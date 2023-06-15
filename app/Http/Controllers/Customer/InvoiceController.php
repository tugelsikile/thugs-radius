<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Repositories\Customer\InvoiceRepository;
use App\Validations\Customer\InvoiceValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class InvoiceController extends Controller
{
    protected $repository;
    protected $validation;
    protected $valid;
    protected $params;
    protected $message;
    protected $code;
    public function __construct()
    {
        $this->repository = new InvoiceRepository();
        $this->validation = new InvoiceValidation();
        $this->params = null;
        $this->valid = null;
        $this->message = __('messages.method');
        $this->code = 400;
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function generate(Request $request): JsonResponse
    {
        try {
            $this->valid = $this->validation->generate($request);
            $this->params = $this->repository->generate($this->valid);
            $this->code = 200; $this->message = __('invoices.generate.success');
            return formatResponse($this->code, $this->message, $this->params);
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
            switch (strtolower($request->method())) {
                case 'post' :
                    $this->params = $this->repository->table($request);
                    $this->code = 200; $this->message = __('messages.ok');
                    break;
                case 'put' :
                    $this->valid = $this->validation->create($request);
                    $this->params = $this->repository->create($this->valid);
                    $this->code = 200; $this->message = __('invoices.create.success');
                    break;
                case 'patch' :
                    $this->valid = $this->validation->update($request);
                    $this->params = $this->repository->update($this->valid);
                    $this->code = 200; $this->message = __('invoices.update.success');
                    break;
                case 'delete' :
                    $this->valid = $this->validation->delete($request);
                    $this->params = $this->repository->delete($this->valid);
                    $this->code = 200; $this->message = __('invoices.delete.success');
                    break;

            }
            return formatResponse($this->code, $this->message, $this->params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
