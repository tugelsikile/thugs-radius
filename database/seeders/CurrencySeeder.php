<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;
use Ramsey\Uuid\Uuid;
use Throwable;

class CurrencySeeder extends Seeder
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
        $requests->push((object) [
            'code' => 'IDR', 'name' => 'Indonesia Rupiah', 'symbols' => 'Rp.', 'exchange_rate' => 0.0000067, 'prefix' => true,
        ]);
        $requests->push((object) [
            'code' => 'USD', 'name' => 'United States Dollar', 'symbols' => '$', 'exchange_rate' => 1, 'prefix' => true,
        ]);
        $requests->push((object) [
            'code' => 'RM', 'name' => 'Malaysia Ringgit', 'symbols' => 'RM', 'exchange_rate' => 0.00031, 'prefix' => true,
        ]);
        $this->command->getOutput()->progressStart($requests->count());
        foreach ($requests as $request) {
            $currency = Currency::where('code', $request->code)->first();
            if ($currency == null) {
                $currency = new Currency();
                $currency->id = Uuid::uuid4()->toString();
                $currency->code = $request->code;
                $currency->name = $request->name;
                $currency->symbols = $request->symbols;
                $currency->prefix = $request->prefix;
            }
            $currency->exchange_rate = $request->exchange_rate;
            $currency->saveOrFail();
            $this->command->getOutput()->progressAdvance();
        }
        $this->command->getOutput()->progressFinish();
    }
}
