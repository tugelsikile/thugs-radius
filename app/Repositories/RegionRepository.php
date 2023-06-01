<?php /** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

class RegionRepository
{
    public function all(Request $request) {
        try {
            return $this->provinces($request);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function provinces(Request $request): Collection
    {
        try {
            $response = collect();
            $provinces = Province::orderBy('name', 'asc');
            if (strlen($request->code) > 0) $provinces = $provinces->where('code', $request->code);
            $provinces = $provinces->get();
            if ($provinces->count() > 0) {
                foreach ($provinces as $province) {
                    $response->push((object) [
                        'value' => $province->code,
                        'label' => ucwords(strtolower($province->name)),
                        'meta' => (object) [
                            'id' => $province->id,
                            'location' => $province->meta,
                            'cities' => $this->cities(new Request(['province' => $province->code])),
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
    public function cities(Request $request): Collection
    {
        try {
            $response = collect();
            $cities = City::orderBy('name', 'asc');
            if (strlen($request->province) > 0) $cities = $cities->where('province_code', $request->province);
            if (strlen($request->code) > 0) $cities = $cities->where('code', $request->code);
            $cities = $cities->get();
            if ($cities->count() > 0) {
                foreach ($cities as $city) {
                    $response->push((object) [
                        'value' => $city->code,
                        'label' => ucwords(strtolower($city->name)),
                        'meta' => (object) [
                            'id' => $city->id,
                            'location' => $city->meta,
                            'districts' => $this->districts(new Request(['city' => $city->code])),
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
    public function districts(Request $request): Collection
    {
        try {
            $response = collect();
            $districts = District::orderBy('name', 'asc');
            if (strlen($request->city) > 0) $districts = $districts->where('city_code', $request->city);
            if (strlen($request->code) > 0) $districts = $districts->where('code', $request->code);
            $districts = $districts->get();
            if ($districts->count() > 0) {
                foreach ($districts as $district) {
                    $response->push((object) [
                        'value' => $district->code,
                        'label' => ucwords(strtolower($district->name)),
                        'meta' => (object) [
                            'id' => $district->id,
                            'location' => $district->meta,
                            'villages' => $this->villages(new Request(['district' => $district->code]))
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
    public function villages(Request $request): Collection
    {
        try {
            $response = collect();
            $villages = Village::orderBy('name', 'asc');
            if (strlen($request->district) > 0) $villages = $villages->where('district_code', $request->district);
            if (strlen($request->code) > 0) $villages = $villages->where('code', $request->code);
            $villages = $villages->get();
            if ($villages->count() > 0) {
                foreach ($villages as $village) {
                    $response->push((object) [
                        'value' => $village->code,
                        'label' => ucwords(strtolower($village->name)),
                        'meta' => (object) [
                            'id' => $village->id,
                            'location' => $village->meta,
                            'postal' => (int) $village->meta['pos']
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
