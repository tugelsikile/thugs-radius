<?php

namespace App\Http\Controllers;

use App\Repositories\ConfigRepository;
use App\Validations\ConfigValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
