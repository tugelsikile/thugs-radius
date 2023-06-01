<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Client\CompanyController;
use App\Http\Controllers\Client\PackageController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\User\PrivilegeController;
use App\Http\Controllers\User\UserController;
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
        Route::group(['prefix' => 'packages'], function () {
            Route::any('/', [PackageController::class, 'crud']);
        });
    });
});
Route::group(['prefix' => 'regions'], function () {
    Route::post('/all', [RegionController::class, 'all']);
});
