<?php

namespace App\Repositories\Backup;

use App\Helpers\RST\RST;
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
            $profiles = $rst->profiles($nas);
            $packages = $rst->packages($branches);
            $customers = $rst->customers($branches);
            $invoices = $rst->invoices($branches);
            $response = collect();
            $response->push(['value' => 'branches', 'data' => $branches ]);
            $response->push(['value' => 'nas', 'data' => $nas ]);
            $response->push(['value' => 'profiles', 'data' => $profiles ]);
            $response->push(['value' => 'packages', 'data' => $packages ]);
            $response->push(['value' => 'customers', 'data' => $customers ]);
            $response->push(['value' => 'invoices', 'data' => $invoices ]);
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
