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
     * @param Request $request
     * @return JsonResponse
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,__('passwords.reset'), $this->repository->resetPassword($this->validation->resetPassword($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,__('passwords.sent'), $this->repository->forgotPassword($this->validation->googleLogin($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function googleLogin(Request $request): JsonResponse
    {
        try {
            return formatResponse(200,__('auth.social.success',['SignType' => 'auth.social.sign_in.label','Social' => 'auth.social.google.label']), $this->repository->googleLogin($this->validation->googleLogin($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function googleRegister(Request $request): JsonResponse
    {
        try {
            return formatResponse(200, __('auth.social.sign_up.success',['Social' => __('auth.social.google.label')]), $this->repository->googleRegister($this->validation->googleRegister($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
    }
    /* @
     * @param Request $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function register(Request $request): JsonResponse
    {
        try {
            return formatResponse(200, __('auth.register_new_member.success'), $this->repository->register($this->validation->register($request)));
        } catch (Exception $exception) {
            return formatResponse($exception->getCode(), $exception->getMessage());
        }
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
