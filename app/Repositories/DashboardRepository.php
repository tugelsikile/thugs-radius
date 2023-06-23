<?php /** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories;

use App\Helpers\MikrotikAPI;
use App\Helpers\MiktorikSSL;
use App\Helpers\Server\Server;
use App\Helpers\SwitchDB;
use App\Models\Nas\Nas;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;


class DashboardRepository
{
    protected $me;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
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
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
