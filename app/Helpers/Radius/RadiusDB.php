<?php

namespace App\Helpers\Radius;

use App\Helpers\MikrotikAPI;
use App\Helpers\SwitchDB;
use App\Models\Company\ClientCompany;
use App\Models\Customer\Customer;
use App\Models\Nas\Nas;
use App\Models\Nas\NasProfile;
use App\Models\Nas\NasProfilePool;
use App\Models\Radius\Radacct;
use App\Models\Radius\Radcheck;
use App\Models\Radius\Radgroupcheck;
use App\Models\Radius\Radgroupreply;
use App\Models\Radius\Radippool;
use App\Models\Radius\Radreply;
use App\Models\Radius\Radusergroup;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Throwable;

/********** TODO **********
 * some problem may exists
 * ex :
 * 1. Client DNS :
 *   - we try using mikrotik pppoe client
 *   - client is connected with proper profile
 *   - dns client not receiving valid dns (null)
 *
 * please remove above line if already fixed
 */
class RadiusDB
{
    public function __construct()
    {
    }
    public function kickOnline(Customer $customer) {
        try {
            $radActs = Radacct::where('username', $customer->nas_username)->whereNull('acctstoptime')->get();
            foreach ($radActs as $radAct) {
                $radAct->acctstoptime = Carbon::now()->format('Y-m-d H:i:s');
                $radAct->acctinterval = Carbon::parse($radAct->acctstarttime)->diffInMilliseconds(Carbon::parse($radAct->acctstoptime));
                $radAct->acctsessiontime = $radAct->acctinterval;
                $radAct->saveOrFail();
            }
            return;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }
    public function generateRadIpPool(NasProfilePool $nasProfilePool) {
        try {
            if ($nasProfilePool->module == 'radius') {
                ini_set('memory_limit',"5120M");
                $start = ip2long($nasProfilePool->first_address);
                $end = ip2long($nasProfilePool->last_address);
                $pools = collect(array_map('long2ip', range($start, $end)));
                $pools = fixHostIP($pools);
                foreach ($pools as $pool) {
                    ini_set('memory_limit',"5120M");
                    $available = Radippool::where('framedipaddress', $pool)->first();
                    if ($available == null) {
                        $available = new Radippool();
                        $available->pool_name = $nasProfilePool->code;
                        $available->framedipaddress = $pool;
                        $available->calledstationid = '';
                        $available->callingstationid = '';
                        $available->username = null;
                        try {
                            $available->saveOrFail();
                        } catch (Exception $exception) {
                            return;
                        }
                    }
                }
                Radippool::where('pool_name', $nasProfilePool->code)->whereNotIn('framedipaddress', $pools)->delete();
            } else {
                Radippool::where('pool_name', $nasProfilePool->code)->delete();
            }
            return;
        } catch (Exception $exception) {
            return;
        }
    }
    /* @
     * @param Customer $customer
     * @return Radcheck|null
     * @throws Throwable
     */
    public function saveClearTextPassword(Customer $customer): ?Radcheck
    {
        try {
            $userPassword = Radcheck::where('username', $customer->nas_username)->where('attribute','Cleartext-Password')->first();
            if ($userPassword == null) {
                $userPassword = new Radcheck();
                $userPassword->attribute = 'Cleartext-Password';
                $userPassword->op = ':=';
                $userPassword->username = $customer->nas_username;
            }
            $userPassword->value = $customer->nas_password;
            $userPassword->saveOrFail();
            return $userPassword;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @param Customer $customer
     * @return Radcheck|null
     * @throws Throwable
     */
    public function saveExpiration(Customer $customer): ?Radcheck
    {
        try {
            $userExpiration = Radcheck::where('username', $customer->nas_username)->where('attribute', 'Expiration')->first();
            if ($customer->due_at != null) {
                if ($userExpiration == null) {
                    $userExpiration = new Radcheck();
                    $userExpiration->attribute = 'Expiration';
                    $userExpiration->op = ':=';
                    $userExpiration->username = $customer->nas_username;
                }
                $userExpiration->value = Carbon::parse($customer->due_at)->format('M d Y H:m:s');
                $userExpiration->saveOrFail();
            } else {
                if ($userExpiration != null) {
                    $userExpiration->delete();
                }
            }
            return $userExpiration;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @param Customer $customer
     * @return Radusergroup|null
     * @throws Throwable
     */
    public function saveRadUserGroup(Customer $customer): ?Radusergroup
    {
        try {
            if ($customer->profileObj != null) {
                $radUser = Radusergroup::where('username', $customer->nas_username)->first();
                if ($radUser == null) {
                    $radUser = new Radusergroup();
                }
                $radUser->groupname = $customer->profileObj->code;
                $radUser->username = $customer->nas_username;
                if ($customer->profileObj->bandwidthObj != null) {
                    $radUser->priority = $customer->profileObj->bandwidthObj->priority;
                } else {
                    $radUser->priority = 8;
                }
                $radUser->saveOrFail();
                return $radUser;
            }
            return null;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @param Customer $customer
     * @return void
     * @throws Throwable
     */
    public function saveUserPoolName(Customer $customer) {
        try {
            $poolName = Radcheck::where('username', $customer->nas_username)->where('attribute', 'Pool-Name')->first();
            if ($poolName == null) {
                $poolName = new Radcheck();
                $poolName->username = $customer->nas_username;
                $poolName->attribute = 'Pool-Name';
                $poolName->op = ':=';
            }
            $poolName->value = $customer->profileObj->poolObj->code;
            $poolName->saveOrFail();
            return;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }
    public function saveFramedIpNetmask(Customer $customer) {
        try {
            if ($customer->profileObj != null) {
                if ($customer->profileObj->netmask != null) {
                    $framedIpNetmask = Radreply::where('username', $customer->nas_username)->where('attribute', 'Framed-IP-Netmask')->first();
                    if ($framedIpNetmask == null) {
                        $framedIpNetmask = new Radreply();
                        $framedIpNetmask->username = $customer->nas_username;
                        $framedIpNetmask->attribute = 'Framed-IP-Netmask';
                        $framedIpNetmask->op = ':=';
                        $framedIpNetmask->value = cidr2NetmaskAddr($customer->profileObj->netmask);
                        $framedIpNetmask->saveOrFail();
                    }
                } else {
                    Radreply::where('username', $customer->nas_username)->where('attribute', 'Framed-IP-Netmask')->delete();
                }
            } else {
                Radreply::where('username', $customer->nas_username)->where('attribute', 'Framed-IP-Netmask')->delete();
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }
    public function saveFramedRoute(Customer $customer) {
        try {
            if ($customer->profileObj != null) {
                if ($customer->profileObj->dns_servers != null) {
                    if (collect($customer->profileObj->dns_servers)->count() > 0) {
                        $framedRoute = Radreply::where('username', $customer->nas_username)->where('attribute', 'Framed-Route')->first();
                        if ($framedRoute == null) {
                            $framedRoute = new Radreply();
                            $framedRoute->username = $customer->nas_username;
                            $framedRoute->attribute = 'Framed-Route';
                            $framedRoute->op = ':=';
                        }
                        $framedRoute->value = collect($customer->profileObj->dns_servers)->join(' ');
                        $framedRoute->saveOrFail();
                    } else {
                        Radreply::where('customer', $customer->nas_username)->where('attribute', 'Framed-Route')->delete();
                    }
                } else {
                    Radreply::where('customer', $customer->nas_username)->where('attribute', 'Framed-Route')->delete();
                }
            } else {
                Radreply::where('customer', $customer->nas_username)->where('attribute', 'Framed-Route')->delete();
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }
    /* @
     * @param Customer $customer
     * @return void
     * @throws Throwable
     */
    public function saveUserPPPoE(Customer $customer) {
        try {
            $this->saveClearTextPassword($customer);
            $this->saveExpiration($customer);
            $this->saveRadUserGroup($customer);
            $this->saveUserPoolName($customer);
            $this->saveFramedRouting($customer);
            $this->saveFramedIpNetmask($customer);
            $this->saveFramedRoute($customer);
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }

    /* @
     * @param Customer $customer
     * @return Radreply|null
     * @throws Throwable
     */
    public function saveRadReply(Customer $customer): ?Radreply
    {
        try {
            $radReply = Radreply::where('username', $customer->nas_username)->first();
            if ($radReply == null) {
                $radReply = new Radreply();
                $radReply->attribute = 'Service-Type';
                $radReply->value = 'Login-User';
                $radReply->op = ':=';
                $radReply->username = $customer->nas_username;
                $radReply->saveOrFail();
                return $radReply;
            }
            return null;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @param Customer $customer
     * @return void
     * @throws Throwable
     */
    public function saveUserHotspot(Customer $customer) {
        try {
            $this->saveRadReply($customer);
            $this->saveRadUserGroup($customer);
            $this->saveUserPoolName($customer);
            $this->saveFramedRouting($customer);
            $this->saveFramedIpNetmask($customer);
            $this->saveFramedRoute($customer);
            return;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }
    public function saveFramedRouting(Customer $customer) {
        try {
            $framedRouting = Radreply::where('username', $customer->nas_username)->where('attribute','Framed-Routing')->first();
            if ($framedRouting == null) {
                $framedRouting = new Radreply();
                $framedRouting->username = $customer->nas_username;
                $framedRouting->attribute = 'Framed-Routing';
                $framedRouting->value = 'Broadcast-Listen';
                $framedRouting->op = ':=';
                $framedRouting->saveOrFail();
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }
    /* @
     * @param Customer $customer
     * @return void
     * @throws Throwable
     */
    public function saveUser(Customer $customer) {
        try {
            if ($customer->active_at != null) {
                if ($customer->method_type == 'pppoe') {
                    $this->saveUserPPPoE($customer);
                } elseif ($customer->method_type == 'hotspot') {
                    $this->saveUserHotspot($customer);
                }
            } else {
                $this->deleteUser($customer);
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }

    /* @
     * @param Customer $customer
     * @return void
     */
    public function deleteUser(Customer $customer) {
        try {
            Radreply::where('username', $customer->nas_username)->delete();
            Radusergroup::where('username', $customer->nas_username)->delete();
            Radcheck::where('username', $customer->nas_username)->delete();
            return;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }

    /* @
     * @param NasProfile $nasProfile
     * @return Radgroupreply|null
     * @throws Throwable
     */
    public function saveFramedProtocol(NasProfile $nasProfile): ?Radgroupreply
    {
        try {
            $framedProtocol = Radgroupreply::where('groupname', $nasProfile->code)->where('attribute','Framed-Protocol')->first();
            if ($framedProtocol == null) {
                $framedProtocol = new Radgroupreply();
                $framedProtocol->op = '=';
                $framedProtocol->attribute = 'Framed-Protocol';
            }
            $framedProtocol->groupname = $nasProfile->code;
            $framedProtocol->value = 'PPP';
            $framedProtocol->saveOrFail();
            return $framedProtocol;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @param NasProfile $nasProfile
     * @return Radgroupreply|null
     * @throws Throwable
     */
    public function saveMikrotikGroup(NasProfile $nasProfile): ?Radgroupreply
    {
        try {
            $mikrotikGroup = Radgroupreply::where('groupname', $nasProfile->code)->where('attribute', 'Mikrotik-Group')->first();
            if ($mikrotikGroup == null) {
                $mikrotikGroup = new Radgroupreply();
                $mikrotikGroup->op = ':=';
                $mikrotikGroup->attribute = 'Mikrotik-Group';
                $mikrotikGroup->groupname = $nasProfile->code;
            }
            $mikrotikGroup->value = $nasProfile->code;
            $mikrotikGroup->saveOrFail();
            return $mikrotikGroup;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @param NasProfile $nasProfile
     * @return Radgroupreply|null
     * @throws Throwable
     */
    public function saveRateLimit(NasProfile $nasProfile): ?Radgroupreply
    {
        try {
            $response = null;
            $mikrotikRateLimit = Radgroupreply::where('groupname', $nasProfile->code)->where('attribute', 'Mikrotik-Rate-Limit')->first();
            if ($nasProfile->bandwidthObj != null) {
                $rl = (new MikrotikAPI())->rateLimit($nasProfile->bandwidthObj);
                if ($rl != null) {
                    if ($mikrotikRateLimit == null) {
                        $mikrotikRateLimit = new Radgroupreply();
                        $mikrotikRateLimit->groupname = $nasProfile->code;
                        $mikrotikRateLimit->attribute = 'Mikrotik-Rate-Limit';
                        $mikrotikRateLimit->op = ':=';
                    }
                    $mikrotikRateLimit->value = $rl;
                    $mikrotikRateLimit->saveOrFail();
                    $response = $mikrotikRateLimit;
                } else {
                    $mikrotikRateLimit->delete();
                }
            } else {
                if ($mikrotikRateLimit != null) {
                    $mikrotikRateLimit->delete();
                }
            }
            return $response;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @param NasProfile $nasProfile
     * @return Radgroupcheck|null
     * @throws Throwable
     */
    public function saveSimultanousUse(NasProfile $nasProfile): ?Radgroupcheck
    {
        try {
            $simultanouseUse = Radgroupcheck::where('groupname', $nasProfile->code)->where('attribute','Simultaneous-Use')->first();
            if ($simultanouseUse == null) {
                $simultanouseUse = new Radgroupcheck();
                $simultanouseUse->groupname = $nasProfile->code;
                $simultanouseUse->op = ':=';
                $simultanouseUse->attribute = 'Simultaneous-Use';
                $simultanouseUse->value = 1;
                $simultanouseUse->saveOrFail();
            }
            return $simultanouseUse;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @param NasProfile $nasProfile
     * @return void|null
     * @throws Throwable
     */
    public function savePoolName(NasProfile $nasProfile) {
        try {
            $framedPool = Radgroupreply::where('groupname', $nasProfile->code)->where('attribute','Framed-Pool')->first();
            if ($nasProfile->poolObj != null) {
                if ($framedPool == null) {
                    $framedPool = new Radgroupreply();
                    $framedPool->groupname = $nasProfile->code;
                    $framedPool->attribute = 'Framed-Pool';
                    $framedPool->op = ':=';
                }
                $framedPool->value = $nasProfile->poolObj->code;
                $framedPool->saveOrFail();
            } else {
                if ($framedPool != null) {
                    $framedPool->delete();
                }
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }
    public function saveFramedUser(NasProfile $nasProfile) {
        try {
            $framedUser = Radgroupreply::where('groupname', $nasProfile->code)->where('attribute','Service-Type')->where('value', 'Framed-User')->first();
            if ($framedUser == null) {
                $framedUser = new Radgroupreply();
                $framedUser->groupname = $nasProfile->code;
                $framedUser->attribute = 'Service-Type';
                $framedUser->op = ':=';
                $framedUser->value = 'Framed-User';
                $framedUser->saveOrFail();
            }
            return;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }
    public function saveFramedRouteProfile(NasProfile $nasProfile) {
        try {
            $customers = Customer::where('profile', $nasProfile->id)->get();
            if ($customers->count() > 0) {
                foreach ($customers as $customer) {
                    if ($nasProfile->dns_servers != null) {
                        if (collect($nasProfile->dns_servers)->count() > 0) {
                            $radReply = Radreply::where('username', $customer->nas_username)->where('attribute','Framed-Route')->first();
                            if ($radReply == null) {
                                $radReply = new Radreply();
                                $radReply->username = $customer->nas_username;
                                $radReply->attribute = 'Framed-Route';
                                $radReply->op = ':=';
                            }
                            $radReply->value = collect($nasProfile->dns_servers)->join(" ");
                            $radReply->saveOrFail();
                        } else {
                            Radreply::where('username', $customer->nas_username)->where('attribute','Framed-Route')->delete();
                        }
                    } else {
                        Radreply::where('username', $customer->nas_username)->where('attribute','Framed-Route')->delete();
                    }
                }
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }
    public function saveFramedIpNetmaskProfile(NasProfile $nasProfile) {
        try {
            $customers = Customer::where('profile', $nasProfile->id)->get();
            foreach ($customers as $customer) {
                $framedIpNetmask = Radreply::where('username', $customer->nas_username)->where('attribute','Framed-IP-Netmask')->first();
                if ($framedIpNetmask == null) {
                    $framedIpNetmask = new Radreply();
                    $framedIpNetmask->username = $customer->nas_username;
                    $framedIpNetmask->attribute = 'Framed-IP-Netmask';
                    $framedIpNetmask->op = ':=';
                }
                $framedIpNetmask->value = cidr2NetmaskAddr($customer->profileObj->netmask);
                $framedIpNetmask->saveOrFail();
            }
            return;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());;
            return;
        }
    }
    /* @
     * @param NasProfile $nasProfile
     * @return void
     * @throws Throwable
     */
    public function saveProfilePPPoE(NasProfile $nasProfile) {
        try {
            $this->saveFramedProtocol($nasProfile);
            $this->saveMikrotikGroup($nasProfile);
            $this->saveRateLimit($nasProfile);
            $this->savePoolName($nasProfile);
            $this->saveSimultanousUse($nasProfile);
            $this->saveFramedUser($nasProfile);
            $this->saveFramedRouteProfile($nasProfile);
            $this->saveFramedIpNetmaskProfile($nasProfile);
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }

    /* @
     * @param NasProfile $nasProfile
     * @return Radgroupreply|null
     * @throws Throwable
     */
    public function saveServiceType(NasProfile $nasProfile): ?Radgroupreply
    {
        try {
            $serviceType = Radgroupreply::where('groupname', $nasProfile->code)->where('attribute','Service-Type')->first();
            if ($serviceType == null) {
                $serviceType = new Radgroupreply();
                $serviceType->groupname = $nasProfile->code;
                $serviceType->attribute = 'Service-Type';
                $serviceType->op = '=';
                $serviceType->value = 'Login-User';
                $serviceType->saveOrFail();
            }
            return $serviceType;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @param NasProfile $nasProfile
     * @throws Throwable
     */
    public function saveMaxAllSession(NasProfile $nasProfile)
    {
        try {
            if ($nasProfile->limit_type !== null) {
                if ($nasProfile->limit_rate > 0) {
                    switch (strtolower($nasProfile->limit_type)) {
                        case 'time' :
                            $maxAllSession = Radgroupcheck::where('attribute', 'Max-All-Session')->where('groupname', $nasProfile->code)->first();
                            if ($maxAllSession == null) {
                                $maxAllSession = new Radgroupcheck();
                                $maxAllSession->attribute = 'Max-All-Session';
                                $maxAllSession->op = ':=';
                                $maxAllSession->groupname = $nasProfile->code;
                            }
                            $maxAllSession->value = convertToSecond($nasProfile->limit_rate, $nasProfile->limit_rate_unit);
                            $maxAllSession->saveOrFail();
                            break;
                        case 'data' :
                            $maxData = Radgroupcheck::where('attribute', 'Max-Data')->where('groupname', $nasProfile->code)->first();
                            if ($maxData != null) {
                                $maxData = new Radgroupcheck();
                                $maxData->attribute = 'Max-Data';
                                $maxData->op = ':=';
                                $maxData->groupname = $nasProfile->code;
                            }
                            $maxData->value = convertToBit($nasProfile->limit_rate, $nasProfile->limit_rate_unit);
                            $maxData->saveOrFail();
                            break;
                    }
                } else {
                    Radgroupcheck::where('attribute', 'Max-All-Session')->orWhere('attribute', 'Max-Data')->where('groupname', $nasProfile->code)->delete();
                }
            } else {
                Radgroupcheck::where('attribute', 'Max-All-Session')->orWhere('attribute', 'Max-Data')->where('groupname', $nasProfile->code)->delete();
            }
            return;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }
    /* @
     * @param NasProfile $nasProfile
     * @return void
     * @throws Throwable
     */
    public function saveProfileHotspot(NasProfile $nasProfile) {
        try {
            $this->saveMikrotikGroup($nasProfile);
            $this->saveRateLimit($nasProfile);
            $this->saveServiceType($nasProfile);
            $this->saveMaxAllSession($nasProfile);
            $this->savePoolName($nasProfile);
            $this->saveFramedUser($nasProfile);
            $this->saveFramedIpNetmaskProfile($nasProfile);
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }

    /* @
     * @param NasProfile $nasProfile
     * @return void
     * @throws Throwable
     */
    public function saveProfile(NasProfile $nasProfile) {
        try {
            if (!$nasProfile->is_additional) {
                if ($nasProfile->type == 'pppoe') {
                    $this->saveProfilePPPoE($nasProfile);
                } elseif ($nasProfile->type == 'hotspot') {
                    $this->saveProfileHotspot($nasProfile);
                }
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }

    /* @
     * @param NasProfilePool $profilePool
     * @param string $defaultName
     * @return void
     */
    public function saveProfilePool(NasProfilePool $profilePool, string $defaultName) {
        try {
            $mikrotikGroups = Radgroupreply::where('value', $defaultName)->whereIn('attribute', ['Mikrotik-Group','Pool-Name'])->get();
            foreach ($mikrotikGroups as $mikrotikGroup) {
                $mikrotikGroup->value = $profilePool->code;
                $mikrotikGroup->saveOrFail();
            }
            if ($profilePool->module == 'mikrotik') {
                Radgroupreply::where('value', $defaultName)->where('attribute', 'Pool-Name')->delete();
            }
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return;
        }
    }

    /* @
     * @param string|null $exceptId
     * @param array|null $exceptIds
     * @param string|null $responseValue
     * @return Collection
     */
    public function allExistingNas(string $exceptId = null, array $exceptIds = null, string $responseValue = null): Collection
    {
        try {
            $response = collect();
            new SwitchDB('mysql');
            $companies = ClientCompany::all();
            foreach ($companies as $company) {
                new SwitchDB("database.connections.radius",[
                    'charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci', 'driver' => 'mysql',
                    'host' => $company->radius_db_host, 'port' => env('DB_RADIUS_PORT'),
                    'database' => $company->radius_db_name, 'username' => $company->radius_db_user, 'password' => $company->radius_db_pass,
                ]);
                $nasCompanies = Nas::orderBy('created_at', 'asc');
                if ($exceptId != null) $nasCompanies = $nasCompanies->where('id', '!=', $exceptId);
                if ($exceptIds != null) $nasCompanies = $nasCompanies->whereNotIn('id', $exceptIds);
                $nasCompanies = $nasCompanies->get();
                if ($nasCompanies->count() > 0) {
                    foreach ($nasCompanies as $nasCompany) {
                        if ($responseValue == null) {
                            $response->push($nasCompany);
                        } else {
                            $nasCompany = (array) $nasCompany;
                            $response->push($nasCompany[$responseValue]);
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            return collect();
        }
    }
}
