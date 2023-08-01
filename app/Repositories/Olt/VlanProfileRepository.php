<?php

namespace App\Repositories\Olt;

use App\Helpers\OLT\ZTE\C320;
use App\Helpers\SwitchDB;
use App\Helpers\Telnet\Telnet;
use App\Models\Olt\Olt;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class VlanProfileRepository
{
    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function crudManagement(Request $request): Collection
    {
        try {
            $response = collect();
            $olt = Olt::where('id', $request[__('olt.form_input.id')])->first();
            if ($olt != null) {
                $responseTelnet = (new C320($olt))->showGPonOnuProfileVLan();
                if ($responseTelnet != null) {
                    $response = $responseTelnet;
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function table(Request $request): Collection
    {
        try {
            $response = collect();
            new SwitchDB();
            $olt = Olt::where('id', $request[__('olt.form_input.id')])->first();
            $telnet = new Telnet($olt->hostname, $olt->port, 5,"");
            $telnet->setLoginPrompt("Username:");
            if ($olt->configs != null) {
                if (property_exists($olt->configs,'prompts')) {
                    if (property_exists($olt->configs->prompts,'user_prompt')) {
                        $telnet->setLoginPrompt($olt->configs->prompts->user_prompt);
                        if (property_exists($olt->configs->prompts,'pas_prompt')) {
                            $telnet->setLoginPrompt($olt->configs->prompts->user_prompt, $olt->configs->prompts->pas_prompt);
                        }
                    }
                }
            }
            $telnet->login($olt->user, $olt->pass);
            $breakCounters = 0;
            $commands = "\n";
            $responseCommands = "";
            for ($index = 0; $index < 3; $index++) {
                if ($index == 0) {
                    $responseCommands .= $telnet->exec("show vlan summary");
                } else {
                    if ($breakCounters < 3) {
                        $commands .= "  " . str_replace("\n","", $commands);
                        $curResponse = str_replace("\x08","",str_replace("--More--","",$telnet->exec($commands)));
                        if (strlen($curResponse) > 20) {
                            $responseCommands .= $curResponse;
                        } else {
                            $breakCounters++;
                        }
                    }
                }
            }
            $responseCommands = explode("\n", $responseCommands);
            if (count($responseCommands) > 0) {
                foreach ($responseCommands as $key => $responseCommand) {
                    if (strlen($responseCommand) < 3) {
                        unset($responseCommands[$key]);
                    } elseif (Str::contains($responseCommand,"All created vlan num")) {
                        unset($responseCommands[$key]);
                    } elseif (Str::contains($responseCommand,"Details are following:")) {
                        unset($responseCommands[$key]);
                    } else {
                        $responseCommands[$key] = trim($responseCommand);
                    }
                }
                $responseCommands = array_values($responseCommands);
                if (count($responseCommands) == 1) {
                    $responseCommands = $responseCommands[0];
                    $responseCommands = explode(",",$responseCommands);
                    if (count($responseCommands) > 0) {
                        foreach ($responseCommands as $responseCommand) {
                            if (Str::contains($responseCommand,"-")) {
                                $lines = explode("-",$responseCommand);
                                if (count($lines) == 2) {
                                    $first = (int) $lines[0];
                                    $last = (int) $lines[1];
                                    for ($num = $first; $num <= $last; $num++) {
                                        $response->push((object) [
                                            'value' => $num,
                                            'label' => 'Vlan ' . $num
                                        ]);
                                    }
                                    //dd($lines,$first,$last);
                                }
                            } else {
                                $response->push((object) [
                                    'value' => $responseCommand,
                                    'label' => 'Vlan ' . $responseCommand,
                                ]);
                            }
                        }
                    }
                }
                //dd($responseCommands);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
