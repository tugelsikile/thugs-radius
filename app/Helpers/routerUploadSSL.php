<?php

use App\Models\Nas\Nas;
use App\Models\Nas\NasProfilePool;

function client() {
    return new \GuzzleHttp\Client();
}
function headerAuth(Nas $nas) {
    return ['auth' => [$nas->user, $nas->password]];
}
function hostname(Nas $nas) {
    $hostname = $nas->hostname;
    if (strlen($nas->port) > 0) {
        if ($nas->port != 443) $hostname .= ':' . $nas->port;
    }
    return $hostname;
}
function getIPPoolSSL(NasProfilePool $nasProfilePool, $defaultName) {
    $client = client();
    $url = hostname($nasProfilePool->nasObj) . '/rest/ip/pool';
    if ($nasProfilePool->pool_id != null) {
        $url .= '/' . $nasProfilePool->pool_id;
    }
    $request = $client->request('get', $url, headerAuth($nasProfilePool->nasObj));
    $response = collect(json_decode($request->getBody()->getContents()));
    if ($response->count() == 3) {
        return $response->toArray();
    }/* elseif ($response->count() > 3) {
        foreach ($response as $item) {
            if ($item->name == $defaultName) {
                return $item;
            }
        }
    }*/
}
function uploadIPPoolSSL(NasProfilePool $nasProfilePool, $defaultName) {
    $exists = getIPPoolSSL($nasProfilePool, $defaultName);
    if ($exists == null) {
        startUploadIpPoolSSL($nasProfilePool);
    } else {
        updateUploadIPPoolSSL($nasProfilePool, $exists);
    }
}
function updateUploadIPPoolSSL(NasProfilePool $nasProfilePool, $exists) {
    $client = client();
    $url = hostname($nasProfilePool->nasObj) . '/rest/ip/pool/' . $exists['.id'];
    $client->request('patch', $url, [
        'auth' => [$nasProfilePool->nasObj->user, $nasProfilePool->nasObj->password],
        'headers' => [
            'Content-type' => 'application/json', 'Accept' => 'application/json'
        ],
        'json' => [
            'name' => $nasProfilePool->name,
            'ranges' => $nasProfilePool->first_address . '-' . $nasProfilePool->last_address
        ]
    ]);
}
function startUploadIpPoolSSL(NasProfilePool $nasProfilePool) {
    $client = client();
    $url = hostname($nasProfilePool->nasObj) . '/rest/ip/pool';
    $request = $client->request('put', $url, [
        'auth' => [$nasProfilePool->nasObj->user, $nasProfilePool->nasObj->password],
        'headers' => [
            'Content-type' => 'application/json', 'Accept' => 'application/json'
        ],
        'json' => [
            'name' => $nasProfilePool->name,
            'ranges' => $nasProfilePool->first_address . '-' . $nasProfilePool->last_address
        ]
    ]);
    $res = collect(json_decode($request->getBody()->getContents()));
    if ($res->count() > 0) {
        $res = $res->first();
        $nasProfilePool->pool_id = $res;
        $nasProfilePool->saveOrFail();
    }
}
function deleteIPPoolSSL(NasProfilePool $nasProfilePool) {
    $client = client();
    $url = hostname($nasProfilePool->nasObj) . '/rest/ip/pool';
    if ($nasProfilePool->pool_id != null) {
        $url .= '/' . $nasProfilePool->pool_id;
    } else {
        $exists = getIPPoolSSL($nasProfilePool, $nasProfilePool->name);
        if ($exists != null) {
            $url .= '/' . $exists['.id'];
        }
    }
    $client->request('delete', $url, headerAuth($nasProfilePool->nasObj));
}
function parentQueueSSL(Nas $nas) {
    $client = client();
    $url = hostname($nas) . '/rest/queue/simple?parent=none';
    $req = $client->request('get', $url, headerAuth($nas));
    return collect(json_decode($req->getBody()->getContents()));
}
