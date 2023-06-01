<?php /** @noinspection PhpUnhandledExceptionInspection */
/** @noinspection PhpUndefinedVariableInspection */
/** @noinspection DuplicatedCode */
/** @noinspection SpellCheckingInspection */
/** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories\Client;

use App\Models\Company\AdditionalPackage;
use App\Models\Company\ClientCompany;
use App\Models\Company\CompanyPackage;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;
use Throwable;

class CompanyRepository
{
    protected $packageRepository;
    public function __construct()
    {
        $this->packageRepository = new PackageRepository();
    }
    public function delete(Request $request) {
        try {
            ClientCompany::whereIn('id', $request->id)->delete();
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return mixed
     * @throws Throwable
     */
    public function update(Request $request) {
        try {
            $company = ClientCompany::where('id', $request->id)->first();
            $company->package = $request[__('companies.packages.form_input.main_package')];
            $company->name = $request[__('companies.form_input.name')];
            $company->email = $request[__('companies.form_input.email')];
            $company->address = $request[__('companies.form_input.address')];
            $company->province = $request[__('regions.province.form_input')];
            $company->city = $request[__('regions.city.form_input')];
            $company->district = $request[__('regions.district.form_input')];
            $company->village = $request[__('regions.village.form_input')];
            $company->postal = $request[__('companies.form_input.postal')];
            $company->phone = $request[__('companies.form_input.phone')];
            $company->discount = $request[__('companies.packages.form_input.discount')];
            $company->saveOrFail();
            if ($request->has(__('companies.packages.form_input.additional'))) {
                foreach ($request[__('companies.packages.form_input.additional')] as $item) {
                    if (array_key_exists('id', $item)) {
                        $additional = AdditionalPackage::where('id', $item['id'])->first();
                    } else {
                        $additional = new AdditionalPackage();
                        $additional->id = Uuid::uuid4()->toString();
                        $additional->company = $company->id;
                    }
                    if (array_key_exists(__('companies.packages.form_input.name'), $item)) {
                        $additional->package = $item[__('companies.packages.form_input.name')];
                        $package = CompanyPackage::where('id', $additional->package)->first();
                        if ($package != null) {
                            $additional->paid_every_type = $package->duration_string;
                            $additional->paid_every_ammount = $package->duration_ammount;
                        }
                    }
                    $additional->otp = $item[__('companies.packages.form_input.otp')] == 1;
                    $additional->saveOrFail();
                }
            }

            if ($request->has(__('companies.packages.form_input.additional_deleted'))) {
                AdditionalPackage::whereIn('id', $request[__('companies.packages.form_input.additional_deleted')])->delete();
            }
            return $this->table(new Request(['id' => $company->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws Throwable
     */
    public function create(Request $request) {
        try {
            $company = new ClientCompany();
            $company->id = Uuid::uuid4()->toString();
            $company->package = $request[__('companies.packages.form_input.main_package')];
            $company->code = generateCompanyCode();
            $company->name = $request[__('companies.form_input.name')];
            $company->email = $request[__('companies.form_input.email')];
            $company->address = $request[__('companies.form_input.address')];
            $company->domain = substr($request->root(),7);
            $company->province = $request[__('regions.province.form_input')];
            $company->city = $request[__('regions.city.form_input')];
            $company->district = $request[__('regions.district.form_input')];
            $company->village = $request[__('regions.village.form_input')];
            $company->postal = $request[__('companies.form_input.postal')];
            $company->phone = $request[__('companies.form_input.phone')];
            $company->discount = $request[__('companies.packages.form_input.discount')];
            $company->saveOrFail();
            if ($request->has(__('companies.packages.form_input.additional'))) {
                foreach ($request[__('companies.packages.form_input.additional')] as $item) {
                    $additional = new AdditionalPackage();
                    $additional->id = Uuid::uuid4()->toString();
                    $additional->company = $company->id;
                    if (array_key_exists(__('companies.packages.form_input.name'), $item)) {
                        $additional->package = $item[__('companies.packages.form_input.name')];
                        $package = CompanyPackage::where('id', $additional->package)->first();
                        if ($package != null) {
                            $additional->paid_every_type = $package->duration_string;
                            $additional->paid_every_ammount = $package->duration_ammount;
                        }
                    }

                    $additional->otp = $item[__('companies.packages.form_input.otp')] == 1;
                    $additional->saveOrFail();
                }
            }
            return $this->table(new Request(['id' => $company->id]))->first();
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
                            'discount' => $company->discount,
                            'expiry' => $company->expired_at == null ? null : Carbon::parse($company->expired_at)->format('Y-m-d H:i:s'),
                            'packages' => $this->companyPackages($company),
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
     * @param ClientCompany $company
     * @return Collection
     * @throws Exception
     */
    public function companyPackages(ClientCompany $company): Collection
    {
        try {
            $response = collect();
            $response->push((object) [
                'additional' => false, 'value' => $company->package,
                'package' => $this->packageRepository->table(new Request(['id' => $company->package]))->first(),
                'every' => (object) [
                    'type' => 'months',
                    'ammount' => 1,
                    'duration' => 0,
                    'otp' => false,
                ]
            ]);
            $additionals = AdditionalPackage::where('company', $company->id)->get();
            if ($additionals->count() > 0) {
                foreach ($additionals as $additional) {
                    $response->push((object)[
                        'additional' => true, 'value' => $additional->id,
                        'package' => $this->packageRepository->table(new Request(['id' => $additional->package]))->first(),
                        'every' => (object) [
                            'type' => $additional->paid_every_type,
                            'ammount' => $additional->paid_every_ammount,
                            'duration' => $additional->paid_duration,
                            'otp' => $additional->otp,
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
