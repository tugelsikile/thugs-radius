<?php /** @noinspection DuplicatedCode */

namespace App\Http\Controllers\Nas;

use App\Http\Controllers\Controller;
use App\Repositories\Nas\PoolRepository;
use App\Validations\Nas\PoolValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PoolController extends Controller
{
    protected PoolRepository $repository;
    protected PoolValidation $validation;
    public function __construct()
    {
        $this->repository = new PoolRepository();
        $this->validation = new PoolValidation();
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
                    $params = $this->repository->create($this->validation->create($request));
                    $code = 200; $message = __('labels.create.success',['Attribute' => __('nas.pools.labels.menu')]);
                    break;
                case 'patch' :
                    $params = $this->repository->update($this->validation->update($request));
                    $code = 200; $message = __('labels.update.success',['Attribute' => __('nas.pools.labels.menu')]);
                    break;
                case 'delete' :
                    $valid = $this->validation->delete($request);
                    $params = $this->repository->delete($valid);
                    $code = 200; $message = __('labels.delete.success',['Attribute' => __('nas.pools.labels.menu')]);
                    break;
            }
            return formatResponse($code, $message, $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
