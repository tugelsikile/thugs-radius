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
            'name' => 'Client', 'route' => 'auth.clients', 'description' => 'Client radius', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-building', 'lang' => 'messages.company.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Package', 'route' => 'auth.clients.packages', 'description' => 'Package for client radius', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-file-contract', 'lang' => 'messages.company.packages.labels.menu' ],
                (object) [ 'name' => 'Invoice', 'route' => 'auth.clients.invoices', 'description' => 'Invoice for client radius', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-file-invoice-dollar', 'lang' => 'messages.company.invoice.labels.menu'],
                (object) [ 'name' => 'Invoice Payment', 'route' => 'auth.clients.invoices.payments', 'description' => 'Payment Invoice for client radius', 'function' => true, 'for_client' => false, 'icon' => 'fas fa-cash-register', 'lang' => 'messages.company.invoice.labels.payment' ],
            ])
        ]);
        $requests->push((object) [
            'name' => 'User', 'route' => 'auth.users', 'description' => 'Users for client radius', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-user-secret', 'lang' => 'messages.users.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Privilege', 'route' => 'auth.users.privileges', 'description' => 'Manage Privileges for users client radius', 'function' => false, 'for_client' => false, 'icon' => 'fas fa-user-shield', 'lang' => 'messages.privileges.labels.menu' ],
            ])
        ]);
        $requests->push((object) [
            'name' => 'Router [NAS]', 'route' => 'clients.routerboards', 'description' => 'Manage routerboards', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-server', 'lang' => 'routerboards.main.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Pilih Routerboard', 'route' => 'clients.routerboards.select', 'description' => 'Select routerboards to manage', 'function' => true, 'for_client' => true, 'icon' => 'fas fa-hand-pointer', 'lang' => 'routerboards.select.labels.menu' ]
            ])
        ]);
        $requests->push((object) [
            'name' => 'Customer PPPoE', 'route' => 'clients.customers', 'description' => 'Manage customers', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-user-tie', 'lang' => 'customers.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Customer PPPoE', 'route' => 'clients.customers.pppoe', 'description' => 'Manage customer pppoe', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-ticket-alt', 'lang' => 'customers.pppoe.labels.menu'],
                (object) [ 'name' => 'Customer Hotspot', 'route' => 'clients.customers.hotspot', 'description' => 'Manage customer hotspot', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-ticket-alt', 'lang' => 'customers.hotspot.labels.menu'],
                (object) [ 'name' => 'Tagihan', 'route' => 'clients.customers.invoices', 'description' => 'Manage invoice', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-file-invoice', 'lang' => 'customers.invoice.labels.menu'],
                (object) [ 'name' => 'Pembayaran Tagihan', 'route' => 'clients.customers.invoices.payment', 'description' => 'Paid customer invoice', 'function' => true, 'for_client' => true, 'icon' => 'fas fa-cash-register', 'lang' => 'customers.invoice.payment.labels.menu'],
            ]),
        ]);
        $requests->push((object) [
            'name' => 'User', 'route' => 'clients.users', 'description' => 'Manage users clients', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-user-secret', 'lang' => 'messages.users.labels.menu',
            'childrens' => collect([
                (object) [ 'name' => 'Privileges', 'route' => 'clients.users.privileges', 'description' => 'Manage users privileges', 'function' => false, 'for_client' => true, 'icon' => 'fas fa-user-shield', 'lang' => 'messages.privileges.labels.menu' ]
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
