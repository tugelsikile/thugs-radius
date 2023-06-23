<?php

namespace App\Http\Controllers;

use App\Repositories\DashboardRepository;
use App\Validations\DashboardValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected $repository;
    protected $validation;
    public $params;
    public $code = 400;
    public $message = '';
    public function __construct()
    {
        $this->validation = new DashboardValidation();
        $this->repository = new DashboardRepository();
        $this->message = __('labels.response.400',['Attribute' => 'Server' ]);
        $this->params = null;
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function serverStatus(Request $request): JsonResponse
    {
        try {
            switch (strtolower($request->method())) {
                case 'post' :
                    $this->params = $this->repository->serverStatus();
                    $this->code = 200; $this->message = __('labels.response.200',['Attribute' => 'Server']);
                    break;
                case 'patch' :
                    $this->params = $this->repository->serverAction($this->validation->serverAction($request));
                    $this->code = 200; $this->message = __('labels.response.200',['Attribute' => 'Server']);
                    break;
            }
            return formatResponse($this->code,$this->message, $this->params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
