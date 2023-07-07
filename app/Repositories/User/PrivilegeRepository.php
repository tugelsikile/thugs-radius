<?php /** @noinspection SpellCheckingInspection */
/** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories\User;

use App\Helpers\SwitchDB;
use App\Models\Menu\Menu;
use App\Models\User\UserLevel;
use App\Models\User\UserPrivilege;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Artisan;
use Ramsey\Uuid\Uuid;
use Throwable;

class PrivilegeRepository
{
    protected $me;
    public function __construct()
    {
        if (auth()->guard('api')->user() != null) {
            $this->me = auth()->guard('api')->user();
        }
    }

    /* @
     * @param Request $request
     * @return bool
     * @throws Exception
     */
    public function delete(Request $request): bool
    {
        try {
            UserLevel::whereIn('id', $request->id)->delete();
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function update(Request $request) {
        try {
            $updatePrivilege = false;
            $level = UserLevel::where('id', $request->id)->first();
            $level->name = $request[__('messages.privileges.form_input.name')];
            $level->description = $request[__('messages.privileges.form_input.description')];
            if ($request[__('messages.privileges.form_input.client')] == 'ya' && ! $level->for_client) {
                $updatePrivilege = true;
            } elseif ($request[__('messages.privileges.form_input.client')] == 'tidak' && $level->for_client) {
                $updatePrivilege = true;
            }
            if ($request[__('messages.privileges.form_input.client')] == 'ya') {
                $level->for_client = true;
            } else {
                $level->for_client = false;
            }
            if ($request->has(__('messages.privileges.form_input.company'))) {
                $level->company = $request[__('messages.privileges.form_input.company')];
            } else {
                $level->company = null;
            }
            $level->saveOrFail();
            if ($updatePrivilege) {
                $privileges = UserPrivilege::where('level', $level->id)->get();
                foreach ($privileges as $privilege) {
                    $privilege->read = false;
                    $privilege->update = false;
                    $privilege->delete = false;
                    $privilege->create = false;
                    $privilege->saveOrFail();
                }
            }
            return $this->table(new Request(['id' => $level->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws Throwable
     */
    public function create(Request $request) {
        try {
            $level = new UserLevel();
            $level->id = Uuid::uuid4()->toString();
            $level->name = $request[__('messages.privileges.form_input.name')];
            $level->description = $request[__('messages.privileges.form_input.description')];
            $level->super = false;
            $level->is_default = false;
            if ($request[__('messages.privileges.form_input.client')] == 'ya') {
                $level->for_client = true;
            } else {
                $level->for_client = false;
            }
            if ($request->has(__('messages.privileges.form_input.company'))) {
                $level->company = $request[__('messages.privileges.form_input.company')];
            }
            $level->saveOrFail();
            Artisan::call("db:seed --class=UserPrivilegeSeeder");
            return $this->table(new Request(['id' => $level->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return null
     * @throws Exception
     */
    public function setPrivilege(Request $request) {
        try {
            $response = null;
            $privilege = UserPrivilege::where('id', $request->id)->first();
            if ($privilege != null) {
                switch ($request->type) {
                    case 'read' :
                        $privilege->read = ! $privilege->read;
                        if (! $privilege->read) {
                            $privilege->create = false;
                            $privilege->update = false;
                            $privilege->delete = false;
                            $menu = Menu::where('route', $privilege->route)->first();
                            if ($menu != null) {
                                $childrens = Menu::where('parent', $menu->id)->get();
                                foreach ($childrens as $children) {
                                    $privChildren = UserPrivilege::where('level', $privilege->level)->where('route', $children->route)->first();
                                    if ($privChildren != null) {
                                        $privChildren->read = false;
                                        $privChildren->create = false;
                                        $privChildren->update = false;
                                        $privChildren->delete = false;
                                        $privChildren->saveOrFail();
                                    }
                                }
                            }
                        }
                        break;
                    case 'create' :
                        $privilege->create = ! $privilege->create;
                        if (! $privilege->create) {
                            $privilege->update = false;
                            $privilege->delete = false;
                        }
                        break;
                    case 'update' :
                        $privilege->update = ! $privilege->update;
                        if (! $privilege->update) {
                            $privilege->delete = false;
                        }
                        break;
                    case 'delete' :
                        $privilege->delete = ! $privilege->delete;
                        break;
                }
                $privilege->saveOrFail();
                $response = $privilege;
            }
            return $this->table(new Request(['id' => $privilege->level]))->first();
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
            new SwitchDB("mysql");
            $levels = UserLevel::orderBy('created_at', 'asc')->where('for_public',true);
            if (strlen($request->id) > 0) {
                $levels = $levels->where('id', $request->id);
            } else {
                if ($request->has(__('companies.form_input.name'))) {
                    $levels = $levels->where('company', $request[__('companies.form_input.name')])->orWhereNull('company')
                        ->where('for_client',true)
                        ->whereNotIn('name',['Super Admin','Billing','Customer']);
                }
                if ($this->me != null) {
                    if ($this->me->company != null) {
                        $levels = $levels->where('company', $this->me->company)->orWhereNull('company')
                            ->where('for_client',true)
                            ->whereNotIn('name',['Super Admin','Billing','Customer']);
                    }
                }
            }
            $levels = $levels->get();
            foreach ($levels as $level) {
                $response->push((object) [
                    'value' => $level->id,
                    'label' => $level->name,
                    'meta' => (object) [
                        'description' => $level->description,
                        'company' => $level->companyObj,
                        'super' => $level->super,
                        'default' => $level->is_default,
                        'client' => $level->for_client,
                        'require' => (object) [
                            'nas' => $level->require_nas
                        ],
                        'privileges' => $this->privilegeTables($level),
                    ]
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param UserLevel $level
     * @return Collection
     * @throws Exception
     */
    private function privilegeTables(UserLevel $level): Collection
    {
        try {
            $response = collect();
            $menus = Menu::whereNull('parent')->orderBy('order', 'asc')->get();
            foreach ($menus as $menu) {
                $privilege = UserPrivilege::where('level', $level->id)->where('route', $menu->route)->first();
                if ($privilege != null) {
                    $response->push((object) [
                        'value' => $privilege->id,
                        'label' => $menu->name,
                        'meta' => (object) [
                            'langs' => (object) [
                                'menu' => $menu->lang,
                                'description' => $menu->description,
                            ],
                            'route' => $menu->route,
                            'url' => route($menu->route),
                            'icon' => $menu->icon,
                            'function' => $menu->function,
                            'client' => $menu->for_client,
                            'childrens' => $this->privilegeChildrens($menu, $level),
                            'can' => (object) [
                                'read' => $privilege->read,
                                'create' => $privilege->create,
                                'update' => $privilege->update,
                                'delete' => $privilege->delete,
                            ],
                        ]
                    ]);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Menu $parent
     * @param UserLevel $level
     * @return Collection
     * @throws Exception
     */
    private function privilegeChildrens(Menu $parent, UserLevel $level): Collection
    {
        try {
            $response = collect();
            $menus = Menu::where('parent', $parent->id)->orderBy('order', 'asc')->get();
            foreach ($menus as $menu) {
                $privilege = UserPrivilege::where('level', $level->id)->where('route', $menu->route)->first();
                if ($privilege != null) {
                    $response->push((object) [
                        'value' => $privilege->id,
                        'label' => $menu->name,
                        'meta' => (object) [
                            'langs' => (object) [
                                'menu' => $menu->lang,
                                'description' => $menu->description,
                            ],
                            'route' => $menu->route,
                            'url' => route($menu->route),
                            'icon' => $menu->icon,
                            'function' => $menu->function,
                            'client' => $menu->for_client,
                            'can' => (object) [
                                'read' => $privilege->read,
                                'create' => $privilege->create,
                                'update' => $privilege->update,
                                'delete' => $privilege->delete,
                            ]
                        ]
                    ]);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
