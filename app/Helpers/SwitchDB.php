<?php /** @noinspection PhpUndefinedFieldInspection */

/** @noinspection DuplicatedCode */

namespace App\Helpers;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class SwitchDB
{
    public function __construct($configName = null)
    {
        if ($configName != null) {
            DB::setDefaultConnection($configName);
        } else {
            $me = auth()->guard('api')->user();
            if ($me != null) {
                if ($me->company != null) {
                    Config::set("database.connections.radius", [
                        'charset' => 'utf8mb4',
                        'collation' => 'utf8mb4_unicode_ci',
                        'driver' => 'mysql',
                        'host' => $me->companyObj->radius_db_host,
                        'port' => env('DB_RADIUS_PORT'),
                        'database' => $me->companyObj->radius_db_name,
                        'username' => $me->companyObj->radius_db_user,
                        'password' => $me->companyObj->radius_db_pass
                    ]);
                    DB::setDefaultConnection("radius");
                }
            }
        }
    }
}
