<?php

namespace App\Repositories;

use App\Helpers\Whatsapp\Whatsapp;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class WhatsappRepository
{
    protected $me;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
    }

    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function table(Request $request): Collection
    {
        try {
            $response = collect();
            if ($this->me->companyObj()->first() != null) {
                $token = (new Whatsapp($this->me->companyObj()->first()))->getToken();
                $response->push($token);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
