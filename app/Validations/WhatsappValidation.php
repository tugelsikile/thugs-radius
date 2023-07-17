<?php

namespace App\Validations;

use Exception;
use Illuminate\Http\Request;

class WhatsappValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function table(Request $request): Request
    {
        try {
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
