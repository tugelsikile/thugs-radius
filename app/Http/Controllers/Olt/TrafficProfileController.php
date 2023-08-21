<?php

namespace App\Http\Controllers\Olt;

use App\Http\Controllers\Controller;
use App\Repositories\Olt\TrafficProfileRepository;
use App\Validations\Olt\TrafficProfileValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrafficProfileController extends Controller
{
    protected TrafficProfileValidation $validation;
    protected TrafficProfileRepository $repository;
    public function __construct()
    {
        $this->repository = new TrafficProfileRepository();
        $this->validation = new TrafficProfileValidation();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function onuType(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,'ok', $this->repository->onuType($this->validation->table($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function tconts(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())) {
                case 'post':
                    $params = $this->repository->tconts($this->validation->table($request));
                    $code = 200; $message = 'ok';
                    break;
                case 'put':
                    $params = $this->repository->create($this->validation->create($request));
                    $code = 200; $message = __('labels.create.success',['Attribute' => '']);
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function crud(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())) {
                case 'post':
                    $params = $this->repository->table($this->validation->table($request));
                    $code = 200; $message = 'ok';
                    break;
                case 'put':
                    $params = $this->repository->create($this->validation->create($request));
                    $code = 200; $message = __('labels.create.success',['Attribute' => '']);
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
