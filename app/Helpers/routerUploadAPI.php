<?php

use App\Models\Nas\Nas;
use App\Models\Nas\NasProfilePool;
use RouterOS\Client as RosClient;
use GuzzleHttp\Client as GzClient;
use RouterOS\Exceptions\BadCredentialsException;
use RouterOS\Exceptions\ClientException;
use RouterOS\Exceptions\ConfigException;
use RouterOS\Exceptions\ConnectException;
use RouterOS\Exceptions\QueryException;
use RouterOS\Query as RosQuery;

function deleteIPPool(NasProfilePool $nasProfilePool) {
    $routerOsClient = RouterOSClient($nasProfilePool->nasObj);
    if ($routerOsClient->connect()) {
        $query = (new RosQuery("/ip/pool/remove"));
        if ($nasProfilePool->pool_id != null) {
            $query->equal('.id', $nasProfilePool->pool_id);
        } else {
            $query->equal('name', $nasProfilePool->name);
        }
        $routerOsClient->query($query)->read();
    }
}
function RouterOSClient(Nas $nas): RosClient
{
    $hostname = APIHostname($nas);
    return new RosClient([
        "host" => $hostname, "user" => $nas->user, "pass" => $nas->password, "timeout" => 1, "attempts" => 1
    ]);
}
function APIHostname(Nas $nas) {
    $hostname = $nas->hostname;
    if (strlen($nas->port) > 0) {
        $hostname .= ":" . $nas->port;
    }
    return $hostname;
}
function getIPPoolAPI(NasProfilePool $nasProfilePool, $name) {
    $routerOsClient = RouterOSClient($nasProfilePool->nasObj);
    if ($routerOsClient->connect()) {
        $pools = collect($routerOsClient->query((new RosQuery("/ip/pool/print")))->read());
        if ($pools->count() > 0) {
            foreach ($pools as $pool) {
                $pool = (object) $pool;
                if ($pool->name == $name) {
                    return $pool;
                }
            }
        }
    }
}
function uploadIPPoolAPI(NasProfilePool $nasProfilePool) {
    try {
        $exists = getIPPoolAPI($nasProfilePool, $nasProfilePool->name);
        $routerOsClient = RouterOSClient($nasProfilePool->nasObj);
        if ($exists == null) {
            if ($routerOsClient->connect()) {
                $query = (new RosQuery("/ip/pool/add"))
                    ->equal("name", $nasProfilePool->name)
                    ->equal('ranges', $nasProfilePool->first_address . '-' . $nasProfilePool->last_address);
                $res = collect($routerOsClient->query($query)->read());
                if ($res->count() > 0) {
                    $res = $res->first();
                    $res = (object) $res;
                    $nasProfilePool->pool_id = $res->ret;
                    $nasProfilePool->saveOrFail();
                }
            }
        } else {
            if ($routerOsClient->connect()) {
                $exists = (array) $exists;
                $query = (new RosQuery("/ip/pool/set"))
                    ->equal(".id", $exists[".id"])
                    ->equal("name", $nasProfilePool->name)
                    ->equal("ranges", $nasProfilePool->first_address . '-' . $nasProfilePool->last_address);
                $routerOsClient->query($query)->read();
            }
        }
    } catch (Exception $exception) {
        return null;
    }
}
function updateIPPoolAPI(NasProfilePool $nasProfilePool, $defaultName) {
    $exists = getIPPoolAPI($nasProfilePool, $defaultName);
    if ($exists != null) {
        $exists = (array) $exists;
        $routerOsClient = RouterOSClient($nasProfilePool->nasObj);
        if ($routerOsClient->connect()) {
            $query = (new RosQuery("/ip/pool/set"))
                ->equal(".id", $exists[".id"])
                ->equal("name", $nasProfilePool->name)
                ->equal("ranges", $nasProfilePool->first_address . '-' . $nasProfilePool->last_address);
            return $routerOsClient->query($query)->read();
        }
    } else {
        uploadIPPool($nasProfilePool);
    }
}
function getParentQueue(Nas $nas) {
    $routerOsClient = RouterOSClient($nas);
    if ($routerOsClient->connect()) {
        $query = (new RosQuery("/queue/simple/print"))->where('parent','none');
        return collect($routerOsClient->query($query)->read());
    }
    return collect();
}
/* @
 * @param NasProfilePool $nasProfilePool
 * @param null $defaultName
 * @return bool
 */
function uploadIPPool(NasProfilePool $nasProfilePool, $defaultName = null)
{
    if ($defaultName != null) {
        return updateIPPoolAPI($nasProfilePool, $defaultName);
    } else {
        return uploadIPPoolAPI($nasProfilePool);
    }
}
