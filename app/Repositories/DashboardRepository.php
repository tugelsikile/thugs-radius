<?php /** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories;

use App\Helpers\MikrotikAPI;
use App\Helpers\MiktorikSSL;
use App\Helpers\Server\Server;
use App\Helpers\SwitchDB;
use App\Models\Customer\Customer;
use App\Models\Customer\CustomerInvoicePayment;
use App\Models\Customer\CustomerTraffic;
use App\Models\Nas\Nas;
use App\Models\Radius\Radacct;
use App\Repositories\Customer\InvoiceRepository;
use Carbon\Carbon;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Ramsey\Uuid\Uuid;


class DashboardRepository
{
    protected $me;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
    }

    /* @
     * @param Request|null $request
     * @return object
     * @throws Exception
     */
    public function topCards(Request $request = null): object
    {
        try {
            new SwitchDB();
            $response = (object)['customers' => collect(), 'payments' => collect(), 'vouchers' => collect(), 'pendings' => collect()];
            $response->customers = Customer::whereDate('active_at', Carbon::now()->format('Y-m-d'))->get('id');
            $vouchers = Customer::whereDate('active_at', Carbon::now()->format('Y-m-d'))->where('is_voucher')->get();
            if ($vouchers->count() > 0) {
                foreach ($vouchers as $voucher) {
                    if ($voucher->profileObj != null) {
                        $response->vouchers->push((object)[ 'price' => $voucher->profileObj->price]);
                    }
                }
            }
            $response->pendings = (new InvoiceRepository())->table(new Request([__('invoices.form_input.bill_period') => Carbon::now()->format('Y-m-d')]));
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request|null $request
     * @return Collection
     * @throws Exception
     */
    public function onlineCustomer(Request $request = null): Collection
    {
        try {
            $response = collect();
            new SwitchDB();
            $routers = Nas::all();
            foreach ($routers as $router) {
                $online = (new MikrotikAPI($router))->allOnlineUsers();
                if ($online->count() > 0) {
                    foreach ($online as $item) {
                        $customer = Customer::where('nas_username', $item['name'])->first();
                        if ($customer != null) {
                            $byteString = "0/0";
                            $packets = "";

                            if (array_key_exists('bytes',$item)) {
                                $bytes = explode('/', $item['bytes']);
                                if (collect($bytes)->count() == 2) {
                                    $newTraffic = new CustomerTraffic();
                                    $newTraffic->id = Uuid::uuid4()->toString();
                                    $newTraffic->customer = $customer->id;
                                    $newTraffic->input = $bytes[0];
                                    $newTraffic->output = $bytes[1];
                                    $newTraffic->saveOrFail();
                                }
                            }
                            if (array_key_exists('packets', $item)) {
                                $packets = $item['packets'];
                            }
                            $traffics = collect();
                            $lastTraffics = CustomerTraffic::where('customer', $customer->id)->limit(5)->offset(0)->orderBy('created_at','asc')->get();
                            if ($lastTraffics->count() > 0) {
                                foreach ($lastTraffics as $lastTraffic) {
                                    $traffics->push($lastTraffic->input . '/' . $lastTraffic->output);
                                }
                            }
                            $response->push((object)[
                                'label' => $customer->name,
                                'meta' => (object) [
                                    'username' => $item['name'],
                                    'type' => $customer->method_type,
                                    'duration' => $item['uptime'],
                                    'ip' => $item['address'],
                                    'mac' => $item['caller-id'],
                                    'bytes' => $byteString,
                                    'last_bytes' => $traffics,
                                    'packets' => $packets
                                ]
                            ]);
                        }
                    }
                }
                //$response = $response->merge($online)->values();
            }
            /*$customers = Radacct::orderBy('acctstarttime', 'desc')->whereDate('acctstarttime',Carbon::now()->format('Y-m-d'))->whereNull('acctstoptime')->distinct('username')->get();
            if ($customers->count() > 0) {
                foreach ($customers as $customer) {
                    $cs = $customer->customerObj;
                    $duration = null;
                    $last = Radacct::whereNotIn('acctterminatecause',['Port-Error',''])->where('username', $customer->username)->whereDate('acctstarttime',Carbon::now()->format('Y-m-d'))->whereNotNull('acctstoptime')->orderBy('acctstoptime','asc')->first();
                    if ($last != null) {
                        $duration = Carbon::parse($last->acctstoptime)->diffInMinutes(Carbon::parse($customer->accstarttime));
                    }
                    $response->push((object)[
                        'value' => $customer->acctsessionid,
                        'label' => $customer->username,
                        'meta' => (object) [
                            'customer' => $cs,
                            'at' => $customer->acctstarttime,
                            'ip' => $customer->framedipaddress,
                            'mac' => $customer->callingstationid,
                            'duration' => $duration,
                        ]
                    ]);
                }
            }*/
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return false|object
     * @throws Exception
     */
    public function serverAction(Request $request) {
        try {
            $response = false;
            $exec = null;
            switch (strtolower($request[__('labels.form_input.type',['Attribute' => 'server'])])) {
                case 'database' :
                    (new Server())->statusServer(env('MIX_DB_SSH_DAEMON'), $request[__('labels.form_input.action',['Attribute'=>'server'])]);
                    $exec = (new Server())->statusServer(env('MIX_DB_SSH_DAEMON'), "status");
                    break;
                case 'radius' :
                    (new Server())->statusServer(env('MIX_RADIUS_SSH_DAEMON'), $request[__('labels.form_input.action',['Attribute'=>'server'])]);
                    $exec = (new Server())->statusServer(env('MIX_RADIUS_SSH_DAEMON'), "status");
                    break;
            }
            if ($exec != null) {
                if (property_exists($exec,'status')) {
                    $response = $exec;
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request|null $request
     * @return Collection
     * @throws Exception|GuzzleException
     */
    public function serverStatus(Request $request = null): Collection
    {
        try {
            $response = collect();
            $response->push((object)[ 'label' => 'Database', 'value' => false, 'type' => 'database', 'id' => 'database', 'icon' => 'fas fa-database', 'message' => '' ]);
            $response->push((object)[ 'label' => 'Radius', 'value' => false, 'type' => 'radius', 'id' => 'radius', 'icon' => 'fas fa-tachograph-digital', 'message' => '' ]);
            foreach ($response as $index => $item) {
                $status = (new Server())->statusServer($item->id == 'database' ? env('MIX_DB_SSH_DAEMON') : env('MIX_RADIUS_SSH_DAEMON'),"status");
                if ($status != null) {
                    $response[$index]->value = $status->status;
                    $response[$index]->message = $status->message;
                }
            }
            new SwitchDB();
            $nas = Nas::all();
            foreach ($nas as $index => $item) {
                $response->push((object) [
                    'label' => $item->shortname, 'value' => false, 'type' => 'nas', 'id' => $item->id, 'icon' => 'fas fa-server', 'message' => ''
                ]);
                $req = null;
                switch ($item->method) {
                    case 'api':
                        $req = (new MikrotikAPI($item))->testConnection(new Request([
                            __('nas.form_input.ip') => $item->nasname,
                            __('nas.form_input.port') => $item->method_port,
                            __('nas.form_input.user') => $item->user,
                            __('nas.form_input.pass') => $item->password,
                        ]));
                        break;
                    case 'ssl':
                        $req = (new MiktorikSSL($item))->testConnection(new Request([
                            __('nas.form_input.domain') => $item->method_domain,
                            __('nas.form_input.port') => $item->method_port,
                            __('nas.form_input.user') => $item->user,
                            __('nas.form_input.pass') => $item->password,
                        ]));
                        break;
                }
                if ($req != null) {
                    if (property_exists($req,'message')) {
                        $response[$index + 2]->message = $req->message;
                    }
                    if (property_exists($req,'success')) {
                        $response[$index + 2]->value = $req->success;
                        $response[$index + 2]->onlines = (new MikrotikAPI($item))->allOnlineUsers();
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
