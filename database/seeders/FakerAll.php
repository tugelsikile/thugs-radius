<?php

namespace Database\Seeders;

use App\Models\Company\ClientCompany;
use App\Models\Company\CompanyPackage;
use App\Models\User\User;
use App\Models\User\UserLevel;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;
use Ramsey\Uuid\Uuid;

class FakerAll extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create('id_ID');
        $levels = UserLevel::whereIn('name', ['Admin','Operator','Customer'])->get('id')->map(function ($data) {
            return $data->id;
        })->toArray();

        $companies = ClientCompany::all()->map(function ($data) {
            return $data->id;
        });
        $packages = CompanyPackage::all()->map(function ($data) {
            return $data->id;
        });
        $this->command->line("Faker Company Packages");
        if (CompanyPackage::all()->count() < 10) {
            $this->command->getOutput()->progressStart(15);
            for ($int = 0; $int <= 15; $int++ ) {
                $package = new CompanyPackage();
                $package->id = Uuid::uuid4()->toString();
                $package->code = generateCompanyPackageCode();
                $package->order = $int;
                $package->name = $faker->domainWord;
                $package->description = $faker->streetAddress;
                $package->base_price = mt_rand(100000,2000000);
                $package->vat_percent = mt_rand(0,11);
                $package->duration_string = $faker->randomElement(durationLists());
                $package->duration_ammount = mt_rand(0,100000);
                $package->max_users = mt_rand(0,100);
                $package->max_customers = mt_rand(0,1000);
                $package->max_vouchers = mt_rand(0,1000000);
                $package->max_routerboards = mt_rand(0,10);
                $package->saveOrFail();
                $packages->push($package->id);
                $this->command->getOutput()->progressAdvance();
            }
            $this->command->getOutput()->progressFinish();
        }

        $this->command->line("Faker Companies");
        if (ClientCompany::all()->count() < 20) {
            $this->command->getOutput()->progressStart(10);
            for ($int = 0; $int <= 10; $int++) {
                $company = new ClientCompany();
                $company->id = Uuid::uuid4()->toString();
                $company->package = $faker->randomElement($packages->toArray());
                $company->code = generateCompanyCode();
                $company->name = $faker->company;
                $company->email = $faker->companyEmail;
                $company->domain = $faker->domainName;
                $company->address = $faker->streetAddress;
                $company->province = $faker->randomElement(Province::orderBy('created_at', 'asc')->get('code')->map(function ($data) {
                    return $data->code;
                })->toArray());
                $company->city = $faker->randomElement(City::orderBy('created_at', 'asc')->where('province_code', $company->province)->get('code')->map(function ($data) {
                    return $data->code;
                })->toArray());
                $company->district = $faker->randomElement(District::orderBy('created_at', 'asc')->where('city_code', $company->city)->get('code')->map(function ($data) {
                    return $data->code;
                })->toArray());
                $company->village = $faker->randomElement(Village::orderBy('created_at', 'asc')->where('district_code', $company->district)->get('code')->map(function ($data) {
                    return $data->code;
                })->toArray());
                $company->postal = Village::where('code', $company->village)->first()->meta['pos'];
                $company->phone = $faker->phoneNumber;
                $paket = CompanyPackage::where('id', $company->package)->first();
                $expired = generateCompanyExpired(Carbon::now(), $paket->duration_string, $paket->duration_ammount);
                if ($expired != null) {
                    $company->expired_at = $expired->format('Y-m-d H:i:s');
                }
                $company->saveOrFail();
                $companies->push($company->id);
                $this->command->getOutput()->progressAdvance();
            }
            $this->command->getOutput()->progressFinish();
        }

        $this->command->line("Faker users");
        $this->command->getOutput()->progressStart(50);
        for ($int = 0; $int <= 50; $int++) {
            $user = new User();
            $user->id = Uuid::uuid4()->toString();
            $user->level = $faker->randomElement($levels);
            $user->company = $faker->randomElement($companies->toArray());
            $user->name = $faker->firstName . ' ' . $faker->lastName;
            $user->email = $faker->safeEmail;
            $user->password = Hash::make($user->email);
            $user->locale = (object) ['lang' => 'id', 'date_format' => 'DD MMMM yyyy HH:mm:ss'];
            $user->saveOrFail();
            $this->command->getOutput()->progressAdvance();
        }
        $this->command->getOutput()->progressFinish();

        $users = User::all();
        $this->command->line("fix date format");
        $this->command->getOutput()->progressStart($users->count());
        foreach ($users as $user) {
            $user->locale = (object) ['lang' => 'id', 'date_format' => 'DD MMMM yyyy HH:mm:ss'];
            $user->saveOrFail();
            $this->command->getOutput()->progressAdvance();
        }
        $this->command->getOutput()->progressFinish();
    }
}
