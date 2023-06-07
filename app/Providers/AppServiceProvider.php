<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        require_once app_path() . '/Helpers/mixed.php';
        require_once app_path() . '/Helpers/routerHelpers.php';
        require_once app_path() . '/Helpers/routerUploadAPI.php';
        require_once app_path() . '/Helpers/routerUploadSSL.php';
    }
}
