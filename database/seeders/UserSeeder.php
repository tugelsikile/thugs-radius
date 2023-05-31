<?php

namespace Database\Seeders;

use App\Models\User\User;
use App\Models\User\UserLevel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Ramsey\Uuid\Uuid;

class UserSeeder extends Seeder
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
            'name' => 'Super Admin', 'email' => 'super@admin.com', 'password' => 'P4ssw0rd', 'level' => UserLevel::where('name','Super Admin')->first()->id,
        ]);
        $dumps->push((object) [
            'name' => 'Billing', 'email' => 'billing@admin.com', 'password' => 'P4ssw0rd', 'level' => UserLevel::where('name', 'Billing')->first()->id,
        ]);
        $this->command->getOutput()->progressStart($dumps->count());
        foreach ($dumps as $dump) {
            $user = User::where('email', $dump->email)->first();
            if ($user == null) {
                $user = new User();
                $user->id = Uuid::uuid4()->toString();
                $user->email = $dump->email;
                $user->password = Hash::make($dump->password);
            }
            $user->name = $dump->name;
            $user->level = $dump->level;
            $user->locale = (object) ['lang' => 'id', 'date_format' => 'DD/MM/yyyy HH:mm:ss', 'time_zone' => 'Asia/Jakarta'];
            $user->saveOrFail();
            $this->command->getOutput()->progressAdvance();
        }
        $this->command->getOutput()->progressFinish();
    }
}
