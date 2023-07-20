<?php

namespace App\Repositories\Backup;

use App\Helpers\RST\RST;
use App\Helpers\SwitchDB;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;

class BackupRepository
{
    public function branch(Request $request) {
        try {
            $response = collect();
            $branches = (new RST($request))->branches();
            if ($branches->count() > 0) {
                foreach ($branches as $branch) {
                    $response->push((object) [
                        'value' => $branch->id,
                        'label' => $branch->name,
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
     * @return object
     * @throws GuzzleException
     */
    public function readRSTData(Request $request): object
    {
        try {
            $response = (object) ['data' => collect()];
            if ($request->has('type')) {
                if (in_array($request->type,['nas','bandwidths','pools','profiles','packages','customers','invoices','payments'])) {
                    $rst = (new RST($request));
                    //$branches = $rst->branches();
                    $nas = $rst->nas($request);
                    switch ($request->type) {
                        default:
                        case 'nas':
                            $response->data = $nas;
                        break;
                        case 'bandwidths':
                            $response->data = $rst->bandwidths($nas);
                            break;
                        case 'pools':
                            new SwitchDB();
                            $response->data = $rst->pools($nas);
                            break;
                        case 'profiles':
                            $response->data = $rst->profiles($nas);
                            break;
                        case 'packages':
                            $response->data = $rst->packages($nas);
                            break;
                        case 'customers':
                            $response->data = $rst->customers($nas);
                            break;
                        case 'invoices':
                            new SwitchDB();
                            $response->data = $rst->invoices($rst->customers($nas,true));
                            break;
                        case 'payments':
                            new SwitchDB();
                            $response->data = $rst->payments($rst->invoices($rst->customers($nas,true),true));
                            break;
                        case 'vouchers':
                            $response->data = $rst->vouchers($nas);
                            break;
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
