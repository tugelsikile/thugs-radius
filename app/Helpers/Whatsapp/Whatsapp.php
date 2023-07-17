<?php

namespace App\Helpers\Whatsapp;

use App\Models\Company\ClientCompany;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class Whatsapp
{
    protected $client           = null;
    protected $params           = null;
    protected $url              = 'https://graph.facebook.com';
    protected $business_id      = null;
    protected $application_id   = null;

    public $token = null;
    public function __construct(ClientCompany $clientCompany = null)
    {
        if ($clientCompany != null) {
            $this->client = new Client(['verify' => false]);
            $this->params = [
                'headers' => [
                    'Accept' => 'application/json', 'Content-Type' => 'application/json',
                ]
            ];
            if ($clientCompany->config != null) {
                if (property_exists($clientCompany->config,'whatsapp')) {
                    if (property_exists($clientCompany->config->whatsapp,'token')) {
                        //$this->params['headers']['Authorization'] = "Bearer EAAMgHSxPajEBANxZAbaOfcMDs5VZARodjbPu8A7hIJC0W2Q9xcnt1RDf13nJrB1pYZBG2Tg4Ug5VnUj1AZAah1ePf0fIdUc9SzewalEu2ZC0UWcZAmy8lsV2PkyZCZC865oCFQMXbwnredR8zOrNqJwiEQlfMeSFJmEYTIHlArh2jxxupZCoBTAhs5wiKnXBIewOQZATy2ugY3ZCQJVjOqBCLAUc1jP8LiBqLYZD";
                        $this->params['headers']['Authorization'] = "Bearer " . $clientCompany->config->whatsapp->token;
                        if (property_exists($clientCompany->config->whatsapp,'business_id')) {
                            $this->business_id = $clientCompany->config->whatsapp->business_id;
                        }
                        if (property_exists($clientCompany->config->whatsapp,'app_id')) {
                            $this->application_id = $clientCompany->config->whatsapp->app_id;
                        }
                        $this->getToken();
                    }
                }
            }
        }
    }
    public function getToken() {
        try {
            if ($this->client != null && $this->business_id) {
                //$this->business_id = "100839519734202";
                $url = $this->url . '/v17.0/' . $this->business_id;
                $request = $this->client->request('get', $url, $this->params);
                $response = json_decode($request->getBody()->getContents(),true);
                if ($response != null && is_array($response)) {
                    if (count($response) > 2) {
                        return $response;
                    }
                }
            }
            return null;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return null;
        }
    }
}
