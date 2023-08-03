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
use PhpOffice\PhpSpreadsheet\Style\Border;

function parseLineGponResponse(string $responseString, string $targetString = "Name:"): ?string
{
    $response = null;
    $lines = explode(" ",str_replace($targetString,"", $responseString));
    if (count($lines) > 0) {
        $lines = stripEmptyLineFromGponResponse($lines);
        if ($lines != null) {
            $response = $lines;
        }
    }
    return $response;
}
function stripEmptyLineFromGponResponse(array $lines): ?string
{
    $response = null;
    foreach ($lines as $key => $line) {
        if (strlen($line) == 0) {
            unset($lines[$key]);
        }
    }
    if (count($lines) > 0) {
        $response = join(' ', $lines);
    }
    return $response;
}
function formatMacFromOlt(string $string, string $separator = ' ', string $jointer = ':'): string
{
    $string = str_replace('Hex-STRING: ','', $string);
    $string = collect(explode($separator, $string));
    return $string->join($jointer);
}
function cidr2NetmaskAddr (string $cidr): string
{
    $ta = substr ($cidr, strpos ($cidr, '/') + 1) * 1;
    $netmask = str_split (str_pad (str_pad ('', $ta, '1'), 32, '0'), 8);
    foreach ($netmask as &$element)
        $element = bindec ($element);
    return join('.', $netmask);
}
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
function generateCustomerInvoiceCode(Carbon $billPeriod, $random = false): string
{
    if ($random) {
        $length = randomNumeric();
    } else {
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

function companyLogo(ClientCompany $company): ?string
{
    if ($company->config != null) {
        if (property_exists($company->config,'logo')) {
            if ($company->config->logo != null) {
                $file = storage_path() . '/app/public/companies/' . $company->id . '/' . $company->config->logo;
                if (File::exists($file)) {
                    return asset('/storage/companies/' . $company->id . '/' . $company->config->logo);
                } else {
                    return asset('/images/logo-1.png');
                }
            }
        }
    }
    return asset('/images/logo-1.png');
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
function toNum($str)
{
    $limit = 5; //apply max no. of characters
    $colLetters = strtoupper($str); //change to uppercase for easy char to integer conversion
    $strlen = strlen($colLetters); //get length of col string
    if ($strlen > $limit)    return "Column too long!"; //may catch out multibyte chars in first pass
    preg_match("/^[A-Z]+$/", $colLetters, $matches); //check valid chars
    if (!$matches) return "Invalid characters!"; //should catch any remaining multibyte chars or empty string, numbers, symbols
    $it = 0;
    $vals = 0; //just start off the vars
    for ($i = $strlen - 1; $i > -1; $i--) { //countdown - add values from righthand side
        $vals += (ord($colLetters[$i]) - 64) * pow(26, $it); //cumulate letter value
        $it++; //simple counter
    }
    return $vals; //this is the answer
}

function toStr($n, $case = 'upper')
{
    $alphabet   = array(
        'A',    'B',    'C',    'D',    'E',    'F',    'G',
        'H',    'I',    'J',    'K',    'L',    'M',    'N',
        'O',    'P',    'Q',    'R',    'S',    'T',    'U',
        'V',    'W',    'X',    'Y',    'Z'
    );
    $n             = $n;
    if ($n <= 26) {
        $alpha     =  $alphabet[$n - 1];
    } elseif ($n > 26) {
        $dividend   = ($n);
        $alpha      = '';
        $modulo;
        while ($dividend > 0) {
            $modulo     = ($dividend - 1) % 26;
            $alpha      = $alphabet[$modulo] . $alpha;
            $dividend   = floor((($dividend - $modulo) / 26));
        }
    }
    if ($case == 'lower') {
        $alpha = strtolower($alpha);
    }
    return $alpha;
}
function formatPrice ($price, int $decimal = 0): string
{
    $locale = config('app.locale');
    switch ($locale) {
        default:
        case 'id':
            $decimalSeparator = ',';
            $thousandSeparator = '.';
            break;
        case 'en':
            $decimalSeparator = '.';
            $thousandSeparator = ',';
            break;
    }
    return number_format($price, $decimal, $decimalSeparator, $thousandSeparator);
}
function excelNumberFormat($decimalPlaces = 0): string
{
    $locale = config('app.locale');
    $format = "";
    switch ($locale) {
        default:
        case 'id':
            $format = "#,##0";
            if ($decimalPlaces > 0) {
                $format .= ".00";
            }
            break;
        case 'en':
            $format = "#,##0";
            if ($decimalPlaces > 0) {
                $format .= ".00";
            }
            break;
    }
    return $format;
}
function excelLocale (): string
{
    $locale = config('app.locale');
    switch ($locale) {
        default:
        case 'id': $locale = 'id_ID'; break;
        case 'en': $locale = 'en_US'; break;
    }
    return $locale;
}
function excelProperBorder(): array
{
    return [
        'borders' => [
            'outline' => [
                'borderStyle' => Border::BORDER_DOUBLE,
                'color' => ['argb' => 'FF000000'],
            ],
            'inside' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => [ 'argb' => 'FF000000' ],
            ]
        ],
    ];;
}
