<?php

namespace App\Validations;

use App\Helpers\SwitchDB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DashboardValidation
{

    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function serverAction(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                strtolower(__('labels.form_input.type',['Attribute' => 'server'])) => 'required|in:database,radius,nas',
                strtolower(__('labels.form_input.action',['Attribute' => 'server'])) => 'required|in:stop,restart,start,reboot',
                strtolower(__('labels.form_input.value',['Attribute' => 'server'])) => 'required_if:' . __('labels.form_input.type',['Attribute' => 'server']) . ',nas|exists:nas,id',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
