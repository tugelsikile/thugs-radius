<?php

namespace App\Repositories\Olt;

use App\Helpers\SwitchDB;
use App\Helpers\Telnet\Telnet;
use App\Helpers\Telnet\TelnetMore;
use App\Helpers\Zte\Kernel\Snmp\Olt;
use App\Helpers\Zte\Kernel\Snmp\Onu;
use App\Models\Customer\Customer;
use App\Models\Olt\CustomerPhaseState;
use \App\Models\Olt\Olt as OltModel;
use Carbon\Carbon;
use Exception;
use Graze\TelnetClient\TelnetClient;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;
use Throwable;

class OltRepository
{
    protected $me;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
    }
    /* @
     * @param Request $request
     * @return bool
     * @throws Exception
     */
    public function delete(Request $request): bool
    {
        try {
            new SwitchDB();
            OltModel::whereIn('id', $request[__('olt.form_input.id')])->delete();
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws Throwable
     */
    public function create(Request $request) {
        try {
            new SwitchDB();
            $olt = new OltModel();
            $olt->id = Uuid::uuid4()->toString();
            $olt->name = $request[__('olt.form_input.name')];
            $olt->hostname = $request[__('olt.form_input.host')];
            $olt->port = $request[__('olt.form_input.port')];
            if ($request->has(__('olt.form_input.read'))) {
                $olt->community_read = $request[__('olt.form_input.read')];
            }
            if ($request->has(__('olt.form_input.write'))) {
                $olt->community_write = $request[__('olt.form_input.write')];
            }
            if ($request->has(__('olt.form_input.user'))) {
                $olt->user = $request[__('olt.form_input.user')];
            }
            if ($request->has(__('olt.form_input.pass'))) {
                $olt->pass = $request[__('olt.form_input.pass')];
            }
            if ($this->me != null) {
                $olt->created_by = $this->me->id;
            }
            $olt->saveOrFail();
            return $this->table(new Request(['id' => $olt->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function update(Request $request) {
        try {
            $updating = false;
            new SwitchDB();
            $olt = OltModel::where('id', $request[__('olt.form_input.id')])->first();
            if ($olt->name != $request[__('olt.form_input.name')]) $updating = true;
            if ($olt->hostname != $request[__('olt.form_input.host')]) $updating = true;
            if ($olt->port != $request[__('olt.form_input.port')]) $updating = true;

            $olt->name = $request[__('olt.form_input.name')];
            $olt->hostname = $request[__('olt.form_input.host')];
            $olt->port = $request[__('olt.form_input.port')];
            if ($request->has(__('olt.form_input.read'))) {
                if ($olt->community_read != $request[__('olt.form_input.read')]) $updating = true;
                $olt->community_read = $request[__('olt.form_input.read')];
            } else {
                $updating = true;
                $olt->community_read = null;
            }
            if ($request->has(__('olt.form_input.write'))) {
                if ($olt->community_write != $request[__('olt.form_input.write')]) $updating = true;
                $olt->community_write = $request[__('olt.form_input.write')];
            } else {
                $updating = true;
                $olt->community_write = null;
            }
            if ($request->has(__('olt.form_input.user'))) {
                if ($olt->user != $request[__('olt.form_input.user')]) $updating = true;
                $olt->user = $request[__('olt.form_input.user')];
            } else {
                $updating = true;
                $olt->user = null;
            }
            if ($request->has(__('olt.form_input.pass'))) {
                if ($olt->pass != $request[__('olt.form_input.pass')]) $updating = true;
                $olt->pass = $request[__('olt.form_input.pass')];
            } else {
                $updating = true;
                $olt->pass = null;
            }
            if ($this->me != null && $updating) {
                $olt->updated_by = $this->me->id;
            }
            $olt->saveOrFail();
            return $this->table(new Request(['id' => $olt->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function table(Request $request): Collection
    {
        try {
            $response = collect();
            new SwitchDB();
            $olts = OltModel::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $olts = $olts->where('id', $request->id);
            $olts = $olts->get();
            foreach ($olts as $olt) {
                $remote = (object) [
                    'name' => null,
                    'uptime' => null
                ];
                $username = $olt->user;
                $password = $olt->pass;
                if ($username == null) $username = '';
                if ($password == null) $password = '';
                try {
                    $responseRemote = $this->testConnection(new Request([
                        __('olt.form_input.host') => $olt->hostname,
                        __('olt.form_input.port') => $olt->port,
                        __('olt.form_input.user') => $olt->user,
                        __('olt.form_input.pass') => $olt->pass,
                        'response_type' => 'object',
                        'expect_uptime' => true
                    ]));
                    if ($responseRemote != null) {
                        if (gettype($responseRemote) == 'object') {
                            if (property_exists($responseRemote,'name')) {
                                $remote->name = $responseRemote->name;
                            }
                            if (property_exists($responseRemote,'uptime')) {
                                $remote->uptime = $responseRemote->uptime;
                            }
                        }
                    }
                } catch (Exception $exception) {}

                $response->push((object) [
                    'value' => $olt->id,
                    'label' => $olt->name,
                    'meta' => (object) [
                        'description' => $olt->description,
                        'auth' => (object) [
                            'host' => $olt->hostname,
                            'port' => $olt->port,
                            'user' => $username,
                            'pass' => $password,
                        ],
                        'communities' => (object) [
                            'read' => $olt->community_read,
                            'write' => $olt->community_write,
                        ],
                        'remote' => $remote
                    ]
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return array|string|string[]|null
     * @throws Exception
     */
    public function testConnection(Request $request) {
        try {
            if (strlen($request[__('olt.form_input.user')]) > 0 && strlen($request[__('olt.form_input.pass')]) > 0) {
                $hostname = $request[__('olt.form_input.host')];
                $port = $request[__('olt.form_input.port')];
                $telnet = new Telnet($hostname, $port, 5,"");
                $telnet->setLoginPrompt("Username:");
                try {
                    $telnet->login($request[__('olt.form_input.user')], $request[__('olt.form_input.pass')]);
                    $responseStrings = $telnet->exec("show system-group");
                    $telnet->disconnect();
                    $responseStrings = collect(explode("\n", $responseStrings));
                    if ($responseStrings->count() > 0) {
                        if ($request->has('response_type') && $request->has('expect_uptime')) {
                            $response = (object) [ 'name' => null, 'uptime' => null ];
                            foreach ($responseStrings as $responseString) {
                                if (Str::contains($responseString,"System name:  ")) {
                                    $response->name =  str_replace("System name:  ","", $responseString);
                                } elseif (Str::contains($responseString,"Started before: ")) {
                                    $response->uptime = str_replace("Started before: ","", $responseString);
                                }
                            }
                            return $response;
                        } else {
                            foreach ($responseStrings as $responseString) {
                                if (Str::contains($responseString,"System name:  ")) {
                                    return str_replace("System name:  ","", $responseString);
                                }
                            }
                        }
                    }
                } catch (Exception $exception) {
                    throw new Exception($exception->getMessage(),500);
                }
            }
            throw new Exception(__("labels.connection.error",['Attribute' => $request[__('olt.form_input.host')]]),400);


            /*$prompt = "Username";
            $promptError = 'ERR';
            $lineEnding = "\r\n";
            $client = TelnetClient::factory();
            $client->connect($dsn, $prompt, $promptError, $lineEnding);
            $client->getSocket()->setOption();
            dd($client);
            $resp = $client->execute($request[__('olt.form_input.pass')], "Password")->getResponseText();
            dd($resp);*/
            /*$olt = new Olt();
            $olt->setCommunity($request[__('olt.form_input.read')]);
            $res = $olt->getOltName($request[__('olt.form_input.host')]);
            if ($res != null) {
                $res = collect($res);
                if ($res->count() > 0) {
                    $res = $res->first();
                    $res = str_replace("STRING: ","", $res);
                    return  $res;
                }
            }
            return null;*/
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Collection $onuResponses
     * @return Collection
     * @throws Exception
     */
    private function parseOnuStateLine(Collection $onuResponses): Collection
    {
        try {
            $response = collect();
            foreach ($onuResponses as $onuResponse) {
                $onuResponse = str_replace("\x08","", $onuResponse);
                if (! Str::contains($onuResponse,"Admin State")) {
                    if (! Str::contains($onuResponse,"---------------------")) {
                        $onuResponse = explode(' ',$onuResponse);
                        if (count($onuResponse) > 0) {
                            $lines = [];
                            foreach ($onuResponse as $item) {
                                if (strlen($item) > 0) {
                                    $lines[] = $item;
                                }
                            }
                            if (count($lines) == 5) {
                                $response->push((object) [
                                    'onu' => $lines[0],
                                    'admin_state' => $lines[1],
                                    'omcc_state' => $lines[2],
                                    'phase_state' => strtolower($lines[3]),
                                    'channel' => $lines[4],
                                    'loading' => false,
                                    'details' => null,
                                ]);
                            }
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
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function gponStates(Request $request): Collection
    {
        try {
            $response = collect();
            $olt = OltModel::where('id', $request[__('olt.form_input.id')])->first();
            $telnet = new Telnet($olt->hostname, $olt->port,3,'');
            $telnet->setLoginPrompt("Username:");
            $telnet->login($olt->user, $olt->pass);
            $onuResponses = $telnet->exec("show gpon onu state");
            $onuResponses = collect(explode("\n", $onuResponses));
            $curCommands = "  \r\n";
            $response = $response->merge($this->parseOnuStateLine($onuResponses));
            for ($index = 0; $index <= 10; $index ++) {
                $curCommands = str_replace("\r\n","",$curCommands) . "  \r\n";
                $onuResponses = $telnet->exec($curCommands);
                if (strlen($onuResponses) > 30) {
                    ini_set('max_execution_time',100000);
                    $onuResponses = collect(explode("\n", $onuResponses));
                    if ($onuResponses->count() > 0) {
                        $response = $response->merge($this->parseOnuStateLine($onuResponses));
                    }
                }
            }
            $unconfigs = $telnet->exec("gpon onu uncfg");
            $unconfigs = explode("\n", $unconfigs);
            if (count($unconfigs) > 0) {
                /*** TODO UNCONFIG PARAMS NOT KNOWN ***/
                foreach ($unconfigs as $unconfig) {
                    if (strlen($unconfig) > 10) {
                        if (!Str::contains($unconfig,"No related information to show")) {
                            //parse here
                        }
                    }
                }
            }
            $telnet->disconnect();
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return object|null
     * @throws Throwable
     */
    public function gponCustomer(Request $request): ?object
    {
        try {
            $response = null;
            $olt = OltModel::where('id', $request[__('olt.form_input.id')])->first();
            if ($olt != null) {
                $telnet = new Telnet($olt->hostname, $olt->port,3,'');
                $telnet->setLoginPrompt("Username:");
                $telnet->login($olt->user, $olt->pass);

                $runInterfaceLines = $telnet->exec("show running-config interface gpon-onu_" . $request[__('olt.form_input.onu')]);
                $telnet->disconnect();

                if (strlen($runInterfaceLines) > 0) {
                    $runInterfaceLines = explode("\n", $runInterfaceLines);
                    if (count($runInterfaceLines) > 0) {
                        $response = (object) [
                            'username' => null,
                            'customer' => null,
                            'profile' => (object) [
                                'tcont' => null,
                            ],
                            'gemport' => (object) [
                                'tcont' => null,
                                'traffic_limit' => (object) [
                                    'upstream' => null,
                                    'downstream' => null,
                                ],
                            ],
                            'vlan' => (object) [
                                'port' => null,
                                'name' => null,
                            ]
                        ];
                        foreach ($runInterfaceLines as $runInterfaceLine) {
                            if (strlen($runInterfaceLine) > 10) {
                                /* EXAMPLE RESPONSE
                                 * Building configuration...
                                 * interface gpon-onu_1/2/8:5
                                 *      name sitijuleha@judyusnet
                                 *      tcont 1 profile HOME-5Mb
                                 *      gemport 1 tcont 1
                                 *      gemport 1 traffic-limit upstream HOME-5Mb downstream HOME-5Mb
                                 *      service-port 1 vport 1 user-vlan 111 vlan 111
                                 */
                                if (! Str::contains($runInterfaceLine,"Building configuration...")) {
                                    if (Str::contains($runInterfaceLine,"description ")) {
                                        $line = explode(" ", $runInterfaceLine);
                                        if (count($line) > 1) {
                                            $response->username = $line[count($line) - 1];
                                        }  else {
                                            $response->username = str_replace(" ","",str_replace("service-port","",str_replace("description ","", $runInterfaceLine)));
                                        }
                                    } elseif (Str::contains($runInterfaceLine,"name")) {
                                        $line = explode(" ", $runInterfaceLine);
                                        if (count($line) > 1) {
                                            $response->username = $line[count($line) - 1];
                                        } else {
                                            $response->username = str_replace(" ","",str_replace("name", "",$runInterfaceLine));
                                        }
                                    } elseif (Str::contains($runInterfaceLine,"tcont")) {
                                        if (Str::contains($runInterfaceLine,"profile")) {
                                            $line = explode(" ", $runInterfaceLine);
                                            if (count($line) > 3) {
                                                $response->profile->tcont = $line[count($line) - 1];
                                            }
                                        } elseif (Str::contains($runInterfaceLine,"gemport")) {
                                            $line = explode(" ", $runInterfaceLine);
                                            if (count($line) > 3) {
                                                $response->gemport->tcont = $line[count($line) - 1];
                                            }
                                        }
                                    } elseif (Str::contains($runInterfaceLine,"traffic-limit")) {
                                        $line = explode(" ", $runInterfaceLine);
                                        if (count($line) >= 6) {
                                            $response->gemport->traffic_limit->upstream = $line[4];
                                            $response->gemport->traffic_limit->downstream = $line[count($line) - 1];
                                        }
                                    } elseif (Str::contains($runInterfaceLine,"service-port")) {
                                        if (Str::contains($runInterfaceLine,"vport")) {
                                            $line = explode(" ", $runInterfaceLine);
                                            if (count($line) >= 7) {
                                                $response->vlan->port = $line[5];
                                                $response->vlan->name = $line[4];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if ($response->username != null) {
                            $customer = Customer::where('nas_username', $response->username)->first();
                            if ($customer != null) {
                                if ($request->has(__('olt.form_input.phase_state'))) {
                                    $phaseState = CustomerPhaseState::where('created_at', '>=', Carbon::now()->addMinutes(-5)->format('Y-m-d H:i:s'))->where('customer', $customer->id)->first();
                                    if ($phaseState == null) {
                                        $phaseState = new CustomerPhaseState();
                                        $phaseState->id = Uuid::uuid4()->toString();
                                        $phaseState->customer = $customer->id;
                                        $phaseState->state = $request[__('olt.form_input.phase_state')];
                                        $phaseState->onu_index = $request[__('olt.form_input.onu')];
                                        @$phaseState->saveOrFail();
                                    }
                                }
                                $response->customer = $customer;
                            }
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function tableLost(Request $request) {
        try {
            $olt = new Olt();
            $onu = new Onu();
            $onu->setCommunity("cobaro");
            $maxPorts = $onu->getInterfaceNumber("10.6.0.2");
            $online = collect();
            $offline = collect();
            $dying = collect();

            for ($port = 1; $port <= $maxPorts; $port++) {
                $gponId = $onu->getOnu("10.6.0.2", $port);
                if ($gponId != null) {
                    $interfaceNames = $onu->getInterfaceNames("10.6.0.2");
                    //$customerCircuits = $onu->getCustomerCircuit("10.6.0.2", $gponId);
                    $gponCustomers = collect($onu->getCustomerStatus("10.6.0.2", $gponId));
                    foreach ($gponCustomers as $index => $gponCustomer) {
                        if (array_key_exists($index,$interfaceNames)) {
                            if (strtolower($gponCustomer) == 'online') {
                                $online->push(['circuit' => $interfaceNames[$index], 'status' => $gponCustomer]);
                            } elseif (strtolower($gponCustomer) == 'lost') {
                                $offline->push(['circuit' => $interfaceNames[$index], 'status' => $gponCustomer]);
                            } else {
                                $dying->push(['circuit' => $interfaceNames[$index], 'status' => $gponCustomer]);
                            }
                        }
                    }
                }
            }
            dd($offline,$online,$dying);
            dd($onu->getOnu("10.6.0.2",4),$onu->getCustomerOnuType("10.6.0.2","268568576"));
            dd($olt->getOltId("10.6.0.2"));
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
