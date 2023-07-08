<?php

namespace App\Http\Controllers\PaymentGateway;

use App\Http\Controllers\Controller;
use App\Repositories\PaymentGateway\MidtransRepository;
use App\Validations\PaymentGateway\MidtransValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MidtransController extends Controller
{
    protected $validation;
    protected $repository;
    public function __construct()
    {
        $this->validation = new MidtransValidation();
        $this->repository = new MidtransRepository();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function transactionStatus(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,'ok', $this->repository->transactionStatus($this->validation->transactionStatus($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
