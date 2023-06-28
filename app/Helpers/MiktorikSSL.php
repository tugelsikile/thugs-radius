<?php /** @noinspection PhpUndefinedFieldInspection */

namespace App\Helpers;

use App\Models\Nas\Nas;
use App\Models\Nas\NasProfile;
use App\Models\Nas\NasProfileBandwidth;
use App\Models\Nas\NasProfilePool;
use Carbon\Carbon;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Throwable;

class MiktorikSSL
{
    protected $client;
    protected $headers;
    protected $rate_limit;
    protected $method;
    protected $url;
    protected $nas;
    protected $me;
    public function __construct(Nas $nas = null, $method = 'get', $json = null)
    {
        $this->client = new Client(['verify' => false]);
        if ($nas != null) {
            $this->nas = $nas;
            $this->url = $nas->method_domain;
            if ($nas->port != null) {
                if ($nas->port != 443) {
                    $this->hostname .= ':' . $nas->method_port;
                }
            }
            $this->headers = [
                'auth' => [ $nas->user, $nas->password ],
                'headers' => [
                    'Accept' => 'application/json', 'Content-Type' => 'application/json',
                ]
            ];
        }
        $this->url .= '/rest';

        if ($json != null) {
            $this->headers['json'] = $json;
        }
        $this->method = $method;
        $this->me = auth()->guard('api')->user();
    }
    /* @
     * @param Request|null $request
     * @return object
     * @throws GuzzleException
     */
    public function testConnection(Request $request = null): object
    {
        try {
            if ($request != null) {
                $url = $request[__('nas.form_input.domain')];
                if ($request[__('nas.form_input.port')] !== 443) {
                    $url .= ':' . $request[__('nas.form_input.port')];
                }
                $url .= '/rest/system/identity';
                $this->headers = [
                    'auth' => [ $request[__('nas.form_input.user')], $request[__('nas.form_input.pass')] ],
                    'headers' => [
                        'Accept' => 'application/json', 'Content-Type' => 'application/json',
                    ]
                ];
            } else {
                $url = $this->hostname() . '/system/identity';
            }
            $this->method = 'get';
            $response = $this->client->request($this->method, $url, $this->headers);
            $response = json_decode($response->getBody()->getContents());
            if (isset($response->name)) {
                return (object) [ 'message' => $response->name, 'success' => true ];
            } else {
                return (object) [ 'message' => '', 'success' => false ];
            }
        } catch (Exception $exception) {
            return (object) ['message' => $exception->getMessage(), 'success' => false ];
        }
    }
    private function hostname() {
        $url = $this->nas->method_domain . '/rest';
        if ($this->nas->method_port != 443) $this->url = $url . ':' . $this->nas->method_port;
        return $url;
    }
    public function getIpPool(NasProfilePool $nasProfilePool) {
        try {
            $client = $this->client;
            $this->url = $this->url . 'ip/pool';
            if ($nasProfilePool->pool_id != null) $this->url .= '/' . $nasProfilePool->pool_id;
            $request = $client->request($this->method, $this->url, $this->headers);
            $response = collect(json_decode($request->getBody()->getContents()));
            if ($response->count() == 3) {
                return $response->toArray();
            }
        } catch (Exception $exception) {
            return null;
        }
    }
    public function getProfilePPPoE(NasProfile $nasProfile) {
        try {
            $this->method = 'get';
            $this->url = $this->hostname() . '/ppp/profile';
            if ($nasProfile->profile_id != null) $this->url = $this->url . '/' . $nasProfile->profile_id;
            $request = $this->client->request($this->method, $this->url, $this->headers);
            $response = collect(json_decode($request->getBody()->getContents()));
            foreach ($response as $item) {
                if ($item->name == $nasProfile->name) {
                    return $item;
                }
            }
        } catch (Exception $exception) {
            return null;
        }
    }

