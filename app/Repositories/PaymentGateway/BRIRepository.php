<?php

namespace App\Repositories\PaymentGateway;

use App\Helpers\SwitchDB;
use App\Models\Company\ClientCompany;
use App\Models\Customer\CustomerInvoice;
use App\Models\PaymentGateway\PaymentGateway;
use App\Models\PaymentGateway\PaymentGatewayToken;
use Carbon\Carbon;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Ramsey\Uuid\Uuid;
use Throwable;

class BRIRepository
{
    public $guzzle_params;
    public $clients;
    public function __construct()
    {
        $this->guzzle_params = [
            'headers' => [
                'Accept' => 'application/json', 'Content-Type' => 'application/json',
            ]
        ];
        $this->clients = new Client();
    }

    /* @
     * @param string $client_secret
     * @param string $method
     * @param string $endpoint
     * @param string $accessToken
     * @param $requestBody
     * @param string $timestamp
     * @return string
     * @throws Exception
     */
    private function generateSignature(string $client_secret = "", string $method = 'get', string $endpoint = "", string $accessToken = "", $requestBody = "", string $timestamp = ""): string
    {
        try {
            $requestBody = json_encode($requestBody);
            $requestBody = hash('sha256', $requestBody);
            $requestBody = bin2hex($requestBody);
            $requestBody = strtolower($requestBody);
            $string = strtoupper($method) . ":" . $endpoint . ":" . $accessToken . ":" . $requestBody . ":" . $timestamp;
            return hash_hmac('sha512', $client_secret, $string);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    private function generateSha256rsa(PaymentGateway $paymentGateway, string $timestamp) {
        try {
            $string = $paymentGateway->keys->consumer_secret . '|' . $timestamp;
            $new_key_pair = openssl_pkey_new([
                'private_key_bits' => 2048,
                'private_key_type' => OPENSSL_KEYTYPE_RSA
            ]);
            openssl_pkey_export($new_key_pair, $private_key_pem);
            $details = openssl_pkey_get_details($new_key_pair);
            $public_key_pem = $details['key'];
            openssl_sign($string, $signature, $private_key_pem,OPENSSL_ALGO_SHA256);
            $targetDir = storage_path() . '/bri';
            if (!File::exists($targetDir)) File::makeDirectory($targetDir,0777,true);
            File::put($targetDir . 'private_key.pem', $private_key_pem);
            File::put($targetDir . 'public_key.pem', $public_key_pem);
            File::put($targetDir . 'signature.date', $signature);
            $r = openssl_verify($string, $signature, $public_key_pem,"sha256WithRSAEncryption");
            return $r;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param PaymentGateway $paymentGateway
     * @return mixed
     * @throws GuzzleException
     * @throws Throwable
     */
    private function createToken(PaymentGateway $paymentGateway) {
        try {
            $timestamp = Carbon::now();
            $uri = $paymentGateway->keys->url . "/oauth/client_credential/accesstoken?grant_type=client_credentials";
            $signature = $this->generateSha256rsa($paymentGateway, $timestamp);
            dd($signature);
            $this->guzzle_params['form_params'] = [
                'client_id' => $paymentGateway->keys->consumer_key,
                'client_secret' => $paymentGateway->keys->consumer_secret,
            ];
            try {
                $request = $this->clients->request('post', $uri, $this->guzzle_params);
                $response = json_decode($request->getBody()->getContents());
                if ($response != null) {
                    if (property_exists('access_token',$response) && property_exists('expires_in',$response)) {
                        $paymentGatewayToken = new PaymentGatewayToken();
                        $paymentGatewayToken->id = Uuid::uuid4()->toString();
                        $paymentGatewayToken->gateway = $paymentGateway->id;
                        $paymentGatewayToken->company = $paymentGateway->company;
                        $paymentGatewayToken->token = $response->access_token;
                        $paymentGatewayToken->params = $response;
                        $paymentGatewayToken->expired_at = Carbon::now()->addSeconds($response->expires_in);
                        $paymentGatewayToken->saveOrFail();
                        return $paymentGatewayToken->token;
                    } else {
                        throw new Exception("Undefined error",500);
                    }
                } else {
                    throw new Exception("Undefined error",500);
                }
            } catch (ClientException $clientException) {
                throw new Exception($clientException->getResponse()->getBody()->getContents());
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    private function getTokenB2b(PaymentGateway $paymentGateway) {
        try {
            $uri = $paymentGateway->keys->url . '/snap/v1.0/access-token/b2b';
            $timestamp = Carbon::now()->toIso8601String();
            $signature = $paymentGateway->keys->consumer_key . "|" . $timestamp;
            $signature = hash_hmac('sha512', $paymentGateway->keys->consumer_secret, $signature);
            $this->guzzle_params['X-SIGNATURE'] = $signature;
            $this->guzzle_params['X-CLIENT-KEY'] = $paymentGateway->keys->consumer_key;
            $this->guzzle_params['X-TIMESTAMP'] = $timestamp;
            $request = $this->clients->request('post', $uri, $this->guzzle_params);
            $response = json_encode($request->getBody()->getContents());
            dd($response);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param PaymentGateway $paymentGateway
     * @return mixed
     * @throws GuzzleException
     * @throws Throwable
     */
    private function getToken(PaymentGateway $paymentGateway) {
        try {
            $availableToken = PaymentGatewayToken::where('gateway', $paymentGateway->id)->where('company', $paymentGateway->company)->where('expired_at','>',Carbon::now()->format('Y-m-d H:i:s'))->first();
            if ($availableToken == null) {
                $availableToken = $this->createToken($paymentGateway);
            } else {
                $availableToken = $availableToken->token;
            }
            return $availableToken;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    public function transactionStatus(Request $request) {
        try {
            new SwitchDB("mysql");
            $paymentGateway = PaymentGateway::where('id', $request->gateway)->first();
            $timestamp = Carbon::now()->toIso8601String();
            $tokenPG = $this->getToken($paymentGateway);

            $company = ClientCompany::where('id', $request->company)->first();
            new SwitchDB("database.connections.radius",[
                'charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci', 'driver' => 'mysql',
                'host' => $company->radius_db_host, 'port' => env('DB_RADIUS_PORT'),
                'database' => $company->radius_db_name, 'username' => $company->radius_db_user,
                'password' => $company->radius_db_pass
            ]);
            $invoice = CustomerInvoice::where('order_id', $request->order_id)->first();

            $this->guzzle_params['headers']['Authorization'] = "Bearer " . $tokenPG;
            $this->guzzle_params['headers']['Content-Type'] = "application/json";
            $this->guzzle_params['headers']['X-TIMESTAMP'] = $timestamp;
            $this->guzzle_params['form_params']['originalReferenceNo'] = $invoice->order_id;
            $this->guzzle_params['form_params']['serviceCode'] = $invoice->code;
            $this->guzzle_params['form_params']['additionalInfo'] = (object) ['terminalId' => '10049258'];
            $this->guzzle_params['headers']['X-SIGNATURE'] = $this->generateSignature($paymentGateway->keys->consumer_secret,"post","/v1.0/qr-dynamic-mpm/qr-mpm-query",$tokenPG,$this->guzzle_params['form_params'],$timestamp);
            $this->guzzle_params['headers']['X-PARTNER-ID'] = "21600";
            $this->guzzle_params['headers']['CHANNEL-ID'] = "11111";
            $this->guzzle_params['headers']['X-EXTRENAL-ID'] = "11111";
            $uri = $paymentGateway->keys->url . "/v1.0/qr-dynamic-mpm/qr-mpm-query";
            $gzRequest = $this->clients->request('post', $uri, $this->guzzle_params);
            $response = json_encode($gzRequest->getBody()->getContents());
            dd($response);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function generateQR(Request $request) {
        try {
            new SwitchDB("mysql");
            $paymentGateway = PaymentGateway::where('id', $request->gateway)->first();
            $timestamp = Carbon::now()->toIso8601String();
            $tokenPG = $this->getToken($paymentGateway);

            $company = ClientCompany::where('id', $request->company)->first();
            new SwitchDB("database.connections.radius",[
                'charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci', 'driver' => 'mysql',
                'host' => $company->radius_db_host, 'port' => env('DB_RADIUS_PORT'),
                'database' => $company->radius_db_name, 'username' => $company->radius_db_user,
                'password' => $company->radius_db_pass
            ]);
            $invoice = CustomerInvoice::where('order_id', $request->order_id)->first();

            $uri = $paymentGateway->keys->url . '/v1.0/qr-dynamic/qr-mpm-notify';
            $this->guzzle_params['form_params'] = [
                'partnerReferenceNo' => $invoice->order_id,
                'amount' => (object) [
                    'value' => $request->order_amount . '.00',
                    'currency' => 'IDR'
                ],
                'merchantId' => $invoice->customerObj->code,
                'terminalId' => $invoice->order_id,
            ];
            $this->guzzle_params['headers']['Authorization'] = 'Bearer ' . $tokenPG;
            $this->guzzle_params['headers']['X-TIMESTAMP'] = $timestamp;
            $this->guzzle_params['headers']['X-SIGNATURE'] = $this->generateSignature($paymentGateway->keys->consumer_key,'post','/v1.0/qr-dynamic/qr-mpm-notify',$tokenPG,$this->guzzle_params['form_params'], $timestamp);
            $this->guzzle_params['headers']['X-PARTNER-ID'] = 21600;
            $this->guzzle_params['headers']['CHANNEL-ID'] = 216005;
            $this->guzzle_params['headers']['X-EXTERNAL-ID'] = 4443123;
            $requestGZ = $this->clients->request('post', $uri, $this->guzzle_params);
            $response = json_encode($requestGZ->getBody()->getContents());
            dd($response);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
