<?php /** @noinspection DuplicatedCode */
/** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories;

use App\Models\Config;
use App\Models\Currency;
use App\Models\Discount;
use App\Models\Tax;
use App\Models\User\User;
use App\Repositories\Client\CompanyRepository;
use Carbon\Carbon;
use DateTimeZone;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;
use Ramsey\Uuid\Uuid;
use Throwable;

class ConfigRepository
{
    protected $companyRepository;
    public function __construct()
    {
        $this->companyRepository = new CompanyRepository();
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function updateDiscount(Request $request) {
        try {
            $me = auth()->guard('api')->user();
            $discount = Discount::where('id', $request[__('discounts.form_input.id')])->first();
            if ($request->has(__('companies.form_input.name'))) {
                $discount->company = $request[__('companies.form_input.name')];
            } else {
                $discount->company = null;
            }
            $discount->code = $request[__('discounts.form_input.code')];
            $discount->name = $request[__('discounts.form_input.name')];
            $discount->amount = $request[__('discounts.form_input.amount')];
            $discount->updated_by = $me->id;
            $discount->saveOrFail();

            return $this->discounts(new Request(['id' => $discount->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws Throwable
     */
    public function createDiscount(Request $request) {
        try {
            $me = auth()->guard('api')->user();
            $discount = new Discount();
            $discount->id = Uuid::uuid4()->toString();
            if ($request->has(__('companies.form_input.name'))) {
                $discount->company = $request[__('companies.form_input.name')];
            } else {
                $discount->company = null;
            }
            $discount->code = $request[__('discounts.form_input.code')];
            $discount->name = $request[__('discounts.form_input.name')];
            $discount->amount = $request[__('discounts.form_input.amount')];
            $discount->created_by = $me->id;
            $discount->saveOrFail();

            return $this->discounts(new Request(['id' => $discount->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return bool
     * @throws Exception
     */
    public function deleteDiscount(Request $request): bool
    {
        try {
            Discount::whereIn('id', $request->id)->delete();
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function discounts(Request $request): Collection
    {
        try {
            $me = auth()->guard('api')->user();
            $response = collect();
            $discounts = Discount::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $discounts = $discounts->where('id', $request->id);
            if ($me != null) {
                if ($me->company != null) $discounts = $discounts->where('company', $me->company);
            }
            $discounts = $discounts->get();
            if ($discounts->count() > 0) {
                foreach ($discounts as $discount) {
                    $response->push((object) [
                        'value' => $discount->id,
                        'label' => $discount->name,
                        'meta' => (object) [
                            'code' => $discount->code,
                            'description' => $discount->description,
                            'amount' => $discount->amount,
                            'company' => $this->companyRepository->table(new Request(['id' => $discount->company]))->first(),
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => Carbon::parse($discount->created_at)->format('Y-m-d H:i:s'),
                                    'by' => $discount->createdBy,
                                ],
                                'update' => (object) [
                                    'at' => Carbon::parse($discount->updated_at)->format('Y-m-d H:i:s'),
                                    'by' => $discount->updatedBy,
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
    public function deleteTax(Request $request): bool
    {
        try {
            Tax::whereIn('id', $request->id)->delete();
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function updateTax(Request $request) {
        try {
            $tax = Tax::where('id', $request[__('taxes.form_input.id')])->first();
            if ($request->has(__('companies.form_input.name'))) {
                $tax->company = $request[__('companies.form_input.name')];
            } else {
                $tax->company = null;
            }
            $tax->code = $request[__('taxes.form_input.code')];
            $tax->name = $request[__('taxes.form_input.name')];
            $tax->description = $request[__('taxes.form_input.description')];
            $tax->percent = $request[__('taxes.form_input.percent')];
            $tax->updated_by = auth()->guard('api')->user()->id;
            $tax->saveOrFail();

            return $this->taxes(new Request(['id' => $tax->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return mixed
     * @throws Throwable
     */
    public function createTax(Request $request) {
        try {
            $tax = new Tax();
            $tax->id = Uuid::uuid4()->toString();
            if ($request->has(__('companies.form_input.name'))) {
                $tax->company = $request[__('companies.form_input.name')];
            }
            $tax->code = $request[__('taxes.form_input.code')];
            $tax->name = $request[__('taxes.form_input.name')];
            $tax->description = $request[__('taxes.form_input.description')];
            $tax->percent = $request[__('taxes.form_input.percent')];
            $tax->created_by = auth()->guard('api')->user()->id;
            $tax->saveOrFail();

            return $this->taxes(new Request(['id' => $tax->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function taxes(Request $request): Collection
    {
        try {
            $me = auth()->guard('api')->user();
            $response = collect();
            $taxes = Tax::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $taxes = $taxes->where('id', $request->id);
            if ($me != null) {
                if ($me->company != null) $taxes = $taxes->orWhere('company', $me->company);
            }
            $taxes = $taxes->get();
            if ($taxes->count() > 0) {
                foreach ($taxes as $tax) {
                    $response->push((object) [
                        'value' => $tax->id,
                        'label' => $tax->name,
                        'meta' => (object) [
                            'code' => $tax->code,
                            'description' => $tax->description,
                            'percent' => $tax->percent,
                            'company' => $tax->company == null ? null : $this->companyRepository->table(new Request(['id' => $tax->company]))->first(),
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => Carbon::parse($tax->created_at)->format('Y-m-d H:i:s'),
                                    'by' => $tax->createdBy
                                ],
                                'update' => (object) [
                                    'at' => Carbon::parse($tax->updated_at)->format('Y-m-d H:i:s'),
                                    'by' => $tax->updatedBy
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
     * @return Collection
     * @throws Exception
     */
    public function currencies(Request $request): Collection
    {
        try {
            $response = collect();
            $currencies = Currency::orderBy('code', 'asc');
            if (strlen($request->id) > 0) $currencies = $currencies->where('id', $request->id);
            $currencies = $currencies->get();
            if ($currencies->count() > 0) {
                foreach ($currencies as $currency) {
                    $response->push((object) [
                        'value' => $currency->id,
                        'label' => $currency->name,
                        'meta' => (object) [
                            'code' => $currency->code,
                            'symbol' => $currency->symbols,
                            'rate' => $currency->exchange_rate,
                            'prefix' => $currency->prefix,
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
     * @return mixed
     * @throws Exception
     */
    public function updateTimezone(Request $request) {
        try {
            $user = User::where('id', auth()->guard('api')->user()->id)->first();
            $locale = $user->locale;
            $locale->time_zone = $request[__('timezones.form_input.name')];
            $user->locale = $locale;
            $user->saveOrFail();
            return $request[__('timezones.form_input.name')];
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @return Collection
     * @throws Exception
     */
    public function timezone(): Collection
    {
        try {
            $response = collect();
            $timezone_identifiers = DateTimeZone::listIdentifiers();
            foreach ($timezone_identifiers as $timezone_identifier) {
                $response->push((object) [
                    'value' => $timezone_identifier, 'label' => $timezone_identifier,
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @return object|null
     * @throws Exception
     */
    public function site(): ?object
    {
        try {
            $response = null;
            $config = Config::where('name', 'site')->first();
            if ($config != null) {
                $config->description->village = Village::where('code', $config->description->village)->first();
                $response = (object) [
                    'name' => $config->description->name,
                    'description' => $config->description->description,
                    'phone' => $config->description->phone,
                    'email' => $config->description->email,
                    'address' => (object) [
                        'street' => $config->description->address,
                        'village' => Village::where('code', $config->description->village)->first(),
                        'district' => District::where('code', $config->description->district)->first(),
                        'city' => City::where('code', $config->description->city)->first(),
                        'province' => Province::where('code', $config->description->province)->first(),
                        'postal' => $config->description->postal,
                    ]
                ];
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
