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
