<?php

namespace App\Validations\Olt;

use App\Helpers\SwitchDB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VlanProfileValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function table(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('olt.form_input.id') => 'required|exists:olts,id'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
