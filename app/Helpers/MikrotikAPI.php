<?php /** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUnhandledExceptionInspection */

namespace App\Helpers;

use App\Models\Customer\Customer;
use App\Models\Nas\Nas;
use App\Models\Nas\NasProfile;
use App\Models\Nas\NasProfileBandwidth;
use App\Models\Nas\NasProfilePool;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use RouterOS\Client;
use RouterOS\Query;

class MikrotikAPI
{
    protected $query;
    protected $client;
    protected $me;
    public function __construct(Nas $nas = null)
    {
        if ($nas != null) {
            $hostname = $nas->nasname . ':' . $nas->method_port;
            try {
                $this->client = new Client([
                    "host" => $hostname, "user" => $nas->user, "pass" => $nas->password, "timeout" => 1, "attempts" => 1
                ]);
            } catch (Exception $exception) {

            }
        }
        $this->query = '';
        $this->me = auth()->guard('api')->user();
    }
    public function statusActivePPPoEServer() {
        try {
            $this->query = (new Query("/interface/pppoe-server/server/print"));
            if ($this->client->connect()) {
                $res = collect($this->client->query($this->query)->read());
                if ($res->count() > 0) {
                    foreach ($res as $item) {
                        if ($item['disabled'] == 'false') {
                            return $item;
                        }
                    }
                }
            }
            return null;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }
    public function statusAAARadius() {
        try {
            $this->query = (new Query("/ppp/aaa/print"));
            if ($this->client->connect()) {
                $res = collect($this->client->query($this->query)->read());
                if ($res->count() > 0) {
                    return $res->first();

                }
            }
            return null;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }
    public function statusRadius() {
        try {
            $this->query = (new Query("/radius/print"));
            if ($this->client->connect()) {
                $res = collect($this->client->query($this->query)->read());
                if ($res->count() > 0) {
                    foreach ($res as $item) {
                        if ($item['disabled'] == 'false') {
                            return $item;
                        }
                    }
                }
            }
            return null;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }
    public function statusRadiusIncoming() {
        try {
            $this->query = (new Query("/radius/incoming/print"));
            if ($this->client->connect()) {
                $res = collect($this->client->query($this->query)->read());
                if ($res->count() > 0) {
                    return $res->first();
                }
            }
            return null;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }
    /* @
     * @return Collection
     * @throws Exception
     */
    public function checkRequirementPPPoE(): Collection
    {
        try {
            $response = collect();
            $response->push((object)[ 'value' => 'pppoe-server', 'label' => __('nas.requirements.pppoe.server.status'), 'status' => $this->statusActivePPPoEServer() ]);
            $response->push((object)[ 'value' => 'radius', 'label' => __('nas.requirements.radius.server.status'), 'status' => $this->statusRadius() ]);
            $response->push((object)[ 'value' => 'radius-aaa', 'label' => __('nas.requirements.radius.aaa.status'), 'status' => $this->statusAAARadius() ]);
            $response->push((object)[ 'value' => 'radius-incoming', 'label' => __('nas.requirements.radius.incoming.status'), 'status' => $this->statusRadiusIncoming() ]);
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function statusHotspotServer() {
        try {
            $this->query = (new Query("/ip/hotspot/print"));
            if ($this->client->connect()) {
                $res = collect($this->client->query($this->query)->read());
                if ($res->count() > 0) {
                    foreach ($res as $item) {
                        if ($item['disabled'] == 'false') {
                            return $item;
                        }
                    }
                }
            }
            return null;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }
    public function statusHotspotServerProfile() {
        try {
            $this->query = (new Query("/ip/hotspot/profile/print"));
            if ($this->client->connect()) {
                $res = collect($this->client->query($this->query)->read());
                if ($res->count() > 0) {
                    foreach ($res as $item) {
                        if (array_key_exists('use-radius', $item)) {
                            if ($item['use-radius'] != 'false') {
                                return $item;
                            }
                        }
                    }
                }
            }
            return null;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }
    /* @
     * @return Collection
     * @throws Exception
     */
    public function checkRequirementHotspot(): Collection
    {
        try {
            $response = collect();
            $response->push((object)[ 'value' => 'hotspot-server', 'label' => __('nas.requirements.hotspot.server.status'),'status' => $this->statusHotspotServer() ]);
            $response->push((object)[ 'value' => 'hotspot-server-profile', 'label' => __('nas.requirements.hotspot.profile.status'), 'status' => $this->statusHotspotServerProfile() ]);
            $response->push((object)[ 'value' => 'radius', 'label' => __('nas.requirements.radius.server.status'), 'status' => $this->statusRadius() ]);
            $response->push((object)[ 'value' => 'radius-aaa', 'label' => __('nas.requirements.radius.aaa.status'), 'status' => $this->statusAAARadius() ]);
            $response->push((object)[ 'value' => 'radius-incoming', 'label' => __('nas.requirements.radius.incoming.status'), 'status' => $this->statusRadiusIncoming() ]);
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @return Collection
     */
    public function allOnlineUsers(): Collection
    {
        try {
            $response = collect();
            $this->query = (new Query("/ppp/active/print"));
            if ($this->client != null) {
                if ($this->client->connect()) {
                    $pppoe = collect($this->client->query($this->query)->read());
                    if ($pppoe->count() > 0) {
                        foreach ($pppoe as $item) {
                            $response->push($item);
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return collect();
        }
    }
    public function statusUserPPPoE(Customer $customer) {
        try {
            $this->query = (new Query("/ppp/active/print"))
                ->where('name', $customer->nas_username);
            if (!$this->client->connect()) throw new Exception(__('wizard.errors.mikrotik.not_connect'),500);
            $res = collect($this->client->query($this->query)->read());
            if ($res->count() > 0) {
                $res = $res->first();
            } else {
                throw new Exception(__('labels.select.not_found',['Attribute' => __('customers.labels.menu')]),400);
            }
            return $res;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function interfaceIpAddressRequest(Request $request) {
        try {
            $this->client = new Client([
                "host" => $request[__('nas.form_input.ip')] . ':' . $request[__('nas.form_input.port')],
                "user" => $request[__('nas.form_input.user')], "attempts" => 1,
                "pass" => $request[__('nas.form_input.pass')], "timeout" => 1,
            ]);
            $this->query = (new Query("/ip/address/print"));
            $response = $this->client->query($this->query)->read();
            if (collect($response)->count() > 0) {
                return collect($response)->map(function ($data){
                    return (object) [
                        'value' => $data['.id'],
                        'label' => $data['interface'],
                        'meta' => (object) [
                            'address' => $data['address'],
                            'network' => $data['network'],
                        ]
                    ];
                });
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request|null $request
     * @return object
     */
    public function testConnection(Request $request = null): object
    {
        try {
            $response = (object) ['message' => '', 'success' => false];
            if ($request != null) {
                $hostname = $request[__('nas.form_input.ip')] . ':' . $request[__('nas.form_input.port')];
                $this->client = new Client([
                    "host" => $hostname, "user" => $request[__('nas.form_input.user')], "pass" => $request[__('nas.form_input.pass')], "timeout" => 1, "attempts" => 1
                ]);
            }
            if ($this->client != null) {
                if ($this->client->connect()) {
                    $this->query = (new Query('/system/identity/print'));
                    try {
                        $res = collect($this->client->query($this->query)->read());
                        if ($res->count() > 0) {
                            $res = $res->first();
                            $response->message = $res['name'];
                            $response->success = true;
                        }
                    } catch (Exception $exception) {
                        throw new Exception($exception->getMessage(),500);
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return (object) ['message' => $exception->getMessage(), 'success' => false];
        }
    }
    public function rateLimit(NasProfileBandwidth $profileBandwidth = null): ?string
    {
        try {
            if ($profileBandwidth != null) {
                $bw = $profileBandwidth;
                $string = collect();
                if ($bw->max_limit_up > 0 || $bw->max_limit_down > 0) {
                    if (($bw->max_limit_up / 1000) < 1 || ($bw->max_limit_down / 1000) < 1) {
                        $string->push( $bw->max_limit_up . 'K/' . $bw->max_limit_down . 'K');
                    } else {
                        $string->push(( $bw->max_limit_up / 1000 )  . 'M/' . ( $bw->max_limit_down / 1000 ). 'M');
                    }
                }
                if ($bw->burst_limit_down > 0 || $bw->burst_limit_up > 0) {
                    if (($bw->burst_limit_down / 1000) < 1 || ($bw->burst_limit_up / 1000) < 1) {
                        $string->push($bw->burst_limit_up . 'K/' . $bw->burst_limit_down . 'K');
                    } else {
                        $string->push(( $bw->burst_limit_up / 1000 ) . 'M/' . ( $bw->burst_limit_down / 1000 ) .'M');
                    }
                }
                if ($bw->threshold_up > 0 || $bw->threshold_down > 0) {
                    if (($bw->threshold_up / 1000) < 1 || ($bw->threshold_down / 1000) < 1) {
                        $string->push( $bw->threshold_up . 'K/' .  $bw->threshold_down .'K');
                    } else {
                        $string->push( ( $bw->threshold_up / 1000 ) . 'M/' . ( $bw->threshold_down / 1000 ).'M');
                    }
                }
                if ($bw->limit_at_up > 0 || $bw->limit_at_down > 0) {
                    if (($bw->limit_at_up / 1000) < 1 || ($bw->limit_at_down / 1000) < 1) {
                        $string->push($bw->limit_at_up . 'K/' . $bw->limit_at_up . 'K');
                    } else {
                        $string->push(( $bw->limit_at_up / 1000 ) . 'M/' . ( $bw->limit_at_up / 1000 ) . 'M');
                    }
                }
                if ($bw->burst_time_up > 0 || $bw->burst_time_down > 0) {
                    $string->push($bw->burst_time_up . '/' . $bw->burst_time_down);
                }
                /*if ($bw->max_limit_up > 0 || $bw->max_limit_down > 0) {
                    $string->push($bw->priority . '/' . $bw->priority);
                }*/
                if ($string->count() > 0) {
                    return $string->join(" ");
                }
            }
            return null;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }
    public function saveIPPool(NasProfilePool $nasProfilePool, $defaultName) {
        try {
            if ($this->client != null) {
                $this->query = (new Query("/ip/pool/print"))
                    ->where('name', $defaultName);
                $find = $this->client->query($this->query)->read();
                if (collect($find)->count() == 0) {
                    $this->query = (new Query("/ip/pool/add"))
                        ->equal("name", $defaultName)
                        ->equal("ranges", $nasProfilePool->first_address . '-' . $nasProfilePool->last_address);
                    //->equal("comment", $this->me == null ? '' : "created by "  . $this->me->name . ' at ' . Carbon::now()->translatedFormat('d F Y, H:i:s'));
                } else {
                    if (array_key_exists('.id', $find)) {
                        $this->query = (new Query("/ip/pool/set"))
                            ->where('.id', $find['.id'])
                            ->equal("name", $defaultName)
                            ->equal("ranges", $nasProfilePool->first_address . '-' . $nasProfilePool->last_address);
                        //->equal("comment", $this->me == null ? '' : "updated by " . $this->me->name . ' at ' . Carbon::now()->translatedFormat('d F Y, H:i:s'));
                    }
                }
                $response = $this->client->query($this->query)->read();
                if (array_key_exists('ret', $response) || array_key_exists('after', $response)) {
                    if ($nasProfilePool->pool_id == null) {
                        $nasProfilePool->pool_id = $response['after']['ret'];
                        $nasProfilePool->saveOrFail();
                    }
                } else {
                    if ($nasProfilePool->pool_id == null) {
                        $nasProfilePool->pool_id = $response['.id'];
                        $nasProfilePool->saveOrFail();
                    }
                }
                return  $response;
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }
    public function deleteIPPool(NasProfilePool $nasProfilePool) {
        try {
            $this->query = (new Query("/ip/pool/print"))->where('name', $nasProfilePool->name);
            if ($nasProfilePool->pool_id != null) {
                $this->query = (new Query("/ip/pool/print"))
                    ->where('.id', $nasProfilePool->pool_id);
            }
            $find = $this->client->query($this->query)->read();
            if (collect($find)->count() > 0) {
                $find = (array) collect($find)->first();
                $this->query = (new Query('/ip/pool/remove'))
                    ->equal('.id', $find['.id']);
                $this->client->query($this->query)->read();
            }
            return $find;
        } catch (Exception $exception) {
            Log::error($exception->getMessage());
            return null;
        }
    }

    /* @
     * @return Collection|null
     */
    public function getParentQueue(): ?Collection
    {
        try {
            $this->query = (new Query("/queue/simple/print"))
                ->where("parent","none");
            return collect($this->client->query($this->query)->read());
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }
    public function saveProfilePPPoE(NasProfile $nasProfile, $defaultName) {
        try {
            if ($this->client != null) {
                $this->query = (new Query("/ppp/profile/print"))
                    ->where("name", $defaultName);
                if ($nasProfile->profile_id != null) {
                    $this->query = (new Query("/ppp/profile/print"))
                        ->where('.id', $nasProfile->profile_id);
                }
                $res = $this->client->query($this->query)->read();
                if (collect($res)->count() > 0) {
                    $res = collect($res)->first();
                    $this->query = (new Query("/ppp/profile/set"))
                        ->equal("name", $nasProfile->code)
                        ->equal('local-address', $nasProfile->local_address)
                        ->equal('session-timeout','01:00:00')
                        ->equal('idle-timeout','00:30:00')
                        ->equal('only-one','yes');
                    if ($nasProfile->poolObj->module == 'mikrotik') {
                        $this->query = $this->query->equal('remote-address', $nasProfile->poolObj->code);
                    }
                    if (array_key_exists('.id', $res)) {
                        $this->query = $this->query->equal('.id', $res['.id']);
                        if ($nasProfile->profile_id == null) {
                            $nasProfile->profile_id = $res['.id'];
                            $nasProfile->saveOrFail();
                        }
                    } else {
                        $this->query = $this->query->equal('name', $nasProfile->code);
                    }
                    //dd($this->query);
                } else {
                    $this->query = (new Query("/ppp/profile/add"))
                        ->equal('name', $nasProfile->code)
                        ->equal('local-address', $nasProfile->local_address)
                        ->equal('session-timeout','01:00:00')
                        ->equal('idle-timeout','00:30:00')
                        ->equal('only-one','yes');
                    if ($nasProfile->poolObj->module == 'mikrotik') {
                        $this->query = $this->query->equal('remote-address', $nasProfile->poolObj->code);
                    }
                }
                if ($nasProfile->dns_servers != null) {
                    $this->query = $this->query->equal('dns-server', collect($nasProfile->dns_servers)->chunk(2)->first()->join(','));
                }
                if ($nasProfile->parent_queue != null) {
                    $this->query = $this->query->equal('parent-queue', $nasProfile->parent_queue->name);
                }
                $rl = $this->rateLimit($nasProfile->bandwidthObj);
                if ($rl != null || strlen($rl) > 3) {
                    $this->query = $this->query->equal('rate-limit', $rl);
                }
                $res = $this->client->query($this->query)->read();
                Log::alert($res == null);

                if ($res != null) {
                    if (array_key_exists('after', $res)) {
                        if (array_key_exists('ret', $res['after'])) {
                            $nasProfile->profile_id = $res['after']['ret'];
                            $nasProfile->saveOrFail();
                        }
                    }
                }
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
        //dd('ddd', $res,array_key_exists('ret', $res['after']));
    }
    public function saveProfileHotspot(NasProfile $nasProfile, $defaultName) {
        try {
            $this->query = (new Query("/ip/hotspot/user/profile/print"))
                ->where('name', $defaultName);
            if ($nasProfile->profile_id != null) {
                $this->query = (new Query("/ip/hotspot/user/profile/print"))
                    ->where('.id', $nasProfile->profile_id);
            }
            $res = $this->client->query($this->query)->read();
            if (collect($res)->count() > 0) {
                $this->query = (new Query("/ip/hotspot/user/profile/set"))
                    ->equal('name', $defaultName);
                $res = collect($res)->first();
                if (array_key_exists('.id', $res)) {
                    $this->query = $this->query->equal('.id', $res['.id']);
                }
            } else {
                $this->query = (new Query("/ip/hotspot/user/profile/add"))
                    ->equal("name", $nasProfile->code)
                    ->equal('session-timeout','00:40:00')
                    ->equal('idle-timeout','00:20:00')
                    ->equal('status-autorefresh','00:10:00')
                    ->equal('shared-users', 1)
                    ->equal('mac-cookie-timeout','1d 00:00:00')
                    ->equal('add-mac-cookie','yes');
            }
            if ($nasProfile->poolObj->module == 'mikrotik') {
                $this->query = $this->query->equal("address-pool", $nasProfile->poolObj->code);
            }
            $rl = $this->rateLimit($nasProfile->bandwidthObj);
            if ($rl != null || strlen($rl) > 3) {
                $this->query = $this->query->equal('rate-limit', $rl);
            }
            if ($nasProfile->parent_queue != null) {
                $this->query = $this->query->equal('parent-queue', $nasProfile->parent_queue->name);
            }
            $res = $this->client->query($this->query)->read();
            if ($res != null) {
                if (array_key_exists('after', $res)) {
                    if (array_key_exists('ret', $res['after'])) {
                        $nasProfile->profile_id = $res['after']['ret'];
                        $nasProfile->saveOrFail();
                    }
                }
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }

    /* @
     * @param Customer $customer
     * @return void
     */
    public function kickOnlinePPPoE(Customer $customer) {
        try {
            $this->query = (new Query("/ppp/active/print"))
                ->where('name', $customer->nas_username);
            $responses = $this->client->query($this->query)->read();
            if (collect($responses)->count() > 0) {
                foreach (collect($responses) as $item) {
                    if ($item['name'] == $customer->nas_username) {
                        $this->query = (new Query("/ppp/active/remove"))
                            ->equal('.id', $item['.id']);
                        $this->client->query($this->query)->read();
                    }
                }
            }
            return;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }

    /* @
     * @param Customer $customer
     * @return void
     */
    public function kickOnlineHostpot(Customer $customer) {
        try {
            $this->query = (new Query("/ip/hotspot/active/print"))
                ->where('user', $customer->nas_username);
            $responses = $this->client->query($this->query)->read();
            if (collect($responses)->count() > 0) {
                foreach (collect($responses) as $item) {
                    if ($item['user'] == $customer->nas_username) {
                        $this->query = (new Query("/ip/hotspot/active/remove"))
                            ->equal('.id', $item['.id']);
                        $this->client->query($this->query)->read();
                    }
                }
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }
}
