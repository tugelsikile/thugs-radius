<?php /** @noinspection SpellCheckingInspection */

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Repositories\Auth\AuthRepository;
use App\Validations\Auth\AuthValidation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class AuthController extends Controller
{
    protected $validation;
    protected $repository;
    public function __construct()
    {
        $this->repository = new AuthRepository();
        $this->validation = new AuthValidation();
    }

    /* @
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        try {
            return formatResponse(200,'ok', $this->repository->logout());
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function setLanguage(Request $request): JsonResponse
    {
        try {
            $valid = $this->validation->setLanguage($request);
            $params = $this->repository->setLanguage($valid);
            return formatResponse(200,'ok', $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function myPrivileges(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,'ok', $this->repository->myPrivileges($request));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }

    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $valid = $this->validation->login($request);
            $params = $this->repository->login($valid);
            return formatResponse(200,"Berhasil login\nMenunggu redirect halaman", $params);
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
}