    public function rateLimit(NasProfileBandwidth $profileBandwidth = null) {
        try {
            if ($profileBandwidth != null) {
                $bw = $profileBandwidth;
                $string = collect();
                if ($bw->max_limit_up > 0 || $bw->max_limit_down > 0) {
                    $string->push($bw->max_limit_up . 'k/' . $bw->max_limit_down . 'k');
                }
                if ($bw->burst_limit_down > 0 || $bw->burst_limit_up > 0) {
                    $string->push($bw->burst_limit_up . 'k/' . $bw->burst_limit_down .'k');
                }
                if ($bw->threshold_up > 0 || $bw->threshold_down > 0) {
                    $string->push($bw->threshold_up . 'k/' . $bw->threshold_down .'k');
                }
                if ($bw->limit_at_up > 0 || $bw->limit_at_up > 0) {
                    $string->push($bw->limit_at_up . 'k/' . $bw->limit_at_up . 'k');
                }
                if ($bw->burst_time_up > 0 || $bw->burst_time_down > 0) {
                    $string->push($bw->burst_time_up . 's/' . $bw->burst_time_down . 's');
                }
                if ($bw->max_limit_up > 0 || $bw->max_limit_down > 0) {
                    $string->push($bw->priority . '/' . $bw->priority);
                }
                if ($string->count() > 0) {
                    return $string->join(" ");
                }
            }
        } catch (Exception $exception) {
            return null;
        }
    }

