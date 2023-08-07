<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Repositories\Accounting\CashFlowRepository;
use App\Validations\Accounting\CashFlowValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashFlowController extends Controller
{
    protected CashFlowValidation $validation;
    protected CashFlowRepository $repository;
    public function __construct()
    {
        $this->validation = new CashFlowValidation();
        $this->repository = new CashFlowRepository();
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
                    $code = 200; $message = __('labels.create.success',['Attribute' => __('cash_flow.labels.menu')]);
                    break;
                case 'patch':
                    $params = $this->repository->store($this->validation->update($request));
                    $code = 200; $message = __('labels.update.success',['Attribute' => __('cash_flow.labels.menu')]);
                    break;
                case 'delete':
                    $params = $this->repository->delete($this->validation->delete($request));
                    $code = 200; $message = __('labels.delete.success',['Attribute' => __('cash_flow.labels.menu')]);
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
    public function crudCategory(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())){
                case 'post':
                    $params = $this->repository->categoryTable($request);
                    $code = 200; $message = 'ok';
                    break;
                case 'put':
                    $params = $this->repository->storeCategory($this->validation->createCategory($request));
                    $code = 200; $message = __('labels.create.success',['Attribute' => __('cash_flow.labels.category.label')]);
                    break;
                case 'patch':
                    $params = $this->repository->storeCategory($this->validation->updateCategory($request));
                    $code = 200; $message = __('labels.update.success',['Attribute' => __('cash_flow.labels.category.label')]);
                    break;
                case 'delete':
                    $params = $this->repository->deleteCategory($this->validation->deleteCategory($request));
                    $code = 200; $message = __('labels.delete.success',['Attribute' => __('cash_flow.labels.category.label')]);
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
    public function crudAccount(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())){
                case 'post':
                    $params = $this->repository->accountTable($request);
                    $code = 200; $message = 'ok';
                    break;
                case 'put':
                    $params = $this->repository->storeAccount($this->validation->createAccount($request));
                    $code = 200; $message = __('labels.create.success',['Attribute' => __('cash_flow.labels.account.label')]);
                    break;
                case 'patch':
                    $params = $this->repository->storeAccount($this->validation->updateAccount($request));
                    $code = 200; $message = __('labels.update.success',['Attribute' => __('cash_flow.labels.account.label')]);
                    break;
                case 'delete':
                    $params = $this->repository->deleteAccount($this->validation->deleteAccount($request));
                    $code = 200; $message = __('labels.delete.success',['Attribute' => __('cash_flow.labels.account.label')]);
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
