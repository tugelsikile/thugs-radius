<?php

namespace App\Http\Controllers;

use App\Repositories\ConfigRepository;
use App\Validations\ConfigValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ConfigController extends Controller
{
    protected $repository;
    protected $validation;
    public function __construct()
    {
        $this->repository = new ConfigRepository();
        $this->validation = new ConfigValidation();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function discounts(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())){
                case 'post' :
                    $params = $this->repository->discounts($request);
                    $code = 200; $message = __('messages.ok');
                    break;
                case 'put' :
                    $valid = $this->validation->createDiscount($request);
                    $params = $this->repository->createDiscount($valid);
                    $code = 200; $message = __('discounts.create.success');
                    break;
                case 'patch' :
                    $valid = $this->validation->updateDiscount($request);
                    $params = $this->repository->updateDiscount($valid);
                    $code = 200; $message = __('discounts.update.success');
                    break;
                case 'delete' :
                    $valid = $this->validation->deleteDiscount($request);
                    $params = $this->repository->deleteDiscount($valid);
                    $code = 200; $message = __('discounts.delete.success');
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
     * @throws Throwable
     */
    public function taxes(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())) {
                case 'post' :
                    $params = $this->repository->taxes($request);
                    $code = 200; $message = __('messages.ok');
                    break;
                case 'put' :
                    $valid = $this->validation->createTax($request);
                    $params = $this->repository->createTax($valid);
                    $code = 200; $message = __('taxes.create.success');
                    break;
                case 'patch' :
                    $valid = $this->validation->updateTax($request);
                    $params = $this->repository->updateTax($valid);
                    $code = 200; $message = __('taxes.update.success');
                    break;
                case 'delete' :
                    $valid = $this->validation->deleteTax($request);
                    $params = $this->repository->deleteTax($valid);
                    $code = 200; $message = __('taxes.delete.success');
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
    public function currencies(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())) {
                case 'post' :
                    $params = $this->repository->currencies($request);
                    $code = 200; $message = __('messages.ok');
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
    public function timezone(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())){
                case 'post' :
                    $params = $this->repository->timezone();
                    $code = 200; $message = __('messages.ok');
                    break;
                case 'patch' :
                    $valid = $this->validation->updateTimezone($request);
                    $params = $this->repository->updateTimezone($valid);
                    $code = 200; $message = __('timezones.labels.success');
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
    public function site(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())){
                case 'post' :
                    $params = $this->repository->site();
                    $code = 200; $message = __('messages.ok');
                    break;
                case 'patch' :
                    $valid = $this->validation->updateSite($request);
                    $params = $this->repository->updateSite($valid);
                    $code = 200; $message = __('configs.site.update.success');
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
