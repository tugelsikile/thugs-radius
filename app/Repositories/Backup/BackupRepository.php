<?php

namespace App\Repositories\Backup;

use App\Helpers\RST\RST;
use App\Helpers\SwitchDB;
use Exception;
use Illuminate\Http\Request;

class BackupRepository
{
    /* @
     * @param Request $request
     * @return object
     * @throws Exception
     */
    public function readRSTData(Request $request): object
    {
        try {
            $rst = (new RST($request));
            $branches = $rst->branches();
            $nas = $rst->nas($branches);
            $bandwidths = $rst->bandwidths($nas);
            $profiles = $rst->profiles($nas);
            $packages = $rst->packages($nas);
            $customers = $rst->customers($nas);
            new SwitchDB();
            $pools = $rst->pools($nas);
            $invoices = $rst->invoices($branches);
            $payments = $rst->payments($branches);
            $response = collect();
            //$response->push(['value' => 'branches', 'data' => $branches ]);
            $response->push(['value' => 'nas', 'data' => $nas ]);
            $response->push(['value' => 'bandwidths', 'data' => $bandwidths ]);
            $response->push(['value' => 'pools', 'data' => $pools ]);
            $response->push(['value' => 'profiles', 'data' => $profiles ]);
            $response->push(['value' => 'packages', 'data' => $packages ]);
            $response->push(['value' => 'customers', 'data' => $customers ]);
            $response->push(['value' => 'invoices', 'data' => $invoices ]);
            $response->push(['value' => 'payments', 'data' => $payments ]);
            return $response;
            /*return (object) [
                'branches' => $branches,
                'nas' => $nas,
                'profiles' => $profiles,
            ];*/
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
