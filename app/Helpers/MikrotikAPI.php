<?php /** @noinspection PhpUnhandledExceptionInspection */

namespace App\Helpers;

use App\Models\Nas\Nas;
use Exception;
use Illuminate\Http\Request;
use RouterOS\Client;
use RouterOS\Query;

class MikrotikAPI
{
    protected $query;
    protected $client;
    public function __construct(Nas $nas = null)
    {
        if ($nas != null) {
            $hostname = $nas->nasname . ':' . $nas->method_port;
            try {
                $this->client = new Client([
                    "host" => $hostname, "user" => $nas->user, "pass" => $nas->password, "timeout" => 1, "attempts" => 1
                ]);
            } catch (Exception $exception) {

            }
        }
        $this->query = '';
    }
    public function testConnection(Request $request = null) {
        try {
            $response = (object) ['message' => '', 'success' => false];
            if ($request != null) {
                $hostname = $request[__('nas.form_input.ip')] . ':' . $request[__('nas.form_input.port')];
                $this->client = new Client([
                    "host" => $hostname, "user" => $request[__('nas.form_input.user')], "pass" => $request[__('nas.form_input.pass')], "timeout" => 1, "attempts" => 1
                ]);
            }
            if ($this->client != null) {
                if ($this->client->connect()) {
                    $this->query = (new Query('/system/identity/print'));
                    try {
                        $res = collect($this->client->query($this->query)->read());
                        if ($res->count() > 0) {
                            $res = $res->first();
                            $response->message = $res['name'];
                            $response->success = true;
                        }
                    } catch (Exception $exception) {
                        return $response;
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            return (object) ['message' => $exception->getMessage(), 'success' => false];
        }
    }
}
