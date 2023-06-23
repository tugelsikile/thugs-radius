<?php /** @noinspection PhpUndefinedFieldInspection */
/** @noinspection PhpIfWithCommonPartsInspection */

/** @noinspection DuplicatedCode */

namespace App\Validations\Nas;

use App\Helpers\SwitchDB;
use App\Models\Nas\Nas;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NasValidation
{
    protected $me;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
    }

    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function reloadStatus(Request $request): Request
    {
        new SwitchDB();
        try {
            $valid = Validator::make($request->all(),[
                __('nas.form_input.name') => 'required|exists:nas,id'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function parentQueue(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('nas.form_input.name') => 'required|exists:nas,id'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function encryptDecrypt(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'action' => 'required|in:encrypt,decrypt',
                'value' => 'required|string|min:100'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }

    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function delete(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'id' => 'required|array|min:1',
                'id.*' => 'required|exists:nas,id'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function update(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('nas.form_input.id') => 'required|exists:nas,id',
                __('nas.form_input.name') => 'required|string|min:1|max:50',
                __('nas.form_input.description') => 'nullable',
                __('nas.form_input.method') => 'required|string|in:api,ssl',
                __('nas.form_input.ip') => 'required|ip|ipv4|not_in:0.0.0.0|unique:nas,nasname,' . $request[__('nas.form_input.id')] . ',id',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            if ($request[__('nas.form_input.method')] == 'ssl') {
                $valid = Validator::make($request->all(),[
                    __('nas.form_input.domain') => 'required|url',
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            }
            $valid = Validator::make($request->all(),[
                __('nas.form_input.ip') => 'required|ip',
                __('nas.form_input.port') => 'required|numeric|min:100|max:999999999',
                __('nas.form_input.user') => 'required|string|min:0|max:50',
                __('nas.form_input.pass') => 'required|string|min:0|max:50|confirmed',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function create(Request $request): Request
    {
        try {
            new SwitchDB("mysql");
            $valid = Validator::make($request->all(),[
                __('companies.form_input.name') => 'required|exists:client_companies,id',
                __('nas.form_input.name') => 'required|string|min:1|max:50',
                __('nas.form_input.description') => 'nullable',
                __('nas.form_input.method') => 'required|string|in:api,ssl',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            new SwitchDB();
            if ($this->me != null) {
                if ($this->me->companyObj != null) {
                    if ($this->me->companyObj->packageObj != null) {
                        $request = $request->merge([
                            __('labels.form_input.max',['Attribute' => __('nas.form_input.id')]) => $this->me->companyObj->packageObj->max_routerboards,
                            __('labels.form_input.current',['Attribute' => __('nas.form_input.id')]) => Nas::orderBy('created_at', 'asc')->get('id')->count() + 1,
                        ]);
                    }
                }
            }
            $valid = Validator::make($request->all(),[
                __('nas.form_input.ip') => 'required|ip|ipv4|not_in:0.0.0.0|unique:nas,nasname',
                __('labels.form_input.current',['Attribute' => __('nas.form_input.id')]) => 'max:' . $request[__('labels.form_input.max',['Attribute' => __('nas.form_input.id')])]
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            if ($request[__('nas.form_input.method')] == 'ssl') {
                $valid = Validator::make($request->all(),[
                    __('nas.form_input.domain') => 'required|url',
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            }
            $valid = Validator::make($request->all(),[
                __('nas.form_input.port') => 'required|numeric|min:100|max:999999999',
                __('nas.form_input.user') => 'required|string|min:0|max:50',
                __('nas.form_input.pass') => 'required|string|min:0|max:50|confirmed',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function testConnection(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('nas.form_input.method') => 'required|string|in:api,ssl',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            if ($request[__('nas.form_input.method')] == 'api') {
                $valid = Validator::make($request->all(),[
                    __('nas.form_input.ip') => 'required|ip',
                    __('nas.form_input.port') => 'required|numeric|min:100|max:999999999',
                    __('nas.form_input.user') => 'required|string|min:0|max:50',
                    __('nas.form_input.pass') => 'required|string|min:0|max:50|confirmed',
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            } else {
                $valid = Validator::make($request->all(),[
                    __('nas.form_input.domain') => 'required|url',
                    __('nas.form_input.port') => 'required|numeric|min:100|max:999999999',
                    __('nas.form_input.user') => 'required|string|min:0|max:50',
                    __('nas.form_input.pass') => 'required|string|min:0|max:50|confirmed',
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            }
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
