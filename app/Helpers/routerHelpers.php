<?php /** @noinspection PhpUndefinedMethodInspection */

/** @noinspection PhpUndefinedFieldInspection */

use App\Models\Nas\Nas;
use App\Models\Nas\NasIpAvailable;
use App\Models\Nas\NasProfilePool;
use App\Models\Radius\Radippool;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;
use RouterOS\Client;
use RouterOS\Query;

function generateIPAvailable(NasProfilePool $nasProfilePool) {
    try {
        if ($nasProfilePool->module == 'radius') {
            ini_set('memory_limit',"5120M");
            $start = ip2long($nasProfilePool->first_address);
            $end = ip2long($nasProfilePool->last_address);
            $pools = collect(array_map('long2ip', range($start, $end)));
            $pools = fixHostIP($pools);
            foreach ($pools as $pool) {
                $available = Radippool::where('framedipaddress', $pool)->first();
                if ($available == null) {
                    $available = new Radippool();
                    $available->pool_name = $nasProfilePool->code;
                    $available->framedipaddress = $pool;
                    $available->saveOrFail();
                }
            }
        }
    } catch (Exception $exception) {
        throw new Exception($exception->getMessage(),500);
    }
}
/* @
 * @param NasProfilePool $nasProfilePool
 * @return void
 * @throws Throwable
 */
function generateIPAvailableBak(NasProfilePool $nasProfilePool) {
    try {
        ini_set('memory_limit',"5120M");
        $start = ip2long($nasProfilePool->first_address);
        $end = ip2long($nasProfilePool->last_address);
        $pools = collect(array_map('long2ip', range($start, $end)));
        $pools = fixHostIP($pools);
        foreach ($pools as $pool) {
            $avail = NasIpAvailable::where('ip', $pool)->where('nas', $nasProfilePool->nas)->where('pool', $nasProfilePool->id)->first();
            if ($avail == null) {
                $avail = new NasIpAvailable();
                $avail->id = Uuid::uuid4()->toString();
                $avail->nas = $nasProfilePool->nas;
                $avail->pool = $nasProfilePool->id;
                $avail->ip = $pool;
                $avail->saveOrFail();
            }
        }
        NasIpAvailable::whereNotIn('pool', $pools->toArray())->delete();
    } catch (Exception $exception) {
        return;
    }
}
function fixHostIP($pools): Collection
{
    $response = collect();
    foreach ($pools as $pool) {
        $xpl = explode('.', $pool);
        if ($xpl[3] <= 254 && $xpl[3] >= 1) {
            $response->push($pool);
        }
    }
    return $response;
}
function testConnection(Nas $nas): object
{
    $response = null;
    switch ($nas->method) {
        default :
        case 'api' :
            $response = testConnectionAPI($nas);
            break;
        case 'ssl' :
            $response = testConnectionSSL($nas);
            break;
    }
    return $response;
}
function testConnectionSSL(Nas $nas): object
{
    $response = (object) [ 'success' => false, 'message' => __('nas.labels.connection.failed') ];
    try {
        $client = new \GuzzleHttp\Client(['verify' => false]);
        $hostname = $nas->hostname;
        if (strlen($nas->port) > 0) {
            if ($nas->port != 443) $hostname .= ":" . $nas->port;
        }
        $url = $hostname . "/rest/system/identity";
        $res = $client->request('get', $url, [
            'auth' => [$nas->user, $nas->password]
        ]);
        $res = json_decode($res->getBody()->getContents());
        if (isset($res->name)) {
            $response->success = true;
            $response->message = $res->name;
        }
    } catch (\GuzzleHttp\Exception\GuzzleException $e) {
        $response->message = $e->getMessage();
    }
    return $response;
}
/* @
 * @param Nas $nas
 * @return object
 */
function testConnectionAPI(Nas $nas): object
{
    $response = (object) [ 'success' => false, 'message' => __('nas.labels.connection.failed') ];
    try {
        $hostname = $nas->hostname;
        if (strlen($nas->port) > 0) {
            $hostname .= ":" . $nas->port;
        }
        $routerOsClient = new Client([
            "host" => $hostname, "user" => $nas->user, "pass" => $nas->password, "timeout" => 1, "attempts" => 1
        ]);
        if (! $routerOsClient->connect()) $response->message = __('nas.labels.connection.failed');
        $query = (new Query("/system/identity/print"));
        $ret = collect($routerOsClient->query($query)->read())->first();
        if (isset($ret['name'])) {
            $response->message = $ret['name'];
            $response->success = true;
        }
    } catch (\RouterOS\Exceptions\BadCredentialsException|\RouterOS\Exceptions\ConnectException|\RouterOS\Exceptions\ClientException|\RouterOS\Exceptions\ConfigException|\RouterOS\Exceptions\QueryException $e) {
        $response->message = $e->getMessage();
    }
    return $response;
}
