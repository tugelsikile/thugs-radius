<?php

namespace App\Http\Controllers\Olt;

use App\Http\Controllers\Controller;
use App\Repositories\Olt\OltRepository;
use App\Validations\Olt\OltValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class OltController extends Controller
{
    protected OltRepository $repository;
    protected OltValidation $validation;
    public function __construct()
    {
        $this->repository = new OltRepository();
        $this->validation = new OltValidation();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function gponCustomer(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())) {
                case 'post' :
                    $params = $this->repository->gponCustomer($this->validation->gponCustomer($request));
                    $code = 200; $message = 'ok';
                    break;
                case 'put':
                    $params = $this->repository->createCustomer($this->validation->createCustomer($request));
                    $code = 200; $message = __('labels.create.success',['Attribute' => __('olt.labels.customers.link')]);
                    break;
            }
            return formatResponse($code,$message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function gponStates(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,"OK", $this->repository->gponStates($this->validation->gponStates($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function testConnection(Request $request): JsonResponse
    {
        try {
            $message = __('messages.method');
            $params = $this->repository->testConnection($this->validation->testConnection($request));
            if ($params != null) {
                if (is_string($params)) $message = __('labels.connection.success',['Attribute' => $params]);
            }
            return formatResponse(200,$message, $params);
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
                    $code = 200; $message = 'ok';
                    break;
                case 'put':
                    $params = $this->repository->create($this->validation->create($request));
                    $code = 200; $message = __('labels.create.success',['Attribute' => __('olt.labels.menu')]);
                    break;
                case 'patch':
                    $params = $this->repository->update($this->validation->update($request));
                    $code = 200; $message = __('labels.update.success',['Attribute' => __('olt.labels.menu')]);
                    break;
                case 'delete':
                    $params = $this->repository->delete($this->validation->delete($request));
                    $code = 200; $message = __('labels.delete.success',['Attribute' => __('olt.labels.menu')]);
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
