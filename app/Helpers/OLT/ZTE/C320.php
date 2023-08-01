<?php

namespace App\Helpers\OLT\ZTE;

use App\Helpers\Telnet\Telnet;
use App\Models\Olt\Olt;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class C320
{
    protected $isLogin  = false;
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
                $this->isLogin = $this->telnet->login($olt->user, $olt->pass);
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
                $this->isLogin = $this->telnet->login($request[__('olt.form_input.user')], $request[__('olt.form_input.pass')]);
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
                            if (stripos($responseCommand,"unknown")) {
                                $lines = explode(" ", $responseCommand);
                                if (count($lines) > 0) {
                                    foreach ($lines as $index => $line) {
                                        if (strlen($line) == 0) unset($lines[$index]);
                                    }
                                    $lines = array_values($lines);
                                    if (count($lines) > 0) {
                                        if (array_key_exists(0,$lines) && array_key_exists(1,$lines)) {
                                            if (strlen($lines[0]) > 0 && strlen($lines[1]) > 0) {
                                                $response->push((object) [
                                                    'onu' => str_replace('gpon-onu_','',$lines[0]),
                                                    'serial_number' => $lines[1],
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

    /* @
     * @param string $onuIndex
     * @return string|null
     */
    public function showGPonOnuDetailInfo(string $onuIndex): ?string
    {
        try {
            $response = null;
            if ($this->telnet != null) {
                $responseMessage = $this->telnet->execPaging("show gpon onu detail-info gpon-onu_" . $onuIndex);
                if (strlen($responseMessage) > 10) {
                    $response = $responseMessage;
                }
            }
            return $response;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @return Collection|null
     */
    public function showOnuType(): ?Collection
    {
        try {
            $response = collect();
            if ($this->telnet != null) {
                if ($this->isLogin) {
                    $responseMessages = $this->telnet->execPaging("show onu-type");
                    $this->telnet->disconnect();
                    if (strlen($responseMessages) > 10) {
                        $responseMessages = explode("\n", $responseMessages);
                        if (count($responseMessages) > 3) {
                            foreach ($responseMessages as $responseMessage) {
                                if (Str::contains($responseMessage,"ONU type name:")) {
                                    $name = trim(str_replace("ONU type name:","", $responseMessage));
                                    $response->push((object) [
                                        'value' => $name,
                                        'label' => $name
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @return Collection|null
     */
    public function showGPonOnuProfileVLan(): ?Collection
    {
        try {
            $response = collect();
            if ($this->telnet != null) {
                if ($this->isLogin) {
                    $responseMessages = $this->telnet->execPaging("show gpon onu profile vlan");
                    $this->telnet->disconnect();
                    if (strlen($responseMessages) > 10) {
                        $responseMessages = explode("\n", $responseMessages);
                        if (count($responseMessages) > 3) {
                            $responseMessages = array_chunk($responseMessages,4);
                            if (count($responseMessages) > 0) {
                                foreach ($responseMessages as $row) {
                                    $name = '';
                                    $tagMode = '';
                                    $cvlan = '';
                                    $priority = '';
                                    foreach ($row as $column) {
                                        if (Str::contains($column,"Profile name:")) {
                                            $name = trim(str_replace("Profile name:","", $column));
                                        } elseif (Str::contains($column,"Tag mode:")) {
                                            $tagMode = trim(str_replace("Tag mode:","", $column));
                                        } elseif (Str::contains($column,"CVLAN:")) {
                                            $cvlan = trim(str_replace("CVLAN:","", $column));
                                        } elseif (Str::contains($column,"CVLAN priority:")) {
                                            $priority = trim(str_replace("CVLAN priority:","", $column));
                                        }
                                    }
                                    $response->push((object) [
                                        'value' => $name, 'label' => $name,
                                        'tag_mode' => $tagMode, 'cvlan' => $cvlan, 'priority' => $priority,
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
            return  $response;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }

    /* @
     * @param array $commands
     * @return string|null
     * @throws Exception
     */
    public function bulkCommands(array $commands): ?string
    {
        try {
            $response = null;
            if ($this->telnet != null) {
                if ($this->isLogin) {
                    if (count($commands) > 0) {
                        foreach ($commands as $command) {
                            $responseMessage = trim($this->telnet->exec($command));
                            Log::info("command = " . $command . ", response = " . $responseMessage);
                            $response .= $responseMessage;
                        }
                    }
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
