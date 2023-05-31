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
        Route::get('/', function () { return view('auth.clients.index'); })->name('auth.clients');
        Route::get('/packages', function () { return view('auth.clients.packages'); })->name('auth.clients.packages');
        Route::group(['prefix' => 'invoices'], function () {
            Route::get('/', function () { return view('auth.clients.invoices.index'); })->name('auth.clients.invoices');
            Route::get('/payments', function () { abort(404); })->name('auth.clients.invoices.payments');
        });
    });
    Route::group(['prefix' => 'users'], function () {
        Route::get('/', function () { return view('auth.users.index'); })->name('auth.users');
        Route::get('/privileges', function () { return view('auth.users.privileges'); })->name('auth.users.privileges');
    });
});
Route::group(['prefix' => 'clients'], function () {
    Route::group(['prefix' => 'users'], function () {
        Route::get('/', function () { return view('clients.users.index'); })->name('clients.users');
        Route::get('/privileges', function () { return view('clients.users.privileges.index'); })->name('clients.users.privileges');
    });
});
