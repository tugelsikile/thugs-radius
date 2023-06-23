<?php

namespace App\Helpers\Server;

use App\Models\Company\ClientCompany;
use DivineOmega\SSHConnection\SSHConnection;
use Exception;
use Illuminate\Support\Str;

class Server
{
    public function execServer($command) {
        try {
            $response = null;
            $connection = (new SSHConnection())
                ->to(env('MIX_DB_SSH_HOST'))
                ->onPort(env('MIX_DB_SSH_PORT'))
                ->as(env('MIX_DB_SSH_USER'))
                ->withPassword(env('MIX_DB_SSH_PASS'))
                ->connect();
            if ($connection->isConnected()) {
                $response = $connection->run($command)->getOutput();
            }
            return $response;
        } catch (Exception $exception) {
            return null;
        }
    }

    /* @
     * @param string|null $daemon
     * @param string|null $action
     * @return object|null
     */
    public function statusServer(string $daemon = null, string $action = null): ?object
    {
        try {
            $response = (object) ['status' => false, 'message' => null ];
            $commands = collect();
            $commands->push("service");
            if ($daemon != null && in_array($daemon,['radiusd','freeradius','mysql','mysqld'])) {
                $commands->push($daemon);
                if ($action != null && in_array($action,['start','stop','restart','status','reboot'])) {
                    $commands->push($action);
                    if ($action == 'reboot') {
                        $commands = collect();
                        $commands->push("reboot");
                    }
                }
                if ($commands->count() >= 3) {
                    $exec = $this->execServer($commands->join(" "));
                    if ($exec != null) {
                        $response->message = $exec;
                        if ($action == 'status') {
                            if (Str::contains($exec,"active (running)")) {
                                $response->status = true;
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
}
