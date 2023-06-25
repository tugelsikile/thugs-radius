<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::get('/', function(){ return view('home'); });
Route::get('/forgot-password', function () { return view('forgot-password'); })->name('forgot-password');
Route::get('/register', function () { return view('register'); })->name('register');
Route::get('/login', function () { return view('auth.login'); })->name('login');
Route::group(['prefix' => 'auth'], function () {
    Route::get('/', function () { return view('auth.dashboard.index'); });
    Route::group(['prefix' => 'clients'], function () {
        Route::get('/', function () { return view('auth.company.index'); })->name('auth.clients');
        Route::get('/packages', function () { return view('auth.company.packages'); })->name('auth.clients.packages');
        Route::group(['prefix' => 'invoices'], function () {
            Route::get('/', function () { return view('auth.company.invoices'); })->name('auth.clients.invoices');
            Route::get('/payments', function () { abort(404); })->name('auth.clients.invoices.payments');
            Route::get('/print/{id}', function () { return view('auth.company.print-invoices',['id' => request()->id]); });
        });
    });
    Route::group(['prefix' => 'users'], function () {
        Route::get('/', function () { return view('auth.users.index'); })->name('auth.users');
        Route::get('/privileges', function () { return view('auth.users.privileges'); })->name('auth.users.privileges');
    });
    Route::group(['prefix' => 'configs'], function () {
        Route::get('/', function () { })->name('auth.configs');
        Route::get('/payment-gateways', function () { return view('auth.configs.payment-gateways'); })->name('auth.configs.payment-gateways');
        Route::get('/discounts', function () { return view('auth.configs.discounts'); })->name('auth.configs.discounts');
        Route::get('/taxes', function () { return view('auth.configs.taxes'); })->name('auth.configs.taxes');
        Route::get('/currencies', function () { return view('auth.configs.currencies'); })->name('auth.configs.currencies');
        Route::get('/timezones', function () { return view('auth.configs.timezones'); })->name('auth.configs.timezones');
    });
});
Route::group(['prefix' => 'clients'], function () {
    Route::get('/', function () { return view('clients.dashboard.index'); });
    Route::group(['prefix' => 'customers'], function () {
        Route::get('/', function () { return view('clients.customers.index'); })->name('clients.customers');
        Route::get('/pppoe', function () { return view('clients.customers.pppoe'); })->name('clients.customers.pppoe');
        Route::get('/hotspot', function () { return view('clients.customers.hotspot'); })->name('clients.customers.hotspot');
        Route::group(['prefix' => 'invoices'], function () {
            Route::get('/', function () { return view('clients.customers.invoices'); })->name('clients.customers.invoices');
            Route::get('/payments', function () { })->name('clients.customers.invoices.payment');
        });
    });
    Route::group(['prefix' => 'users'], function () {
        Route::get('/', function () { return view('clients.users.index'); })->name('clients.users');
        Route::get('/privileges', function () { return view('clients.users.privileges'); })->name('clients.users.privileges');
    });
    Route::group(['prefix' => 'nas'], function () {
        Route::get('/', function () { return view('clients.nas.index'); })->name('clients.nas');
        Route::get('/pools', function () { return view('clients.nas.profiles.pools'); })->name('clients.nas.pools');
        Route::get('/bandwidths', function () { return view('clients.nas.profiles.bandwidths'); })->name('clients.nas.bandwidths');
        Route::get('/profiles', function () { return view('clients.nas.profiles.index'); })->name('clients.nas.profiles');
        Route::get('/select', function () { abort(404); })->name('clients.nas.select');
    });
    Route::group(['prefix' => 'configs'], function () {
        Route::get('/', function () { return view('clients.configs.index'); })->name('clients.configs');
        Route::get('/payment-gateways', function () { return view('clients.configs.payment-gateways'); })->name('clients.configs.payment-gateways');
        Route::get('/discounts', function () { return view('clients.configs.discounts'); })->name('clients.configs.discounts');
        Route::get('/taxes', function () { return view('clients.configs.taxes'); })->name('clients.configs.taxes');
    });
});

Route::get('logs', [\Rap2hpoutre\LaravelLogViewer\LogViewerController::class, 'index']);
