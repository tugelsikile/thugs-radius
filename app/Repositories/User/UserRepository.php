<?php /** @noinspection PhpUndefinedMethodInspection */

/** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories\User;

use App\Models\User\User;
use App\Models\User\UserLevel;
use App\Models\User\UserLog;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Ramsey\Uuid\Uuid;
use Throwable;

class UserRepository
{
    protected $levelRepository;
    protected $me;
    public function __construct()
    {
        $this->levelRepository = new PrivilegeRepository();
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
            $levelIncludes = UserLevel::whereIn('name',['Customer','Operator'])->orWhere('company', $this->me->company)->get('id');
            $users = User::whereIn('id', $request[__('users.form_input.id')])->get();
            if ($users->count() > 0) {
                /*** THIS PREVENT DELETED ALL USER ***/
                if ((User::where('company', $this->me->company)->whereNotIn('level', $levelIncludes->toArray())->count() - $users->count()) <= 0 ) {
                    throw new Exception(__('users.delete.error_user'),400);
                }
            }

            foreach ($users as $user) {
                /**** PREVENT SUPER ADMIN DELETION ****/
                if ($user->name !== 'Super Admin') {
                    $user->delete();
                }
            }
            return true;
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
            $user = new User();
            $user->id = Uuid::uuid4()->toString();
            $user->level = $request[__('users.privileges.form_input.name')];
            if ($request->has(__('companies.form_input.name'))) {
                $user->company = $request[__('companies.form_input.name')];
            }
            $user->name = $request[__('users.form_input.name')];
            $user->email = $request[__('users.form_input.email')];
            $user->password = Hash::make($request[__('users.form_input.password.current')]);
            $user->locale = (object) [
                'lang' => $request[__('users.form_input.lang')],
                'date_format' => $request[__('users.form_input.date_format')],
                'time_zone' => 'Asia/Jakarta'
            ];
            $user->created_by = $this->me->id;
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
    public function update(Request $request) {
        try {
            $adminLevel = UserLevel::where('name', 'Admin')->first();
            $updating = false;

            $user = User::where('id', $request[__('users.form_input.id')])->first();
            if ($request[__('users.privileges.form_input.name')] != $adminLevel->id) {
                $adminCounter = User::where('level', $adminLevel->id)->where('company', $user->company)->count();
                if (($adminCounter - 1) == 0) {
                    throw new Exception(__('users.update.error_admin'),400);
                }
            }
            if ($request[__('users.privileges.form_input.name')] != $user->level) $updating = true;
            if ($user->name != $request[__('users.form_input.name')]) $updating = true;
            if ($user->email != $request[__('users.form_input.email')]) $updating = true;

            $user->level = $request[__('users.privileges.form_input.name')];

            if ($request->has(__('companies.form_input.name'))) {
                if ($user->company != $request[__('companies.form_input.name')]) $updating = true;
                $user->company = $request[__('companies.form_input.name')];
            } else {
                if ($user->company != null) $updating = true;
                $user->company = null;
            }

            $user->name = $request[__('users.form_input.name')];
            $user->email = $request[__('users.form_input.email')];
            if ($user->locale->lang != $request[__('users.form_input.lang')]) $updating = true;
            if ($user->locale->date_format != $request[__('users.form_input.date_format')]) $updating = true;
            $user->locale = (object) [
                'lang' => $request[__('users.form_input.lang')],
                'date_format' => $request[__('users.form_input.date_format')],
                'time_zone' => 'Asia/Jakarta'
            ];
            if ($updating) {
                $user->updated_by = $this->me->id;
            }
            $user->saveOrFail();

            return $this->table(new Request(['id' => $user->id]))->first();
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
            $levelCustomer = UserLevel::where('name', 'Customer')->get('id');
            $users = User::orderBy('created_at', 'asc')->where('is_ghost',false)->whereNotIn('level', $levelCustomer->toArray());
            if (strlen($request->id) > 0) {
                $users = $users->where('id', $request->id);
            } else {
                if ($this->me != null) {
                    if ($this->me->company != null) {
                        $users = $users->where('company', $this->me->company);
                    }
                }
            }
            $users = $users->get();
            foreach ($users as $user) {
                $response->push((object) [
                    'value' => $user->id,
                    'label' => $user->name,
                    'meta' => (object) [
                        'avatar' => getAvatar($user),
                        'email' => $user->email,
                        'locale' => $user->locale,
                        'company' => $user->companyObj,
                        'level' => $this->levelRepository->table(new Request(['id' => $user->level]))->first(),
                        'last' => (object) [
                            'login' => UserLog::where('user', $user->id)->orderBy('created_at', 'desc')->where('url', url('/api/login'))->first(),
                            'activity' => UserLog::where('user', $user->id)->orderBy('created_at', 'desc')->first(),
                        ]
                    ]
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
