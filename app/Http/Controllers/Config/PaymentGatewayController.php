<?php

namespace App\Http\Controllers\Config;

use App\Http\Controllers\Controller;
use App\Repositories\Config\PaymentGatewayRepository;
use App\Validations\Config\PaymentGatewayValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PaymentGatewayController extends Controller
{
    protected $repository;
    protected $validation;
    public $valid;
    public $params;
    public $code;
    public $message;
    public function __construct()
    {
        $this->valid = new Request();
        $this->params = null;
        $this->code = 400;
        $this->message = __('messages.method');
        $this->repository = new PaymentGatewayRepository();
        $this->validation = new PaymentGatewayValidation();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function activate(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,__('labels.active.success', ['Attribute'=>__('gateways.labels.menu')]), $this->repository->activate($this->validation->activate($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function crud(Request $request): JsonResponse
    {
        try {
            switch (strtolower($request->method())) {
                case 'post' :
                    $this->params = $this->repository->table($request);
                    $this->code = 200; $this->message = __('messages.ok');
                    break;
                case 'put' :
                    $this->params = $this->repository->create($this->validation->create($request));
                    $this->code = 200; $this->message = __('labels.create.success',['Attribute'=>__('gateways.labels.menu')]);
                    break;
                case 'patch' :
                    $this->params = $this->repository->update($this->validation->update($request));
                    $this->code = 200; $this->message = __('labels.update.success',['Attribute'=>__('gateways.labels.menu')]);
                    break;
                case 'delete' :
                    $this->params = $this->repository->delete($this->validation->delete($request));
                    $this->code = 200; $this->message = __('labels.delete.success',['Attribute'=>__('gateways.labels.menu')]);
                    break;
            }
            return formatResponse($this->code, $this->message, $this->params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
