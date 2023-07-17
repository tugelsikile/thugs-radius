<?php

namespace App\Http\Controllers;

use App\Repositories\WhatsappRepository;
use App\Validations\WhatsappValidation;
use Exception;
use Illuminate\Http\Request;

class WhatsappController extends Controller
{
    protected WhatsappRepository $repository;
    protected WhatsappValidation $validation;
    public function __construct()
    {
        $this->repository = new WhatsappRepository();
        $this->validation = new WhatsappValidation();
    }
    public function crud(Request $request) {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())){
                case 'post':
                    $params = $this->repository->table($this->validation->table($request));
                    $code = 200; $message = 'ok';
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
