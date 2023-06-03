<?php

namespace App\Validations;

use DateTimeZone;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConfigValidation
{
    private function tzLists() {
        return $timezone_identifiers = DateTimeZone::listIdentifiers();
    }

    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function updateTimezone(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('timezones.form_input.name') => 'required|in:' . collect($this->tzLists())->join(','),
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
