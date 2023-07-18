<?php

namespace App\Helpers\RST;

use App\Helpers\SwitchDB;
use App\Models\Customer\Customer;
use App\Models\Customer\CustomerInvoice;
use App\Models\Customer\CustomerInvoicePayment;
use App\Models\Nas\Nas;
use App\Models\Nas\NasProfile;
use App\Models\Nas\NasProfileBandwidth;
use App\Models\Nas\NasProfilePool;
use App\Repositories\Customer\CustomerRepository;
use App\Repositories\Nas\BandwidthRepository;
use App\Repositories\Nas\NasRepository;
use App\Repositories\Nas\PoolRepository;
use App\Repositories\Nas\ProfileRepository;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

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
            $branches = DB::connection("backup")->table("branches")->where('ho',0)->whereNotIn('name',['FTTH Pangkalan'])->get();
            if ($branches->count() > 0) {
                $response = $branches;
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param $branches
     * @return Collection
     * @throws GuzzleException
     */
    public function nas($branches): Collection
    {
        try {
            $response = collect();
            $branches = $branches->map(function ($q){ return $q->id; })->toArray();
            $nas = DB::connection("backup")->table("routerboards")->whereNotIn('name',['RO-HOME PANGKALAN','POP-TELUKAN','RO-GAMERS_PKL'])
                ->whereIn('branch', $branches)->get();//->except(['created_at','updated_at']);
            if ($nas->count() > 0) {
                new SwitchDB();
                foreach ($nas as $item) {
                    ini_set('max_execution_time',100000);
                    $item->value = null;
                    $exists = Nas::where("id", $item->id)->select('id')->first();
                    if ($exists != null) {
                        //$item->system = @(new NasRepository())->table(new Request(['id' => $exists->id]))->first();
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

    /* @
     * @param $nas
     * @return Collection
     * @throws Exception
     */
    public function pools($nas): Collection
    {
        try {
            $response = collect();
            $nas = $nas->map(function ($q){ return $q->id; })->toArray();
            $profiles = DB::connection("backup")->table("nas_profile_group")->whereNotIn('name',['FTTH-PKL_20Mbps'])->whereIn("routerboard", $nas)->get();
            if ($profiles->count() > 0) {
                foreach ($profiles as $profile) {
                    ini_set('max_execution_time',100000);
                    if ($profile->last_address != null && $profile->first_address !== null) {
                        $pool = NasProfilePool::where('system_id', $profile->id)->select('id')->first();
                        if ($pool != null) {
                            $profile->value = $pool->id;
                            //$profile->system = (new PoolRepository())->table(new Request(['id' => $pool->id]))->first();
                        } else {
                            $profile->value = null;
                            $profile->pool = null;

                            $response->push($profile);
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param $nas
     * @return Collection
     * @throws Exception
     */
    public function bandwidths($nas): Collection
    {
        try {
            $response = collect();
            $nas = $nas->map(function ($q){ return $q->id; })->toArray();
            $profiles = DB::connection("backup")->table("nas_profile_customer")->whereIn("routerboard", $nas)->get();
            if ($profiles->count() > 0) {
                foreach ($profiles as $profile) {
                    ini_set('max_execution_time',100000);
                    $profile->value = null;
                    $profile->system = null;
                    $bandwidth = NasProfileBandwidth::where('system_id', $profile->id)->select('id')->first();
                    if ($bandwidth != null) {
                        $profile->value = $bandwidth->id;
                        //$profile->system = (new BandwidthRepository())->table(new Request(['id' => $bandwidth->id]))->first();
                    } else {
                        $response->push($profile);
                    }
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
                    ini_set('max_execution_time',100000);
                    $exists = NasProfile::where('system_id', $profile->id)->where('is_additional', false)->select('id')->first();
                    if ($exists != null) {
                        $profile->value = $exists->id;
                        //$profile->system = (new ProfileRepository())->table(new Request(['id' => $exists->id]))->first();
                    } else {
                        $profile->bandwidth = (object) [ 'value' => null, 'system' => null ];
                        $profile->pool = (object) [ 'value' => null, 'system' => null ];
                        $group = DB::connection("backup")->table("nas_profile_group")->where("id", $profile->profile_group)->first();
                        $bandwidth = NasProfileBandwidth::where('system_id', $profile->id)->select('id')->first();
                        if ($bandwidth != null) {
                            $profile->bandwidth->value = $bandwidth->id;
                            //$profile->bandwidth->system = (new BandwidthRepository())->table(new Request(['id' => $bandwidth->id]))->first();
                        }
                        $pool = NasProfilePool::where('system_id', $group->id)->select('id')->first();
                        if ($pool != null) {
                            $profile->pool->value = $pool->id;
                            //$profile->pool->system = (new PoolRepository())->table(new Request(['id' => $pool->id]))->first();
                        }
                        $profile->value = null;
                        $profile->group = $group;

                        if ($profile->bandwidth->value != null && $profile->pool->value != null) {
                            $response->push($profile);
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param $nas
     * @return Collection
     * @throws Exception
     */
    public function packages($nas): Collection
    {
        try {
            $response = collect();
            $nas = $nas->map(function ($q){ return $q->id; })->toArray();
            $packages = DB::connection("backup")->table("packages")->whereIn("routerboard", $nas)->get();
            if ($packages->count() > 0) {
                foreach ($packages as $package) {
                    ini_set('max_execution_time',100000);
                    $exists = NasProfile::where('system_package', $package->id)->where('is_additional', true)->select('id')->first();
                    $package->value = null;
                    $package->system = null;
                    if ($exists != null) {
                        $package->value = $exists->id;
                        //$package->system = (new ProfileRepository())->table(new Request(['id' => $exists->id]))->first();
                    } else {
                        $response->push($package);
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param $nas
     * @return Collection
     * @throws Exception
     */
    public function customers($nas): Collection
    {
        try {
            $response = collect();
            $nas = $nas->map(function ($q){ return $q->id; })->toArray();
            $customers = DB::connection("backup")->table("customers")->whereIn("routerboard", $nas)->get();
            if ($customers->count() > 0) {
                foreach ($customers as $customer) {
                    $customer->value = null;
                    $customer->system = null;
                    $customer->main_service = null;
                    $customer->nas_customer = null;
                    ini_set('max_execution_time',100000);
                    $exists = Customer::where('system_id', $customer->id)->select('id')->first();
                    if ($exists != null) {
                        $customer->value = $exists->id;
                        //$customer->system = (new CustomerRepository())->table(new Request(['id' => $exists->id]))->first();
                    }
                    $nasCustomer = DB::connection("backup")->table("nas_customer")->where('customer', $customer->id)->first();
                    if ($nasCustomer != null) {
                        $customer->additional_service = null;
                        $customer->main_service = null;
                        $profile = NasProfile::where('system_id', $nasCustomer->profile)->select('id')->first();
                        //$profile = DB::connection("backup")->table("nas_profile_customer")->where('id', $nasCustomer->profile)->first();
                        if ($profile != null) {
                            if ($exists == null) {
                                $customer->main_service = $profile;
                                $customer->nas_customer = $nasCustomer;
                                $package = NasProfile::where('system_package', $customer->package)->first();
                                if ($package != null) {
                                    $customer->additional_service = $package;
                                }
                                $customer->village_obj = null;
                                $customer->district_obj = null;
                                $customer->city_obj = null;
                                $customer->province_obj = null;
                                new SwitchDB("mysql");
                                if ($customer->province != null) {
                                    $provinceSystem = DB::connection("backup")->table('indonesia_provinces')->where('id', $customer->province)->first();
                                    if ($provinceSystem != null) {
                                        $province = Province::where('name', $provinceSystem->name)->first();
                                        if ($province != null) {
                                            $customer->province_obj = $province;

                                            if ($customer->city != null) {
                                                $citySystem = DB::connection("backup")->table('indonesia_cities')->where('id', $customer->city)->first();
                                                if ($citySystem != null) {
                                                    $city = City::where('name', $citySystem->name)->where('province_code', $province->code)->first();
                                                    if ($city != null) {
                                                        $customer->city_obj = $city;
                                                        if ($customer->district != null) {
                                                            $districtSystem = DB::connection("backup")->table('indonesia_districts')->where('id', $customer->district)->first();
                                                            if ($districtSystem != null) {
                                                                $district = District::where('name', $districtSystem->name)->where('city_code', $city->code)->first();
                                                                if ($district != null) {
                                                                    $customer->district_obj = $district;
                                                                    if ($customer->village != null) {
                                                                        $villageSystem = DB::connection("backup")->table('indonesia_villages')->where('id', $customer->village)->first();
                                                                        if ($villageSystem != null) {
                                                                            $village = Village::where('name', $villageSystem->name)->where('district_code', $district->code)->first();
                                                                            if ($village != null) {
                                                                                $customer->village_obj = $village;
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                        }
                                    }
                                }
                            }
                        }
                    }
                    $response->push($customer);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param $customers
     * @return Collection
     * @throws Exception
     */
    public function invoices($customers): Collection
    {
        try {
            $response = collect();
            $customers = $customers->map(function ($q){ return $q->id; })->toArray();
            $invoices = DB::connection("backup")->table("invoices")->whereIn("customer", $customers)->get();
            if ($invoices->count() > 0) {
                foreach ($invoices as $invoice) {
                    ini_set('max_execution_time',100000);
                    $invoice->value = null;
                    $invoice->system_package = null;
                    $invoice->system_customer = null;
                    $exists = CustomerInvoice::where('system_id', $invoice->id)->select('id')->first();
                    if ($exists != null) {
                        $invoice->value = $exists->id;
                    } else {
                        $customer = Customer::where('system_id', $invoice->customer)->select('id')->first();
                        if ($customer != null) {
                            $invoice->system_package = null;
                            $invoice->system_customer = $customer->id;
                            $package = NasProfile::where('system_package', $invoice->package)->select('id')->first();
                            if ($package != null) {
                                $invoice->system_package = $package->id;
                            }
                        }
                    }
                    $response->push($invoice);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param $invoices
     * @return Collection
     * @throws Exception
     */
    public function payments($invoices): Collection
    {
        try {
            $response = collect();
            $invoices = $invoices->map(function ($q){ return $q->id; })->toArray();
            $payments = DB::connection("backup")->table("invoice_partial_payments")->whereIn('invoice', $invoices)->get();
            if ($payments->count() > 0) {
                foreach ($payments as $payment) {
                    $payment->value = null;
                    $payment->system_invoice = null;
                    $exist = CustomerInvoicePayment::select('id')->whereNotNull('system_id')->where('system_id', $payment->id)->first();
                    if ($exist == null) {
                        $invoice = CustomerInvoice::where('system_id', $payment->invoice)->select('id')->first();
                        if ($invoice != null) {
                            $payment->system_invoice = $invoice->id;
                        }
                        //$payment->value = $exist->id;
                        $response->push($payment);
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
