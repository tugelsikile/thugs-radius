<?php /** @noinspection DuplicatedCode */

/** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories\Nas;

use App\Helpers\MikrotikAPI;
use App\Helpers\MiktorikSSL;
use App\Helpers\SwitchDB;
use App\Models\Nas\NasProfile;
use App\Models\Nas\NasProfileBandwidth;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;
use Throwable;

class BandwidthRepository
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
    public function delete(Request $request): bool
    {
        try {
            new SwitchDB();
            NasProfileBandwidth::whereIn('id', $request->id)->delete();
            /**** TODO ***
             * hapus juga di routerboards / nas
             */
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function update(Request $request) {
        try {
            new SwitchDB();
            $bandwidth = NasProfileBandwidth::where('id', $request[__('bandwidths.form_input.id')])->first();
            $bandwidth->name = $request[__('bandwidths.form_input.name')];
            $bandwidth->description = $request[__('bandwidths.form_input.description')];
            $bandwidth->max_limit_up = $request[__('bandwidths.form_input.max_limit.up')];
            $bandwidth->max_limit_down = $request[__('bandwidths.form_input.max_limit.down')];
            $bandwidth->burst_limit_up = $request[__('bandwidths.form_input.burst.up')];
            $bandwidth->burst_limit_down = $request[__('bandwidths.form_input.burst.down')];
            $bandwidth->threshold_up = $request[__('bandwidths.form_input.threshold.up')];
            $bandwidth->threshold_down = $request[__('bandwidths.form_input.threshold.down')];
            $bandwidth->burst_time_up = $request[__('bandwidths.form_input.time.down')];
            $bandwidth->burst_time_down = $request[__('bandwidths.form_input.time.down')];
            $bandwidth->limit_at_up = $request[__('bandwidths.form_input.limit_at.down')];
            $bandwidth->limit_at_down = $request[__('bandwidths.form_input.limit_at.down')];
            $bandwidth->priority = $request[__('bandwidths.form_input.priority')];
            $bandwidth->updated_by = $this->me->id;
            $bandwidth->saveOrFail();

            /*$profiles = NasProfile::where('bandwidth', $bandwidth->id)->get();
            foreach ($profiles as $profile) {
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
            return $this->table(new Request(['id' => $bandwidth->id]))->first();
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
            $bandwidth = new NasProfileBandwidth();
            $bandwidth->id = Uuid::uuid4()->toString();
            $bandwidth->name = $request[__('bandwidths.form_input.name')];
            $bandwidth->description = $request[__('bandwidths.form_input.description')];
            $bandwidth->max_limit_up = $request[__('bandwidths.form_input.max_limit.up')];
            $bandwidth->max_limit_down = $request[__('bandwidths.form_input.max_limit.down')];
            $bandwidth->burst_limit_up = $request[__('bandwidths.form_input.burst.up')];
            $bandwidth->burst_limit_down = $request[__('bandwidths.form_input.burst.down')];
            $bandwidth->threshold_up = $request[__('bandwidths.form_input.threshold.up')];
            $bandwidth->threshold_down = $request[__('bandwidths.form_input.threshold.down')];
            $bandwidth->burst_time_up = $request[__('bandwidths.form_input.time.down')];
            $bandwidth->burst_time_down = $request[__('bandwidths.form_input.time.down')];
            $bandwidth->limit_at_up = $request[__('bandwidths.form_input.limit_at.down')];
            $bandwidth->limit_at_down = $request[__('bandwidths.form_input.limit_at.down')];
            $bandwidth->priority = $request[__('bandwidths.form_input.priority')];
            $bandwidth->created_by = $this->me->id;
            $bandwidth->saveOrFail();
            return $this->table(new Request(['id' => $bandwidth->id]))->first();
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
            new SwitchDB();
            $response = collect();
            $bandwidths = NasProfileBandwidth::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $bandwidths = $bandwidths->where('id', $request->id);
            $bandwidths = $bandwidths->get();
            if ($bandwidths->count() > 0) {
                foreach ($bandwidths as $bandwidth) {
                    $response->push((object) [
                        'value' => $bandwidth->id,
                        'label' => $bandwidth->name,
                        'meta' => (object) [
                            'description' => $bandwidth->description == null ? '' : $bandwidth->description,
                            'max_limit' => (object) [
                                'up' => $bandwidth->max_limit_up,
                                'down' => $bandwidth->max_limit_down,
                            ],
                            'burst' => (object) [
                                'up' => $bandwidth->burst_limit_up,
                                'down' => $bandwidth->burst_limit_down,
                            ],
                            'threshold' => (object) [
                                'up' => $bandwidth->threshold_up,
                                'down' => $bandwidth->threshold_down,
                            ],
                            'time' => (object) [
                                'up' => $bandwidth->burst_time_up,
                                'down' => $bandwidth->burst_time_down
                            ],
                            'limit_at' => (object) [
                                'up' => $bandwidth->limit_at_up,
                                'down' => $bandwidth->limit_at_down,
                            ],
                            'priority' => $bandwidth->priority,
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => $bandwidth->created_at,
                                    'by' => $bandwidth->createdBy
                                ],
                                'update' => (object) [
                                    'at' => $bandwidth->updated_at,
                                    'by' => $bandwidth->updatedBy
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
