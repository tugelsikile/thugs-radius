<?php /** @noinspection DuplicatedCode */

namespace App\Validations\Nas;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PoolValidation
{
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
                'id.*' => 'required|exists:nas_profile_pools,id'
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
            $valid = Validator::make($request->all(),[
                __('nas.pools.form_input.id') => 'required|exists:nas_profile_pools,id',
                __('companies.form_input.name') => 'required|exists:client_companies,id',
                __('nas.form_input.name') => 'required|exists:nas,id',
                __('nas.pools.form_input.name') => 'required|string|min:1|max:50|unique:nas_profile_pools,name,'.$request[__('nas.pools.form_input.id')].',id,nas,' . $request[__('nas.form_input.name')],
                __('nas.pools.form_input.description') => 'nullable',
                __('nas.pools.form_input.address.first') => 'required|ipv4',
                __('nas.pools.form_input.address.last') => 'required_with:'.$request[__('nas.pools.form_input.address.first')].'|ipv4',
                __('nas.pools.form_input.upload') => 'required|boolean'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            $firstIP = collect(explode('.', $request[__('nas.pools.form_input.address.first')]));
            $lastIP = collect(explode('.', $request[__('nas.pools.form_input.address.last')]));
            foreach ($lastIP as $index => $item) {
                if ((int) $item < (int) $firstIP->get($index)) {
                    throw new Exception(__('nas.pools.labels.address.error',[
                        'ip' => $request[__('nas.pools.form_input.address.last')],
                        'index' => $index,
                        'blok' => $item,
                        'ip2' => $request[__('nas.pools.form_input.address.first')],
                        'index2' => $index,
                        'blok2' => $firstIP->get($index)
                    ]),400);
                }
            }
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
            $valid = Validator::make($request->all(),[
                __('companies.form_input.name') => 'required|exists:client_companies,id',
                __('nas.form_input.name') => 'required|exists:nas,id',
                __('nas.pools.form_input.name') => 'required|string|min:1|max:50|unique:nas_profile_pools,name,null,null,nas,' . $request[__('nas.form_input.name')],
                __('nas.pools.form_input.description') => 'nullable',
                __('nas.pools.form_input.address.first') => 'required|ipv4',
                __('nas.pools.form_input.address.last') => 'required_with:'.$request[__('nas.pools.form_input.address.first')].'|ipv4',
                __('nas.pools.form_input.upload') => 'required|boolean'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            $firstIP = collect(explode('.', $request[__('nas.pools.form_input.address.first')]));
            $lastIP = collect(explode('.', $request[__('nas.pools.form_input.address.last')]));
            foreach ($lastIP as $index => $item) {
                if ((int) $item < (int) $firstIP->get($index)) {
                    throw new Exception(__('nas.pools.labels.address.error',[
                        'ip' => $request[__('nas.pools.form_input.address.last')],
                        'index' => $index + 1,
                        'block' => $item,
                        'ip2' => $request[__('nas.pools.form_input.address.first')],
                        'index2' => $index + 1,
                        'block2' => $firstIP->get($index)
                    ]),400);
                }
            }
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
