<?php

namespace Database\Seeders;

use App\Models\Menu\Menu;
use App\Models\User\UserLevel;
use App\Models\User\UserPrivilege;
use Illuminate\Database\Seeder;
use Ramsey\Uuid\Uuid;

class UserPrivilegeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $menus = Menu::all();
        $levels = UserLevel::all();

        foreach ($levels as $level) {
            $this->command->line("Seed privilege for " . $level->name);
            $this->command->getOutput()->progressStart($menus->count());
            foreach ($menus as $menu) {
                $privilege = UserPrivilege::where('level', $level->id)->where('route', $menu->route)->first();
                if ($privilege == null) {
                    $privilege = new UserPrivilege();
                    $privilege->id = Uuid::uuid4()->toString();
                    $privilege->level = $level->id;
                    $privilege->route = $menu->route;
                    /*$privilege->read = false;
                    $privilege->create = false;
                    $privilege->update = false;
                    $privilege->delete = false;*/
                    if ($level->super) {
                        if ($menu->for_client) {
                            $privilege->read = false;
                            $privilege->create = false;
                            $privilege->update = false;
                            $privilege->delete = false;
                        } else {
                            $privilege->read = true;
                            $privilege->create = true;
                            $privilege->update = true;
                            $privilege->delete = true;
                        }
                    } else {
                        if ($level->for_client) {
                            if ($menu->for_client) {
                                $privilege->read = false;
                                $privilege->create = false;
                                $privilege->update = false;
                                $privilege->delete = false;
                            }
                        }
                    }
                    $privilege->saveOrFail();
                }
                $this->command->getOutput()->progressAdvance();
            }
            $this->command->getOutput()->progressFinish();
        }
    }
}
