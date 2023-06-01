<?php

namespace App\Http\Controllers;

use App\Repositories\RegionRepository;
use Exception;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    protected $repository;
    public function __construct()
    {
        $this->repository = new RegionRepository();
    }

    public function all(Request $request) {
        try {
            return formatResponse(200,__('messages.ok'), $this->repository->all($request));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
