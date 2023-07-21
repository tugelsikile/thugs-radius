<?php

namespace App\Repositories\Backup;

use App\Helpers\RST\RST;
use App\Helpers\SwitchDB;
use App\Models\Company\ClientCompany;
use App\Models\Discount;
use App\Models\Tax;
use App\Repositories\Client\CompanyRepository;
use App\Repositories\Config\DiscountRepository;
use App\Repositories\Config\TaxRepository;
use App\Repositories\Customer\CustomerRepository;
use App\Repositories\Customer\InvoiceRepository;
use App\Repositories\Nas\BandwidthRepository;
use App\Repositories\Nas\NasRepository;
use App\Repositories\Nas\PoolRepository;
use App\Repositories\Nas\ProfileRepository;
use App\Repositories\User\UserRepository;
use Carbon\Carbon;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Madnest\Madzipper\Madzipper;
use ZipArchive;

class BackupRepository
{
    protected $me           = null;
    public $targetDir       = null;
    public $tempRestoreDir  = null;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
        if ($this->me != null) {
            $this->targetDir = storage_path() . '/app/public/companies/' . $this->me->company . '/backups/';
            $this->tempRestoreDir = $this->targetDir . 'temporary/';
        }
    }
    private function restoreCompany(object $fileCompany) {
        try {
            $company = ClientCompany::where('id', $this->me->company)->first();
            $company->name = $fileCompany->label;
            $company->address = $fileCompany->meta->address->street;
            $company->code = $fileCompany->meta->code;
            $company->email = $fileCompany->meta->address->email;
            $company->phone = $fileCompany->meta->address->phone;
            $company->domain = $fileCompany->meta->address->domain;
            $company->postal = $fileCompany->meta->address->postal;
            $company->expired_at = $fileCompany->meta->expiry;
            if (collect($fileCompany->meta->packages)->count() > 0) {
                $company->package = collect($fileCompany->meta->packages)->first()->value;
            }
            $company->active_at = $fileCompany->meta->timestamps->active->at;
            if ($fileCompany->meta->address->province != null) {
                if (gettype($fileCompany->meta->address->province) == 'object') {
                    if (property_exists($fileCompany->meta->address->province,'code')) $company->province = $fileCompany->meta->address->province->code;
                }
            }
            if ($fileCompany->meta->address->city != null) {
                if (gettype($fileCompany->meta->address->city) == "object") {
                    if (property_exists($fileCompany->meta->address->city,'code')) $company->city = $fileCompany->meta->address->city->code;
                }
            }
            if ($fileCompany->meta->address->district != null) {
                if (gettype($fileCompany->meta->address->district) == "object") {
                    if (property_exists($fileCompany->meta->address->district,'code')) $company->district = $fileCompany->meta->address->district->code;
                }
            }
            if ($fileCompany->meta->address->village != null) {
                if (gettype($fileCompany->meta->address->village) == "object") {
                    if (property_exists($fileCompany->meta->address->village,'code')) $company->village = $fileCompany->meta->address->village->code;
                }
            }
            $company->config = $fileCompany->meta->config->general;
            if ($fileCompany->meta->config->currency != null) {
                if (gettype($fileCompany->meta->config->currency) == "object") {
                    if (property_exists($fileCompany->meta->config->currency,'value')) $company->currency = $fileCompany->meta->config->currency->value;
                }
            }
            $company->radius_db_host = $fileCompany->meta->config->database->host;
            $company->radius_db_name = $fileCompany->meta->config->database->name;
            $company->radius_db_user = $fileCompany->meta->config->database->user;
            $company->radius_db_pass = $fileCompany->meta->config->database->pass;
            $company->saveOrFail();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    private function restoreTaxes(Collection $taxes) {
        try {
            Tax::where('company', $this->me->company)->delete();
            foreach ($taxes as $item) {
                $tax = new Tax();
                $tax->id = $item->value;
                $tax->name = $item->label;
                if ($item->meta->company != null) {
                    if (property_exists($item->meta->company,'id')) {
                        $tax->company = $item->meta->company->id;
                    }
                    if (property_exists($item->meta->company,'value')) {
                        $tax->company = $item->meta->company->value;
                    }
                }
                $tax->code = $item->meta->code;
                $tax->description = $item->meta->description;
                $tax->percent = $item->meta->percent;
                if ($item->meta->timestamps->create->by != null) {
                    if (property_exists($item->meta->timestamps->create->by,'id')) {
                        $tax->created_by = $item->meta->timestamps->create->by->id;
                    }
                    if (property_exists($item->meta->timestamps->create->by,'value')) {
                        $tax->created_by = $item->meta->timestamps->create->by->value;
                    }
                }
                if ($item->meta->timestamps->update->by != null) {
                    if (property_exists($item->meta->timestamps->update->by,'id')) {
                        $tax->updated_by = $item->meta->timestamps->update->by->id;
                    }
                    if (property_exists($item->meta->timestamps->update->by,'value')) {
                        $tax->updated_by = $item->meta->timestamps->update->by->value;
                    }
                }
                $tax->created_at = $item->meta->timestamps->create->at;
                $tax->updated_at = $item->meta->timestamps->update->at;
                $tax->saveOrFail();
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    private function restoreDiscounts(Collection $collections) {
        try {
            Discount::where('company', $this->me->company)->delete();
            foreach ($collections as $collection) {
                $discount = new Discount();
                $discount->id = $collection->value;
                $discount->code = $collection->meta->code;
                if ($collection->meta->company != null) {
                    if (property_exists($collection->meta->company,'id')) {
                        $discount->company = $collection->meta->company->id;
                    }
                    if (property_exists($collection->meta->company,'value')) {
                        $discount->company = $collection->meta->company->value;
                    }
                }
                $discount->name = $collection->label;
                $discount->amount = $collection->meta->amount;
                if ($collection->meta->timestamps->create->by != null) {
                    if (property_exists($collection->meta->timestamps->create->by,'id')) {
                        $discount->created_by = $collection->meta->timestamps->create->by->id;
                    }
                    if (property_exists($collection->meta->timestamps->create->by,'value')) {
                        $discount->created_by = $collection->meta->timestamps->create->by->value;
                    }
                }
                if ($collection->meta->timestamps->update->by != null) {
                    if (property_exists($collection->meta->timestamps->update->by,'id')) {
                        $discount->updated_by = $collection->meta->timestamps->update->by->id;
                    }
                    if (property_exists($collection->meta->timestamps->update->by,'value')) {
                        $discount->updated_by = $collection->meta->timestamps->update->by->value;
                    }
                }
                $discount->created_at = $collection->meta->timestamps->create->at;
                $discount->updated_at = $collection->meta->timestamps->update->at;
                $discount->saveOrFail();
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    private function restoreUsers(Collection $collections) {
        try {
            foreach ($collections as $collection) {
                dd($collection);
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return bool
     * @throws Exception
     */
    public function restore(Request $request): bool
    {
        try {
            throw new Exception("Under maintenance",400);
            $targetFile = $this->targetDir . $request[__('backup.form_input.id')];
            if (! File::exists($this->tempRestoreDir)) File::makeDirectory($this->tempRestoreDir);
            if (! File::isWritable($this->tempRestoreDir)) File::chmod($this->tempRestoreDir,0777);
            $zipper = new Madzipper();
            $zipper->make($targetFile)->extractTo($this->tempRestoreDir);
            $files = File::allFiles($this->tempRestoreDir);
            foreach ($files as $file) {
                $fileContent = json_decode(File::get($file));
                switch (strtolower($file->getFilename())) {
                    case '01.company.json':
                        $this->restoreCompany($fileContent);
                        break;
                    case '02.taxes.json':
                        $this->restoreTaxes(collect($fileContent));
                        break;
                    case '03.discounts.json':
                        $this->restoreDiscounts(collect($fileContent));
                        break;
                    case '04.users.json':
                        $this->restoreUsers(collect($fileContent));
                        break;
                }
            }
            File::deleteDirectory($this->tempRestoreDir);
            return true;
        } catch (Exception $exception) {
            if (File::exists($this->tempRestoreDir)) {
                if (! File::isWritable($this->tempRestoreDir)) File::chmod($this->tempRestoreDir,0777);
                File::deleteDirectory($this->tempRestoreDir);
            }
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
            foreach ($request[__('backup.form_input.id')] as $item) {
                $targetFile = $this->targetDir . $item;
                $exists = File::exists($targetFile);
                if ($exists) {
                    if (! File::isWritable($targetFile)) File::chmod($targetFile,0777);
                    File::delete($targetFile);
                    //return true;
                }
            }
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
            if ($this->targetDir != null) {
                $files = collect(File::allFiles($this->targetDir));
                foreach ($files as $file) {
                    if ($file->getExtension() == 'zip') {
                        $response->push((object) [
                            'value' => $file->getFilename(),
                            'label' => $file->getFilename(),
                            'meta' => (object) [
                                'size' => $file->getSize(),
                                'path' => asset('storage/companies/' . $this->me->company . '/backups/' . $file->getFilename()),
                                'created' => Carbon::createFromTimestamp($file->getCTime())->format('Y-m-d H:i:s'),
                            ]
                        ]);
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @return string|null
     * @throws GuzzleException
     */
    public function create(): ?string
    {
        try {
            $response = null;
            if ($this->me != null) {
                $company = $this->me->companyObj()->first();
                if ($company != null) {
                    //$targetDir = storage_path() . '/app/public/companies/' . $company->id . '/backups/' . Carbon::now()->format('YmdHis') . '/';
                    $targetDir = $this->targetDir . '/' . Carbon::now()->format('YmdHis') . '/';
                    $targetFile = Carbon::now()->format('YmdHis') . '.zip';
                    $targetZipFile = $this->targetDir . $targetFile;
                    if (! File::exists($targetDir)) File::makeDirectory($targetDir,0777,true);
                    if (! File::isWritable($targetDir)) File::chmod($targetDir,0777);
                    $files = collect();
                    //company file
                    $files->push($targetDir . '01.company.json');
                    File::put($targetDir . '01.company.json', json_encode((new CompanyRepository())->table(new Request(['id' => $company->id]))->first()));
                    //tax files
                    $files->push($targetDir . '02.taxes.json');
                    File::put($targetDir . '02.taxes.json', json_encode((new TaxRepository())->table(new Request())));
                    //discounts
                    $files->push($targetDir . '03.discounts.json');
                    File::put($targetDir . '03.discounts.json', json_encode((new DiscountRepository())->table(new Request())));
                    //users file
                    $files->push($targetDir . '04.users.json');
                    File::put($targetDir . '04.users.json', json_encode((new UserRepository())->table(new Request())));
                    //nas files
                    $files->push($targetDir . '05.nas.json');
                    File::put($targetDir . '05.nas.json', json_encode((new NasRepository())->table(new Request(['ignore_status' => true]))));
                    //pools files
                    $files->push($targetDir . '06.nas_profile_pools.json');
                    File::put($targetDir . '06.nas_profile_pools.json',json_encode((new PoolRepository())->table(new Request())));
                    //bandwidth files
                    $files->push($targetDir . '07.nas_profile_bandwidths.json');
                    File::put($targetDir . '07.nas_profile_bandwidths.json', json_encode((new BandwidthRepository())->table(new Request())));
                    //profile files
                    $files->push($targetDir . '08.nas_profiles.json');
                    File::put($targetDir . '08.nas_profiles.json', json_encode((new ProfileRepository())->table(new Request())));
                    //customer files
                    ini_set('max_execution_time',-0);
                    $files->push($targetDir . '09.customers.json');
                    File::put($targetDir . '09.customers.json', json_encode((new CustomerRepository())->table(new Request(['limit' => 1000]))));
                    //invoice files
                    ini_set('max_execution_time',-0);
                    $files->push($targetDir . '10.customer_invoices.json');
                    File::put($targetDir . '10.customer_invoices.json', json_encode((new InvoiceRepository())->table(new Request(['limit' => 1000]))));

                    $zip = new ZipArchive();

                    if ($zip->open($targetZipFile, ZipArchive::CREATE) !== TRUE) {
                        throw new Exception("unable open zip file",500);
                    }
                    foreach ($files as $file) {
                        $entryName = explode('/',$file);
                        if (! $zip->addFile($file, $entryName[count($entryName)-1])) {
                            throw new Exception("could not add file to zip :" . $file,500);
                        }
                    }
                    $zip->close();
                    File::deleteDirectory($targetDir);
                    resetStorageLink();
                    $response = asset('storage/companies/' . $company->id . '/backups/' . $targetFile);
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
    public function branch(Request $request): Collection
    {
        try {
            $response = collect();
            $branches = (new RST($request))->branches();
            if ($branches->count() > 0) {
                foreach ($branches as $branch) {
                    $response->push((object) [
                        'value' => $branch->id,
                        'label' => $branch->name,
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
     * @return object
     * @throws GuzzleException
     */
    public function readRSTData(Request $request): object
    {
        try {
            $response = (object) ['data' => collect()];
            if ($request->has('type')) {
                if (in_array($request->type,['nas','bandwidths','pools','profiles','packages','customers','invoices','payments'])) {
                    $rst = (new RST($request));
                    //$branches = $rst->branches();
                    $nas = $rst->nas($request);
                    switch ($request->type) {
                        default:
                        case 'nas':
                            $response->data = $nas;
                        break;
                        case 'bandwidths':
                            $response->data = $rst->bandwidths($nas);
                            break;
                        case 'pools':
                            new SwitchDB();
                            $response->data = $rst->pools($nas);
                            break;
                        case 'profiles':
                            $response->data = $rst->profiles($nas);
                            break;
                        case 'packages':
                            $response->data = $rst->packages($nas);
                            break;
                        case 'customers':
                            $response->data = $rst->customers($nas);
                            break;
                        case 'invoices':
                            new SwitchDB();
                            $response->data = $rst->invoices($rst->customers($nas,true));
                            break;
                        case 'payments':
                            new SwitchDB();
                            $response->data = $rst->payments($rst->invoices($rst->customers($nas,true),true));
                            break;
                        case 'vouchers':
                            $response->data = $rst->vouchers($nas);
                            break;
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            throw new Exception($exception->getMessage(),500);
        }
    }
}
