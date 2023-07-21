<?php

namespace App\Http\Controllers\Nas;

use App\Http\Controllers\Controller;
use App\Repositories\Nas\BandwidthRepository;
use App\Validations\Nas\BandwidthValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class BandwidthController extends Controller
{
    protected $repository;
    protected $validation;
    public function __construct()
    {
        $this->repository = new BandwidthRepository();
        $this->validation = new BandwidthValidation();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function crud(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())) {
                case 'post' :
                    $params = $this->repository->table($request);
                    $code = 200; $message = __('messages.ok');
                    break;
                case 'put' :
                    $valid = $this->validation->create($request);
                    $params = $this->repository->create($valid);
                    $code = 200; $message = __('bandwidths.create.success');
                    break;
                case 'patch' :
                    $valid = $this->validation->update($request);
                    $params = $this->repository->update($valid);
                    $code = 200; $message = __('bandwidths.update.success');
                    break;
                case 'delete' :
                    $valid = $this->validation->delete($request);
                    $params = $this->repository->delete($valid);
                    $code = 200; $message = __('bandwidths.delete.success');
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
