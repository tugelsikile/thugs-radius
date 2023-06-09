<?php /** @noinspection PhpUndefinedFieldInspection */

namespace App\Helpers;

use App\Models\Nas\Nas;
use App\Models\Nas\NasProfile;
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
    protected $method;
    protected $url;
    protected $nas;
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
    }

    /* @
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

    /* @
     * @param NasProfile $nasProfile
     * @return bool|null
     * @throws GuzzleException
     * @throws Throwable
     */
    public function createProfilePPPoE(NasProfile $nasProfile): ?bool
    {
        try {
            $this->method = 'put';
            $this->url = $this->hostname() . '/ppp/profile';
            $this->headers['json'] = [
                'name' => $nasProfile->name,
                'local-address' => $nasProfile->poolObj->name,
                'comment' => 'created by ' . auth()->guard('api')->user()->name . ' using radius application at ' . Carbon::now()->translatedFormat('d F Y, H:i:s'),
            ];
            if ($nasProfile->parent_queue != null) {
                $this->headers['json']['parent-queue'] = $nasProfile->parent_queue->name;
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
}
