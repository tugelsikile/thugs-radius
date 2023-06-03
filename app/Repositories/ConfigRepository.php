<?php /** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories;

use App\Models\Config;
use App\Models\User\User;
use DateTimeZone;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

class ConfigRepository
{
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
