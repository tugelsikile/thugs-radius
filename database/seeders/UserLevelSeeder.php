<?php

namespace Database\Seeders;

use App\Models\User\UserLevel;
use Illuminate\Database\Seeder;
use Ramsey\Uuid\Uuid;

class UserLevelSeeder extends Seeder
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
            'name' => 'Super Admin', 'description' => 'Super admin privilege', 'super' => true, 'is_default' => true, 'for_client' => false,
        ]);
        $dumps->push((object) [
            'name' => 'Billing', 'description' => 'Billing', 'super' => false, 'is_default' => true, 'for_client' => false,
        ]);
        $dumps->push((object) [
            'name' => 'Admin', 'description' => 'Admin', 'super' => false, 'is_default' => true, 'for_client' => true,
        ]);
        $dumps->push((object) [
            'name' => 'Operator', 'description' => 'Operator Clients', 'super' => false, 'is_default' => true, 'for_client' => true,
        ]);
        $dumps->push((object) [
            'name' => 'Customer', 'description' => 'Customer Clients', 'super' => false, 'is_default' => true, 'for_client' => true,
        ]);
        $this->command->getOutput()->progressStart($dumps->count());
        foreach ($dumps as $dump) {
            $level = UserLevel::where('name', $dump->name)->first();
            if ($level == null) {
                $level = new UserLevel();
                $level->id = Uuid::uuid4()->toString();
            }
            $level->name = $dump->name;
            $level->description = $dump->description;
            $level->super = $dump->super;
            $level->is_default = $dump->is_default;
            $level->for_client = $dump->for_client;
            $level->saveOrFail();
            $this->command->getOutput()->progressAdvance();
        }
        $this->command->getOutput()->progressFinish();
    }
}
