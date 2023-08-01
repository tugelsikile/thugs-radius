<?php

namespace App\Repositories\Olt;

use App\Helpers\OLT\ZTE\C320;
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
    public function unConfigure(Request $request) {
        try {
            $olt = OltModel::where('id', $request[__('olt.form_input.id')])->first();
            $onu = $request[__('olt.form_input.onu')];
            $portOlt = explode(":", $onu);
            if (count($portOlt) == 2) {
                $portOnu = $portOlt[1];
                $portOlt = $portOlt[0];
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
                    $responseMessages = $telnet->exec("conf t");
                    $responseMessages .= "\n" . $telnet->exec("interface gpon-olt_" . $portOlt);
                    $responseMessages .= "\n" . $telnet->exec("no onu " . $portOnu);
                    Log::info($responseMessages);
                    return $this->gponCustomer($request);
                }
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
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
            if ($request->has(__('olt.form_input.brand'))) {
                $olt->brand = (object) [ 'name' => null];
                $olt->brand->name = $request[__('olt.form_input.brand')];
            }
            if ($request->has(__('olt.form_input.model'))) {
                $olt->brand->model = $request[__('olt.form_input.model')];
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

            $brand = $olt->brand;
            if ($brand == null) $brand = (object) [];
            if ($request->has(__('olt.form_input.brand'))) {
                $brand->name = $request[__('olt.form_input.brand')];
            } else {
                if (property_exists($brand,'model')) {
                    unset($brand->name);
                }
            }
            if ($request->has(__('olt.form_input.model'))) {
                $brand->model = $request[__('olt.form_input.model')];
            } else {
                if (property_exists($brand,'model')) {
                    unset($brand->model);
                }
            }
            $olt->brand = $brand;

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
                        'brand' => $olt->brand,
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
                            if (! Str::contains($onuResponse,"#") || ! Str::contains($onuResponse,">")) {
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
            if ($olt->brand != null) {
                if (property_exists($olt->brand,'name') && property_exists($olt->brand,'model')) {
                    switch ($olt->brand->name) {
                        default:
                        case 'zte':
                            switch ($olt->brand->model) {
                                default:
                                case 'zte_320':
                                    if ($request->has(__('olt.form_input.host')) &&
                                        $request->has(__('olt.form_input.port')) &&
                                        $request->has(__('olt.form_input.user')) &&
                                        $request->has(__('olt.form_input.pass'))
                                    ) {
                                        $response = $response->merge((new C320(null, $request))->gPonUnConfigs());
                                        $response = $response->merge((new C320(null, $request))->gPonStates());
                                    } else {
                                        $response = $response->merge((new C320($olt))->gPonUnConfigs());
                                        $response = $response->merge((new C320($olt))->gPonStates());
                                    }
                                    break;
                            }
                            break;
                        case 'hioso':
                        case 'hsgc':
                            switch ($olt->brand->model){
                                default:
                                case 'none':
                                    break;
                            }
                            break;
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
            $config = null;
            if ($olt->brand != null) {
                if (property_exists($olt->brand,'name') && property_exists($olt->brand,'model')) {
                    switch ($olt->brand->name) {
                        default:
                        case 'zte':
                            switch ($olt->brand->model){
                                default:
                                case 'zte_320':
                                    $config = (new C320($olt))->showGPonOnuDetailInfo($customer->onu_index);
                                    if ($config != null) {
                                        $customer->gpon_configs = $config;
                                    }
                                    break;
                            }
                        break;
                    }
                }
            }
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
            if ($request->phase_state !== 'unconfig') {
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
                            'phase_state' => null,
                        ];
                        $stateAndCauses = collect();
                        foreach ($responseCommands as $index => $responseCommand) {
                            if ($index > 0) {
                                if ($index == 1 && Str::contains($responseCommand,"Name:")) { // name
                                    $response->name = parseLineGponResponse($responseCommand);
                                } elseif ($index == 11 && Str::contains($responseCommand,"Serial number:")) { //Serial number:
                                    $response->serial_number = parseLineGponResponse($responseCommand, "Serial number:");
                                } elseif ($index == 13 && Str::contains($responseCommand,"Description:")) { //description
                                    $response->description = parseLineGponResponse($responseCommand,"Description:");
                                } elseif ($index == 20 && Str::contains($responseCommand,"ONU Distance:")) { //ONU Distance
                                    $response->onu_distance = parseLineGponResponse($responseCommand,"ONU Distance:");
                                } elseif ($index == 21 && Str::contains($responseCommand,"Online Duration:")) { //Online Duration:
                                    $response->online_duration = parseLineGponResponse($responseCommand,"Online Duration:");
                                } elseif ($index >= 30 && $index <= 39) {
                                    $stateAndCauses->push($responseCommand);
                                } elseif ($index >= 3) {
                                    if (Str::contains($responseCommand,"Phase state:")) {
                                        $response->phase_state = trim(str_replace("Phase state:","", $responseCommand));
                                    }
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
     * @return bool|null
     * @throws Exception
     */
    public function registerCustomer(Request $request): ?bool
    {
        try {
            $response = null;
            $olt = OltModel::where('id', $request[__('olt.form_input.id')])->first();
            if ($olt != null) {
                $customer = Customer::where('id', $request[__('customers.form_input.id')])->first();
                if ($customer != null) {
                    $commandRegisters = collect();
                    $commandConfigs = collect();
                    $commandRegisters->push("config terminal");
                    $commandRegisters->push("interface gpon-olt_" . $request[__('olt.form_input.onus.olt')]);
                    $commandRegisters->push("onu " . $request[__('olt.form_input.onus.index')]. " type " . $request[__('olt.form_input.onus.type')]. " sn " . $request[__('olt.form_input.onus.sn')]);
                    $commandConfigs->push("config terminal");
                    $gponOnu = $request[__('olt.form_input.onus.olt')] . ':' . $request[__('olt.form_input.onus.index')];
                    $commandConfigs->push("interface gpon-onu_" . $gponOnu);
                    $commandConfigs->push("name " . $request[__('olt.form_input.onus.name')]);
                    $commandConfigs->push("description " . $request[__('olt.form_input.onus.description')]);
                    foreach ($request[__('olt.form_input.onus.tcont.input')] as $item) {
                        $commandConfigs->push("tcont " . $item[__('olt.form_input.onus.tcont.id')] . " profile " . $item[__('olt.form_input.onus.tcont.profile')]);
                    }
                    foreach ($request[__('olt.form_input.onus.gemport.input')] as $item) {
                        $commandConfigs->push("gemport " . $item[__('olt.form_input.onus.gemport.id')] . " tcont " . $item[__('olt.form_input.onus.tcont.input')]);
                        $commandConfigs->push("gemport " . $item[__('olt.form_input.onus.gemport.id')] . " traffic-limit upstream " . $item[__('olt.form_input.onus.gemport.upstream')]. " downstream " . $item[__('olt.form_input.onus.gemport.downstream')]);
                    }
                    foreach ($request[__('olt.form_input.onus.vlan.input')] as $item) {
                        $commandConfigs->push("service-port " . $item[__('olt.form_input.onus.vlan.port')] . " vport " . $item[__('olt.form_input.onus.vlan.vport')] . " user-vlan " . $item[__('olt.form_input.onus.vlan.user')] . " vlan " . $item[__('olt.form_input.onus.vlan.service')]);
                    }
                    $commandConfigs->push("exit");
                    $commandConfigs->push("config terminal");
                    $commandConfigs->push("pon-onu-mng gpon-onu_" . $gponOnu);
                    foreach ($request[__('olt.form_input.onus.pon_mng.input')] as $item) {
                        $commandConfigs->push("service " . $item[__('olt.form_input.onus.pon_mng.name')] . " gemport " . $item[__('olt.form_input.onus.gemport.input')] . " vlan " . $item[__('olt.form_input.onus.vlan.input')]);
                    }

                    switch ($request[__('olt.form_input.brand')]) {
                        case 'zte':
                            $commandConfigs->push("wan-ip 1 mode pppoe username " . $customer->nas_username . " password " . $customer->nas_password . " vlan-profile " . $request[__('olt.form_input.onus.pon_mng.vlan')] . " host 1");
                            $commandConfigs->push("wan-ip 1 ping-response enable traceroute-response enable");
                            $commandConfigs->push("security-mgmt 500 state enable mode forward protocol web");
                            break;
                        case 'fiberhome':
                            $commandConfigs->push("vlan port veip_1 mode hybrid");
                            $commandConfigs->push("wan-ip 1 mode pppoe username " . $customer->nas_username . " password " . $customer->nas_password . " vlan-profile " . $request[__('olt.form_input.onus.pon_mng.vlan')] . " host 1");
                            $commandConfigs->push("wan-ip 1 ping-response enable traceroute-response enable");
                            $commandConfigs->push("security-mgmt 500 state enable mode forward protocol web");
                            break;
                    }
                    $commandConfigs->push("exit");
                    $commandConfigs->push("write");
                    $responseRegister = (new C320($olt))->bulkCommands($commandRegisters->toArray());
                    if (strlen($responseRegister) > 0) {
                        $responseConfig = (new C320($olt))->bulkCommands($commandConfigs->toArray());
                        if (strlen($responseConfig) > 0) {
                            $customer->olt = $olt->id;
                            $customer->onu_index = $gponOnu;
                            $customer->saveOrFail();
                            $response = true;
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
