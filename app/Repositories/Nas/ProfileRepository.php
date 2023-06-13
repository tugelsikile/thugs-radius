<?php /** @noinspection DuplicatedCode */
/** @noinspection PhpUndefinedMethodInspection */

/** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories\Nas;

use App\Helpers\MikrotikAPI;
use App\Helpers\MiktorikSSL;
use App\Helpers\SwitchDB;
use App\Models\Nas\NasProfile;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;
use Throwable;

class ProfileRepository
{
    protected $me;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
    }

    /* @
     * @param Request $request
     * @return bool
     * @throws Exception
     */
    public function delete(Request $request) {
        try {
            NasProfile::whereIn('id', $request->id)->delete();
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
            new SwitchDB();
            $profile = NasProfile::where('id', $request[__('profiles.form_input.id')])->first();
            $profile->is_additional = $request[__('profiles.form_input.is_additional')] == 1;
            if ($request[__('profiles.form_input.is_additional')] == 0) { //is not additional
                $profile->type = $request[__('profiles.form_input.type')];
                $profile->nas = $request[__('nas.form_input.name')];
                $profile->pool = $request[__('nas.pools.form_input.name')];
                $profile->bandwidth = $request[__('bandwidths.form_input.name')];
                if ($request->has(__('profiles.form_input.queue.name'))) {
                    $queue = [ 'name' => $request[__('profiles.form_input.queue.name')], '.id' => null, 'target' ];
                    if ($request->has(__('profiles.form_input.queue.id'))) $queue['.id'] = $request[__('profiles.form_input.queue.id')];
                    if ($request->has(__('profiles.form_input.queue.target'))) $queue['target'] = $request[__('profiles.form_input.queue.target')];
                    $profile->parent_queue = (object) $queue;
                } else {
                    $profile->parent_queue = null;
                }
                if ($request->has(__('profiles.form_input.limitation.type'))) {
                    $profile->limit_type = $request[__('profiles.form_input.limitation.type')];
                    if ($request->has(__('profiles.form_input.limitation.rate'))) {
                        $profile->limit_rate = $request[__('profiles.form_input.limitation.rate')];
                    }
                    if ($request->has(__('profiles.form_input.limitation.unit'))) {
                        $profile->limit_rate_unit = $request[__('profiles.form_input.limitation.unit')];
                    }
                } else {
                    $profile->limit_rate = 0;
                    $profile->limit_rate_unit = null;
                    $profile->limit_type = null;
                }
                if ($request->has(__('profiles.form_input.address.dns'))) {
                    $dns = collect();
                    foreach ($request[__('profiles.form_input.address.dns')] as $item) {
                        $dns->push($item);
                    }
                    $profile->dns_servers = $dns->toArray();
                }
            }
            $defaultName = $profile->name;
            $profile->name = $request[__('profiles.form_input.name')];
            $profile->description = $request[__('profiles.form_input.description')];
            $profile->price = $request[__('profiles.form_input.price')];
            $profile->created_by = $this->me->id;


            /*if ($profile->nasObj != null) {
                switch ($profile->nasObj->method) {
                    case 'ssl' :
                        $ssl = new MiktorikSSL($profile->nasObj,'put');
                        switch ($profile->type) {
                            case 'pppoe' :
                                $ssl->saveProfilePPPoE($profile, $defaultName);
                                break;
                            case 'hotspot' :
                                $ssl->saveProfileHotspot($profile, $defaultName);
                                break;
                        }
                        break;
                    case 'api' :
                        $api = new MikrotikAPI($profile->nasObj);
                        switch ($profile->type) {
                            case 'pppoe' :
                                $api->saveProfilePPPoE($profile, $defaultName);
                                break;
                            case 'hotspot' :
                                $api->saveProfileHotspot($profile, $defaultName);
                                break;
                        }
                        break;
                }
            }*/
            $profile->saveOrFail();
            return $this->table(new Request(['id' => $profile->id]))->first();
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
            new SwitchDB();
            $profile = new NasProfile();
            $profile->id = Uuid::uuid4()->toString();
            $profile->is_additional = $request[__('profiles.form_input.is_additional')] == 1;
            if ($request[__('profiles.form_input.is_additional')] == 0) { //is not additional
                $profile->type = $request[__('profiles.form_input.type')];
                $profile->nas = $request[__('nas.form_input.name')];
                $profile->pool = $request[__('nas.pools.form_input.name')];
                $profile->bandwidth = $request[__('bandwidths.form_input.name')];
                if ($request->has(__('profiles.form_input.queue.name'))) {
                    $queue = [ 'name' => $request[__('profiles.form_input.queue.name')], '.id' => null, 'target' ];
                    if ($request->has(__('profiles.form_input.queue.id'))) $queue['.id'] = $request[__('profiles.form_input.queue.id')];
                    if ($request->has(__('profiles.form_input.queue.target'))) $queue['target'] = $request[__('profiles.form_input.queue.target')];
                    $profile->parent_queue = (object) $queue;
                } else {
                    $profile->parent_queue = null;
                }
                if ($request->has(__('profiles.form_input.limitation.type'))) {
                    $profile->limit_type = $request[__('profiles.form_input.limitation.type')];
                }
                if ($request->has(__('profiles.form_input.limitation.rate'))) {
                    $profile->limit_rate = $request[__('profiles.form_input.limitation.rate')];
                }
                if ($request->has(__('profiles.form_input.limitation.unit'))) {
                    $profile->limit_rate_unit = $request[__('profiles.form_input.limitation.unit')];
                }
                if ($request->has(__('profiles.form_input.address.dns'))) {
                    $dns = collect();
                    foreach ($request[__('profiles.form_input.address.dns')] as $item) {
                        $dns->push($item);
                    }
                    $profile->dns_servers = $dns->toArray();
                }
            }
            $profile->name = $request[__('profiles.form_input.name')];
            $profile->description = $request[__('profiles.form_input.description')];
            $profile->price = $request[__('profiles.form_input.price')];
            $profile->created_by = $this->me->id;


            /*if ($profile->nasObj != null) {
                switch ($profile->nasObj->method) {
                    case 'ssl' :
                        $ssl = new MiktorikSSL($profile->nasObj,'put');
                        switch ($profile->type) {
                            case 'pppoe' :
                                $ssl->saveProfilePPPoE($profile, $profile->name);
                                break;
                            case 'hotspot' :
                                $ssl->saveProfileHotspot($profile, $profile->name);
                                break;
                        }
                        break;
                    case 'api' :
                        $api = new MikrotikAPI($profile->nasObj);
                        switch ($profile->type) {
                            case 'pppoe' :
                                $api->saveProfilePPPoE($profile, $profile->name);
                                break;
                            case 'hotspot' :
                                $api->saveProfileHotspot($profile, $profile->name);
                                break;
                        }
                        break;
                }
            }*/
            $profile->saveOrFail();
            return $this->table(new Request(['id' => $profile->id]))->first();
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
            new SwitchDB();
            $profiles = NasProfile::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $profiles = $profiles->where('id', $request->id);
            $profiles = $profiles->get();
            if ($profiles->count() > 0) {
                foreach ($profiles as $profile) {
                    $response->push((object) [
                        'value' => $profile->id,
                        'label' => $profile->name,
                        'meta' => (object) [
                            'nas' => $profile->nasObj,
                            'pool' => $profile->poolObj,
                            'bandwidth' => $profile->bandwidthObj,
                            'description' => $profile->description == null ? '' : $profile->description,
                            'price' => $profile->price,
                            'type' => $profile->type,
                            'additional' => $profile->is_additional,
                            'queue' => $profile->parent_queue,
                            'dns' => $profile->dns_servers,
                            'limit' => (object) [
                                'type' => $profile->limit_type,
                                'rate' => $profile->limit_rate,
                                'unit' => $profile->limit_rate_unit,
                            ],
                            'customers' => collect(),
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
