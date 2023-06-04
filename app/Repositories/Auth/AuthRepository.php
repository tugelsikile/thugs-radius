<?php /** @noinspection PhpUnhandledExceptionInspection */
/** @noinspection DuplicatedCode */
/** @noinspection SpellCheckingInspection */
/** @noinspection PhpUndefinedMethodInspection */
/** @noinspection PhpPossiblePolymorphicInvocationInspection */

/** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories\Auth;

use App\Models\Menu\Menu;
use App\Models\User\User;
use App\Models\User\UserLog;
use App\Models\User\UserPrivilege;
use hisorange\BrowserDetect\Parser as Browser;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Session;
use Ramsey\Uuid\Uuid;
use Throwable;

class AuthRepository
{
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
    public function getStorageLang() {
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
    public function setLanguage(Request $request) {
        try {
            //dd($this->getStorageLang());
            $user = User::where('id', auth()->guard('api')->user()->id)->first();
            $user->locale = (object) [
                'lang' => $request->lang,
                'date_format' => $user->locale->date_format
            ];
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
                $menus = Menu::orderBy('created_at', 'asc');
                $menus->whereIn('route', $request->route);
                $menus = $menus->get();
                foreach ($menus as $menu) {
                    $privilege = UserPrivilege::where('route', $menu->route)->where('level', $user->level)->first();
                    if ($privilege != null) {
                        $response->push((object) [
                            'value' => $menu->route,
                            'read' => $privilege->read,
                            'create' => $privilege->create,
                            'update' => $privilege->update,
                            'delete' => $privilege->delete,
                        ]);
                    }
                }
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
            $user = User::where('email', $request->email)->first();
            DB::table('oauth_access_tokens')->where('user_id', $user->id)->delete();
            auth()->login($user);
            $logs = new UserLog();
            $logs->id = Uuid::uuid4()->toString();
            $logs->user = $user->id;
            $logs->url = $request->fullUrl();
            $logs->method = strtolower($request->method());
            $requestX = $request->all();
            $requestX['password'] = '**********';
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
                $response->push((object) [
                    'value' => $user->id,
                    'label' => $user->name,
                    'meta' => (object) [
                        'email' => $user->email,
                        'avatar' => getAvatar($user),
                        'level' => $user->levelObj,
                        'locale' => $user->locale,
                        'company' => $user->companyObj,
                    ]
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
