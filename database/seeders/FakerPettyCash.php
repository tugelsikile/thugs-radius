<?php

namespace Database\Seeders;

use App\Helpers\SwitchDB;
use App\Models\Accounting\PettyCash;
use App\Models\Company\ClientCompany;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Ramsey\Uuid\Uuid;

class FakerPettyCash extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $company = ClientCompany::where('id',"5fbffc08-105d-4800-823a-c29d73ad61cf")->first();
        if ($company != null) {
            $dbParam = [
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
                'driver' => 'mysql',
                'host' => $company->radius_db_host,
                'port' => env('DB_RADIUS_PORT'),
                'database' => $company->radius_db_name,
                'username' => $company->radius_db_user,
                'password' => $company->radius_db_pass
            ];
            new SwitchDB("database.connections.radius", $dbParam);

            $faker = Faker::create('id_ID');
            $dataCounts = 2000;
            $this->command->getOutput()->progressStart($dataCounts);
            for ($index = 0; $index <= $dataCounts; $index++) {
                $pettyCash = new PettyCash();
                $pettyCash->id = Uuid::uuid4()->toString();
                $pettyCash->period = $faker->dateTimeBetween("-30 days","+30 days")->format('Y-m-d H:i:s');
                $pettyCash->name = $faker->name;
                $pettyCash->description = $faker->address;
                $rand = mt_rand(0,100);
                if ($rand >= 0 && $rand <= 50) {
                    $pettyCash->type = "input";
                    $pettyCash->amount = mt_rand(10000,9999999999);
                } else {
                    $pettyCash->type = "output";
                    $pettyCash->amount = 0 - mt_rand(10000,9999999999);
                }
                $pettyCash->approved_at = Carbon::now()->format('Y-m-d H:i:s');
                $pettyCash->saveOrFail();
                $this->command->getOutput()->progressAdvance();
            }
            $this->command->getOutput()->progressFinish();
        }
    }
}
