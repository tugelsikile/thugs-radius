<?php /** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories\Client;

use App\Models\Company\ClientCompany;
use App\Models\Company\CompanyPackage;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Ramsey\Uuid\Uuid;

class CompanyConfigRepository
{
    protected $me;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
    }
    public function updateAddress(Request $request) {
        try {
            $updating = false;
            $company = ClientCompany::where('id', $request[__('configs.address.form_input.id')])->first();
            if ($request->has(__('configs.address.form_input.logo'))) {
                $dstDir = storage_path() . '/app/public/companies/' . $company->id . '/';
                /**** DELETE OLD LOGO ****/
                if ($company->config != null) {
                    if ($company->config->logo != null) {
                        $dstFile = $dstDir . $company->config->logo;
                        if (File::exists($dstFile)) {
                            if (!File::isWritable($dstFile)) File::chmod($dstFile,0777);
                            File::delete($dstFile);
                        }
                    }
                }
                /**** CONTINUE UPLOAD LOGO ****/
                $fileLogo = $request->file(__('configs.address.form_input.logo'));
                if (!File::exists($dstDir)) File::makeDirectory($dstDir,0777,true);
                $logoName = Uuid::uuid4()->toString() . '.' . $fileLogo->getClientOriginalExtension();
                $fileLogo->move($dstDir, $logoName);
                resetStorageLink();
                if ($company->config == null) {
                    $company->config = (object) ['logo' => $logoName];
                } else {
                    $updating = true;
                    $config = $company->config;
                    $config->logo = $logoName;
                    $company->config = $config;
                }
            }
            if ($request->has(__('configs.address.form_input.delete_logo'))) {
                if ($company->config != null) {
                    $config = $company->config;
                    if (property_exists($config,'logo')) {
                        if ($config->logo != null) {
                            $updating = true;
                            $fileLogo = storage_path() . '/app/public/companies/' . $company->id . '/' . $company->config->logo;
                            if (File::exists($fileLogo) && File::isFile($fileLogo)) {
                                if (!File::isWritable($fileLogo)) File::chmod($fileLogo,0777);
                                File::delete($fileLogo);
                                resetStorageLink();
                                $config->logo = null;
                                $company->config = $config;
                            }
                        }
                    }
                }
            }
            if ($company->name != $request[__('configs.address.form_input.name')]) $updating = true;
            $company->name = $request[__('configs.address.form_input.name')];
            if ($company->phone != $request[__('configs.address.form_input.phone')]) $updating = true;
            $company->phone = $request[__('configs.address.form_input.phone')];
            if ($company->email != $request[__('configs.address.form_input.email')]) $updating = true;
            $company->email = $request[__('configs.address.form_input.email')];
            if ($company->address = $request[__('configs.address.form_input.street')]) $updating = true;
            $company->address = $request[__('configs.address.form_input.street')];
            if ($request->has(__('configs.address.form_input.village'))) {
                if ($company->village != $request[__('configs.address.form_input.village')]) $updating = true;
                $company->village = $request[__('configs.address.form_input.village')];
            } else {
                if ($company->village != null) $updating = true;
                $company->village = null;
            }
            if ($request->has(__('configs.address.form_input.district'))) {
                if ($company->district != $request[__('configs.address.form_input.district')]) $updating = true;
                $company->district = $request[__('configs.address.form_input.district')];
            } else {
                if ($company->district != null) $updating = true;
                $company->district = null;
            }
            if ($request->has(__('configs.address.form_input.city'))) {
                if ($company->city != $request[__('configs.address.form_input.city')]) $updating = true;
                $company->city = $request[__('configs.address.form_input.city')];
            } else {
                if ($company->city != null) $updating = true;
                $company->city = null;
            }
            if ($request->has(__('configs.address.form_input.province'))) {
                if ($company->province != $request[__('configs.address.form_input.province')]) $updating = true;
                $company->province = $request[__('configs.address.form_input.province')];
            } else {
                if ($company->province != null) $updating = true;
                $company->province = null;
            }
            if ($request->has(__('configs.address.form_input.postal'))) {
                if ($company->postal != $request[__('configs.address.form_input.postal')]) $updating = true;
                $company->postal = $request[__('configs.address.form_input.postal')];
            } else {
                if ($company->postal != null) $updating = true;
                $company->postal = null;
            }
            if ($updating) {
                $company->updated_by = $this->me->id;
            }
            $company->saveOrFail();
            return $this->allConfig($request)->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function allConfig(Request $request): Collection
    {
        try {
            $response = collect();
            $company = ClientCompany::where('id', $this->me->company)->first();
            if ($company != null) {
                $response->push((object)[
                    'value' => 'client',
                    'label' => $company->name,
                    'meta' => (object) [
                        'id' => $company->id,
                        'logo' => companyLogo($company),
                        'address' => (object) [
                            'street' => $company->address,
                            'village' => $company->villageObj,
                            'district' => $company->districtObj,
                            'city' => $company->cityObj,
                            'province' => $company->provinceObj,
                            'postal' => $company->postal,
                            'email' => $company->email,
                            'phone' => $company->phone,
                        ]
                    ]
                ]);
                //$package = $company->packageObj;
                //dd($package);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
