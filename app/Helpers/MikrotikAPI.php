<?php /** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUnhandledExceptionInspection */

namespace App\Helpers;

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
    public function testConnection(Request $request = null) {
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
                        return $response;
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            return (object) ['message' => $exception->getMessage(), 'success' => false];
        }
    }
    public function rateLimit(NasProfileBandwidth $profileBandwidth = null) {
        try {
            if ($profileBandwidth != null) {
                $bw = $profileBandwidth;
                $string = collect();
                if ($bw->max_limit_up > 0 || $bw->max_limit_down > 0) {
                    $string->push(( $bw->max_limit_up / 1000 )  . 'M/' . ( $bw->max_limit_down / 1000 ). 'M');
                }
                if ($bw->burst_limit_down > 0 || $bw->burst_limit_up > 0) {
                    $string->push(( $bw->burst_limit_up / 1000 ) . 'M/' . ( $bw->burst_limit_down / 1000 ) .'M');
                }
                if ($bw->threshold_up > 0 || $bw->threshold_down > 0) {
                    $string->push( ( $bw->threshold_up / 1000 ) . 'k/' . ( $bw->threshold_down / 1000 ).'k');
                }
                if ($bw->limit_at_up > 0 || $bw->limit_at_up > 0) {
                    $string->push(( $bw->limit_at_up / 1000 ) . 'k/' . ( $bw->limit_at_up / 1000 ) . 'k');
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
            return null;
        }
    }
    public function saveIPPool(NasProfilePool $nasProfilePool, $defaultName) {
        try {
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
        } catch (Exception $exception) {
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
            return null;
        }
    }
    public function saveProfilePPPoE(NasProfile $nasProfile, $defaultName) {
        try {
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
                    ->equal('remote-address', $nasProfile->poolObj->code)
                    ->equal('session-timeout','01:00:00')
                    ->equal('idle-timeout','00:30:00')
                    ->equal('only-one','yes');
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
                    ->equal('remote-address', $nasProfile->poolObj->code)
                    ->equal('session-timeout','01:00:00')
                    ->equal('idle-timeout','00:30:00')
                    ->equal('only-one','yes');
            }
            if ($nasProfile->dns_servers != null) {
                $this->query = $this->query->equal('dns-server', collect($nasProfile->dns_servers)->join(','));
            }
            if ($nasProfile->parent_queue != null) {
                $this->query = $this->query->equal('parent-queue', $nasProfile->parent_queue->name);
            }
            $rl = $this->rateLimit($nasProfile->bandwidthObj);
            if ($rl != null || strlen($rl) > 3) {
                $this->query = $this->query->equal('rate-limit', $rl);
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
            $this->query = $this->query->equal("address-pool", $nasProfile->poolObj->code);

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
            return;
        }
    }
}
