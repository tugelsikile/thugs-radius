<?php

namespace App\Repositories\User;

use App\Models\User\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Ramsey\Uuid\Uuid;

class UserRepository
{
    protected $levelRepository;
    public function __construct()
    {
        $this->levelRepository = new PrivilegeRepository();
    }
    public function delete(Request $request) {
        try {
            User::whereIn('id', $request->id)->delete();
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function create(Request $request) {
        try {
            $user = new User();
            $user->id = Uuid::uuid4()->toString();
            $user->level = $request[__('messages.users.form_input.level')];
            if ($request->has(__('messages.users.form_input.company'))) {
                $user->company = $request[__('messages.users.form_input.company')];
            }
            $user->name = $request[__('messages.users.form_input.name')];
            $user->email = $request[__('messages.users.form_input.email')];
            $user->password = Hash::make($request[__('messages.users.form_input.password')]);
            $user->locale = (object) [
                'lang' => $request[__('messages.users.form_input.lang')],
                'date_format' => $request[__('messages.users.form_input.date_format')],
                'time_zone' => 'Asia/Jakarta'
            ];
            $user->saveOrFail();

            return $this->table(new Request(['id' => $user->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function update(Request $request) {
        try {
            $user = User::where('id', $request->id)->first();
            $user->level = $request[__('messages.users.form_input.level')];
            if ($request->has(__('messages.users.form_input.company'))) {
                $user->company = $request[__('messages.users.form_input.company')];
            } else {
                $user->company = null;
            }
            $user->name = $request[__('messages.users.form_input.name')];
            $user->email = $request[__('messages.users.form_input.email')];
            if ($request->has(__('messages.users.form_input.password'))) {
                $user->password = Hash::make($request[__('messages.users.form_input.password')]);
            }
            $user->locale = (object) [
                'lang' => $request[__('messages.users.form_input.lang')],
                'date_format' => $request[__('messages.users.form_input.date_format')],
                'time_zone' => 'Asia/Jakarta'
            ];
            $user->saveOrFail();

            return $this->table(new Request(['id' => $user->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function table(Request $request) {
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
                        'avatar' => getAvatar($user),
                        'email' => $user->email,
                        'locale' => $user->locale,
                        'company' => $user->companyObj,
                        'level' => $this->levelRepository->table(new Request(['id' => $user->level]))->first(),
                    ]
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
