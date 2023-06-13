<?php /** @noinspection PhpMultipleClassDeclarationsInspection */
/** @noinspection DuplicatedCode */
/** @noinspection PhpDocRedundantThrowsInspection */
/** @noinspection PhpUndefinedMethodInspection */
/** @noinspection SpellCheckingInspection */

/** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories\Nas;

use App\Helpers\MikrotikAPI;
use App\Helpers\MiktorikSSL;
use App\Helpers\SwitchDB;
use App\Models\Nas\Nas;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Ramsey\Uuid\Uuid;
use RouterOS\Client;
use RouterOS\Query;
use Throwable;

class NasRepository
{
    protected $mikrotikAPI;
    protected $mikrotikSSL;
    public function __construct()
    {
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
            }
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
            $nas->id = Uuid::uuid4()->toString();
            $nas->shortname = $request[__('nas.form_input.name')];
            $nas->description = $request[__('nas.form_input.description')];
            $nas->type = 'other';
            $nas->secret = 'asd';
            $nas->community = "default";
            $nas->method = $request[__('nas.form_input.method')];
            $nas->nasname = $request[__('nas.form_input.ip')];
            if ($nas->method == 'api') {
            } else {
                $nas->method_domain = $request[__('nas.form_input.domain')];
            }
            $nas->method_port = $request[__('nas.form_input.port')];
            $nas->user = $request[__('nas.form_input.user')];
            $nas->password = $request[__('nas.form_input.pass')];
            $nas->created_by = $me->id;
            $nas->saveOrFail();
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
            $me = auth()->guard('api')->user();
            $nas = Nas::where('id', $request[__('nas.form_input.id')])->first();
            $nas->shortname = $request[__('nas.form_input.name')];
            $nas->description = $request[__('nas.form_input.description')];
            $nas->method = $request[__('nas.form_input.method')];
            $nas->nasname = $request[__('nas.form_input.ip')];
            if ($nas->method == 'ssl') {
                $nas->method_domain = $request[__('nas.form_input.domain')];
            } else {
                $nas->method_domain = null;
            }
            $nas->method_port = $request[__('nas.form_input.port')];
            $nas->user = $request[__('nas.form_input.user')];
            $nas->password = $request[__('nas.form_input.pass')];
            $nas->updated_by = $me->id;
            $nas->saveOrFail();
            return $this->table(new Request(['id' => $nas->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function testConnection(Request $request) {
        try {
            switch ($request[__('nas.form_input.method')]) {
                case 'api' :
                    $api = new MikrotikAPI();
                    $r = $api->testConnection($request);
                    if ($r != null) {
                        return __('nas.labels.connection.success') . $r->message;
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
            new SwitchDB();
            $nass = Nas::orderBy('shortname', 'asc');
            if (strlen($request->id) > 0) $nass = $nass->where('id', $request->id);
            if (strlen($request->trash) > 0) $nass = $nass->onlyTrashed();
            /*if ($me != null) {
                if ($me->company != null) $nass = $nass->where('company', $me->company);
            }*/
            $nass = $nass->get();
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
                    $response->push((object) [
                        'value' => $nas->id,
                        'label' => $nas->shortname,
                        'meta' => (object) [
                            'description' => $nas->description == null ? '' : $nas->description,
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
                            ],
                            'url' => $nas->expire_url,
                            'status' => $status,
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => $nas->created_at,
                                    'by' => $nas->createdBy == null ? null : (object) [ 'value' => $nas->createdBy->id, 'label' => $nas->createdBy->name ],
                                ],
                                'update' => (object) [
                                    'at' => $nas->updated_at,
                                    'by' => $nas->updatedBy == null ? null : (object) [ 'value' => $nas->updatedBy->id, 'label' => $nas->updatedBy->name ],
                                ],
                                'delete' => (object) [
                                    'at' => $nas->deleted_at,
                                    'by' => $nas->deletedBy == null ? null : (object) [ 'value' => $nas->deletedBy->id, 'label' => $nas->deletedBy->name ]
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
}
