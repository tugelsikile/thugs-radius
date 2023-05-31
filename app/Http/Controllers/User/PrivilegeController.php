<?php /** @noinspection DuplicatedCode */

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Repositories\User\PrivilegeRepository;
use App\Validations\User\PrivilegeValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PrivilegeController extends Controller
{
    protected $validation;
    protected $repository;
    public function __construct()
    {
        $this->repository = new PrivilegeRepository();
        $this->validation = new PrivilegeValidation();
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function setPrivilege(Request $request): JsonResponse
    {
        try {
            $valid = $this->validation->setPrivilege($request);
            $params = $this->repository->setPrivilege($valid);
            return formatResponse(200,__('messages.privileges.set.success'), $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function crud(Request $request): JsonResponse
    {
        try {
            $code = 400; $message = __('messages.method'); $params = null;
            switch (strtolower($request->method())) {
                case 'post' :
                    $params = $this->repository->table($request);
                    $code = 200; $message = __('messages.ok');
                    break;
                case 'put' :
                    $valid = $this->validation->create($request);
                    $params = $this->repository->create($valid);
                    $code = 200; $message = __('messages.privileges.create.success');
                    break;
                case 'patch' :
                    $valid = $this->validation->update($request);
                    $params = $this->repository->update($valid);
                    $code = 200; $message = __('messages.privileges.update.success');
                    break;
                case 'delete' :
                    $valid = $this->validation->delete($request);
                    $params = $this->repository->delete($valid);
                    $code = 200; $message = __('messages.privileges.delete.success');
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
