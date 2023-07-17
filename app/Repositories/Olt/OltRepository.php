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
use App\Repositories\Customer\CustomerRepository;
use Carbon\Carbon;
use Exception;
use Graze\TelnetClient\TelnetClient;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
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
     * @param OltModel $olt
     * @return Collection
     * @throws Exception
     */
    private function lossCustomerOlt(OltModel $olt): Collection
    {
        try {
            $response = collect();
            $telnet = new Telnet($olt->hostname, $olt->port,1,'');
            $telnet->setLoginPrompt("Username:");
            if ($olt->configs != null) {
                if (property_exists($olt->configs,'prompts')) {
                    if (property_exists($olt->configs->prompts,'user_prompt')) {
                        $telnet->setLoginPrompt($olt->configs->prompts->user_prompt);
                        if (property_exists($olt->configs->prompts,'pass_prompt')) {
                            $telnet->setLoginPrompt($olt->configs->prompts->user_prompt, $olt->configs->prompts->pass_prompt);
                        }
                    }
                }
            }
            $login = $telnet->login($olt->user, $olt->pass);
            if ($login) {
                $responseMessages = $telnet->execPaging("show gpon onu state");
                $telnet->clearBuffer();
                $responseMessages = explode("\n", $responseMessages);
                if (count($responseMessages) > 0) {
                    unset($responseMessages[0]);
                    unset($responseMessages[1]);
                    $responseMessages = array_values($responseMessages);
                    foreach ($responseMessages as $responseMessage) {
                        if (strlen($responseMessage) > 0) {
                            $lines = explode(" ", $responseMessage);
                            foreach ($lines as $index => $line) {
                                if (strlen($line) == 0) {
                                    unset($lines[$index]);
                                }
                            }
                            $lines = array_values($lines);
                            if (array_key_exists(3,$lines)) {
                                if (strtolower($lines[3]) == 'los') {
                                    $name = $description = "";
                                    $response->push(['onu' => $lines[0], 'name' => $name, 'description' => $description, 'states' => implode(' ', $lines), 'olt' => $olt->name, 'olt_id' => $olt->id]);
                                    /*$configLines = $telnet->exec("show gpon onu detail-info gpon-onu_" . $lines[0]);
                                    if (strlen($configLines) > 50) {
                                        $configLines = explode("\n", $configLines);
                                        if (count($configLines) > 0) {
                                            $name = $description = "";
                                            foreach ($configLines as $index => $configLine) {
                                                if ($index >= 1) {
                                                    if (Str::contains($configLine,"Name:")) {
                                                        $name = trim(str_replace("Name:","",trim($configLine)));
                                                    } elseif (Str::contains($configLine,"Description:")) {
                                                        $description = trim(str_replace("Description:","",trim($configLine)));
                                                    }
                                                }
                                            }
                                            $response->push(['name' => $name, 'description' => $description, 'states' => implode(' ', $lines), 'olt' => $olt->name]);
                                        }
                                    }*/
                                }
                            }
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
     * @return Collection
     * @throws Exception
     */
    public function lossCustomer(Request $request): Collection
    {
        try {
            $response = collect();
            new SwitchDB();
            $olts = OltModel::all();
            if ($olts->count() > 0) {
                foreach ($olts as $olt) {
                    $response = $response->merge($this->lossCustomerOlt($olt));
                }
            }
            //dd($response);
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
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
            $configs = (object) [];
            if ($request->has(__('olt.form_input.prompts.user'))) {
                if (! property_exists($configs,'prompts')) $configs->prompts = (object) [];
                if (! property_exists($configs->prompts,'user_prompt'))  $configs->prompts->user_prompt = '';
                $configs->prompts->user_prompt = $request[__('olt.form_input.prompts.user')];
            }
            if ($request->has(__('olt.form_input.prompts.pass'))) {
                if (! property_exists($configs,'prompts')) $configs->prompts = (object) [];
                if (! property_exists($configs->prompts,'pass_prompt'))  $configs->prompts->pass_prompt = '';
                $configs->prompts->pass_prompt = $request[__('olt.form_input.prompts.pass')];
            }
            $olt->configs = $configs;
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
            $configs = $olt->configs;

            if ($request->has(__('olt.form_input.prompts.user'))) {
                if ($configs != null) {
                    if (! property_exists($configs,'prompts')) {
                        $configs->prompts = (object) [];
                        $updating = true;
                    }
                    if (! property_exists($configs->prompts,'user_prompt')) {
                        $configs->prompts->user_prompt = '';
                        $updating = true;
                    }
                }
                if ($configs != null) {
                    if ($configs->prompts->user_prompt != $request[__('olt.form_input.prompts.user')]) $updating = true;
                    $configs->prompts->user_prompt = $request[__('olt.form_input.prompts.user')];
                } else {
                    $configs = (object) [];
                    $updating = true;
                    $configs->prompts = (object)['user_prompt' => $request[__('olt.form_input.prompts.user')] ];

                }
            } else {
                if (property_exists($configs,'prompts')) {
                    if (property_exists($configs->prompts,'user_prompt')) {
                        $updating = true;
                        unset($configs->prompts->user_prompt);
                    }
                }
            }
            if ($request->has(__('olt.form_input.prompts.pass'))) {
                if (! property_exists($configs,'prompts')) {
                    $updating = true;
                    $configs->prompts = (object) [];
                }
                if (! property_exists($configs->prompts,'pass_prompt'))  {
                    $updating = true;
                    $configs->prompts->pass_prompt = '';
                }
                if ($configs->prompts->pass_prompt != $request[__('olt.form_input.prompts.pass')]) $updating = true;
                $configs->prompts->pass_prompt = $request[__('olt.form_input.prompts.pass')];
            } else {
                if (property_exists($configs,'prompts')) {
                    if (property_exists($configs->prompts,'pass_prompt')) {
                        $updating = true;
                        unset($configs->prompts->pass_prompt);
                    }
                }
            }
            $olt->configs = $configs;

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
                    $newReq = new Request([
                        __('olt.form_input.host') => $olt->hostname,
                        __('olt.form_input.port') => $olt->port,
                        __('olt.form_input.user') => $olt->user,
                        __('olt.form_input.pass') => $olt->pass,
                        'response_type' => 'object',
                        'expect_uptime' => true
                    ]);
                    if ($olt->configs != null) {
                        if (property_exists($olt->configs,'prompts')) {
                            if (property_exists($olt->configs->prompts,'user_prompt')) {
                                $newReq = $newReq->merge([__('olt.form_input.prompts.user') => $olt->configs->prompts->user_prompt]);
                            }
                            if (property_exists($olt->configs->prompts,'user_prompt')) {
                                $newReq = $newReq->merge([__('olt.form_input.prompts.pass') => $olt->configs->prompts->pass_prompt]);
                            }
                        }
                    }
                    $responseRemote = $this->testConnection($newReq);
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
                $configs = $olt->configs;
                $prompts = null;
                if ($configs != null) {
                    if (property_exists($configs,'prompts')) {
                        $prompts = $configs->prompts;
                    }
                }
                $response->push((object) [
                    'value' => $olt->id,
                    'label' => $olt->name,
                    'meta' => (object) [
                        'description' => $olt->description,
                        'loss' => [
                            'loading' => false,
                            'count' => 0,
                            'data' => [],
                        ],
                        'auth' => (object) [
                            'host' => $olt->hostname,
                            'port' => $olt->port,
                            'user' => $username,
                            'pass' => $password,
                            'prompts' => $prompts
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
                if ($request->has(__('olt.form_input.prompts.user'))) {
                    $telnet->setLoginPrompt($request[__('olt.form_input.prompts.user')]);
                    if ($request->has(__('olt.form_input.prompts.pass'))) {
                        $telnet->setLoginPrompt($request[__('olt.form_input.prompts.user')], $request[__('olt.form_input.prompts.pass')]);
                    }
                }
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
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param array $onuResponses
     * @return Collection
     * @throws Exception
     */
    private function parseOnuStateLine(array $onuResponses): Collection
    {
        try {
            $response = collect();
            $breakPoints = 0;
            //dd($onuResponses);
            foreach ($onuResponses as $onuResponse) {
                if ($breakPoints < 5) {
                    $onuResponse = trim($onuResponse);
                    //$onuResponse = str_replace("\x08","", trim($onuResponse));
                    if (! Str::contains($onuResponse,"Admin State")) {
                        if (! Str::contains($onuResponse,"---------------------")) {
                            if (! Str::contains($onuResponse,"#")) {
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
                                            'serial_number' => null,
                                            'admin_state' => $lines[1],
                                            'omcc_state' => $lines[2],
                                            'phase_state' => strtolower($lines[3]),
                                            'channel' => $lines[4],
                                            'loading' => true,
                                            'details' => null,
                                        ]);
                                    }
                                }
                            } else {
                                $breakPoints++;
                            }
                        } else {
                            $breakPoints++;
                        }
                    } else {
                        $breakPoints++;
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
            if ($request->has(__('olt.form_input.prompts.user'))) {
                $telnet->setLoginPrompt($request[__('olt.form_input.prompts.user')]);
                if ($request->has(__('olt.form_input.prompts.pass'))) {
                    $telnet->setLoginPrompt($request[__('olt.form_input.prompts.user')], $request[__('olt.form_input.prompts.pass')]);
                }
            }
            $telnet->login($olt->user, $olt->pass);
            $unconfigs = $telnet->exec("show gpon onu uncfg");
            $unconfigs = explode("\n", $unconfigs);
            if (count($unconfigs) > 0) {
                //dd($unconfigs);
                /*** TODO UNCONFIG PARAMS NOT KNOWN ***/
                foreach ($unconfigs as $unconfig) {
                    if (strlen($unconfig) > 10) {
                        if (!Str::contains($unconfig,"No related information to show")) {
                            if (!Str::contains($unconfig,"------------------")) {
                                if (Str::contains($unconfig,"gpon-o")) {
                                    $line = explode(' ', $unconfig);
                                    $strings = [];
                                    if (count($line) > 1) {
                                        foreach ($line as $item) {
                                            if (strlen($item) > 4) {
                                                $strings[] = $item;
                                            }
                                        }
                                    }
                                    if (count($strings) == 3) {
                                        $response->push((object)[
                                            'onu' => str_replace('gpon-onu_','',$strings[0]),
                                            'serial_number' => $strings[1],
                                            'admin_state' => null,
                                            'omcc_state' => null,
                                            'phase_state' => 'unconfig',
                                            'channel' => '',
                                            'loading' => false,
                                            'details' => null,
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            $onuResponses = $telnet->execPaging("show gpon onu state");
            $onuResponses = explode("\n", $onuResponses);
            if (count($onuResponses) > 0) {
                unset($onuResponses[0]);
                unset($onuResponses[1]);
                $onuResponses = implode("\n",array_values($onuResponses));
                /*foreach ($onuResponses as $onuResponses) {
                    if (strlen($onuResponses) > 0) {

                    }
                }*/
            }
            //$onuResponses = str_replace("\x08","",trim($onuResponses));
            //$curCommands = "  \r\n";
            //$response = $response->merge($this->parseOnuStateLine($onuResponses));
            //$breaks = 0;
            /*for ($index = 0; $index <= 50; $index ++) {
                if ($breaks < 3) {
                    $curCommands = str_replace("\r\n","",$curCommands) . "  \r\n";
                    $curResponse = str_replace("\x08","",trim($telnet->exec($curCommands)));
                    if (strlen($curResponse) > 30) {
                        $onuResponses .= "\n" .$curResponse;
                    } elseif (Str::contains($curResponse,"#")) {
                        $breaks++;
                    }
                }*/
                /*if (!Str::contains($onuResponses,"#")) {
                    if (strlen($onuResponses) > 30) {
                        ini_set('max_execution_time',100000);
                        $onuResponses = collect(explode("\n", $onuResponses));
                        if ($onuResponses->count() > 0) {
                            $response = $response->merge($this->parseOnuStateLine($onuResponses));
                        } else {
                            $breaks++;
                        }
                    } else {
                        $breaks++;
                        if ($breaks >= 3) {
                            break;
                        }
                    }
                }*/
            /*}*/
            $onuResponses = explode("\n", $onuResponses);
            $telnet->disconnect();
            if (count($onuResponses) > 0) {
                $response = $this->parseOnuStateLine($onuResponses);
            }
            //Log::alert("break counts " . $breaks);
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return object|null
     * @throws Exception
     */
    public function unlinkCustomer(Request $request): ?object
    {
        try {
            $customer = Customer::where('onu_index', $request[__('olt.form_input.onu')])->first();
            $request = $request->merge([__('olt.form_input.id') => $customer->olt]);

            $customer->onu_index = null;
            $customer->gpon_configs = null;
            $customer->olt = null;
            $customer->saveOrFail();
            return $this->gponCustomer($request);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return object|null
     * @throws Exception
     */
    public function createCustomer(Request $request): ?object
    {
        try {
            $customer = Customer::where('id', $request[__('customers.form_input.id')])->first();
            $olt = OltModel::where('id', $request[__('olt.form_input.id')])->first();
            $customer->olt = $olt->id;
            $customer->onu_index = $request[__('olt.form_input.onu')];
            $customer->saveOrFail();
            return $this->gponCustomer(new Request([
                __('olt.form_input.id') => $olt->id,
                __('olt.form_input.onu') => $request[__('olt.form_input.onu')],
            ]));
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return object|null
     * @throws Exception
     */
    public function gponCustomer(Request $request): ?object
    {
        try {
            $response = null;
            $olt = OltModel::where('id', $request[__('olt.form_input.id')])->first();
            if ($olt != null) {
                $telnet = new Telnet($olt->hostname, $olt->port, 3, '');
                $telnet->setLoginPrompt("Username:");
                if ($olt->configs != null) {
                    if (property_exists($olt->configs,'prompts')) {
                        if (property_exists($olt->configs->prompts,'user_prompt')) {
                            $telnet->setLoginPrompt($olt->configs->prompts->user_prompt);
                            if (property_exists($olt->configs->prompts,'pass_prompt')) {
                                $telnet->setLoginPrompt($olt->configs->prompts->user_prompt, $olt->configs->prompts->pass_prompt);
                            }
                        }
                    }
                }
                $telnet->login($olt->user, $olt->pass);

                $responseCommands = $telnet->execPaging("show gpon onu detail-info gpon-onu_" . $request[__('olt.form_input.onu')]);
                /*for ($index = 0; $index <= 3; $index++) {
                    $responseCommands .= "\n";
                    $responseCommands .= $telnet->exec("   \n");
                }*/
                $telnet->disconnect();
                $responseCommands = collect(explode("\n",$responseCommands));
                if ($responseCommands->count() > 20) {
                    $customer = null;
                    if (Customer::where('onu_index', $request[__('olt.form_input.onu')])->first() != null) {
                        $customer = (new CustomerRepository())->table(new Request([__('olt.form_input.onu') => $request[__('olt.form_input.onu')]]))->first();
                    }
                    $response = (object) [
                        'name' => null,
                        'description' => null,
                        'username' => null,
                        'customer' => $customer,
                        'serial_number' => null,
                        'onu_distance' => null,
                        'online_duration' => null,
                        'state_causes' => collect(),
                        'full_response' => $responseCommands,
                    ];
                    $stateAndCauses = collect();
                    foreach ($responseCommands as $index => $responseCommand) {
                        if ($index > 0) {
                            if ($index == 1) { // name
                                $response->name = parseLineGponResponse($responseCommand);
                            } elseif ($index == 11) { //Serial number:
                                $response->serial_number = parseLineGponResponse($responseCommand, "Serial number:");
                            } elseif ($index == 13) { //description
                                $response->description = parseLineGponResponse($responseCommand,"Description:");
                            } elseif ($index == 20) { //ONU Distance
                                $response->onu_distance = parseLineGponResponse($responseCommand,"ONU Distance:");
                            } elseif ($index == 21) { //Online Duration:
                                $response->online_duration = parseLineGponResponse($responseCommand,"Online Duration:");
                            } elseif ($index >= 30 && $index <= 39) {
                                $stateAndCauses->push($responseCommand);
                            }
                        }
                    }
                    if ($stateAndCauses->count() > 0) {
                        foreach ($stateAndCauses as $stateAndCause) {
                            $lines = explode(" ", $stateAndCause);
                            if (count($lines) > 0) {
                                foreach ($lines as $key => $line) {
                                    if (strlen($line) < 3) {
                                        unset($lines[$key]);
                                    }
                                }
                                if (count($lines) == 5) {
                                    $lines = collect($lines)->values()->toArray();
                                    if ($lines[0] != "0000-00-00" && $lines[1] != "00:00:00" && $lines[2] != "0000-00-00" && $lines[3] != "00:00:00") {
                                        if (strtolower($lines[4]) == 'losi') $lines[4] = 'los';
                                        $response->state_causes->push((object) [
                                            'online_time' => $lines[0] . ' ' . $lines[1],
                                            'offline_time' => $lines[2] . ' ' . $lines[3],
                                            'phase_state' => strtolower($lines[4]),
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                    if ($response->state_causes->count() > 0) {
                        $response->new_phase_state = $response->state_causes->last()->phase_state;
                    }

                }
                //dd($responseCommands);
            }
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
    public function gponCustomerBak(Request $request): ?object
    {
        try {
            $response = null;
            $olt = OltModel::where('id', $request[__('olt.form_input.id')])->first();
            if ($olt != null) {
                $telnet = new Telnet($olt->hostname, $olt->port,3,'');
                $telnet->setLoginPrompt("Username:");
                if ($olt->configs != null) {
                    if (property_exists($olt->configs,'prompts')) {
                        if (property_exists($olt->configs->prompts,'user_prompt')) {
                            $telnet->setLoginPrompt($olt->configs->prompts->user_prompt);
                        }
                        if (property_exists($olt->configs->prompts,'pass_prompt')) {
                            $telnet->setLoginPrompt($olt->configs->prompts->user_prompt, $olt->configs->prompts->pass_prompt);
                        }
                    }
                }
                $telnet->login($olt->user, $olt->pass);
                $runInterfaceLines = $telnet->exec("show running-config interface gpon-onu_" . $request[__('olt.form_input.onu')]);
                $telnet->disconnect();

                if (strlen($runInterfaceLines) > 0) {
                    $runInterfaceLines = explode("\n", $runInterfaceLines);
                    if (count($runInterfaceLines) > 2) {
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
                        foreach ($runInterfaceLines as $index => $runInterfaceLine) {
                            if ($index >= 2) {
                                if (strlen($runInterfaceLine) > 10) {
                                    /* EXAMPLE RESPONSE
                                     * Building configuration...
                                     * interface gpon-onu_1/2/8:5
                                     *      name sitijuleha@judyusnet
                                     *      tcont 1 profile HOME-5Mb
                                     *      gemport 1 tcont 1
                                     *      gemport 1 traffic-limit upstream HOME-5Mb downstream HOME-5Mb
                                     *      service-port 1 vport 1 user-vlan 111 vlan 111
                                     *
                                     * Building configuration...
                                     * interface gpon-onu_1/1/1:8
                                     *      name jgr.sugriyanto@rst.net.id
                                     *      description jgr.sugriyanto@rst.net.id
                                     *      tcont 1 name jgr.sugriyanto@rst.net.id profile Home-5Mbps
                                     *      gemport 1 name jgr.sugriyanto@rst.net.id tcont 1
                                     *      gemport 1 traffic-limit upstream Home-5Mbps downstream Home-5Mbps
                                     *      service-port 1 vport 1 user-vlan 142 vlan 142
                                     *      service-port 1 description jgr.sugriyanto@rst.net.id
                                     */
                                    if (Str::contains($runInterfaceLine,"description") && ( $index == 2 || $index == 3) ) {
                                        if ($response->username == null) {
                                            if (!Str::contains($runInterfaceLine,"service-port")) {
                                                $line = explode(" ", $runInterfaceLine);
                                                if (count($line) > 1) {
                                                    foreach ($line as $key => $item) {
                                                        if (strlen($item) == 0) {
                                                            array_splice($line,$key,1);
                                                        }
                                                        if ($item == 'description') {
                                                            array_splice($line,$key,1);
                                                        }
                                                    }
                                                    $response->username = join(' ', $line);
                                                }
                                            }
                                        }
                                    } elseif (Str::contains($runInterfaceLine,"name") && ($index == 2 || $index == 3) ) {
                                        if (! Str::contains($runInterfaceLine,"tcont") && ! Str::contains($runInterfaceLine,"profile")) {
                                            $line = explode(" ", $runInterfaceLine);
                                            if (count($line) > 1) {
                                                foreach ($line as $key => $item) {
                                                    if (strlen($item) == 0) {
                                                        array_splice($line,$key,1);
                                                    }
                                                    if ($item == 'name') {
                                                        array_splice($line,$key,1);
                                                    }
                                                }
                                                $response->username = join(' ', $line);
                                            }
                                        }
                                    } elseif (Str::contains($runInterfaceLine,"tcont") && $index > 3) {
                                        if (Str::contains($runInterfaceLine,"profile")) {
                                            $line = explode(" ", $runInterfaceLine);
                                            if (count($line) > 3) {
                                                $response->profile->tcont = $line[count($line) - 1];
                                            }
                                        } elseif (Str::contains($runInterfaceLine,"gemport") && $index > 3) {
                                            $line = explode(" ", $runInterfaceLine);
                                            if (count($line) > 3) {
                                                $response->gemport->tcont = $line[count($line) - 1];
                                            }
                                        }
                                    } elseif (Str::contains($runInterfaceLine,"traffic-limit") && $index > 3) {
                                        $line = explode(" ", $runInterfaceLine);
                                        if (count($line) >= 6) {
                                            $response->gemport->traffic_limit->upstream = $line[4];
                                            $response->gemport->traffic_limit->downstream = $line[count($line) - 1];
                                        }
                                    } elseif (Str::contains($runInterfaceLine,"service-port") && $index > 3) {
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
