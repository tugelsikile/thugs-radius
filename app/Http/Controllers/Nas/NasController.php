<?php

namespace App\Http\Controllers\Nas;

use App\Http\Controllers\Controller;
use App\Repositories\Nas\NasRepository;
use App\Validations\Nas\NasValidation;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

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
     */
    public function reloadStatus(Request $request): JsonResponse
    {
        try {
            $valid = $this->validation->reloadStatus($request);
            $params = $this->repository->reloadStatus($valid);
            return formatResponse(200,__('messages.ok'), $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function parentQueue(Request $request): JsonResponse
    {
        try {
            $valid = $this->validation->parentQueue($request);
            $params = $this->repository->parentQueue($valid);
            return formatResponse(200, __('messages.ok'), $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
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
     */
    public function interfaceIpAddress(Request $request): JsonResponse
    {
        try {
            $username = $this->repository->encryptDecrypt(new Request(['action' => 'decrypt', 'value' => $request[__('nas.form_input.user')]]));
            $password = $this->repository->encryptDecrypt(new Request(['action' => 'decrypt', 'value' => $request[__('nas.form_input.pass')]]));
            $request = $request->merge([
                __('nas.form_input.user') => $username,
                __('nas.form_input.pass') => $password,
                __('nas.form_input.pass_confirm') => $password,
            ]);
            return formatResponse(200,'ok', $this->repository->interfaceIpAddress($this->validation->testConnection($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
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
     * @throws GuzzleException
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
