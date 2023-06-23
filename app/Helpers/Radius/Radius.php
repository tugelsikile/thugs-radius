<?php

namespace App\Helpers\Radius;

use App\Models\Company\ClientCompany;
use App\Models\Nas\Nas;
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
                }
            }
        }
    }
}
