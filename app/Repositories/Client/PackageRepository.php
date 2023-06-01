<?php /** @noinspection PhpUndefinedFieldInspection */
/** @noinspection DuplicatedCode */
/** @noinspection SpellCheckingInspection */

/** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories\Client;

use App\Models\Company\CompanyPackage;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;
use Throwable;

class PackageRepository
{
    /* @
     * @param Request $request
     * @return mixed
     * @throws Throwable
     */
    public function create(Request $request) {
        try {
            $package = new CompanyPackage();
            $package->id = Uuid::uuid4()->toString();
            $package->code = generateCompanyPackageCode();
            $package->order = CompanyPackage::all()->count();
            $package->name = $request[__('companies.packages.form_input.name')];
            $package->description = $request[__('companies.packages.form_input.description')];
            $package->base_price = $request[__('companies.packages.form_input.price')];
            $package->vat_percent = $request[__('companies.packages.form_input.vat')];
            $package->duration_string = $request[__('companies.packages.form_input.duration_type')];
            $package->duration_ammount = $request[__('companies.packages.form_input.duration_ammount')];
            $package->max_users = $request[__('companies.packages.form_input.max_user')];
            $package->max_customers = $request[__('companies.packages.form_input.max_customer')];
            $package->max_vouchers = $request[__('companies.packages.form_input.max_voucher')];
            $package->max_routerboards = $request[__('companies.packages.form_input.max_router')];
            $package->saveOrFail();

            return $this->table(new Request(['id' => $package->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function update(Request $request) {
        try {
            $package = CompanyPackage::where('id', $request->id)->first();
            $package->name = $request[__('companies.packages.form_input.name')];
            $package->description = $request[__('companies.packages.form_input.description')];
            $package->base_price = $request[__('companies.packages.form_input.price')];
            $package->vat_percent = $request[__('companies.packages.form_input.vat')];
            $package->duration_string = $request[__('companies.packages.form_input.duration_type')];
            $package->duration_ammount = $request[__('companies.packages.form_input.duration_ammount')];
            $package->max_users = $request[__('companies.packages.form_input.max_user')];
            $package->max_customers = $request[__('companies.packages.form_input.max_customer')];
            $package->max_vouchers = $request[__('companies.packages.form_input.max_voucher')];
            $package->max_routerboards = $request[__('companies.packages.form_input.max_router')];
            $package->saveOrFail();

            return $this->table(new Request(['id' => $package->id]))->first();
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
            CompanyPackage::whereIn('id', $request->id)->delete();
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
    public function table(Request $request): Collection
    {
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
