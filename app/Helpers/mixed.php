<?php /** @noinspection PhpUndefinedMethodInspection */
/** @noinspection DuplicatedCode */

/** @noinspection PhpUndefinedFieldInspection */

use App\Models\Company\ClientCompany;
use App\Models\Company\CompanyPackage;
use App\Models\Company\Invoice\CompanyInvoice;
use App\Models\Company\Invoice\CompanyInvoicePayment;
use App\Models\Customer\Customer;
use App\Models\Customer\CustomerInvoice;
use App\Models\Customer\CustomerInvoicePayment;
use App\Models\User\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
function randomNumeric($length = 5): string
{
    return collect(array_merge(range('0', '9'), range('0', '9')))
        ->shuffle()
        ->take($length)
        ->implode('');
}
function randomString($length = 5): string
{
    return collect(array_merge(range('a', 'z'), range('A', 'Z')))
        ->shuffle()
        ->take($length)
        ->implode('');
}
function generateCompanyExpired($current, string $durString, int $durAmmount): ?Carbon
{
    $response = null;
    if ($durAmmount > 0) {
        switch ($durString) {
            case 'seconds' : $response = Carbon::parse($current)->addSeconds($durAmmount); break;
            case 'minutes' : $response = Carbon::parse($current)->addMinutes($durAmmount); break;
            case 'hours' : $response = Carbon::parse($current)->addHours($durAmmount); break;
            case 'days' : $response = Carbon::parse($current)->addDays($durAmmount); break;
            case 'weeks' : $response = Carbon::parse($current)->addWeeks($durAmmount); break;
            case 'months' : $response = Carbon::parse($current)->addMonths($durAmmount); break;
            case 'years' : $response = Carbon::parse($current)->addYears($durAmmount); break;
        }
    }
    return $response;
}
function generateCustomerPaymentCode(Carbon $carbon): string
{
    $length = CustomerInvoicePayment::whereDate('paid_at', $carbon->format('Y-m-d'))->orderBy('code', 'desc')->withTrashed()->limit(1)->offset(0)->get('code');
    if ($length->count() > 0) {
        $length = $length->first();
        $length = Str::substr($length,-5);
        $length = (int) $length;
        $length = $length + 1;
    } else {
        $length = 1;
    }
    return $carbon->format('ymd') . Str::padLeft($length,5,'0');
}
function generateCompanyPackageCode(): string
{
    $length = CompanyPackage::orderBy('code', 'desc')->limit(1)->offset(0)->get('code');
    if ($length->count() > 0) {
        $length = $length->first();
        $length = Str::substr($length,-4);
        $length = (int) $length;
        $length = $length + 1;
    } else {
        $length = 1;
    }
    return Carbon::now()->format('ym') . Str::padLeft($length,4,'0');
}
function generateCompanyInvoicePaymentCode($tanggal): string
{
    $length = CompanyInvoicePayment::orderBy('code', 'desc')->whereDate('paid_at', Carbon::parse($tanggal)->format('Y-m-d'))->withTrashed()->get('code');
    if ($length->count() > 0) {
        $length = $length->first();
        $length = Str::substr($length,-4);
        $length = (int) $length;
        $length = $length + 1;
    } else {
        $length = 1;
    }
    return Carbon::parse($tanggal)->format('Ymd') . Str::padLeft($length,4,'0');
}
function generateCustomerInvoiceCode(Carbon $billPeriod): string
{
    $length = CustomerInvoice::orderBy('code', 'desc')->whereMonth('bill_period', $billPeriod->format('m'))
        ->whereYear('bill_period', $billPeriod->format('Y'))
        ->withTrashed()
        ->limit(1)->offset(0)->get('code');
    if ($length->count() > 0) {
        $length = $length->first();
        $length = Str::substr($length,-5);
        $length = (int) $length;
        $length = $length + 1;
    } else {
        $length = 1;
    }
    return $billPeriod->format('Ym') . Str::padLeft($length,5,'0');
}
function generateCustomerCode(): string
{
    $length = Customer::orderBy('code', 'desc')->whereDate('created_at', Carbon::now()->format('Y-m-d'))->limit(1)->offset(0)->get('code');
    if ($length->count() > 0) {
        $length = $length->first();
        $length = Str::substr($length,-5);
        $length = (int) $length;
        $length = $length + 1;
    } else {
        $length = 1;
    }
    return Carbon::now()->format('ymd') . Str::padLeft($length,5,'0');
}
function generateCompanyInvoiceCode(): string
{
    $length = CompanyInvoice::orderBy('code', 'desc')->limit(1)->offset(0)->withTrashed()->get('code');
    if ($length->count() > 0) {
        $length = $length->first();
        $length = Str::substr($length,-4);
        $length = (int) $length;
        $length = $length + 1;
    } else {
        $length = 1;
    }
    return Carbon::now()->format('ym') . Str::padLeft($length,4,'0');
}
function generateCompanyCode(): string
{
    $length = ClientCompany::orderBy('code', 'desc')->limit(1)->offset(0)->get('code');
    if ($length->count() > 0) {
        $length = $length->first();
        $length = Str::substr($length,-4);
        $length = (int) $length;
        $length = $length + 1;
    } else {
        $length = 1;
    }
    return Carbon::now()->format('ym') . Str::padLeft($length,4,'0');
}
function durationLists(): array
{
    return [
        'minutes', 'hours', 'days', 'weeks', 'months'
    ];
}
function allowedDateFormat(): array
{
    return [
        'DD/MM/yyyy HH:mm:ss', 'DD/MM/yyyy HH:mm',
        'DD/MM/yy HH:mm', 'DD-MM-yyyy HH:mm:ss',
        'DD MMMM yyyy HH:mm:ss', 'dd, DD MMMM yyyy HH:mm:ss',
        'ddd, DD MMMM yyyy HH:mm:ss',
        'dddd, DD MMMM yyyy HH:mm:ss',
        'DD MMM yyyy HH:mm:ss',
        'yyyy/MM/DD HH:mm:ss',
        'yyyy/MM/DD HH:mm',
        'yy/MM/DD HH:mm',
    ];
}
function formatResponsePG(int $code, string $message = null, $params = null): JsonResponse
{
    if ($code > 550) $code = 500;
    if ($code < 200) $code = 400;
    if ($message == null) $message = __('messages.method');
    if (strlen($message) == 0) $message = __('messages.method');
    return response()->json([
        'status_code' => $code,
        'status_message' => $message,
        'status_data' => $params,
    ]);
}
function formatResponse($code, $message = null, $params = null): JsonResponse
{
    if (! is_integer($code)) $code = 400;
    if ($code > 550) $code = 500;
    if ($code < 200) $code = 400;
    if ($message == null) $message = __('messages.method');
    if (strlen($message) == 0) $message = __('messages.method');
    return response()->json([
        'message' => $message,
        'params' => $params
    ], $code);
}
function getAvatar(User $user) {
    $ava = new Laravolt\Avatar\Avatar();
    if ($user->avatar == null) {
        return $ava->create($user->name)->setBackground('#001f3f')->setBorder(1,'#001f3f')->toBase64();
    } else {
        $tgtFile = storage_path() . '/app/public/avatars/' . $user->avatar;
        if (File::exists($tgtFile)) {
            return asset('/storage/avatars/' . $user->avatar);
        } else {
            return $ava->create($user->name)->setBackground('#001f3f')->setBorder(1,'#001f3f')->toBase64();
        }
    }
}
function companyLogo(ClientCompany $company) {
    if ($company->config != null) {
        if ($company->config->logo != null) {
            $file = storage_path() . '/app/public/companies/' . $company->id . '/' . $company->config->logo;
            if (File::exists($file)) {
                return asset('/storage/companies/' . $company->id . '/' . $company->config->logo);
            } else {
                return asset('/images/logo-1.png');
            }
        }
    }
    return null;
}
function resetStorageLink() {
    $dir = public_path() . '/storage';
    if (File::exists($dir)) {
        if (!File::isWritable($dir)) File::chmod($dir,0777);
        File::delete($dir);
    }
    Artisan::call("storage:link");
}
function convertToSecond(int $time, string $unit) {
    $response = 0;
    $time = (int) $time;
    switch (strtolower($unit)) {
        case 'seconds' : $response = $time; break;
        case 'minutes' : $response = $time * 60; break;
        case 'hours' : $response = ( $time * 60 ) * 60; break;
        case 'days' : $response = ( ( $time * 60 ) * 60 ) * 24; break;
        case 'weeks' : $response = ( ( ( $time * 60 ) * 60 ) * 24 ) * 7; break;
        case 'months' : $response = ( ( ( $time * 60 ) * 60 ) * 24 ) * 30; break;
        case 'years' : $response = ( ( ( $time * 60 ) * 60 ) * 24 ) * 365; break;
    }
    return $response;
}
function convertToBit(int $byte, string $unit) {
    $response = 0;
    switch (strtolower($unit)) {
        case 'b': $response = $byte; break;
        case 'k': $response = $byte * 1024; break;
        case 'm': $response = ( $byte * 1024 ) * 1024; break;
        case 'g': $response = ( ( $byte * 1024 ) * 1024 ); break;
    }
    return $response;
}
