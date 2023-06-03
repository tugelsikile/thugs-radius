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
        Route::get('/discounts', function () { })->name('auth.configs.discounts');
        Route::get('/taxes', function () { })->name('auth.configs.taxes');
        Route::get('/currencies', function () { })->name('auth.configs.currencies');
        Route::get('/timezones', function () { return view('auth.configs.timezones'); })->name('auth.configs.timezones');
    });
});
Route::group(['prefix' => 'clients'], function () {
    Route::get('/', function () { return view('auth.dashboard.index'); });
    Route::group(['prefix' => 'customers'], function () {
        Route::get('/', function () { })->name('clients.customers');
        Route::get('/pppoe', function () { })->name('clients.customers.pppoe');
        Route::get('/hotspot', function () { })->name('clients.customers.hotspot');
        Route::group(['prefix' => 'invoices'], function () {
            Route::get('/', function () { })->name('clients.customers.invoices');
            Route::get('/payments', function () { })->name('clients.customers.invoices.payment');
        });
    });
    Route::group(['prefix' => 'users'], function () {
        Route::get('/', function () { return view('clients.users.index'); })->name('clients.users');
        Route::get('/privileges', function () { return view('clients.users.privileges.index'); })->name('clients.users.privileges');
    });
    Route::group(['prefix' => 'routerboards'], function () {
        Route::get('/', function () { return view('clients.routerboards.index'); })->name('clients.routerboards');
        Route::get('/select', function () { return view('clients.routerboards.index'); })->name('clients.routerboards.select');
    });
});
