<?php /** @noinspection DuplicatedCode */

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Repositories\Client\CompanyRepository;
use App\Validations\Client\CompanyValidation;
use Exception;
use Illuminate\Http\JsonResponse as JsonResponseAlias;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    protected $repository;
    protected $validation;
    public function __construct()
    {
        $this->repository = new CompanyRepository();
        $this->validation = new CompanyValidation();
    }

    /* @
     * @param Request $request
     * @return JsonResponseAlias
     */
    public function crud(Request $request): JsonResponseAlias
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
