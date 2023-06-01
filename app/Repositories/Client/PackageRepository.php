<?php

namespace App\Repositories\Client;

use App\Models\Company\CompanyPackage;
use Exception;
use Illuminate\Http\Request;

class PackageRepository
{
    public function table(Request $request) {
        try {
            $response = collect();
            $packages = CompanyPackage::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $packages = $packages->where('id', $request->id);
            $packages = $packages->get();
            if ($packages->count() > 0) {
                foreach ($packages as $package) {
                    $response->push((object) [
                        'value' => $package->id,
                        'label' => $package->name,
                        'meta' => (object) [
                            'code' => $package->code,
                            'description' => $package->description,
                            'prices' => (object) [
                                'base' => $package->base_price,
                                'percent' => $package->vat_percent
                            ],
                            'duration' => (object) [
                                'string' => $package->duration_string,
                                'ammount' => $package->duration_ammount,
                            ],
                            'max' => (object) [
                                'users' => $package->max_users,
                                'customers' => $package->max_customers,
                                'vouchers' => $package->max_vouchers,
                                'routers' => $package->max_routerboards,
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
}
