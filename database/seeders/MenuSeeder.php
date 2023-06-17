<?php /** @noinspection PhpUndefinedMethodInspection */

/** @noinspection SpellCheckingInspection */

namespace Database\Seeders;

use App\Models\Menu\Menu;
use Illuminate\Database\Seeder;
use Ramsey\Uuid\Uuid;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $routes = collect();
        $requests = collect();
        $requests->push((object) [
            'name' => 'Client', 'route' => 'auth.clients', 'description' => 'companies.labels.menu_info', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-building', 'lang' => 'companies.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Package', 'route' => 'auth.clients.packages', 'description' => 'companies.packages.labels.menu_info', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-archive', 'lang' => 'companies.packages.labels.menu' ],
                (object) [ 'name' => 'Invoice', 'route' => 'auth.clients.invoices', 'description' => 'companies.invoices.labels.menu_info', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-file-invoice-dollar', 'lang' => 'companies.invoices.labels.menu'],
                (object) [ 'name' => 'Invoice Payment', 'route' => 'auth.clients.invoices.payments', 'description' => 'companies.invoices.payments.labels.menu_info', 'function' => true, 'for_client' => false, 'icon' => 'fas fa-cash-register', 'lang' => 'companies.invoices.payments.labels.menu' ],
            ])
        ]);
        $requests->push((object) [
            'name' => 'User', 'route' => 'auth.users', 'description' => 'users.labels.menu_info', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-user-secret', 'lang' => 'users.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Privilege', 'route' => 'auth.users.privileges', 'description' => 'users.privileges.labels.menu_info', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-user-shield', 'lang' => 'users.privileges.labels.menu' ],
                (object) [ 'name' => 'Reset Password', 'route' => 'auth.users.reset-password', 'description' => 'users.resets.labels.menu_info', 'function' => true, 'for_client' => false, 'icon' => 'fas fa-key', 'lang' => 'users.resets.labels.menu' ]
            ])
        ]);
        $requests->push((object) [
            'name' => 'Config', 'route' => 'auth.configs', 'description' => 'configs.labels.menu_info', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-tools', 'lang' => 'configs.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Diskon / Promo', 'route' => 'auth.configs.discounts', 'description' => 'discounts.labels.menu_info', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-tags', 'lang' => 'discounts.labels.menu' ],
                (object) [ 'name' => 'Pajak', 'route' => 'auth.configs.taxes', 'description' => 'taxes.labels.menu_info', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-wallet', 'lang' => 'taxes.labels.menu' ],
                (object) [ 'name' => 'Mata Uang', 'route' => 'auth.configs.currencies', 'description' => 'currencies.labels.menu_info', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-money-bill', 'lang' => 'currencies.labels.menu' ],
                (object) [ 'name' => 'Timezone', 'route' => 'auth.configs.timezones', 'description' => 'timezones.labels.menu_info', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-atlas', 'lang' => 'timezones.labels.menu' ],
            ])
        ]);

        $requests->push((object) [
            'name' => 'Router [NAS]', 'route' => 'clients.nas', 'description' => 'nas.labels.menu_info', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-server', 'lang' => 'nas.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Pilih Routerboard', 'route' => 'clients.nas.select', 'description' => 'nas.select.labels.menu_info', 'function' => true, 'for_client' => true, 'icon' => 'fas fa-hand-pointer', 'lang' => 'nas.select.labels.menu' ],
                (object) [ 'name' => 'Pool', 'route' => 'clients.nas.pools', 'description' => 'nas.pools.labels.menu_info', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-poll-h', 'lang' => 'nas.pools.labels.menu' ],
                (object) [ 'name' => 'Bandwidth', 'route' => 'clients.nas.bandwidths', 'description' => 'bandwidths.labels.menu_info', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-wifi', 'lang' => 'bandwidths.labels.menu' ],
                (object) [ 'name' => 'Profile', 'route' => 'clients.nas.profiles', 'description' => 'profiles.labels.menu_info', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-concierge-bell', 'lang' => 'profiles.labels.menu' ],
            ])
        ]);
        $requests->push((object) [
            'name' => 'Customer', 'route' => 'clients.customers', 'description' => 'customers.labels.menu_info', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-user-tie', 'lang' => 'customers.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Customer PPPoE', 'route' => 'clients.customers.pppoe', 'description' => 'customers.pppoe.labels.menu_info', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-ticket-alt', 'lang' => 'customers.pppoe.labels.menu'],
                (object) [ 'name' => 'Customer Hotspot', 'route' => 'clients.customers.hotspot', 'description' => 'customers.hotspot.labels.menu_info', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-ticket-alt', 'lang' => 'customers.hotspot.labels.menu'],
                (object) [ 'name' => 'Tagihan', 'route' => 'clients.customers.invoices', 'description' => 'customers.invoices.labels.menu_info', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-file-invoice', 'lang' => 'customers.invoices.labels.menu'],
                (object) [ 'name' => 'Pembayaran Tagihan', 'route' => 'clients.customers.invoices.payment', 'description' => 'customers.invoices.payments.labels.menu_info', 'function' => true, 'for_client' => true, 'icon' => 'fas fa-cash-register', 'lang' => 'customers.invoices.payments.labels.menu'],
            ]),
        ]);
        $requests->push((object) [
            'name' => 'User', 'route' => 'clients.users', 'description' => 'users.labels.menu_info', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-user-secret', 'lang' => 'users.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Privileges', 'route' => 'clients.users.privileges', 'description' => 'users.privileges.labels.menu_info', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-user-shield', 'lang' => 'users.privileges.labels.menu' ],
                (object) [ 'name' => 'Reset Password', 'route' => 'clients.users.reset-password', 'description' => 'users.resets.labels.menu_info', 'function' => true, 'for_client' => true, 'icon' => 'fas fa-key', 'lang' => 'users.resets.labels.menu' ]
            ])
        ]);
        $requests->push((object) [
            'name' => 'Config', 'route' => 'clients.configs', 'description' => 'Konfigurasi', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-cog', 'lang' => 'configs.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Diskon', 'route' => 'clients.configs.discounts', 'description' => 'Manage Diskon', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-tags', 'lang' => 'discounts.labels.menu' ],
                (object) [ 'name' => 'Pajak', 'route' => 'clients.configs.taxes', 'description' => 'Manage Jenis Pajak', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-tags', 'lang' => 'taxes.labels.menu' ],
            ])
        ]);

        $this->command->getOutput()->progressStart($requests->count());
        foreach ($requests as $order => $request) {
            $menu = Menu::where('route', $request->route)->first();
            $routes->push($request->route);
            if ($menu == null) {
                $menu = new Menu();
                $menu->id = Uuid::uuid4()->toString();
            }
            $menu->icon = $request->icon;
            $menu->route = $request->route;
            $menu->order = $order;
            $menu->name = $request->name;
            $menu->description = $request->description;
            $menu->function = $request->function;
            $menu->for_client = $request->for_client;
            $menu->lang = $request->lang;
            $menu->saveOrFail();

            foreach ($request->childrens as $orderChild => $children) {
                $routes->push($children->route);
                $menuChildren = Menu::where('route', $children->route)->first();
                if ($menuChildren == null) {
                    $menuChildren = new Menu();
                    $menuChildren->id = Uuid::uuid4()->toString();
                }
                $menuChildren->icon = $children->icon;
                $menuChildren->order = $orderChild;
                $menuChildren->parent = $menu->id;
                $menuChildren->name = $children->name;
                $menuChildren->route = $children->route;
                $menuChildren->description = $children->description;
                $menuChildren->function = $children->function;
                $menuChildren->for_client = $children->for_client;
                $menuChildren->lang = $children->lang;
                $menuChildren->saveOrFail();
            }
            $this->command->getOutput()->progressAdvance();
        }
        $this->command->getOutput()->progressFinish();

        $this->command->line("Clearing unused menu");
        Menu::whereNotIn('route', $routes->toArray())->delete();
    }
}
