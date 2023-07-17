<?php

namespace App\Helpers\RST;

use App\Helpers\SwitchDB;
use App\Models\Nas\Nas;
use App\Models\Nas\NasProfile;
use App\Repositories\Nas\NasRepository;
use App\Repositories\Nas\ProfileRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class RST
{
    protected $hostname;
    protected $user;
    protected $port = 3306;
    protected $pass;
    protected $dbname;
    public function __construct(Request $request)
    {
        $this->hostname = $request->hostname;
        $this->user = $request->user;
        $this->port = $request->port;
        $this->pass = $request->pass;
        $this->dbname = $request->name;
        $configParams = [
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'driver' => 'mysql',
            'host' => $this->hostname,
            'port' => $this->port,
            'database' => $this->dbname,
            'username' => $this->user,
            'password' => $this->pass
        ];
        Config::set("backup", $configParams);
        DB::setDefaultConnection("backup");
    }

    /* @
     * @return Collection
     * @throws Exception
     */
    public function branches(): Collection
    {
        try {
            $response = collect();
            $branches = DB::connection("backup")->table("branches")->where('mitra',0)->get();
            if ($branches->count() > 0) {
                foreach ($branches as $branch) {
                    $response = $branches;
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    public function nas($branches) {
        try {
            $response = collect();
            $branches = $branches->map(function ($q){ return $q->id; })->toArray();
            $nas = DB::connection("backup")->table("routerboards")->whereIn('branch', $branches)->get();//->except(['created_at','updated_at']);
            if ($nas->count() > 0) {
                new SwitchDB();
                foreach ($nas as $item) {
                    $item->value = null;
                    $exists = Nas::where("id", $item->id)->first();
                    if ($exists != null) {
                        $item->nas = (new NasRepository())->table(new Request(['id' => $exists->id]))->first();
                        $item->value = $exists->id;
                    }
                    $response->push($item);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function profiles($nas) {
        try {
            $response = collect();
            $nas = $nas->map(function ($q){ return $q->id; })->toArray();
            $profiles = DB::connection("backup")->table("nas_profile_customer")->whereIn("routerboard", $nas)->get();
            if ($profiles->count() > 0) {
                foreach ($profiles as $profile) {
                    $group = DB::connection("backup")->table("nas_profile_group")->where("id", $profile->profile_group)->first();
                    $profile->group = $group;
                    $profile->value = null;
                    $exists = NasProfile::where('id', $profile->id)->first();
                    if ($exists != null) {
                        $profile->value = $exists->id;
                        $profile->system = (new ProfileRepository())->table(new Request(['id' => $exists->id]))->first();
                    }
                    $response->push($profile);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function packages($branches) {
        try {
            $response = collect();
            $branches = $branches->map(function ($q){ return $q->id; })->toArray();
            $profiles = DB::connection("backup")->table("packages")->whereIn("branch", $branches)->get();
            if ($profiles->count() > 0) {
                foreach ($profiles as $profile) {
                    $response->push($profile);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function customers($branches) {
        try {
            $response = collect();
            $branches = $branches->map(function ($q){ return $q->id; })->toArray();
            $profiles = DB::connection("backup")->table("customers")->whereIn("branch", $branches)->get();
            if ($profiles->count() > 0) {
                foreach ($profiles as $profile) {
                    $response->push($profile);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function invoices($branches) {
        try {
            $response = collect();
            $branches = $branches->map(function ($q){ return $q->id; })->toArray();
            $profiles = DB::connection("backup")->table("invoices")->whereIn("branch", $branches)->get();
            if ($profiles->count() > 0) {
                foreach ($profiles as $profile) {
                    $payments = DB::connection("backup")->table("invoice_partial_payments")->where('invoice', $profile->id)->get();
                    $profile->payments = $payments;
                    $response->push($profile);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
