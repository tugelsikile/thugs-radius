<?php

namespace App\Repositories\Client;

use App\Models\Company\ClientCompany;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;

class CompanyRepository
{
    public function table(Request $request) {
        try {
            $user = auth()->guard('api')->user();
            $response = collect();
            $companies = ClientCompany::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $companies = $companies->where('id', $request->id);
            if ($user != null) {
                if (strlen($user->company) > 0) $companies = $companies->where('id', $user->company);
            }
            $companies = $companies->get();
            if ($companies->count() > 0) {
                foreach ($companies as $company) {
                    $response->push((object) [
                        'value' => $company->id,
                        'label' => $company->name,
                        'meta' => (object) [
                            'code' => $company->code,
                            'address' => (object) [
                                'email' => $company->email,
                                'phone' => $company->phone,
                                'domain' => $company->domain,
                                'street' => $company->address,
                                'province' => $company->provinceObj,
                                'city' => $company->cityObj,
                                'district' => $company->districtObj,
                                'village' => $company->villageObj,
                                'postal' => $company->postal
                            ],
                            'expiry' => $company->expired_at == null ? null : Carbon::parse($company->expired_at)->format('Y-m-d H:i:s'),
                            'package' => $company->package,
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
