<?php

namespace App\Http\Controllers\PaymentGateway;

use App\Http\Controllers\Controller;
use App\Repositories\PaymentGateway\MidtransRepository;
use App\Validations\PaymentGateway\MidtransValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

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
    public function tokenMidtrans(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,"OK", $this->repository->tokenMidtrans($this->validation->tokenMidtrans($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function paymentNotification(Request $request): JsonResponse
    {
        try {
            return formatResponsePG(200,"OK", $this->repository->paymentNotification($this->validation->paymentNotification($request)));
        } catch (Exception $exception) {
            return formatResponsePG($exception->getCode(), $exception->getMessage());
        }
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
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
