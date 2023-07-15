<?php

namespace App\Repositories\Olt;

use App\Helpers\SwitchDB;
use App\Helpers\Telnet\Telnet;
use App\Models\Olt\Olt;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class TrafficProfileRepository
{
    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function tconts(Request $request): Collection
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
            for ($index = 0; $index < 10; $index++) {
                if ($index == 0) {
                    $responseCommands .= $telnet->exec("show gpon profile tcont");
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
            $telnet->disconnect();
            if (strlen($responseCommands) > 30) {
                $responseCommands = explode("\n", $responseCommands);
                foreach ($responseCommands as $key => $responseCommand) {
                    $responseCommands[$key] = trim($responseCommand);
                    if (Str::contains($responseCommand,"#")) {
                        unset($responseCommands[$key]);
                    } elseif (strlen(trim($responseCommand)) < 5) {
                        unset($responseCommands[$key]);
                    }
                }
                $responseCommands = array_values($responseCommands);
                $profileNames = [];
                $profileValues = [];
                foreach ($responseCommands as $key => $responseCommand) {
                    if ($key % 3 == 0) {
                        $profileNames[] = trim(str_replace("Profile name :","",$responseCommand));
                    } elseif ($key % 3 == 2) {
                        $vl = explode(" ",trim($responseCommand));
                        foreach ($vl as $idx => $item) {
                            if (strlen($item) == 0) {
                                unset($vl[$idx]);
                            }
                        }
                        $profileValues[] = array_values($vl);
                    }
                }
                if (count($profileValues) > 0 && count($profileNames) > 0) {
                    if (count($profileValues) == count($profileNames)) {
                        foreach ($profileNames as $index => $profileName) {
                            if (count($profileValues[$index]) == 6) {
                                $response->push((object) [
                                    'value' => $profileName,
                                    'label' => $profileName,
                                    'meta' => (object) [
                                        'type' => $profileValues[$index][0],
                                        'fbw' => $profileValues[$index][1],
                                        'abw' => $profileValues[$index][2],
                                        'mbw' => $profileValues[$index][3],
                                        'priority' => $profileValues[$index][4],
                                        'weight' => $profileValues[$index][5],
                                    ],
                                ]);
                            }
                        }
                    }
                }
                /*dd($response);
                dd($profileNames, $profileValues, $responseCommands);*/
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
            for ($index = 0; $index < 10; $index++) {
                if ($index == 0) {
                    $responseCommands .= $telnet->exec("show gpon profile traffic");
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
            $telnet->disconnect();
            if (strlen($responseCommands) > 30) {
                $responseCommands = explode("\n", $responseCommands);
                foreach ($responseCommands as $key => $responseCommand) {
                    $responseCommands[$key] = trim($responseCommand);
                    if (Str::contains($responseCommand,"#")) {
                        unset($responseCommands[$key]);
                    } elseif (strlen(trim($responseCommand)) < 5) {
                        unset($responseCommands[$key]);
                    }
                }
                $responseCommands = array_values($responseCommands);
                $profileNames = [];
                $profileValues = [];
                foreach ($responseCommands as $key => $responseCommand) {
                    if ($key % 3 == 0) {
                        $profileNames[] = trim(str_replace("Profile name  :","",$responseCommand));
                    } elseif ($key % 3 == 2) {
                        $vl = explode(" ",trim($responseCommand));
                        foreach ($vl as $idx => $item) {
                            if (strlen($item) < 2) {
                                unset($vl[$idx]);
                            }
                        }
                        $profileValues[] = array_values($vl);
                    }
                }
                if (count($profileValues) > 0 && count($profileNames) > 0) {
                    if (count($profileValues) == count($profileNames)) {
                        foreach ($profileNames as $index => $profileName) {
                            if (count($profileValues[$index]) == 4) {
                                $response->push((object) [
                                    'value' => $profileName,
                                    'label' => $profileName,
                                    'meta' => (object) [
                                        'sir' => $profileValues[$index][0],
                                        'pir' => $profileValues[$index][1],
                                        'cbs' => $profileValues[$index][2],
                                        'pbs' => $profileValues[$index][3],
                                    ],
                                ]);
                            }
                        }
                    }
                }
                /*dd($response);
                dd($profileNames, $profileValues, $responseCommands);*/
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