    /* @
     * @param NasProfile $nasProfile
     * @param $defaultName
     * @return bool|null
     * @throws GuzzleException
     * @throws Throwable
     */
    public function saveProfilePPPoE(NasProfile $nasProfile, $defaultName): ?bool
    {
        try {
            $this->method = 'put';
            $this->url = $this->hostname() . '/ppp/profile?name=' . $defaultName;
            if ($nasProfile->profile_id != null) {
                $this->url = $this->hostname() . '/ppp/profile/' . $nasProfile->profile_id;
            }
            $find = $this->client->request('get', $this->url, $this->headers);
            $this->headers['json'] = [
                'name' => $nasProfile->name,
                'local-address' => $nasProfile->poolObj->name,
                'comment' => 'created by ' . auth()->guard('api')->user()->name . ' using radius application at ' . Carbon::now()->translatedFormat('d F Y, H:i:s'),
            ];
            if (collect(json_decode($find->getBody()->getContents()))->count() > 0) {
                $this->method = 'patch';
                $this->headers['json']['comment'] = 'updated by ' . auth()->guard('api')->user()->name . ' using radius application at ' . Carbon::now()->translatedFormat('d F Y, H:i:s');
            } else {
                $this->method = 'put';
            }

            if ($nasProfile->dns_servers != null) {
                $this->headers['json']['dns-server'] = collect($nasProfile->dns_servers)->join(",");
            }
            if ($nasProfile->parent_queue != null) {
                $this->headers['json']['parent-queue'] = $nasProfile->parent_queue->name;
            }
            if ($nasProfile->bandwidthObj != null) {
                $rl = $this->rateLimit($nasProfile->bandwidthObj);
                if (strlen($rl) > 3) {
                    $this->headers['json']['rate-limit'] = $rl;
                }
            }
            $request = $this->client->request($this->method, $this->url, $this->headers);
            $response = (array) json_decode($request->getBody()->getContents());
            $nasProfile->profile_id = $response['.id'];
            $nasProfile->saveOrFail();
            return true;
        } catch (Exception $exception) {
            return null;
        }
    }
    public function updateProfilePPPoE(NasProfile $nasProfile) {
        try {
            $this->method = 'patch';
            $this->url = $this->hostname() . '/ppp/profile';
            if ($nasProfile->profile_id != null) {
                $this->url = $this->url . '/' . $nasProfile->profile_id;
            } else {
                $exists = $this->getProfilePPPoE($nasProfile);
                if ($exists != null) {

                } else {
                    $this->createProfilePPPoE($nasProfile);
                }
            }
            $this->headers['json'] = [
                'name' => $nasProfile->name,
                'local-address' => $nasProfile->poolObj->name,
                'comment' => 'updated by ' . auth()->guard('api')->user()->name . ' using radius application at ' . Carbon::now()->translatedFormat('d F Y, H:i:s'),
            ];
            $request = $this->client->request($this->method, $this->url, $this->headers);
            $response = (array) json_decode($request->getBody()->getContents());
            return $response;
        } catch (Exception $exception) {
            return null;
        }
    }
    public function saveIPPool(NasProfilePool $nasProfilePool, $defaultName) {
        try {
            $url = $this->hostname() . '/ip/pool';
            if (strlen($defaultName) > 0) {
                $url .= '?name=' . $defaultName;
            } elseif ($nasProfilePool->pool_id != null) {
                $url = $this->hostname() . '/ip/pool/' . $nasProfilePool->pool_id;
            }
            $find = $this->client->request('get', $url, $this->headers);
            $find = collect(json_decode($find->getBody()->getContents()));
            $this->headers['json'] = [
                'name' => $defaultName,
                'ranges' => $nasProfilePool->first_address . '-' . $nasProfilePool->last_address,
                'comment' => $this->me == null ? '' : 'created by ' . $this->me->name . ' at ' . Carbon::now()->translatedFormat('d F Y, H:i:s'),
            ];
            if ($find->count() == 0) {
                $url = $this->hostname() . '/ip/pool';
                $request = $this->client->request('put', $url, $this->headers);
            } else {
                $find = (array) $find->first();
                $url = $this->hostname() . '/ip/pool/' . $find['.id'];
                $this->headers['json']['comment'] = $this->me == null ? '' : 'updated by ' . $this->me->name . ' at ' . Carbon::now()->translatedFormat('d F Y, H:i:s');
                $request = $this->client->request('patch', $url, $this->headers);
            }
            $response = (array) json_decode($request->getBody()->getContents());
            if ($nasProfilePool->pool_id == null) {
                $nasProfilePool->pool_id = $response['.id'];
                $nasProfilePool->saveOrFail();
            }
            return  $response;
        } catch (Exception $exception) {
            return null;
        }
    }
    public function getParentQueue() {
        try {
            $url = $this->hostname() . '/queue/simple?parent=none';
            $res = $this->client->request('get', $url, $this->headers);
            $res = json_decode($res->getBody()->getContents());
            return collect($res);
        } catch (Exception $exception) {
            return null;
        }
    }
    public function saveProfileHotspot(NasProfile $nasProfile, $defaultName) {
        try {
            $url = $this->hostname() . '/ip/hotspot/user/profile?name=' . $defaultName;
            if ($nasProfile->profile_id != null) {
                $url = $this->hostname() . '/ip/hotspot/user/profile/' . $nasProfile->profile_id;
            }
            $res = $this->client->request('get', $url, $this->headers);
            $res = json_decode($res->getBody()->getContents());
            if (collect($res)->count() > 0) {
                $res = (array) collect($res)->first();
                $nasProfile->profile_id = $res['.id'];
                $nasProfile->saveOrFail();
                $url = $this->hostname() . '/ip/hotspot/user/profile/' . $res['.id'];
                $this->method = 'patch';
            } else {
                $url = $this->hostname() . '/ip/hotspot/user/profile';
                $this->method = 'put';
            }
            $this->headers['json'] = [
                'name' => $nasProfile->name,
                'address-pool' => $nasProfile->poolObj->name,
            ];
            if ($nasProfile->parent_queue != null) {
                $this->headers['json']['parent-queue'] = $nasProfile->parent_queue->name;
            }
            $rl = $this->rateLimit($nasProfile->bandwidthObj);
            if (strlen($rl) > 3) {
                $this->headers['json']['rate-limit'] = $rl;
            }
            $res = $this->client->request($this->method, $url, $this->headers);
            $res = json_decode($res->getBody()->getContents());
            if (collect($res)->count() > 0) {
                if ($nasProfile->profile_id == null) {
                    $res = (array) $res;
                    if (array_key_exists('.id', $res)) {
                        $nasProfile->profile_id = $res['.id'];
                        $nasProfile->saveOrFail();
                    }
                }
            }
        } catch (Exception $exception) {
            return null;
        }
    }
}
