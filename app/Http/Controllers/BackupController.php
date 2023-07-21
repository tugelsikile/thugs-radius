<?php

namespace App\Http\Controllers;

use App\Repositories\Backup\BackupRepository;
use App\Validations\Backup\BackupValidation;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BackupController extends Controller
{
    protected BackupValidation $validation;
    protected BackupRepository $repository;
    public function __construct()
    {
        $this->validation = new BackupValidation();
        $this->repository = new BackupRepository();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function crud(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())){
                case 'post':
                    $params = $this->repository->table($request);
                    $code = 200; $message = 'ok';
                    break;
                case 'put':
                    $params = $this->repository->create();
                    $code = 200; $message = __('labels.create.success',['Attribute' => __('backup.labels.backup')]);
                    break;
                case 'patch':
                    $params = $this->repository->restore($request);
                    $code = 200; $message = __('backup.restore.success');
                    break;
                case 'delete':
                    $params = $this->repository->delete($request);
                    $code = 200; $message = __('labels.delete.success', ['Attribute' => __('backup.labels.backup')]);
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
    public function readRSTBranch(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,'ok', $this->repository->branch($this->validation->readRSTData($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function readRSTData(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,"ok", $this->repository->readRSTData($this->validation->readRSTData($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
