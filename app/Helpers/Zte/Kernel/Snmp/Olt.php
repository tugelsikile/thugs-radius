<?php
namespace App\Helpers\Zte\Kernel\Snmp;
use App\Helpers\Zte\Kernel\Interfaces\Olt as OltInterface;

/**
 * @ This class work with only zte olt
 * @author Xeleniumz Fx
 * @version 1.1
 * @date 2/3/2017
 * */
class Olt implements OltInterface
{
	private $olt_name = '1.3.6.1.2.1.1.5.0';
	private $snmp_get_octet  = '1.3.6.1.2.1.2.2.1.1';
	private $gpon_name ='1.3.6.1.2.1.2.2.1.2';
	private $gpon_status = '1.3.6.1.2.1.2.2.1.8';
	private $gpon_uptime = '1.3.6.1.2.1.1.3.0';
	private $community = 'public';


	public function __construct()
	{
		$this->olt_name = '1.3.6.1.2.1.1.5.0';
		$this->snmp_get_octet  = '1.3.6.1.2.1.2.2.1.1';
		$this->gpon_name ='1.3.6.1.2.1.2.2.1.2';
		$this->gpon_status = '1.3.6.1.2.1.2.2.1.8';
		$this->gpon_uptime = '1.3.6.1.2.1.1.3.0';
		$this->community = 'public';

	}
    public function setCommunity(string $communityName) : void
    {
        $this->community = $communityName;
    }
    public function getCommunity(): string
    {
        return $this->community;
    }
	public function getOltName($ip) :string
	{
		$name = snmp2_walk($ip, $this->community, $this->olt_name);
        if (is_array($name)) {
            if (count($name) > 0) $name = $name[0];
        }
		return $name;
	}

	public function getOltId($ip) :int
	{
		$id = snmp2_walk($ip, $this->community, $this->snmp_get_octet);
		return $id;
	}

	public function getOltSolt($ip,$id) :array
	{
		$data = $this->gpon_name.'.'.$id;
		$rs = snmpwalk($ip,$this->community,$data);
		return $rs;
	}

	public function getOltStatus($ip,$id,$check=FALSE) :string
	{
		if($check == TRUE){
			$data = $this->gpon_status.'.'.$id;
			$rs = snmpwalk($ip,$this->community,$data);
			$rs = explode(' ', $rs[0]);
			return $rs[1];
		}else{
			$data = $this->gpon_status.'.'.$id;
			$rs = snmpwalk($ip,$this->community,$data);
			$rs = explode(' ', $rs[0]);
			$res = ($rs[1] == '1') ? 'ONLINE':'OFFLINE';
			return $res;
		}
	}

	public function checkGpon($val) :string
	{
		$v = explode('"', $val);
		$g = explode('_', $v[1]);

		$rs['chk'] = ($g[0] == 'gpon') ? TRUE:FALSE;
		$rs['gpon'] = $v[1];
		return $rs;
	}

	public function getUptime($ip) :string
	{
        $response = "";
		$uptime = collect(snmp2_walk($ip,$this->community,$this->gpon_uptime));
        if (collect($uptime)->count() > 0) {
            $response = str_replace('Timeticks: ','', $uptime->first());
        }
		return $response;
	}


}
