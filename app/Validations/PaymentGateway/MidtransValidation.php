<?php

namespace App\Validations\PaymentGateway;

use App\Helpers\SwitchDB;
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
