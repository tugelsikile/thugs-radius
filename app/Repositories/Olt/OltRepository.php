<?php

namespace App\Repositories\Olt;

use App\Helpers\SwitchDB;
use App\Helpers\Zte\Kernel\Snmp\Olt;
use App\Helpers\Zte\Kernel\Snmp\Onu;
use \App\Models\Olt\Olt as OltModel;
use Exception;
use Graze\TelnetClient\TelnetClient;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;

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
    public function create(Request $request) {
        try {
            new SwitchDB();
            $olt = new OltModel();
            $olt->id = Uuid::uuid4()->toString();
            $olt->name = $request[__('olt.form_input.name')];
            $olt->hostname = $request[__('olt.form_input.host')];
            $olt->port = $request[__('olt.form_input.port')];
            $olt->community_read = $request[__('olt.form_input.read')];
            $olt->community_write = $request[__('olt.form_input.write')];
            if ($this->me != null) {
                $olt->created_by = $this->me->id;
            }
            $olt->saveOrFail();
            return $this->table(new Request(['id' => $olt->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function update(Request $request) {
        try {
            new SwitchDB();
            $olt = OltModel::where('id', $request[__('olt.form_input.id')])->first();
            $olt->name = $request[__('olt.form_input.name')];
            $olt->hostname = $request[__('olt.form_input.host')];
            $olt->port = $request[__('olt.form_input.port')];
            $olt->community_read = $request[__('olt.form_input.read')];
            $olt->community_write = $request[__('olt.form_input.write')];
            if ($this->me != null) {
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
                $remote = new Olt();
                $remote->setCommunity($olt->community_read);
                $response->push((object) [
                    'value' => $olt->id,
                    'label' => $olt->name,
                    'meta' => (object) [
                        'description' => $olt->description,
                        'auth' => (object) [
                            'host' => $olt->hostname,
                            'port' => $olt->port,
                            'user' => $olt->user,
                            'pass' => $olt->pass,
                        ],
                        'communities' => (object) [
                            'read' => $olt->community_read,
                            'write' => $olt->community_write,
                        ],
                        'remote' => (object) [
                            'name' => @ str_replace('STRING: ','',$remote->getOltName($olt->hostname)),
                            'uptime' => @ $remote->getUptime($olt->hostname)
                        ]
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
            $olt = new Olt();
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
            return null;
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
            $onu = new Onu();
            $onu->setCommunity($olt->community_read);
            //$rxOpticPowers = $onu->getRxOpticPower($olt->hostname);
            $maxPorts = $onu->getInterfaceNumber($olt->hostname);
            for ($port = 1; $port < $maxPorts; $port++) {
                $gponId = $onu->getOnu($olt->hostname, $port);
                try {
                    $customerCircuits = $onu->getCustomerCircuit($olt->hostname, $gponId);
                    $macs = $onu->getCustomerOnuMac($olt->hostname, $gponId);
                    if ($gponId != null) {
                        try {
                            $gponCustomers = collect($onu->getCustomerStatus($olt->hostname, $gponId));
                            foreach ($gponCustomers as $index => $gponCustomer) {
                                $response->push((object) [
                                    'circuit' => str_replace('string: ','',str_replace('"','',strtolower($customerCircuits[$index]))),
                                    'status' => strtolower($gponCustomer),
                                    'mac' => formatMacFromOlt($macs[$index]),
                                    /*'powers' => (object) [
                                        'rx' => $rxOpticPowers[$index],
                                    ]*/
                                ]);
                            }
                        } catch (Exception $exception) {}
                    }
                } catch (Exception $exception) {}
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
