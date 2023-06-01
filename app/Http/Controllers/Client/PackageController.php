<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Repositories\Client\PackageRepository;
use App\Validations\Client\PackageValidation;
use Exception;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    protected $repository;
    protected $validation;
    public function __construct()
    {
        $this->repository = new PackageRepository();
        $this->validation = new PackageValidation();
    }
    public function crud(Request $request) {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())) {
                case 'post' :
                    $params = $this->repository->table($request);
                    $code = 200; $message = __('messages.ok');
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
