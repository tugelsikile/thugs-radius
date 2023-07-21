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
                    } elseif ($level->name == 'Admin'  && $level->for_client && $level->is_default) {
                        if ($menu->for_client) {
                            $privilege->read = true;
                            $privilege->create = true;
                            $privilege->update = true;
                            $privilege->delete = true;
                        }
                    } elseif ($level->name == 'Billing' && ! $level->for_client && $level->is_default) {
                        if (! $menu->for_client) {
                            switch ($menu->route) {
                                case 'auth.clients':
                                case 'auth.clients.packages':
                                case 'auth.configs':
                                    $privilege->read = true;
                                    $privilege->create = false;
                                    $privilege->update = false;
                                    $privilege->delete = false;
                                    break;
                                case 'auth.clients.invoices':
                                case 'auth.clients.invoices.payments':
                                case 'auth.configs.discounts':
                                case 'auth.configs.taxes':
                                    $privilege->read = true;
                                    $privilege->create = true;
                                    $privilege->update = true;
                                    $privilege->delete = false;
                                    break;
                            }
                        }
                    } elseif ($level->name == 'Operator' && $level->for_client && $level->is_default) {
                        if ($menu->for_client) {
                            switch ($menu->route) {
                                case 'clients.nas':
                                case 'clients.nas.select':
                                case 'clients.nas.pools':
                                case 'clients.nas.bandwidths':
                                case 'clients.nas.profiles':
                                case 'clients.customers':
                                case 'clients.customers.pppoe':
                                case 'clients.customers.hotspot':
                                case 'clients.olt':
                                case 'clients.olt.customers.connect':
                                case 'clients.olt.gpon.un_configure':
                                    $privilege->read = true;
                                    $privilege->create = true;
                                    $privilege->update = true;
                                    $privilege->delete = false;
                                    break;
                                case 'clients.customers.invoices':
                                    $privilege->read = true;
                                    $privilege->create = false;
                                    $privilege->update = false;
                                    $privilege->delete = false;
                                    break;
                            }
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
