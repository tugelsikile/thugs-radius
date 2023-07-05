<?php

namespace App\Repositories\Auth;

use App\Models\Company\ClientCompany;
use App\Models\Company\CompanyPackage;
use App\Models\Currency;
use App\Models\Menu\Menu;
use App\Models\User\User;
use App\Models\User\UserLevel;
use App\Models\User\UserLog;
use App\Models\User\UserPrivilege;
use App\Repositories\Client\CompanyRepository;
use App\Repositories\Nas\NasRepository;
use App\Repositories\User\UserRepository;
use Carbon\Carbon;
use hisorange\BrowserDetect\Parser as Browser;
use Exception;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;
use Throwable;

class AuthRepository
{
    public function finishWizard() {
        try {
            $user = User::where('id', auth()->guard('api')->user()->id)->first();
            $company = $user->companyObj()->first();
            if ($company != null) {
                $companyUsers = User::where('company', $company->id)->get();
                foreach ($companyUsers as $companyUser) {
                    $locale = $companyUser->locale;
                    if (! property_exists($locale,'finish_wizard')) {
                        $locale->finish_wizard = true;
                    }
                    $companyUser->locale = $locale;
                    $companyUser->saveOrFail();
                }
                return $this->table(new Request(['id' => $user->id]))->first();
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function updateLocale(Request $request) {
        try {
            $user = User::where('id', auth()->guard('api')->user()->id)->first();
            $locale = $user->locale;
            if ($request->has(__('users.form_input.lang'))) {
                $locale->lang = $request[__('users.form_input.lang')];
            } else {
                if (property_exists($locale,'lang')) {
                    unset($locale->lang);
                }
            }
            if ($request->has(__('users.form_input.date_format'))) {
                $locale->date_format = $request[__('users.form_input.date_format')];
            } else {
                if (property_exists($locale,'date_format')) {
                    unset($locale->date_format);
                }
            }
            if ($request->has(__('users.form_input.time_zone'))) {
                $locale->time_zone = $request[__('users.form_input.time_zone')];
            } else {
                if (property_exists($locale, 'time_zone')) {
                    unset($locale->time_zone);
                }
            }
            $user->locale = $locale;
            $user->saveOrFail();
            return $this->table(new Request(['id' => $user->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function updatePassword(Request $request) {
        try {
            $user = User::where('id', auth()->guard('api')->user()->id)->first();
            $user->password = Hash::make($request[__('users.form_input.password.current')]);
            $user->saveOrFail();
            return $this->table(new Request(['id' => $user->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function updateAccount(Request $request) {
        try {
            $user = User::where('id', auth()->guard('api')->user()->id)->first();
            $user->name = $request[__('users.form_input.name')];
            $user->email = $request[__('users.form_input.email')];
            $user->saveOrFail();

            return $this->table(new Request(['id' => $user->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return object
     * @throws Exception
     */
    public function updateAvatar(Request $request) {
        try {
            $user = User::where('id', $request[__('users.form_input.id')])->first();
            $file = $request->file(__('users.form_input.avatar'));
            $targetDir = storage_path() . '/app/public/avatars/';
            $targetName = Uuid::uuid4()->toString() . '.' . $file->getClientOriginalExtension();

            if (! File::exists($targetDir)) File::makeDirectory($targetDir,0777,true);
            if (! File::isWritable($targetDir)) File::chmod($targetDir,0777);
            if ($user->avatar != null) {//delete existing
                $oldFile = $targetDir . $user->avatar;
                if (File::exists($oldFile)) {
                    if (! File::isWritable($oldFile)) File::chmod($oldFile,0777);
                    File::delete($oldFile);
                }
            }
            $file->move($targetDir, $targetName);
            $user->avatar = $targetName;
            $user->saveOrFail();
            resetStorageLink();
            return (object) ['profile' => (new UserRepository())->table(new Request(['id' => $user->id]))->first(), 'user' => $this->table(new Request(['id' => $user->id]))->first()];
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception|Throwable
     */
    public function resetPassword(Request $request) {
        try {
            $status = Password::reset([
                'email' => $request[__('auth.form_input.email')],
                'password' => $request[__('auth.form_input.password')],
                'password_confirmation' => $request[__('auth.form_input.confirm')],
                'token' => $request->token,
            ], function ($user, $password) {
                $user->forceFill(['password' => Hash::make($password)])->setRememberToken(Str::random(60));
                $user->save();
                event(new PasswordReset($user));
            });
            if ($status === Password::PASSWORD_RESET) {
                return $this->login(new Request([__('auth.form_input.email') => $request[__('auth.form_input.email')]]));
            } else {
                throw new Exception(__($status),400);
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return string
     * @throws Exception
     */
    public function forgotPassword(Request $request): string
    {
        try {
            $status = Password::sendResetLink(['email' => $request[__('auth.form_input.email')]]);
            if ($status === Password::RESET_LINK_SENT) {
                return $status;
            } else {
                throw new Exception(__($status),400);
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return object
     * @throws Throwable
     */
    public function googleLogin(Request $request): object
    {
        try {
            return $this->login($request);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return object|null
     * @throws Throwable
     */
    public function googleRegister(Request $request): ?object
    {
        try {
            $request = $request->merge([__('auth.form_input.password') => Str::random(16)]);
            return $this->register($request);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return object|null
     * @throws Throwable
     */
    public function register(Request $request): ?object
    {
        try {
            $response = null;
            $trialLevel = UserLevel::where('name', 'Admin')->first();
            if ($trialLevel != null) {
                $trialPackage = CompanyPackage::where('code', '00000001')->first();
                if ($trialPackage != null) {
                    $company = new ClientCompany();
                    $company->id = Uuid::uuid4()->toString();
                    $company->name = $request[__('companies.form_input.other')];
                    $company->package = $trialPackage->id;
                    $company->code = generateCompanyCode();
                    $company->email = $request[__('auth.form_input.email')];
                    $company->active_at = Carbon::now();
                    $company->expired_at = generateCompanyExpired(Carbon::now(), $trialPackage->duration_string, $trialPackage->duration_ammount);
                    $company->currency = Currency::where('code', 'IDR')->first()->id;
                    $company->radius_db_host = config('database.connections.radius.host');
                    $company->radius_db_name = 'radius_' . Str::slug($company->name,'_');
                    $company->radius_db_user = Str::slug($company->name,'_');
                    $company->radius_db_pass = 'Ac'. randomString() . randomNumeric() . '!-_';
                    $company->saveOrFail();

                    $user = new User();
                    $user->id = Uuid::uuid4()->toString();
                    $user->level = $trialLevel->id;
                    $user->company = $company->id;
                    $user->name = $request[__('messages.users.form_input.name')];
                    $user->email = $request[__('auth.form_input.email')];
                    $user->password = Hash::make($request[__('auth.form_input.password')]);
                    $locale = (object)[];
                    if ($request->hasHeader('Language')) $locale->lang = $request->header('Language');
                    $locale->date_format = 'dddd, DD MMMM yyyy, HH:mm:ss';
                    $locale->time_zone = 'Asia/Jakarta';
                    $user->locale = $locale;
                    if ($request->has(__('auth.form_input.avatar'))) {
                        $tgtDir = storage_path() . '/app/public/avatars/';
                        if (! File::exists($tgtDir)) File::makeDirectory($tgtDir,0777,true);
                        if (! File::isWritable($tgtDir)) File::chmod($tgtDir,0777);
                        $url = $request[__('auth.form_input.avatar')];
                        $content = file_get_contents($url);
                        $ext = explode('.', $url);
                        $ext = end($ext);
                        if (!in_array(strtolower($ext),['jpg','png','gif','bmp','svg'])) {
                            $ext = 'jpg';
                        }
                        $user->avatar = Uuid::uuid4()->toString() . '.' . $ext;
                        File::put($tgtDir . $user->avatar, $content);
                    }
                    $user->saveOrFail();

                    (new CompanyRepository())->generateDatabase($company);
                    $response = $this->login(new Request([__('auth.form_input.email') => $user->email]));
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @return bool
     * @throws Exception
     */
    public function logout(): bool
    {
        try {
            $user = auth()->guard('api')->user();
            if ($user != null) {
                $user = $user->token();
                if ($user != null) {
                    $user->revoke();
                }
            }
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function setStorageLang($lang) {
        try {
            $me = auth()->guard('api')->user();
            $tgtDir = storage_path() . '/framework/cookies/langs/';
            $tgtFile = $me->id . '.json';
            if (! File::exists($tgtDir)) File::makeDirectory($tgtDir,0777,true);
            File::put($tgtDir . $tgtFile, json_encode((object)['lang' => $lang]));
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @return string
     * @throws Exception
     */
    public function getStorageLang(): string
    {
        try {
            $me = auth()->guard('api')->user();
            $tgtDir = storage_path() . '/framework/cookies/langs/';
            $tgtFile = $me->id . '.json';
            if (File::exists($tgtDir . $tgtFile)) {
                $fileContent = File::get($tgtDir . $tgtFile,false);
                $fileContent = json_decode($fileContent);
                return $fileContent->lang;
            } else {
                return 'id';
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function setLanguage(Request $request) {
        try {
            $user = User::where('id', auth()->guard('api')->user()->id)->first();
            $locale = $user->locale;
            if ($locale == null) $locale = (object) [];
            $locale->lang = $request->lang;
            $user->locale = $locale;
            $user->saveOrFail();
            $this->setStorageLang($request->lang);
            return $request->lang;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Menu $menu
     * @return Collection
     * @throws Exception
     */
    private function myMenuChildrens(Menu $menu): Collection
    {
        try {
            $user = auth()->guard('api')->user();
            $response = collect();
            $childrens = Menu::where('parent', $menu->id)->orderBy('order', 'asc')->where('function', false)->get();
            if ($childrens->count() > 0) {
                $response->push((object) [
                    'value' => $menu->id,
                    'label' => $menu->name,
                    'meta' => (object) [
                        'route' => $menu->route,
                        'icon' => $menu->icon,
                        'url' => route($menu->route),
                        'lang' => $menu->lang,
                    ]
                ]);
            }
            foreach ($childrens as $children) {
                $privilege = UserPrivilege::where('level', $user->levelObj->id)->where('route', $children->route)->first();
                if ($privilege != null) {
                    if ($privilege->read) {
                        $response->push((object) [
                            'value' => $children->id,
                            'label' => $children->name,
                            'meta' => (object) [
                                'route' => $children->route,
                                'icon' => $children->icon,
                                'url' => route($children->route),
                                'lang' => $children->lang,
                            ]
                        ]);
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @return Collection
     * @throws Exception
     */
    private function myMenus(): Collection
    {
        try {
            $user = auth()->guard('api')->user();
            $response = collect();
            $menus = Menu::whereNull('parent')->where('function', false)->orderBy('order', 'asc')->get();
            foreach ($menus as $menu) {
                $privilege = UserPrivilege::where('level', $user->levelObj->id)->where('route', $menu->route)->first();
                if ($privilege != null) {
                    if ($privilege->read) {
                        $response->push((object) [
                            'value' => $menu->id,
                            'label' => $menu->name,
                            'meta' => (object) [
                                'route' => $menu->route,
                                'icon' => $menu->icon,
                                'url' => route($menu->route),
                                'lang' => $menu->lang,
                                'childrens' => $this->myMenuChildrens($menu),
                            ]
                        ]);
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return Collection|null
     * @throws Exception
     */
    private function privileges(Request $request)
    {
        try {
            $response = null;
            if ($request->has('route')) {
                $response = collect();
                $user = auth()->guard('api')->user();
                foreach ($request->route as $route) {
                    $menu = Menu::where('route', $route)->first();
                    if ($menu != null) {
                        $privilege = UserPrivilege::where('route', $menu->route)->where('level', $user->level)->first();
                        if ($privilege != null) {
                            if ($privilege->read) {
                                $response->push((object) [
                                    'value' => $menu->route,
                                    'func' => $menu->function,
                                    'read' => $privilege->read,
                                    'create' => $privilege->create,
                                    'update' => $privilege->update,
                                    'delete' => $privilege->delete,
                                ]);
                            }
                        }
                    }
                }
                /*$temp = collect();
                $menus = Menu::orderBy('order', 'asc');
                $menus->whereIn('route', $request->route);
                $menus = $menus->get();
                foreach ($menus as $menu) {
                    $privilege = UserPrivilege::where('route', $menu->route)->where('level', $user->level)->first();
                    if ($privilege != null) {
                        $temp->push((object) [
                            'value' => $menu->route,
                            'func' => $menu->function,
                            'read' => $privilege->read,
                            'create' => $privilege->create,
                            'update' => $privilege->update,
                            'delete' => $privilege->delete,
                        ]);
                    }
                }*/
                if (collect($request->route)->count() == 1) $response = $response->first();
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    public function myPrivileges(Request $request) {
        try {
            return (object) [ 'menus' => $this->myMenus(), 'privileges' => $this->privileges($request) ];
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return object
     * @throws Exception|Throwable
     */
    public function login(Request $request): object
    {
        try {
            $user = User::where('email', $request[__('auth.form_input.email')])->first();
            DB::table('oauth_access_tokens')->where('user_id', $user->id)->delete();
            auth()->login($user);
            $logs = new UserLog();
            $logs->id = Uuid::uuid4()->toString();
            $logs->user = $user->id;
            $logs->url = $request->fullUrl();
            $logs->method = strtolower($request->method());
            $requestX = $request->all();
            $requestX['password'] = '***HIDDEN***';
            $logs->params = $requestX;
            $logs->ip = $request->ip();
            $logs->browser = Browser::browserFamily() . ' ' . Browser::browserVersion();
            $logs->platform = Browser::platformName();
            $logs->saveOrFail();
            Session::put('locale_lang', $user->locale->lang);
            return (object) [
                'user' => $this->table(new Request(['id' => $user->id]))->first(),
                'token' => auth()->user()->createToken('app')->accessToken,
            ];
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function table(Request $request): Collection
    {
        try {
            $response = collect();
            $users = User::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $users = $users->where('id', $request->id);
            $users = $users->get();
            foreach ($users as $user) {
                $company = $user->companyObj;
                if ($company != null) {
                    if ($company->config != null) {
                        if ($company->config->logo != null) {
                            $logo = companyLogo($company);
                            if ($logo != null) {
                                $config = $company->config;
                                if (property_exists($config,'logo')) {
                                    $config->logo = $logo;
                                    $company->config = $config;
                                }
                            }
                        }
                    }
                }
                $response->push((object) [
                    'value' => $user->id,
                    'label' => $user->name,
                    'meta' => (object) [
                        'email' => $user->email,
                        'avatar' => getAvatar($user),
                        'level' => $user->levelObj,
                        'locale' => $user->locale,
                        'company' => $company,
                        'nas' => (new NasRepository())->tableNasGroup(new Request(['user' => $user->id]))
                    ]
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @return mixed
     * @throws Exception
     */
    public function me() {
        try {
            return $this->table(new Request(['id' => auth()->guard('api')->user()->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
