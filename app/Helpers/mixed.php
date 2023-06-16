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
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
function randomString($length = 5) {
    return collect(array_merge(range('a', 'z'), range('A', 'Z')))
        ->shuffle()
        ->take($length)
        ->implode('');
}
function generateCompanyExpired($current, $durString, $durAmmount): ?Carbon
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
function allowedDateFormat() {
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
        return $ava->create($user->name)->toBase64();
    } else {
        $tgtFile = storage_path() . '/app/public/avatars/' . $user->avatar;
        if (File::exists($tgtFile)) {
            return asset('/storage/avatars/' . $user->avatar);
        } else {
            $ava->create($user->name)->toBase64();
        }
    }
}
