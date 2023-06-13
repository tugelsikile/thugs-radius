<?php

namespace App\Console\Commands;

use App\Models\Company\ClientCompany;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class MigrateClient extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:client';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $companies = ClientCompany::all();
        foreach ($companies as $company) {
            Config::set("database.connections.radius", [
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
                'driver' => 'mysql',
                'host' => $company->radius_db_host,
                'port' => env('DB_RADIUS_PORT'),
                'database' => $company->radius_db_name,
                'username' => $company->radius_db_user,
                'password' => $company->radius_db_pass
            ]);
            Artisan::call('migrate', [
                '--database' => 'radius',
                '--path' => 'database/migrations/radius'
            ]);
            DB::purge('radius');
        }
        return 0;
    }
}
