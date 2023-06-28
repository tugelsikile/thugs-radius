<?php

namespace App\Http\Controllers\PaymentGateway;

use App\Http\Controllers\Controller;
use App\Repositories\PaymentGateway\BRIRepository;
use App\Validations\PaymentGateway\BRIValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BRIController extends Controller
{
    protected $validation;
    protected $repository;
    public $status;
    public $message;
    public $params;
    public function __construct()
    {
        $this->status = 400;
        $this->message = __('messages.ok');
        $this->params = null;
        $this->validation = new BRIValidation();
        $this->repository = new BRIRepository();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function transactionStatus(Request $request): JsonResponse
    {
        try {
            return formatResponsePG($this->status, $this->message, $this->repository->generateQR($this->validation->transactionStatus($request)));
        } catch (Exception $exception) {
            return formatResponsePG($exception->getCode(), $exception->getMessage());
        }
    }
}
