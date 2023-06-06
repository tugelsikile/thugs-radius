<?php /** @noinspection PhpUndefinedFieldInspection */

use App\Models\Nas\Nas;
use RouterOS\Client;
use RouterOS\Query;

function testConnection(Nas $nas) {
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
        $client = new \GuzzleHttp\Client();
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
