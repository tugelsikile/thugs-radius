<?php /** @noinspection DuplicatedCode */

namespace App\Validations\PaymentGateway;

use App\Helpers\SwitchDB;
use App\Models\Company\ClientCompany;
use App\Models\PaymentGateway\PaymentGateway;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DuitkuValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function generateQR(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'gateway' => 'required|exists:payment_gateways,id,module,duitku',
                'company' => 'required|exists:client_companies,id',
                'channel' => 'required|string'
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
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function paymentChannel(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'gateway' => 'required|exists:payment_gateways,id,module,duitku',
                'company' => 'required|exists:client_companies,id',
                'order_amount' => 'required|numeric|min:0',
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
    public function transactionStatus(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'gateway' => 'required|exists:payment_gateways,id,module,duitku',
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

    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function callback(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'merchantCode' => 'required|string',
                'amount' => 'required|numeric|min:0',
                'merchantOrderId' => 'required',
                'productDetail' => 'required',
                'additionalParam' => 'nullable',
                'paymentCode' => 'required',
                'resultCode' => 'required|numeric',
                'merchantUserId' => 'required',
                'reference' => 'required',
                'publisherOrderId' => 'required',
                'signature' => 'nullable',
                'spUserHash' => 'nullable',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            if ($request->has('additionalParam')) {
                $additionalParam = $request->additionalParam;
                $additionalParam = explode('=', $additionalParam);
                if (collect($additionalParam)->count() == 2) {
                    $companyId = $additionalParam[1];
                    $request = $request->merge(['company' => $companyId]);
                    if (strlen($companyId) > 5) {
                        $company = ClientCompany::where('id', $companyId)->first();
                        if ($company != null) {
                            $paymentGateway = PaymentGateway::where('company', $company->id)->whereNotNull('active_at')->first();
                            if ($paymentGateway != null) {
                                if ($paymentGateway->keys->merchant_code == $request->merchantCode) {
                                    $request = $request->merge(['gateway' => $paymentGateway->id]);
                                    $serverSignature = md5($request->merchantCode . $request->amount . $request->merchantOrderId . $paymentGateway->keys->api_key);
                                    //dd($serverSignature);
                                    new SwitchDB("database.connections.radius",[
                                        'charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci', 'driver' => 'mysql',
                                        'host' => $company->radius_db_host, 'port' => env('DB_RADIUS_PORT'),
                                        'database' => $company->radius_db_name, 'username' => $company->radius_db_user,
                                        'password' => $company->radius_db_pass
                                    ]);
                                    $valid = Validator::make($request->all(),[
                                        'merchantOrderId' => 'required|exists:customer_invoices,order_id',
                                        'merchantUserId' => 'required|exists:customers,code',
                                        'signature' => 'required|in:' . $serverSignature,
                                    ]);
                                    if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
                                } else {
                                    throw new Exception(__('validation.exists',['Attribute' => 'merchantCode']),400);
                                }
                            } else {
                                throw new Exception(__('validation.exists',['Attribute' => 'merchantCode']),400);
                            }
                        } else {
                            throw new Exception(__('validation.exists',['Attribute' => 'additionalParam']),400);
                        }
                    } else {
                        throw new Exception(__('validation.exists',['Attribute' => 'additionalParam']),400);
                    }
                } else {
                    throw new Exception(__('validation.not_in',['Attribute' => 'additionalParam']),400);
                }
            } else {
                throw new Exception(__('validation.required',['Attribute' => 'additionalParam']),400);
            }
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
