<?php

namespace App\Http\Controllers\Olt;

use App\Http\Controllers\Controller;
use App\Repositories\Olt\VlanProfileRepository;
use App\Validations\Olt\VlanProfileValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VlanProfileController extends Controller
{
    protected VlanProfileValidation $validation;
    protected VlanProfileRepository $repository;
    public function __construct()
    {
        $this->validation = new VlanProfileValidation();
        $this->repository = new VlanProfileRepository();
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
