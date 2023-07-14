<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Client\CompanyConfigController;
use App\Http\Controllers\Client\CompanyController;
use App\Http\Controllers\Client\CompanyInvoiceController;
use App\Http\Controllers\Client\PackageController;
use App\Http\Controllers\Config\DiscountController;
use App\Http\Controllers\Config\PaymentGatewayController;
use App\Http\Controllers\Config\TaxController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\Customer\CustomerController;
use App\Http\Controllers\Customer\InvoiceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Nas\BandwidthController;
use App\Http\Controllers\Nas\NasController;
use App\Http\Controllers\Nas\PoolController;
use App\Http\Controllers\Nas\ProfileController;
use App\Http\Controllers\Olt\OltController;
use App\Http\Controllers\PaymentGateway\BRIController;
use App\Http\Controllers\PaymentGateway\DuitkuController;
use App\Http\Controllers\PaymentGateway\MidtransController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\User\PrivilegeController;
use App\Http\Controllers\User\UserController;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['prefix' => 'login'], function () {
    Route::post('/', [AuthController::class, 'login']);
    Route::post('/google', [AuthController::class, 'googleLogin']);
});
Route::group(['prefix' => 'register'], function () {
    Route::post('/', [AuthController::class, 'register']);
    Route::post('/google', [AuthController::class, 'googleRegister']);
});
Route::group(['prefix' => 'password'], function () {
    Route::post('/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('/reset', [AuthController::class, 'resetPassword']);
});

Route::group(['prefix' => 'auth', 'middleware' => ['auth:api','logs']], function () {
    Route::any('/logout', [AuthController::class, 'logout']);
    Route::group(['prefix' => 'me'], function () {
        Route::get('/', [AuthController::class, 'me']);
        Route::post('/privileges', [AuthController::class, 'myPrivileges']);
        Route::post('/language', [AuthController::class, 'setLanguage']);
        Route::patch('/avatar', [AuthController::class, 'updateAvatar']);
        Route::patch('/account', [AuthController::class, 'updateAccount']);
        Route::patch('/password', [AuthController::class, 'updatePassword']);
        Route::patch('/locale', [AuthController::class, 'updateLocale']);
        Route::post('/finish-wizard', [AuthController::class, 'finishWizard']);
    });
    Route::group(['prefix' => 'users'], function () {
        Route::any('/', [UserController::class, 'crud']);
        Route::patch('/reset-passwords', [UserController::class, 'resetPassword'])->name('auth.users.reset-password');
        Route::patch('/reset-password', [UserController::class, 'resetPassword'])->name('clients.users.reset-password');
        Route::group(['prefix' => 'privileges'], function () {
            Route::any('/', [PrivilegeController::class, 'crud']);
            Route::patch('/set', [PrivilegeController::class, 'setPrivilege']);
        });
    });
    Route::group(['prefix' => 'companies'], function () {
        Route::any('/', [CompanyController::class, 'crud']);
        Route::patch('/active', [CompanyController::class, 'activate']);
        Route::group(['prefix' => 'packages'], function () {
            Route::any('/', [PackageController::class, 'crud']);
        });
        Route::group(['prefix' => 'invoices'], function () {
            Route::any('/', [CompanyInvoiceController::class, 'crud']);
            Route::any('/payments', [CompanyInvoiceController::class, 'payment']);
            Route::put('/generate',[CompanyInvoiceController::class, 'generate']);
        });
    });
    Route::group(['prefix' => 'configs'], function () {
        Route::any('/timezones', [ConfigController::class, 'timezone']);
        Route::any('/currencies', [ConfigController::class, 'currencies']);
        Route::any('/taxes', [TaxController::class, 'crud']);
        Route::any('/discounts', [DiscountController::class, 'crud']);
        Route::patch('/payment-gateways/activate', [PaymentGatewayController::class, 'activate'])->name('auth.configs.payment-gateways.activate');
    });
});
Route::group(['prefix' => 'clients', 'middleware' => ['auth:api', 'logs']], function () {
    Route::group(['prefix' => 'dashboards'],function () {
        Route::any('/server-statuses', [DashboardController::class, 'serverStatus']);
        Route::post('/online-customers', [DashboardController::class, 'onlineCustomer']);
        Route::post('/top-cards', [DashboardController::class, 'topCards']);
    });
    Route::group(['prefix' => 'nas'], function () {
        Route::any('/', [NasController::class, 'crud']);
        Route::post('/check-requirement', [NasController::class, 'checkRequirement']);
        Route::post('/ip-address', [NasController::class, 'interfaceIpAddress']);
        Route::post('/reload-status', [NasController::class, 'reloadStatus']);
        Route::post('/test-connection', [NasController::class, 'testConnection']);
        Route::post('/decrypt-encrypt', [NasController::class, 'encryptDecrypt']);
        Route::post('/parent-queues', [NasController::class, 'parentQueue']);
        Route::group(['prefix' => 'profiles'], function () {
            Route::any('/', [ProfileController::class, 'crud']);
            Route::any('/bandwidths', [BandwidthController::class, 'crud']);
            Route::any('/pools', [PoolController::class, 'crud']);
        });
    });
    Route::group(['prefix' => 'customers'], function () {
        Route::any('/', [CustomerController::class, 'crud']);
        Route::patch('/active', [CustomerController::class, 'statusActive']);
        Route::put('/generate', [CustomerController::class, 'generate']);
        Route::post('/kick-online', [CustomerController::class, 'kickOnlineUser']);
        Route::group(['prefix' => 'invoices'],function () {
            Route::any('/', [InvoiceController::class,'crud']);
            Route::any('/payments', [InvoiceController::class, 'payment']);
            Route::put('/generate', [InvoiceController::class, 'generate']);
        });
        Route::group(['prefix' => 'test-connection'],function () {
            Route::post('/wizard', [CustomerController::class, 'testConnectionWizard']);
        });
    });
    Route::group(['prefix' => 'configs'], function () {
        Route::any('/', [CompanyConfigController::class, 'crud']);
        Route::group(['prefix' => 'payment-gateways'], function () {
            Route::any('/', [PaymentGatewayController::class, 'crud']);
            Route::patch('/activate', [PaymentGatewayController::class, 'activate'])->name('clients.configs.payment-gateways.activate');
            Route::patch('/inactivate', [PaymentGatewayController::class, 'activate']);
        });
    });
    Route::group(['prefix' => 'olt'], function () {
        Route::any('/', [OltController::class, 'crud']);
        Route::any('/test-connection', [OltController::class, 'testConnection']);
        Route::group(['prefix' => 'gpon'], function () {
            Route::any('/state', [OltController::class, 'gponStates']);
            Route::any('/customer', [OltController::class, 'gponCustomer']);
        });
    });
});
Route::group(['prefix' => 'regions'], function () {
    Route::post('/all', [RegionController::class, 'all']);
    Route::get('/file', [RegionController::class, 'fileRegions']);
    Route::post('/search', [RegionController::class, 'searchRegions']);
});
Route::group(['prefix' => 'configs'], function () {
    Route::get('/times', function () {
        return formatResponse(200,'ok', Carbon::now()->format('Y-m-d H:i:s'));
    });
    Route::post('/site', [ConfigController::class, 'site']);
    Route::post('/timezones', [ConfigController::class, 'timezone']);
});
Route::group(['prefix' => 'payment-gateways'],function () {
    Route::group(['prefix' => 'bri'], function () {
        Route::post('/status', [BRIController::class, 'transactionStatus']);
    });
    Route::group(['prefix' => 'duitku'], function () {
        Route::post('/status', [DuitkuController::class, 'transactionStatus']);
        Route::post('/qr', [DuitkuController::class, 'generateQR']);
        Route::post('/channels', [DuitkuController::class, 'paymentChannel']);
        Route::post('/callback', [DuitkuController::class, 'callback']);
    });
    Route::group(['prefix' => 'midtrans'], function () {
        Route::post('/status', [MidtransController::class, 'transactionStatus'])->middleware('auth:api');
        Route::post('/token', [MidtransController::class, 'tokenMidtrans'])->middleware('auth:api');
        Route::group(['prefix' => 'payment'],function () {
            Route::any('/notification', [MidtransController::class, 'paymentNotification']);
            Route::any('/recurring', [MidtransController::class, 'paymentNotification']);
            Route::any('/account', [MidtransController::class, 'paymentNotification']);
        });
    });
});
