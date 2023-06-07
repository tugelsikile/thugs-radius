<?php /** @noinspection DuplicatedCode */
/** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories\Nas;

use App\Models\Nas\NasProfilePool;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;
use Throwable;

class PoolRepository
{
    /* @
     * @param Request $request
     * @return bool
     * @throws Exception
     */
    public function delete(Request $request): bool
    {
        try {
            $pools = NasProfilePool::whereIn('id', $request->id)->get();
            foreach ($pools as $pool) {
                switch ($pool->nasObj->method) {
                    case 'api' :
                        deleteIPPool($pool);
                        break;
                    case 'ssl' :
                        deleteIPPoolSSL($pool);
                        break;
                }
                $pool->delete();
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
    public function update(Request $request) {
        try {
            $regenerate = false;
            $me = auth()->guard('api')->user();
            $pool = NasProfilePool::where('id', $request[__('nas.pools.form_input.id')])->first();
            if ($request->has(__('companies.form_input.name'))) {
                $pool->company = $request[__('companies.form_input.name')];
            }
            $pool->nas = $request[__('nas.form_input.name')];
            $defaultName = $pool->name;
            $pool->name = $request[__('nas.pools.form_input.name')];
            $pool->description = strlen($request[__('nas.pools.form_input.description')]) == 0 ? '' : $request[__('nas.pools.form_input.description')];
            if ($pool->first_address != $request[__('nas.pools.form_input.address.first')]) {
                $regenerate = true;
            }
            $pool->first_address = $request[__('nas.pools.form_input.address.first')];
            if ($pool->last_address != $request[__('nas.pools.form_input.address.last')]) {
                $regenerate = true;
            }
            $pool->last_address = $request[__('nas.pools.form_input.address.last')];
            $pool->updated_by = $me->id;
            $pool->saveOrFail();
            if ($regenerate) {
                @generateIPAvailable($pool);
            }
            if ($request[__('nas.pools.form_input.upload')] == 1) {
                switch ($pool->nasObj->method) {
                    case 'api' :
                        @uploadIPPool($pool, $defaultName);
                        break;
                    case 'ssl' :
                        @uploadIPPoolSSL($pool, $defaultName);
                        break;
                }

            }
            return $this->table(new Request(['id' => $pool->id]))->first();
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
            $me = auth()->guard('api')->user();
            $pool = new NasProfilePool();
            $pool->id = Uuid::uuid4()->toString();
            if ($request->has(__('companies.form_input.name'))) {
                $pool->company = $request[__('companies.form_input.name')];
            }
            $pool->nas = $request[__('nas.form_input.name')];
            $pool->name = $request[__('nas.pools.form_input.name')];
            $pool->description = strlen($request[__('nas.pools.form_input.description')]) == 0 ? '' : $request[__('nas.pools.form_input.description')];
            $pool->first_address = $request[__('nas.pools.form_input.address.first')];
            $pool->last_address = $request[__('nas.pools.form_input.address.last')];
            $pool->created_by = $me->id;
            $pool->saveOrFail();
            @generateIPAvailable($pool);
            if ($request[__('nas.pools.form_input.upload')] == 1) {
                switch ($pool->nasObj->method) {
                    case 'api' :
                        @uploadIPPool($pool);
                        break;
                    case 'ssl' :
                        @uploadIPPoolSSL($pool, $pool->name);
                        break;
                }
            }
            return $this->table(new Request(['id' => $pool->id]))->first();
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
            $me = auth()->guard('api')->user();
            $response = collect();
            $pools = NasProfilePool::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $pools = $pools->where('id', $request->id);
            if (strlen($request->nas) > 0) $pools = $pools->where('nas', $request->nas);
            if ($me != null) {
                if ($me->company != null) $pools = $pools->where('company', $me->company);
            }
            $pools = $pools->get();
            if ($pools->count() > 0) {
                foreach ($pools as $pool) {
                    $response->push((object) [
                        'value' => $pool->id,
                        'label' => $pool->name,
                        'meta' => (object) [
                            'description' => $pool->description,
                            'company' => $pool->companyObj,
                            'nas' => $pool->nasObj,
                            'address' => (object) [
                                'id' =>$pool->mikrotik_id,
                                'first' => $pool->first_address,
                                'last' => $pool->last_address,
                            ],
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => $pool->created_at,
                                    'by' => $pool->createdBy
                                ],
                                'update' => (object) [
                                    'at' => $pool->updated_at,
                                    'by' => $pool->updatedBy
                                ]
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
