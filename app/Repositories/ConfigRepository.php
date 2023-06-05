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
