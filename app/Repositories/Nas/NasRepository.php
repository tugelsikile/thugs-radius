<?php /** @noinspection PhpMultipleClassDeclarationsInspection */
/** @noinspection DuplicatedCode */
/** @noinspection PhpDocRedundantThrowsInspection */
/** @noinspection PhpUndefinedMethodInspection */
/** @noinspection SpellCheckingInspection */

/** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories\Nas;

use App\Helpers\MikrotikAPI;
use App\Helpers\MiktorikSSL;
use App\Helpers\Radius\Radius;
use App\Helpers\Server\Server;
use App\Helpers\SwitchDB;
use App\Models\Company\ClientCompany;
use App\Models\Nas\Nas;
use App\Models\Nas\NasUserGroup;
use App\Models\User\User;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;
use RouterOS\Client;
use RouterOS\Query;
use Throwable;
use function PHPUnit\Framework\isFalse;

class NasRepository
{
    protected $mikrotikAPI;
    protected $mikrotikSSL;
    protected $me;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
        if ($this->me != null) {
            if ($this->me->company != null) {
                Config::set("database.connections.radius", [
                    'charset' => 'utf8mb4',
                    'collation' => 'utf8mb4_unicode_ci',
                    'driver' => 'mysql',
                    'host' => $this->me->companyObj->radius_db_host,
                    'port' => env('DB_RADIUS_PORT'),
                    'database' => $this->me->companyObj->radius_db_name,
                    'username' => $this->me->companyObj->radius_db_user,
                    'password' => $this->me->companyObj->radius_db_pass
                ]);
            }
        }
    }

    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function tableNasGroup(Request $request): Collection
    {
        try {
            $response = collect();
            $user = User::where('id', $request->user)->first();
            if ($user != null) {
                $company = ClientCompany::where('id', $user->company)->first();
                if ($company != null) {
                    new SwitchDB("database.connections.radius",[
                        'charset' => 'utf8mb4',
                        'collation' => 'utf8mb4_unicode_ci',
                        'driver' => 'mysql',
                        'host' => $company->radius_db_host,
                        'port' => env('DB_RADIUS_PORT'),
                        'database' => $company->radius_db_name,
                        'username' => $company->radius_db_user,
                        'password' => $company->radius_db_pass
                    ]);
                    $nasGroups = NasUserGroup::where('user', $user->id)->orderBy('created_at','asc')->get();
                    if ($nasGroups->count() > 0) {
                        foreach ($nasGroups as $nasGroup) {
                            $response->push((object) [
                                'value' => $nasGroup->id,
                                'label' => $nasGroup->nasObj->shortname,
                                'meta' => (object) [
                                    'nas' => $nasGroup->nasObj,
                                    'user' => $nasGroup->userObj
                                ]
                            ]);
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function reloadStatus(Request $request) {
        try {
            $response = null;
            $nas = Nas::where('id', $request[__('nas.form_input.name')])->first();
            if ($nas != null) {
                switch ($nas->method) {
                    case 'api':
                        $api = new MikrotikAPI($nas);
                        $response = $api->testConnection();
                        break;
                    case 'ssl' :
                        $ssl = new MiktorikSSL($nas);
                        $response = $ssl->testConnection();
                        break;
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
    public function parentQueue(Request $request): Collection
    {
        try {
            $response = collect();
            new SwitchDB();
            $nas = Nas::where('id', $request[__('nas.form_input.name')])->first();
            if ($nas != null) {
                $queues = null;
                switch (strtolower($nas->method)) {
                    case 'api' :
                        $api = new MikrotikAPI($nas);
                        $queues = $api->getParentQueue();
                        break;
                    case 'ssl' :
                        $ssl = new MiktorikSSL($nas);
                        $queues = $ssl->getParentQueue();
                        break;
                }
                if ($queues != null) {
                    if ($queues->count() > 0) {
                        foreach ($queues as $queue) {
                            if (! is_array($queue)) $queue = (array) $queue;
                            if ($queue['disabled'] == 'false') {
                                $response->push((object) [
                                    'value' => $queue['.id'],
                                    'label' => $queue['name'],
                                    'meta' => (object) [
                                        'data' => $queue
                                    ]
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
     * @return mixed
     * @throws GuzzleException
     * @throws Throwable
     */
    public function create(Request $request) {
        try {
            new SwitchDB();
            $me = auth()->guard('api')->user();
            $nas = new Nas();
            if ($request->has('default_id')) {
                $nas->id = $request->default_id;
            } else {
                $nas->id = Uuid::uuid4()->toString();
            }
            $nas->shortname = $request[__('nas.form_input.name')];
            $nas->description = $request[__('nas.form_input.description')];
            $nas->type = 'other';
            $nas->secret = $request[__('nas.form_input.secret')];
            $nas->community = Str::slug($nas->shortname,'_');
            $nas->method = $request[__('nas.form_input.method')];
            $nas->nasname = $request[__('nas.form_input.ip')];
            if ($nas->method == 'ssl') {
                $nas->method_domain = $request[__('nas.form_input.domain')];
            }
            $nas->method_port = $request[__('nas.form_input.port')];
            $nas->user = $request[__('nas.form_input.user')];
            $nas->password = $request[__('nas.form_input.pass')];
            $nas->created_by = $me->id;
            $nas->saveOrFail();
            (new Server())->statusServer(env('MIX_RADIUS_SSH_DAEMON'),'restart');
            return $this->table(new Request(['id' => $nas->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws GuzzleException
     * @throws Throwable
     */
    public function update(Request $request) {
        try {
            new SwitchDB();
            $this->testConnection($request);
            $updating = false;
            $nas = Nas::where('id', $request[__('nas.form_input.id')])->first();

            if ($nas->shortname != $request[__('nas.form_input.name')]) $updating = true;
            if ($nas->community != Str::slug($nas->shortname,'_')) $updating = true;
            if ($nas->description != $request[__('nas.form_input.description')]) $updating = true;
            if ($nas->method != $request[__('nas.form_input.method')]) $updating = true;
            if ($nas->nasname != $request[__('nas.form_input.ip')]) $updating = true;
            if ($nas->secret != $request[__('nas.form_input.secret')]) $updating = true;

            $nas->shortname = $request[__('nas.form_input.name')];
            $nas->community = Str::slug($nas->shortname,'_');
            $nas->description = $request[__('nas.form_input.description')];
            $nas->method = $request[__('nas.form_input.method')];
            $nas->nasname = $request[__('nas.form_input.ip')];
            $nas->secret = $request[__('nas.form_input.secret')];
            if ($nas->method == 'ssl') {
                if ($nas->method != 'ssl') $updating = true;
                if ($nas->method_domain != $request[__('nas.form_input.domain')]) $updating = true;
                $nas->method_domain = $request[__('nas.form_input.domain')];
            } else {
                if ($nas->method == 'api') $updating = true;
                if ($nas->method_domain != null) $updating = true;
                $nas->method_domain = null;
            }
            if ($nas->method_port != $request[__('nas.form_input.port')]) $updating = true;
            if ($nas->user != $request[__('nas.form_input.user')]) $updating = true;
            if ($nas->password != $request[__('nas.form_input.pass')]) $updating = true;

            $nas->method_port = $request[__('nas.form_input.port')];
            $nas->user = $request[__('nas.form_input.user')];
            $nas->password = $request[__('nas.form_input.pass')];

            if ($updating) {
                $nas->updated_by = $this->me->id;
            }
            $nas->saveOrFail();

            if ($updating) {
                (new Server())->statusServer(env('MIX_RADIUS_SSH_DAEMON'),'restart');
            }
            return $this->table(new Request(['id' => $nas->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return string|null
     * @throws GuzzleException
     */
    public function testConnection(Request $request): ?string
    {
        try {
            switch ($request[__('nas.form_input.method')]) {
                case 'api' :
                    $api = new MikrotikAPI();
                    $r = $api->testConnection($request);
                    if ($r != null) {
                        if ($r->success) {
                            return __('nas.labels.connection.success') . $r->message;
                        } else {
                            throw new Exception($r->message,500);
                        }
                    }
                    break;
                case 'ssl' :
                    $ssl = new MiktorikSSL();
                    $r = $ssl->testConnection($request);
                    if ($r != null) {
                        return __('nas.labels.connection.success') . $r->message;
                    }
                    break;
            }
            return null;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception|GuzzleException
     */
    public function table(Request $request): Collection
    {
        try {
            $response = collect();
            if ($this->me->company == null) {
                $clientCompanies = ClientCompany::all();
                $nass = collect();
                foreach ($clientCompanies as $company) {
                    new SwitchDB("database.connections.radius",[
                        'charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci', 'driver' => 'mysql',
                        'host' => $company->radius_db_host, 'port' => env('DB_RADIUS_PORT'),
                        'database' => $company->radius_db_name, 'username' => $company->radius_db_user,
                        'password' => $company->radius_db_pass,
                    ]);
                    $nassX = Nas::orderBy('shortname', 'asc');
                    if (strlen($request->id) > 0) $nassX = $nassX->where('id', $request->id);
                    if (strlen($request->trash) > 0) $nassX = $nassX->onlyTrashed();
                    $nassX = $nassX->get();
                    $nass = $nass->merge($nassX);
                }
                $nass = $nass->values();
            } else {
                new SwitchDB();
                $nass = Nas::orderBy('shortname', 'asc');
                if (strlen($request->id) > 0) $nass = $nass->where('id', $request->id);
                if (strlen($request->trash) > 0) $nass = $nass->onlyTrashed();
                if ($this->me != null) {
                    if ($this->me->nasGroups()->get()->count() > 0) {
                        $nass = $nass->whereIn('id', $this->me->nasGroups()->map(function ($q){ return $q->nas; }));
                    }
                }
                $nass = $nass->get();
            }
            if ($nass->count() > 0) {
                foreach ($nass as $nas) {
                    $status = (object) ['message' => null, 'success' => false ];
                    switch ($nas->method) {
                        case 'api' :
                            $this->mikrotikAPI = new MikrotikAPI($nas);
                            $status = $this->mikrotikAPI->testConnection();
                            break;
                        case 'ssl' :
                            $this->mikrotikSSL = new MiktorikSSL($nas);
                            $status = $this->mikrotikSSL->testConnection();
                            break;
                    }
                    $description = $nas->description;
                    if ($description == null) $description = '';
                    $response->push((object) [
                        'value' => $nas->id,
                        'label' => $nas->shortname,
                        'meta' => (object) [
                            'description' => $description,
                            'type' => $nas->type,
                            'community' => $nas->community,
                            'ports' => (object) [
                                'auth' => $nas->auth_port,
                                'acc' => $nas->acc_port,
                            ],
                            'auth' => (object) [
                                'host' => $nas->method_domain,
                                'ip' => $nas->nasname,
                                'port' => $nas->method_port,
                                'method' => $nas->method,
                                'user' => Crypt::encryptString($nas->user),
                                'pass' => Crypt::encryptString($nas->password),
                                'secret' => $nas->secret,
                                'subnet' => $nas->netmask,
                            ],
                            'url' => $nas->expire_url,
                            'status' => $status,
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => $nas->created_at,
                                    'by' => $nas->createdBy,
                                ],
                                'update' => (object) [
                                    'at' => $nas->updated_at,
                                    'by' => $nas->updatedBy,
                                ],
                                'delete' => (object) [
                                    'at' => $nas->deleted_at,
                                    'by' => $nas->deletedBy,
                                ]
                            ]
                        ]
                    ]);
                }
            }
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
            Nas::whereIn('id' , $request->id)->delete();
            Nas::whereIn('id', $request->id)->onlyTrashed()->forceDelete();
            (new Server())->statusServer(env('MIX_RADIUS_SSH_DAEMON'),'restart');
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return string
     * @throws Exception
     */
    public function encryptDecrypt(Request $request): string
    {
        try {
            if ($request->action == 'encrypt') {
                return Crypt::encryptString($request->value);
            } else {
                return  Crypt::decryptString($request->value);
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return Collection|null
     * @throws Exception
     */
    public function interfaceIpAddress(Request $request): ?Collection
    {
        try {
            return (new MikrotikAPI())->interfaceIpAddressRequest($request);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function checkRequirement(Request $request) {
        try {
            $nas = Nas::where('id', $request[__('nas.form_input.id')])->first();
            $response = null;
            $checks = null;
            switch ($request[__('profiles.form_input.type')]) {
                case 'pppoe':
                    switch ($nas->method) {
                        case 'api':
                            $response = (new MikrotikAPI($nas))->checkRequirementPPPoE();
                            break;
                        case 'ssl':
                            break;
                    }
                    break;
                case 'hotspot':
                    switch ($nas->method) {
                        case 'api':
                            $response = (new MikrotikAPI($nas))->checkRequirementHotspot();
                            break;
                        case 'ssl':
                            break;
                    }
                    break;
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
