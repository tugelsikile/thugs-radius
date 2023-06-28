<?php

namespace App\Validations\PaymentGateway;

use App\Helpers\SwitchDB;
use App\Models\Company\ClientCompany;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BRIValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function transactionStatus(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'gateway' => 'required|exists:payment_gateways,id,module,briapi',
                'company' => 'required|exists:client_companies,id'
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
                'order_amount' => 'required|numeric|min:0'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
