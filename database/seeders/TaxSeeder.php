<?php

namespace Database\Seeders;

use App\Models\Tax;
use Illuminate\Database\Seeder;
use Ramsey\Uuid\Uuid;

class TaxSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $requests  = collect();
        $requests->push((object) [
            'code' => 'PPN', 'name' => 'Pajak Penambahan Nilai 11%', 'percent' => 11,
        ]);
        $requests->push((object) [
            'code' => 'PPH', 'name' => 'Pajak Penghasilan', 'percent' => 5,
        ]);
        $this->command->getOutput()->progressStart($requests->count());
        foreach ($requests as $request) {
            $pajak = Tax::where('code', $request->code)->first();
            if ($pajak == null) {
                $pajak = new Tax();
                $pajak->id = Uuid::uuid4()->toString();
                $pajak->code = $request->code;
                $pajak->name = $request->name;
                $pajak->percent = $request->percent;
                $pajak->saveOrFail();
            }
            $this->command->getOutput()->progressAdvance();
        }
        $this->command->getOutput()->progressFinish();
    }
}
