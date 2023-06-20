<?php

namespace App\Http\Controllers;

use App\Repositories\RegionRepository;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    protected $repository;
    public function __construct()
    {
        $this->repository = new RegionRepository();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function all(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,__('messages.ok'), $this->repository->all($request));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    public function fileRegions() {
        try {
            return formatResponse(200,'ok', $this->repository->fileRegions());
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function searchRegions(Request $request): JsonResponse
    {
        try {
            $params = $this->repository->searchRegions($request);
            return formatResponse(200,'ok', $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
