<?php
namespace App\Helpers\Zte\Kernel\Snmp;
use App\Helpers\Zte\Kernel\Interfaces\Onu as OnuInterface;
use Illuminate\Support\Str;

/**
 * @ This class work with only zte olt
 * @author Xeleniumz Fx
 * @version 1.1
 * @date 2/3/2017
 * */

class Onu implements OnuInterface
{
	private $onu_no;
	private $onu_customer_circuit;
	private $onu_type;
	private $onu_mac;
	private $onu_status;
	private $community;
    private $if_num;
    private $if_name;
    private $interface_table;
    private $optical_power;

	public function __construct()
	{
        $this->if_name                 = '1.3.6.1.2.1.31.1.1.1.1';
        $this->if_num                   = '1.3.6.1.2.1.2.1'; //interface number
        $this->onu_no                   = '1.3.6.1.4.1.3902.1012.3.28.1.1.6';
        $this->onu_customer_circuit     = '1.3.6.1.4.1.3902.1012.3.28.1.1.2';
        $this->onu_type                 = '1.3.6.1.4.1.3902.1012.3.28.1.1.1';
        $this->onu_mac                  = '1.3.6.1.4.1.3902.1012.3.28.1.1.5';
        $this->onu_status               = '1.3.6.1.4.1.3902.1012.3.28.2.1.4';
        $this->community                = 'public';
        $this->optical_power            = '1.3.6.1.4.1.3902.1082.500.40.1.1.1.1';
	}
    public function getRxOpticPower($ip): array
    {
        $arr = snmp2_walk($ip, $this->community, $this->optical_power);
        dd($arr);
        if (collect($arr)->count() > 0) {
            $res = collect();
            foreach (collect($arr) as $item) {
                $res->push(str_replace('"','',str_replace('integer: ','',strtolower($item))));
            }
            return $res->toArray();
        }
        return [];
    }
    public function getInterfaceTable($ip) {
        $arr = snmp2_walk($ip, $this->community, $this->interface_table);
        dd($arr);
    }
    public function setCommunity(string $communityName) : void
    {
        $this->community = $communityName;
    }
    public function getCommunity(): string
    {
        return $this->community;
    }
    public function getInterfaceNames($ip): array
    {
        $arr = snmp2_real_walk($ip, $this->community, $this->if_name);
        if (collect($arr)->count() > 0) {
            $res = collect();
            foreach (collect($arr) as $item) {
                $res->push(str_replace('"','',str_replace('string: ','',strtolower($item))));
            }
            return $res->toArray();
        }
        return [];
    }
    public function getInterfaceNumber($ip): int
    {
        $arr = snmp2_real_walk($ip, $this->community, $this->if_num);
        if ($arr != null) {
            $arr = collect($arr);
            if ($arr->count() > 0) {
                $arr = str_replace('integer: ','',strtolower($arr->first()));
                return (int) $arr;
            }
        }
        return 0;
    }
	public function getOnu($ip,$index) //index adalah nomor port
	{
        $response = null;
		$index_olt = $index;
		$arr = snmprealwalk($ip, $this->community,$this->onu_no);
		$key ='';
		$j=1;
		foreach($arr as $k => $v){
            if (Str::contains($k,"SNMPv2-SMI::enterprises.")) {
                $k = str_replace("SNMPv2-SMI::enterprises.","1.3.6.1.4.1.", $k);
            }
			$i = explode('.', $k);
			$index = $i[13];
			if($key != $index){
				$key = $index;
				$value[$j] = $key;
				if($j == $index_olt){
					//return $value[$j];
                    $response = $value[$j];
					break;
				}
				$j++;
			}
		}
        return $response;
	}

	public function getCustomerCircuit($ip,$gpon_id) :array
	{
		$val = $this->onu_customer_circuit.'.'.$gpon_id;
		$arr = snmpwalk($ip, $this->community,$val);
		return $arr;
	}

	public function getCustomerOnuType($ip,$gpon_id) :array
	{
		$val = $this->onu_type.'.'.$gpon_id;
		$arr = snmpwalk($ip, $this->community,$val);
		return $arr;
	}

	public function getCustomerOnuMac($ip,$gpon_id) :array
	{
		$val = $this->onu_mac.'.'.$gpon_id;
		$arr = snmpwalk($ip, $this->community,$val);
		return $arr;
	}

	public function getCustomerStatus($ip,$gpon_id) :array
	{
		$rs = $this->onu_status.'.'.$gpon_id;
		$arr = snmpwalk($ip, $this->community,$rs);
		$res = array();
		foreach($arr as $v){
			$val = explode(':', $v);
			if($val[1] == '1')
				$status='Lost';
			elseif($val[1] == '3')
				$status='Online';
			elseif($val[1] == '4')
				$status='Dying Gasp';
			elseif($val[1] == '6')
				$status='Offline';
			array_push($res,$status);
		}
		return $res;
	}

	public function getClientCircuit($ip,$cus_circuit_no) :array
	{
		$rs = snmprealwalk($ip,$this->community,$this->onu_customer_circuit);
		foreach($rs as $k => $r){
			$circuit = explode('"',$r);
			if($circuit[1] == $cus_circuit_no){
				//echo $k .'=>'.$circuit[1].'<br/>';
				$key = explode('.', $k);
				return  $key[13].'.'.$key[14];
				break;
			}
		}
	}

	public function getClientStatus($ip,$onu_circuit_index) :array
	{

		$rs = snmprealwalk($ip,$this->community,$this->onu_status);
		foreach ($rs as $k => $v) {
			$key = explode('.', $k);
			$onu_status_index = $key[13].'.'.$key[14];
			if($onu_circuit_index == $onu_status_index){
				$val = explode(':',$v);
				break;
			}
		}
			if($val[1] == '1')
				$status='Lost';
			elseif($val[1] == '3')
				$status='Online';
			elseif($val[1] == '4')
				$status='Dying Gasp';
			elseif($val[1] == '6')
				$status='Offline';

		return $status;
	}

}
