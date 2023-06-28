<?php

namespace App\Http\Controllers\PaymentGateway;

use App\Http\Controllers\Controller;
use App\Repositories\PaymentGateway\DuitkuRepository;
use App\Validations\PaymentGateway\DuitkuValidation;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class DuitkuController extends Controller
{
    protected $validation;
    protected $repository;
    public function __construct()
    {
        $this->repository = new DuitkuRepository();
        $this->validation = new DuitkuValidation();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function callback(Request $request): JsonResponse
    {
        try {
            return formatResponsePG(200,'ok', $this->repository->callback($this->validation->callback($request)));
        } catch (Exception $exception) {
            return formatResponsePG($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function paymentChannel(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,'ok', $this->repository->paymentChannel($this->validation->paymentChannel($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function generateQR(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,'ok', $this->repository->generateQR($this->validation->generateQR($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
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
