<?php

namespace App\Helpers\OLT\ZTE;

use App\Helpers\Telnet\Telnet;
use App\Models\Olt\Olt;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class C320
{
    protected $telnet   = null;
    public function __construct(Olt $olt = null, Request $request = null)
    {
        if ($olt != null) {
            try {
                $this->telnet = new Telnet($olt->hostname, $olt->port,1,'');
                $this->telnet->setLoginPrompt("Username:");
                if ($olt->configs != null) {
                    if (property_exists($olt->configs,'prompts')) {
                        if (property_exists($olt->configs->prompts,'user_prompt')) {
                            if ($olt->configs->prompts->user_prompt != null) {
                                if ($olt->configs->prompts->user_prompt != 'Username:') {
                                    $this->telnet->setLoginPrompt($olt->configs->prompts->user_prompt);
                                }
                                if (property_exists($olt->configs->prompts,'pass_prompt')) {
                                    if ($olt->configs->prompts->pass_prompt != null) {
                                        if ($olt->configs->prompts->pass_prompt != 'Password:') {
                                            $this->telnet->setLoginPrompt($olt->configs->prompts->user_prompt, $olt->configs->prompts->pass_prompt);;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                $this->telnet->login($olt->user, $olt->pass);
            } catch (Exception $exception) {}
        } elseif ($request != null) {
            try {
                $this->telnet = new Telnet($request[__('olt.form_input.host')], $request[__('olt.form_input.port')],1,'');
                $this->telnet->setLoginPrompt("Username:");
                if ($request->has(__('olt.form_input.prompts.user'))) {
                    $this->telnet->setLoginPrompt($request[__('olt.form_input.prompts.user')]);
                    if ($request->has(__('olt.form_input.prompts.pass'))) {
                        $this->telnet->setLoginPrompt($request[__('olt.form_input.prompts.user')], $request[__('olt.form_input.prompts.pass')]);
                    }
                }
                $this->telnet->login($request[__('olt.form_input.user')], $request[__('olt.form_input.pass')]);
            } catch (Exception $exception) {}
        }
    }

    /* @
     * @return Collection
     */
    public function gPonStates(): Collection
    {
        try {
            $response = collect();
            if ($this->telnet != null) {
                $responseString = $this->telnet->execPaging("show gpon onu state");
                $this->telnet->disconnect();
                if (strlen($responseString) > 10) {
                    $responseArrays = explode("\n", $responseString);
                    if (count($responseArrays) > 0) {
                        unset($responseArrays[0]);
                        unset($responseArrays[1]);
                        $responseArrays = array_values($responseArrays);
                        foreach ($responseArrays as $responseArray) {
                            if (! strpos($responseArray,"Admin State")) {
                                if (! strpos($responseArray,"---------------------")) {
                                    if (! strpos($responseArray,"#") || ! strpos($responseArray,">")) {
                                        $stringArrays = explode(' ',$responseArray);
                                        if (count($stringArrays) > 0) {
                                            $lines = [];
                                            foreach ($stringArrays as $stringArray) {
                                                if (strlen($stringArray) > 0) {
                                                    $lines[] = $stringArray;
                                                }
                                            }
                                            if (count($lines) > 0) {
                                                if (array_key_exists(0,$lines) &&
                                                    array_key_exists(1,$lines) &&
                                                    array_key_exists(2,$lines) &&
                                                    array_key_exists(3,$lines) &&
                                                    array_key_exists(4, $lines)
                                                ) {
                                                    $response->push((object) [
                                                        'onu' => $lines[0],
                                                        'serial_number' => null,
                                                        'admin_state' => $lines[1],
                                                        'omcc_state' => $lines[2],
                                                        'phase_state' => strtolower($lines[3]),
                                                        'channel' => $lines[4],
                                                        'loading' => true,
                                                        'details' => null,
                                                    ]);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            return collect();
        }
    }
    /* @
     * @return Collection
     */
    public function gPonUnConfigs(): Collection
    {
        try {
            $response = collect();
            if ($this->telnet != null) {
                $responseCommands = $this->telnet->execPaging("show gpon onu uncfg");
                $this->telnet->disconnect();
                if (strlen($responseCommands) > 0) {
                    $responseCommands = explode("\n", $responseCommands);
                    if (count($responseCommands) > 0) {
                        foreach ($responseCommands as $responseCommand) {
                            if (! strpos(strtolower($responseCommand),"no related information to show")) {
                                if (! strpos($responseCommand,"------------------")) {
                                    if (strpos($responseCommand,"gpon-o")) {
                                        $line = explode(' ', $responseCommand);
                                        $strings = [];
                                        if (count($line) > 1) {
                                            foreach ($line as $item) {
                                                if (strlen($item) > 4) {
                                                    $strings[] = $item;
                                                }
                                            }
                                        }
                                        if (count($strings) == 3) {
                                            if (array_key_exists(0,$strings) && array_key_exists(1,$strings)) {
                                                $response->push((object)[
                                                    'onu' => str_replace('gpon-onu_','',$strings[0]),
                                                    'serial_number' => $strings[1],
                                                    'admin_state' => null,
                                                    'omcc_state' => null,
                                                    'phase_state' => 'unconfig',
                                                    'channel' => '',
                                                    'loading' => false,
                                                    'details' => null,
                                                ]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return collect();
        }
    }
}
