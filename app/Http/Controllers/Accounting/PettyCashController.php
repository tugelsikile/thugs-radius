<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Repositories\Accounting\PettyCashRepository;
use App\Validations\Accounting\PettyCashValidation;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PettyCashController extends Controller
{
    protected PettyCashRepository $repository;
    protected PettyCashValidation $validation;
    public function __construct()
    {
        $this->repository = new PettyCashRepository();
        $this->validation = new PettyCashValidation();
    }
    public function approve(Request $request) {
        try {
            return formatResponse(200,__('petty_cash.approve.success'), $this->repository->approve($this->validation->approve($request)));
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
            switch (strtolower($request->method())){
                case 'post':
                    $params = $this->repository->table($request);
                    $code = 200; $message = 'ok';
                    break;
                case 'put':
                    $params = $this->repository->store($this->validation->create($request));
                    $code = 200; $message = __('labels.create.success',['Attribute' => __('petty_cash.labels.menu')]);
                    break;
                case 'patch':
                    $params = $this->repository->store($this->validation->update($request));
                    $code = 200; $message = __('labels.update.success',['Attribute' => __('petty_cash.labels.menu')]);
                    break;
                case 'delete':
                    $params = $this->repository->delete($this->validation->delete($request));
                    $code = 200; $message = __('labels.delete.success',['Attribute' => __('petty_cash.labels.menu')]);
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }

    /* @
     * @param Request $request
     * @return void
     * @throws Exception
     */
    public function download(Request $request) {
        try {
            $this->repository->download($request);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function print(Request $request) {
        try {
            $period = Carbon::parse($request->period)->translatedFormat('F Y');
            $this->repository->switchDBManual($request);
            $pettyCashes = $this->repository->print($request);
            return view("clients.accounting.petty-cash-print", compact('pettyCashes','period'));
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
