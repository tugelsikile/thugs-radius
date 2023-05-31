<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Laravolt\Indonesia\Models\Province;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();
        if (Province::all()->count() == 0) {
            $this->command->line("Seed laravolt indonesia");
            Artisan::call("laravolt:indonesia:seed");
        }
        $this->call([
            UserLevelSeeder::class,
            UserSeeder::class,
            MenuSeeder::class,
            UserPrivilegeSeeder::class,
        ]);
    }
}
