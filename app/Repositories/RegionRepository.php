<?php /** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

class RegionRepository
{
    public function fileRegions() {
        try {
            $file = storage_path() . '/app/public/regions/all-regions.json';
            if (File::exists($file)) {
                return json_decode(File::get($file));
            } else {
                return $this->provinces(new Request());
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
    public function searchRegions(Request $request): Collection
    {
        try {
            $response = collect();
            if ($request->has(__('labels.form_input.search_type'))) {
                $searchType = $request[__('labels.form_input.search_type')];
                $keywords = '';
                if ($request->has(__('labels.form_input.keywords'))) {
                    $keywords = $request[__('labels.form_input.keywords')];
                }
                switch ($searchType) {
                    default :
                    case 'villages' : $search = $this->searchVillages($keywords); break;
                    case 'districts' : $search = $this->searchDistricts($keywords); break;
                    case 'cities' : $search = $this->searchCities($keywords); break;
                    case 'provinces' : $search = $this->searchProvinces($keywords); break;
                }
                if ($search != null) {
                    if ($search->count() > 0) {
                        $response = $search;
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param String $keywords
     * @return Collection
     * @throws Exception
     */
    public function searchVillages(String $keywords): Collection
    {
        try {
            $response = collect();
            $villages = Village::whereLike('name', "%$keywords")->limit(20)->get();
            if ($villages->count() > 0) {
                foreach ($villages as $village) {
                    $response->push((object) [
                        'value' => $village->code,
                        'label' => ucwords(strtolower($village->name)),
                        'meta' => (object) [
                            'location' => $village->meta,
                            'postal' => $village->meta['pos'],
                            'district' => District::where('code', $village->district_code)->get()->map(function ($district) {
                                return (object) [
                                    'value' => $district->code,
                                    'label' => ucwords(strtolower($district->name)),
                                    'meta' => (object) [
                                        'location' => $district->meta,
                                        'villages' => Village::where('district_code', $district->code)->get()->map(function ($village) {
                                            return (object) [
                                                'value' => $village->code,
                                                'label' => ucwords(strtolower($village->name)),
                                            ];
                                        }),
                                        'city' => City::where('code', $district->city_code)->get()->map(function ($city) {
                                            return (object) [
                                                'value' => $city->code,
                                                'label' => ucwords(strtolower($city->name)),
                                                'meta' => (object) [
                                                    'location' => $city->meta,
                                                    'province' => Province::where('code', $city->province_code)->get()->map(function ($province) {
                                                        return (object) [
                                                            'value' => $province->code,
                                                            'label' => ucwords(strtolower($province->name)),
                                                            'meta' => (object) [
                                                                'location' => $province->meta,
                                                            ]
                                                        ];
                                                    })->first(),
                                                ]
                                            ];
                                        })->first()
                                    ]
                                ];
                            })->first()
                        ]
                    ]);
                }
            }
            /*$districts = District::whereIn('code', $villages->map(function ($d){ return $d->district_code; })->toArray())->get();
            $cities = City::whereIn('code', $districts->map(function ($d){ return $d->city_code; })->toArray())->get();
            $provinces = Province::whereIn('code', $cities->map(function ($d){ return $d->province_code; })->toArray())->get();
            foreach ($provinces as $province) {
                $response->push((object)[
                    'value' => $province->code,
                    'label' => ucwords(strtolower($province->name)),
                    'meta' => (object) [
                        'locations' => $province->meta,
                        'cities' => $cities->map(function ($city) use ($districts,$villages) {
                            return (object) [
                                'value' => $city->code,
                                'label' => ucwords(strtolower($city->name)),
                                'meta' => (object) [
                                    'locations' => $city->meta,
                                    'districts' => $districts->map(function ($district) use ($villages){
                                        return (object) [
                                            'value' => $district->code,
                                            'label' => ucwords(strtolower($district->name)),
                                            'meta' => (object) [
                                                'locations' => $district->meta,
                                                'villages' => $villages->map(function ($village) {
                                                    return (object) [
                                                        'value' => $village->code,
                                                        'label' => ucwords(strtolower($village->name)),
                                                        'meta' => (object) [
                                                            'location' => $village->meta,
                                                            'postal' => $village->meta['pos'],
                                                        ]
                                                    ];
                                                })
                                            ]
                                        ];
                                    })
                                ]
                            ];
                        })
                    ]
                ]);
            }*/
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
    public function all(Request $request): Collection
    {
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
            $provinces = $provinces->limit(20)->get();
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
                $tgtDir = storage_path() . '/app/public/regions';
                $tgtFile = $tgtDir . '/all-regions.json';
                if (!File::exists($tgtDir)) File::makeDirectory($tgtDir,0777,true);
                if (!File::isWritable($tgtDir)) File::chmod($tgtDir,0777);
                File::put($tgtFile,$response);
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
                            'province' => Province::where('code', $city->province_code)->get()->map(function ($province){
                                return (object) [
                                    'value' => $province->code,
                                    'label' => ucwords(strtolower($province->name)),
                                ];
                            })->first(),
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
                            'city' => City::where('code', $district->city_code)->get()->map(function ($city) {
                                return (object) [
                                    'value' => $city->code,
                                    'label' => ucwords(strtolower($city->name))
                                ];
                            })->first(),
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
                            'district' => District::where('code', $village->district_code)->get()->map(function ($district){
                                return (object) [
                                    'value' => $district->code,
                                    'label' => ucwords(strtolower($district->name))
                                ];
                            })->first(),
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
