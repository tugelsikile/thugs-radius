<?php

namespace App\Helpers\Radius;

use App\Helpers\MikrotikAPI;
use App\Models\Company\ClientCompany;
use App\Models\Customer\Customer;
use App\Models\Nas\Nas;
use DivineOmega\SSHConnection\SSHConnection;
use Exception;
use Illuminate\Support\Str;
use phpseclib3\Net\SSH2;

class Radius
{
    public $nas;
    protected $me;
    protected $company;
    protected $radius_server;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
        if ($this->me != null) {
            if (!empty($this->me->companyObj)) {
                $this->company = $this->me->companyObj;
            }
        }
    }
    public function setNas(Nas $nas = null) {
        $this->nas = $nas;
    }
    public function getNas() {
        return $this->nas;
    }

    /* @
     * @param ClientCompany|null $company
     * @configParams object ['host' => 'hostname', 'user' => 'username', 'pass' => 'password', 'port' => 22, 'daemon' => 'daemon radius' ]
     * @return void
     */
    public function restartRadiusService(ClientCompany $company = null) {
        try {
            if ($company != null) {
                if (property_exists($company->config,'radius')) {
                    $config = $company->config->radius;
                    if (property_exists($config,'host') &&
                        property_exists($config,'user') &&
                        property_exists($config,'pass') &&
                        property_exists($config,'port') &&
                        property_exists($config,'daemon')
                    ) {
                        $ssh = new SSH2($config->host, $config->port);
                        $ssh->login($config->user, $config->pass);
                        $command = "service " . $config->daemon . " restart";
                        $ssh->exec($command);
                        $ssh->disconnect();
                        return;
                    }
                }
            }
        } catch (Exception $exception) {
            return null;
        }
    }

    /* @
     * @param ClientCompany|null $company
     * @return object|null
     */
    public function statusRadiusServerService(ClientCompany $company = null): ?object
    {
        try {
            $response = null;
            if ($company != null) {
                if (!empty($company->config)) {
                    if (property_exists($company->config,'radius')) {
                        $config = $company->config->radius;
                        if (property_exists($config,'host') &&
                            property_exists($config,'user') &&
                            property_exists($config,'pass') &&
                            property_exists($config,'port') &&
                            property_exists($config,'daemon')
                        ) {
                            $connection = (new SSHConnection())
                                ->to($config->host)
                                ->onPort($config->port)
                                ->as($config->user)
                                ->withPassword($config->pass)
                                ->connect();
                            if ($connection->isConnected()) {
                                $response = (object) ['active' => false, 'message' => '' ];
                                $cmd = "service " . $config->daemon . " status";
                                $command = $connection->run($cmd);
                                if (Str::contains($command->getOutput(),"active (running)")) {
                                    $response->active = true;
                                }
                                $response->message = $command->getOutput();
                            }
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            return null;
        }
    }
    public function startRadiusServerService(ClientCompany $company) {
        try {
            $response = null;
            if ($company != null) {
                if (!empty($company->config)) {
                    if (property_exists($company->config,'radius')) {
                        $config = $company->config->radius;
                        if (property_exists($config,'host') &&
                            property_exists($config,'user') &&
                            property_exists($config,'pass') &&
                            property_exists($config,'port') &&
                            property_exists($config,'daemon')
                        ) {
                            $connection = (new SSHConnection())
                                ->to($config->host)
                                ->onPort($config->port)
                                ->as($config->user)
                                ->withPassword($config->pass)
                                ->connect();
                            if ($connection->isConnected()) {
                                $response = (object) ['active' => false, 'message' => '' ];
                                $cmd = "service " . $config->daemon . " start";
                                $command = $connection->run($cmd);
                                if (Str::contains($command->getOutput(),"active (running)")) {
                                    $response->active = true;
                                }
                                $response->message = $command->getOutput();
                            }
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function stopRadiusServerService(ClientCompany $company) {
        try {
            $response = null;
            if ($company != null) {
                if (!empty($company->config)) {
                    if (property_exists($company->config,'radius')) {
                        $config = $company->config->radius;
                        if (property_exists($config,'host') &&
                            property_exists($config,'user') &&
                            property_exists($config,'pass') &&
                            property_exists($config,'port') &&
                            property_exists($config,'daemon')
                        ) {
                            $connection = (new SSHConnection())
                                ->to($config->host)
                                ->onPort($config->port)
                                ->as($config->user)
                                ->withPassword($config->pass)
                                ->connect();
                            if ($connection->isConnected()) {
                                $response = (object) ['active' => false, 'message' => '' ];
                                $cmd = "service " . $config->daemon . " stop";
                                $command = $connection->run($cmd);
                                if (Str::contains($command->getOutput(),"active (running)")) {
                                    $response->active = true;
                                }
                                $response->message = $command->getOutput();
                            }
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function kickOnlinePPPoE(Customer $customer) {
        try {
            $nas = $customer->nasObj;
            if ($nas != null) {
                switch ($nas->method) {
                    case 'api':
                        (new MikrotikAPI($nas))->kickOnlinePPPoE($customer);
                        break;
                    case 'ssl':
                        break;
                }
            }
            return;
        } catch (Exception $exception) {
            return;
        }
    }
    public function kickOnlineHostpot(Customer $customer) {
        try {
            $nas = $customer->nasObj;
            if ($nas != null) {
                switch ($nas->method) {
                    case 'api':
                        (new MikrotikAPI($nas))->kickOnlineHostpot($customer);
                        break;
                    case 'ssl':
                        break;
                }
            }
            return;
        } catch (Exception $exception) {
            return;
        }
    }
    public function kickOnlineUser(Customer $customer) {
        try {
            switch ($customer->method_type) {
                case 'pppoe':
                    $this->kickOnlinePPPoE($customer);
                    break;
                case 'hotspot':
                    $this->kickOnlineHostpot($customer);
                    break;
            }
            return;
        } catch (Exception $exception) {
            return;
        }
    }
}
