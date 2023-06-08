<?php /** @noinspection PhpMultipleClassDeclarationsInspection */
/** @noinspection DuplicatedCode */
/** @noinspection PhpDocRedundantThrowsInspection */
/** @noinspection PhpUndefinedMethodInspection */
/** @noinspection SpellCheckingInspection */

/** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories\Nas;

use App\Models\Nas\Nas;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Crypt;
use Ramsey\Uuid\Uuid;
use RouterOS\Client;
use RouterOS\Query;
use Throwable;

class NasRepository
{
    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function parentQueue(Request $request): Collection
    {
        try {
            $response = collect();
            $nas = Nas::where('id', $request[__('nas.form_input.name')])->first();
            if ($nas != null) {
                switch (strtolower($nas->method)) {
                    case 'api' :
                        $queues = getParentQueue($nas);
                        break;
                    case 'ssl' :
                        $queues = parentQueueSSL($nas);
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
            $this->testConnection($request);
            $me = auth()->guard('api')->user();
            $nas = new Nas();
            $nas->id = Uuid::uuid4()->toString();
            if ($request->has(__('companies.form_input.name'))) {
                $nas->company = $request[__('companies.form_input.name')];
            }
            $nas->name = $request[__('nas.form_input.name')];
            $nas->description = $request[__('nas.form_input.description')];
            $nas->type = 'other';
            $nas->community = "default";
            $nas->method = $request[__('nas.form_input.method')];
            if ($nas->method == 'api') {
                $nas->hostname = $request[__('nas.form_input.ip')];
            } else {
                $nas->hostname = $request[__('nas.form_input.domain')];
            }
            $nas->port = $request[__('nas.form_input.port')];
            $nas->user = $request[__('nas.form_input.user')];
            $nas->password = $request[__('nas.form_input.pass')];
            $nas->salt_hash = Uuid::uuid4()->toString();
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
            $this->testConnection($request);
            $me = auth()->guard('api')->user();
            $nas = Nas::where('id', $request[__('nas.form_input.id')])->first();
            if ($request->has(__('companies.form_input.name'))) {
                $nas->company = $request[__('companies.form_input.name')];
            }
            $nas->name = $request[__('nas.form_input.name')];
            $nas->description = $request[__('nas.form_input.description')];
            $nas->method = $request[__('nas.form_input.method')];
            if ($nas->method == 'api') {
                $nas->hostname = $request[__('nas.form_input.ip')];
            } else {
                $nas->hostname = $request[__('nas.form_input.domain')];
            }
            $nas->port = $request[__('nas.form_input.port')];
            $nas->user = $request[__('nas.form_input.user')];
            $nas->password = $request[__('nas.form_input.pass')];
            $nas->updated_by = $me->id;
            $nas->saveOrFail();
            return $this->table(new Request(['id' => $nas->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return string|void
     * @throws GuzzleException
     * @throws Exception
     */
    public function testConnectionSSL(Request $request) {
        try {
            $client = new \GuzzleHttp\Client();
            $hostname = $request[__('nas.form_input.domain')];
            if ($request->has(__('nas.form_input.port'))) {
                if ($request[__('nas.form_input.port')] != 443) $hostname .= ":" . $request[__('nas.form_input.port')];
            }
            $url = $hostname . "/rest/system/identity";
            try {
                $res = $client->request('get', $url, [
                    'auth' => [$request[__('nas.form_input.user')], $request[__('nas.form_input.pass')] ]
                ]);
                $response = json_decode($res->getBody()->getContents());
                if (isset($response->name)) return __('nas.labels.connection.success') . $response->name;
            } catch (GuzzleException $exception) {
                throw new Exception($exception->getMessage(),500);
            }
        } catch (Exception $exception ) {
            return null;
            //throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return string|null
     * @throws Exception
     */
    private function testConnectionAPI(Request $request): ?string
    {
        try {
            $hostname = $request[__('nas.form_input.ip')];
            if ($request->has(__('nas.form_input.port'))) {
                $hostname .= ":" . $request[__('nas.form_input.port')];
            }
            $routerOsClient = new Client([
                "host" => $hostname, "user" => $request[__('nas.form_input.user')], "pass" => $request[__('nas.form_input.pass')], "timeout" => 1, "attempts" => 1
            ]);
            if (! $routerOsClient->connect()) throw new Exception(__('nas.labels.connection.failed'),400);
            $query = (new Query("/system/identity/print"));
            return __('nas.labels.connection.success') . collect($routerOsClient->query($query)->read())->first()['name'];
        } catch (Exception $exception) {
            return null;
            //throw new Exception($exception->getMessage(),500);
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
            $response = null;
            switch ($request[__('nas.form_input.method')]) {
                default :
                case 'api' :
                    $response = $this->testConnectionAPI($request);
                    break;
                case 'ssl' :
                    $response = $this->testConnectionSSL($request);
                    break;
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
    public function table(Request $request): Collection
    {
        try {
            $response = collect();
            $me = auth()->guard('api')->user();
            $nass = Nas::orderBy('name', 'asc');
            if (strlen($request->id) > 0) $nass = $nass->where('id', $request->id);
            if (strlen($request->trash) > 0) $nass = $nass->onlyTrashed();
            if ($me != null) {
                if ($me->company != null) $nass = $nass->where('company', $me->company);
            }
            $nass = $nass->get();
            if ($nass->count() > 0) {
                foreach ($nass as $nas) {
                    $response->push((object) [
                        'value' => $nas->id,
                        'label' => $nas->name,
                        'meta' => (object) [
                            'company' => $nas->companyObj,
                            'description' => $nas->description == null ? '' : $nas->description,
                            'type' => $nas->type,
                            'community' => $nas->community,
                            'ports' => (object) [
                                'auth' => $nas->auth_port,
                                'acc' => $nas->acc_port,
                            ],
                            'auth' => (object) [
                                'host' => $nas->hostname,
                                'port' => $nas->port,
                                'method' => $nas->method,
                                'user' => Crypt::encryptString($nas->user),
                                'pass' => Crypt::encryptString($nas->password),
                            ],
                            'url' => $nas->expire_url,
                            'status' => testConnection($nas),
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
