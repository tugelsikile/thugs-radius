<?php

namespace App\Validations\Backup;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BackupValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function readRSTData(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'hostname' => 'required|ip',
                'port' => 'required|numeric',
                'user' => 'required|string',
                'pass' => 'nullable',
                'db_name' => 'required|string',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
