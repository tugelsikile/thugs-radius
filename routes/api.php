<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Client\CompanyController;
use App\Http\Controllers\Client\CompanyInvoiceController;
use App\Http\Controllers\Client\PackageController;
use App\Http\Controllers\Config\DiscountController;
use App\Http\Controllers\Config\TaxController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\Nas\NasController;
use App\Http\Controllers\Nas\PoolController;
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

Route::post('/login', [AuthController::class, 'login']);
Route::group(['prefix' => 'auth', 'middleware' => ['auth:api','logs']], function () {
    Route::group(['prefix' => 'me'], function () {
        Route::post('/privileges', [AuthController::class, 'myPrivileges']);
        Route::post('/language', [AuthController::class, 'setLanguage']);
    });
    Route::group(['prefix' => 'users'], function () {
        Route::any('/', [UserController::class, 'crud']);
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
    });
});
Route::group(['prefix' => 'clients', 'middleware' => ['auth:api', 'logs']], function () {
    Route::group(['prefix' => 'nas'], function () {
        Route::any('/', [NasController::class, 'crud']);
        Route::post('/test-connection', [NasController::class, 'testConnection']);
        Route::post('/decrypt-encrypt', [NasController::class, 'encryptDecrypt']);
        Route::group(['prefix' => 'profiles'], function () {
            Route::group(['prefix' => 'pools'], function () {
                Route::any('/', [PoolController::class, 'crud']);
            });
        });
    });
});
Route::group(['prefix' => 'regions'], function () {
    Route::post('/all', [RegionController::class, 'all']);
});
Route::group(['prefix' => 'configs'], function () {
    Route::get('/times', function () {
        return formatResponse(200,'ok', Carbon::now()->format('Y-m-d H:i:s'));
    });
    Route::post('/site', [ConfigController::class, 'site']);
    Route::post('/timezones', [ConfigController::class, 'timezone']);
});
