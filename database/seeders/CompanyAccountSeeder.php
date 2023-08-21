<?php

namespace Database\Seeders;

use App\Helpers\SwitchDB;
use App\Models\Accounting\Account;
use App\Models\Company\ClientCompany;
use Illuminate\Database\Seeder;
use Ramsey\Uuid\Uuid;

class CompanyAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $dumps = collect();
        $dumps->push((object) [
            'code' => '000001', 'name' => 'Customer Online Payment', 'description' => 'Account untuk pembayaran pelanggan secara online'
        ]);
        $companies = ClientCompany::all();
        $this->command->getOutput()->progressStart($companies->count());
        foreach ($companies as $company) {
            new SwitchDB("database.connections.radius",[
                'charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci', 'driver' => 'mysql',
                'host' => $company->radius_db_host, 'port' => env('DB_RADIUS_PORT'),
                'database' => $company->radius_db_name, 'username' => $company->radius_db_user,
                'password' => $company->radius_db_pass
            ]);
            foreach ($dumps as $dump) {
                $account = Account::where('code', $dump->code)->first();
                if ($account == null) {
                    $account = new Account();
                    $account->id = Uuid::uuid4()->toString();
                    $account->code = $dump->code;
                    $account->name = $dump->name;
                    $account->description = $dump->description;
                    $account->save();
                }
            }
            $this->command->getOutput()->progressAdvance();
        }
        $this->command->getOutput()->progressFinish();
    }
}
