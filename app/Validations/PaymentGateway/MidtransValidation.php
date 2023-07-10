<?php

namespace App\Validations\PaymentGateway;

use App\Helpers\SwitchDB;
use App\Models\Company\ClientCompany;
use App\Models\PaymentGateway\PaymentGateway;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MidtransValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function tokenMidtrans(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'gateway' => 'required|exists:payment_gateways,id',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function paymentNotification(Request $request): Request
    {
        try {
            new SwitchDB("mysql");
            $valid = Validator::make($request->all(),[
                'transaction_time' => 'required|dateFormat:Y-m-d H:i:s',
                'transaction_id' => 'required|string|min:20',
                'transaction_status' => 'required|string|in:capture,settlement,pending,deny,cancel,expire,failure,refund,partial_refund,authorize',
                'status_code' => 'required|numeric|min:200|max:600',
                'company' => 'required|exists:client_companies,id',
                'gateway' => 'required|exists:payment_gateways,id',
                'status_message' => 'required|string'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            $company = ClientCompany::where('id', $request->company)->first();
            new SwitchDB("database.connections.radius",[
                'charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci', 'driver' => 'mysql',
                'host' => $company->radius_db_host, 'port' => env('DB_RADIUS_PORT'),
                'database' => $company->radius_db_name, 'username' => $company->radius_db_user,
                'password' => $company->radius_db_pass
            ]);
            $valid = Validator::make($request->all(),[
                'order_id' => 'required|exists:customer_invoices,order_id',
                'gross_amount' => 'required|numeric|min:0',
                'signature_key' => 'required|string',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            $gateway = PaymentGateway::where('id', $request->gateway)->first();
            $signature = $request->order_id . $request->status_code . $request->gross_amount . $gateway->keys->server_key;
            $signature = hash('sha512', $signature); //hash_hmac('sha512', $signature,$gateway->keys->server_key);
            if ($request->signature_key != $signature) throw new Exception("Invalid signature",400);

            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function transactionStatus(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'company' => 'required|exists:client_companies,id',
                'gateway' => 'required|exists:payment_gateways,id',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                'order_id' => 'required|exists:customer_invoices,order_id',
                'order_amount' => 'required|numeric|min:0',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
