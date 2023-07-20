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
    public function readRSTBranch(Request $request) {
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
