<?php

namespace Database\Seeders;

use App\Models\Company\CompanyPackage;
use Illuminate\Database\Seeder;
use Ramsey\Uuid\Uuid;
use Throwable;

class CompanyPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     * @throws Throwable
     */
    public function run()
    {
        $requests = collect();
        $requests->push((object)[
            'code' => '00000001', 'name' => 'TRIAL PACKAGE', 'description' => 'This is trial package for newly registered customer', 'base_price' => 0, 'duration_string' => 'days', 'duration_ammount' => 7, 'max_users' => 1, 'max_customers' => 10, 'max_routerboards' => 1, 'max_vouchers' => 20, 'is_additional' => false, 'for_homepage' => false,
        ]);
        $this->command->getOutput()->progressStart($requests->count());
        foreach ($requests as $request) {
            $package = CompanyPackage::where('code', $request->code)->first();
            if ($package == null) {
                $package = new CompanyPackage();
                $package->id = Uuid::uuid4()->toString();
            }
            $package->code = $request->code;
            $package->name = $request->name;
            $package->description = $request->description;
            $package->base_price = $request->base_price;
            $package->duration_string = $request->duration_string;
            $package->duration_ammount = $request->duration_ammount;
            $package->max_users = $request->max_users;
            $package->max_customers = $request->max_customers;
            $package->max_routerboards = $request->max_routerboards;
            $package->is_additional = $request->is_additional;
            $package->for_homepage = $request->for_homepage;
            $package->saveOrFail();
            $this->command->getOutput()->progressAdvance();
        }
    }
}
