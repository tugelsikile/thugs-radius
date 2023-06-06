<?php

namespace App\Http\Controllers\Nas;

use App\Http\Controllers\Controller;
use App\Repositories\Nas\NasRepository;
use App\Validations\Nas\NasValidation;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NasController extends Controller
{
    protected $repository;
    protected $validation;
    public function __construct()
    {
        $this->repository = new NasRepository();
        $this->validation = new NasValidation();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function encryptDecrypt(Request $request): JsonResponse
    {
        try {
            $valid = $this->validation->encryptDecrypt($request);
            $params = $this->repository->encryptDecrypt($valid);
            return formatResponse(200,'ok', $params);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function testConnection(Request $request): JsonResponse
    {
        try {
            $valid = $this->validation->testConnection($request);
            $params = $this->repository->testConnection($valid);
            return formatResponse(200, $params, $params);
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
                case 'post' :
                    $params = $this->repository->table($request);
                    $code = 200; $message = __('messages.ok');
                    break;
                case 'put' :
                    $valid = $this->validation->create($request);
                    $params = $this->repository->create($valid);
                    $code = 200; $message = __('nas.create.success');
                    break;
                case 'patch' :
                    $valid = $this->validation->update($request);
                    $params = $this->repository->update($valid);
                    $code = 200; $message = __('nas.update.success');
                    break;
                case 'delete' :
                    $valid = $this->validation->delete($request);
                    $params = $this->repository->delete($valid);
                    $code = 200; $message = __('nas.delete.success');
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
