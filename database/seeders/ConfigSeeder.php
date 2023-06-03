<?php

namespace Database\Seeders;

use App\Models\Config;
use Illuminate\Database\Seeder;
use Ramsey\Uuid\Uuid;

class ConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $dumps = collect();
        $dumps->push((object)[
            'name' => 'site',
            'description' => (object) [
                'name' => 'Radius Server', 'description' => 'Custom Radius Server', 'phone' => '+62 8531 5705 411',
                'email' => 'reyang19@gmail.com', 'address' => 'Blok Anjun RT. 001/010',
                'village' => 3212212006,
                'district' => 321221,
                'city' => 3212,
                'province' => 32,
                'postal' => 45254,
            ]
        ]);
        $this->command->getOutput()->progressStart($dumps->count());
        foreach ($dumps as $dump) {
            $config = Config::where('name', $dump->name)->first();
            if ($config == null) {
                $config = new Config();
                $config->id = Uuid::uuid4()->toString();
                $config->name = $dump->name;
                $config->description = $dump->description;
                $config->saveOrFail();
            }
            $this->command->getOutput()->progressAdvance();
        }
        $this->command->getOutput()->progressFinish();
    }
}
