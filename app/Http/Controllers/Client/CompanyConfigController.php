<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Repositories\Client\CompanyConfigRepository;
use App\Validations\Client\CompanyConfigValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyConfigController extends Controller
{
    protected $repository;
    protected $validation;
    public $valid;
    public $params;
    public $message;
    public $code;
    public function __construct()
    {
        $this->repository = new CompanyConfigRepository();
        $this->validation = new CompanyConfigValidation();
        $this->valid = new Request();
        $this->params = null;
        $this->code = 400;
        $this->message = __('messages.method');
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function crud(Request $request): JsonResponse
    {
        try {
            switch (strtolower($request->method())) {
                case 'post' :
                    $this->params = $this->repository->allConfig($request);
                    $this->code = 200; $this->message = __('messages.ok');
                    break;
                case 'patch' :
                    switch (strtolower($request->type)) {
                        case 'address' :
                            $this->valid = $this->validation->updateAddress($request);
                            $this->params = $this->repository->updateAddress($this->valid);
                            $this->code = 200; $this->message = __('configs.address.success');
                            break;
                    }
                    break;
            }
            return formatResponse($this->code, $this->message, $this->params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
