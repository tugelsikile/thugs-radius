<?php /** @noinspection PhpUnhandledExceptionInspection */
/** @noinspection PhpUndefinedVariableInspection */
/** @noinspection DuplicatedCode */
/** @noinspection SpellCheckingInspection */
/** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories\Client;

use App\Models\Company\AdditionalPackage;
use App\Models\Company\ClientCompany;
use App\Models\Company\CompanyDiscount;
use App\Models\Company\CompanyPackage;
use App\Models\Company\CompanyTax;
use App\Models\Currency;
use App\Models\User\User;
use App\Models\User\UserLevel;
use App\Repositories\Config\DiscountRepository;
use App\Repositories\Config\TaxRepository;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;
use Throwable;

class CompanyRepository
{
    protected $packageRepository;
    protected $discountRepository;
    protected $taxRepository;
    public function __construct()
    {
        $this->packageRepository = new PackageRepository();
        $this->discountRepository = new DiscountRepository();
        $this->taxRepository = new TaxRepository();
    }
    public function activate(Request $request) {
        try {
            $company = ClientCompany::where('id', $request->id)->first();
            if ($company->active_at == null) {
                $company->active_by = auth()->guard('api')->user()->id;
                $company->active_at = Carbon::now()->format('Y-m-d H:i:s');
            } else {
                $company->active_at = null;
                $company->active_by = null;
            }
            $company->saveOrFail();
            return $this->table(new Request(['id' => $company->id]))->first();
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
            $companies = ClientCompany::whereIn('id', $request->id)->get();
            foreach ($companies as $company) {
                Config::set("database.connections.radius.host", $company->radius_db_host);
                Config::set("database.connections.radius.username", config('database.connections.mysql.username'));
                Config::set("database.connections.radius.password", config('database.connections.mysql.password'));
                DB::connection("radius")->unprepared(
                    "DROP USER '$company->radius_db_user'@'%';"
                    . "DROP DATABASE $company->radius_db_name;"
                );
                $company->delete();
            }
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
            $me = auth()->guard('api')->user();
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
            $company->saveOrFail();
            if ($request->has(__('companies.packages.form_input.additional'))) {
                foreach ($request[__('companies.packages.form_input.additional')] as $item) {
                    if (array_key_exists(__('companies.packages.form_input.id'), $item)) {
                        $additional = AdditionalPackage::where('id', $item[__('companies.packages.form_input.id')])->first();
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
                    $additional->qty = $item[__('companies.packages.form_input.qty')];
                    $additional->saveOrFail();
                }
            }
            if ($request->has(__('companies.form_input.taxes.array_input'))) {
                foreach ($request[__('companies.form_input.taxes.array_input')] as $item) {
                    if (array_key_exists(__('companies.form_input.taxes.id'), $item)) {
                        $pajak = CompanyTax::where('id', $item[__('companies.form_input.taxes.id')])->first();
                        $pajak->updated_by = $me->id;
                    } else {
                        $pajak = new CompanyTax();
                        $pajak->id = Uuid::uuid4()->toString();
                        $pajak->company = $company->id;
                        $pajak->created_by = $me->id;
                    }
                    $pajak->tax = $item[__('companies.form_input.taxes.name')];
                    $pajak->saveOrFail();
                }
            }
            if ($request->has(__('companies.form_input.discounts.array_input'))) {
                foreach ($request[__('companies.form_input.discounts.array_input')] as $item) {
                    if (array_key_exists(__('companies.form_input.discounts.id'), $item)) {
                        $diskon = CompanyDiscount::where('id', $item[__('companies.form_input.discounts.id')])->first();
                        $diskon->updated_by = $me->id;
                    } else {
                        $diskon = new CompanyDiscount();
                        $diskon->id = Uuid::uuid4()->toString();
                        $diskon->company = $company->id;
                        $diskon->created_by = $me->id;
                    }
                    $diskon->discount = $item[__('companies.form_input.discounts.name')];
                    $diskon->saveOrFail();
                }
            }
            if ($request->has(__('companies.form_input.taxes.array_delete'))) {
                CompanyTax::whereIn('id', $request[__('companies.form_input.taxes.array_delete')])->delete();
            }
            if ($request->has(__('companies.form_input.discounts.array_delete'))) {
                CompanyDiscount::whereIn('id', $request[__('companies.form_input.discounts.array_delete')])->delete();
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
            $me = auth()->guard('api')->user();
            $company = new ClientCompany();
            $company->id = Uuid::uuid4()->toString();
            $company->package = $request[__('companies.packages.form_input.main_package')];
            $company->code = generateCompanyCode();
            $company->name = $request[__('companies.form_input.name')];
            $company->email = $request[__('companies.form_input.email')];
            $company->address = $request[__('companies.form_input.address')];
            $company->domain = null;
            $company->province = $request[__('regions.province.form_input')];
            $company->city = $request[__('regions.city.form_input')];
            $company->district = $request[__('regions.district.form_input')];
            $company->village = $request[__('regions.village.form_input')];
            $company->postal = $request[__('companies.form_input.postal')];
            $company->phone = $request[__('companies.form_input.phone')];
            $company->currency = Currency::orderBy('code', 'asc')->first()->id;
            $company->radius_db_host = config('database.connections.radius.host');
            $company->radius_db_name = 'radius_' . Str::slug($company->name,'_');
            $company->radius_db_user = Str::slug($company->name,'_');
            $company->radius_db_pass = Str::random(8) . '-_';
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
                    $additional->qty = $item[__('companies.packages.form_input.qty')];
                    $additional->otp = $item[__('companies.packages.form_input.otp')] == 1;
                    $additional->saveOrFail();
                }
            }
            if ($request->has(__('companies.form_input.taxes.array_input'))) {
                foreach ($request[__('companies.form_input.taxes.array_input')] as $item) {
                    $pajak = new CompanyTax();
                    $pajak->id = Uuid::uuid4()->toString();
                    $pajak->company = $company->id;
                    $pajak->tax = $item[__('companies.form_input.taxes.name')];
                    $pajak->created_by = $me->id;
                    $pajak->saveOrFail();
                }
            }
            if ($request->has(__('companies.form_input.discounts.array_input'))) {
                foreach ($request[__('companies.form_input.discounts.array_input')] as $item) {
                    $diskon = new CompanyDiscount();
                    $diskon->id = Uuid::uuid4()->toString();
                    $diskon->company = $company->id;
                    $diskon->discount = $item[__('companies.form_input.discounts.name')];
                    $diskon->created_by = $me->id;
                    $diskon->saveOrFail();
                }
            }
            $levelUser = UserLevel::where('name', 'Admin')->first();
            if ($levelUser != null) {
                $user = new User();
                $user->id = Uuid::uuid4()->toString();
                $user->level = $levelUser->id;
                $user->company = $company->id;
                $user->name = $company->name;
                $user->email = $company->email;
                $user->password = Hash::make($user->email);
                $user->locale = (object) [ 'lang' => 'id', 'date_format' => 'DD/MM/yyyy HH:mm:ss', 'time_zone' => 'Asia/Jakarta' ];
                $user->saveOrFail();
            }
            $this->generateDatabase($company);
            return $this->table(new Request(['id' => $company->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param ClientCompany $clientCompany
     * @return void
     * @throws Exception
     */
    private function generateDatabase(ClientCompany $clientCompany): void
    {
        try {
            /*$configs = [
                'host' => $clientCompany->radius_db_host,
                'port' => config('database.connections.radius.port'),
                'database' => $clientCompany->radius_db_name,
                'username' => $clientCompany->radius_db_user,
                'password' => $clientCompany->radius_db_pass,
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
            ];*/
            Config::set("database.connections.radius.host", env('DB_RADIUS_HOST'));
            Config::set("database.connections.radius.port", env('DB_RADIUS_PORT'));
            Config::set("database.connections.radius.username", env('DB_RADIUS_USERNAME'));
            Config::set("database.connections.radius.password", env('DB_RADIUS_PASSWORD'));

            $newDB = DB::connection("radius")->unprepared(
                "CREATE DATABASE {$clientCompany->radius_db_name};"
                . "CREATE USER '$clientCompany->radius_db_user'@'%' IDENTIFIED BY '$clientCompany->radius_db_pass';"
                . "GRANT ALL PRIVILEGES ON $clientCompany->radius_db_name.*  TO '$clientCompany->radius_db_user'@'%' WITH GRANT OPTION;"
                . "GRANT ALL PRIVILEGES ON ".config('database.connections.mysql.database').".*  TO '$clientCompany->radius_db_user'@'%' WITH GRANT OPTION;"
                . "GRANT ALL PRIVILEGES ON *.*  TO '".config('database.connections.mysql.username')."'@'%' WITH GRANT OPTION;"
                . "FLUSH PRIVILEGES;"
            );
            //. "GRANT ALL PRIVILEGES ON $clientCompany->radius_db_name.*  TO '$clientCompany->radius_db_user'@'%' WITH GRANT OPTION;";
            DB::purge('radius');

            if ($newDB) {
                Config::set("database.connections.radius", [
                    'charset' => 'utf8mb4',
                    'collation' => 'utf8mb4_unicode_ci',
                    'driver' => 'mysql',
                    'host' => $clientCompany->radius_db_host,
                    'port' => env('DB_RADIUS_PORT'),
                    'database' => $clientCompany->radius_db_name,
                    'username' => $clientCompany->radius_db_user,
                    'password' => $clientCompany->radius_db_pass
                ]);
                Artisan::call('migrate', [
                    '--database' => 'radius',
                    '--path' => 'database/migrations/radius'
                ]);
                DB::purge('radius');
                return;
            }
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
                                'phone' => $company->phone == null ? '' : $company->phone,
                                'domain' => $company->domain,
                                'street' => $company->address == null ? '' : $company->address,
                                'province' => $company->provinceObj,
                                'city' => $company->cityObj,
                                'district' => $company->districtObj,
                                'village' => $company->villageObj,
                                'postal' => $company->postal == null ? '' : $company->postal
                            ],
                            'discounts' => $this->companyDiscounts($company),
                            'taxes' => $this->companyTaxes($company),
                            'expiry' => $company->expired_at == null ? null : Carbon::parse($company->expired_at)->format('Y-m-d H:i:s'),
                            'packages' => $this->companyPackages($company),
                            'timestamps' => (object) [
                                'active' => (object) [
                                    'at' => $company->active_at == null ? null : Carbon::parse($company->active_at)->format('Y-m-d H:i:s'),
                                    'by' => $company->activeBy,
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
    private function companyTaxes(ClientCompany $company) {
        try {
            $response = collect();
            $taxes = CompanyTax::orderBy('created_at', 'asc')->where('company', $company->id)->get();
            if ($taxes->count() > 0) {
                foreach ($taxes as $tax) {
                    $response->push((object) [
                        'value' => $tax->id,
                        'meta' => (object) [
                            'tax' => $this->taxRepository->table(new Request(['id' => $tax->tax]))->first(),
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => $tax->created_at,
                                    'by' => $tax->createdBy,
                                ],
                                'update' => (object) [
                                    'at' => $tax->updated_at,
                                    'by' => $tax->updatedBy,
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
     * @param ClientCompany $company
     * @return Collection
     * @throws Exception
     */
    private function companyDiscounts(ClientCompany $company): Collection
    {
        try {
            $response = collect();
            $discounts = CompanyDiscount::where('company', $company->id)->orderBy('created_at', 'asc')->get();
            foreach ($discounts as $discount) {
                $response->push((object) [
                    'value' => $discount->id,
                    'meta' => (object) [
                        'discount' => $this->discountRepository->table(new Request(['id' => $discount->discount]))->first(),
                        'timestamps' => (object) [
                            'create' => (object) [
                                'at' => $discount->created_at,
                                'by' => $discount->createdBy,
                            ],
                            'update' => (object) [
                                'at' => $discount->updated_at,
                                'by' => $discount->updatedBy
                            ]
                        ]
                    ]
                ]);
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
                'additional' => false,
                'value' => $company->package,
                'meta' => (object) [
                    'qty' => 1,
                    'package' => $this->packageRepository->table(new Request(['id' => $company->package]))->first(),
                    'duration' => (object) [
                        'type' => 'months',
                        'amount' => 1,
                        'duration' => 0,
                        'otp' => false,
                    ]
                ],
            ]);
            $additionals = AdditionalPackage::where('company', $company->id)->get();
            if ($additionals->count() > 0) {
                foreach ($additionals as $additional) {
                    $response->push((object)[
                        'additional' => true,
                        'value' => $additional->id,
                        'meta' => (object) [
                            'qty' => $additional->qty,
                            'package' => $this->packageRepository->table(new Request(['id' => $additional->package]))->first(),
                            'duration' => (object) [
                                'type' => $additional->paid_every_type,
                                'ammount' => $additional->paid_every_ammount,
                                'duration' => $additional->paid_duration,
                                'otp' => $additional->otp,
                            ]
                        ],
                    ]);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
