<?php

namespace App\Repositories\PaymentGateway;

use App\Helpers\SwitchDB;
use App\Models\Company\ClientCompany;
use App\Models\Customer\CustomerInvoice;
use App\Models\Customer\CustomerInvoicePayment;
use App\Models\PaymentGateway\PaymentGateway;
use App\Models\User\User;
use App\Repositories\Customer\InvoiceRepository;
use Carbon\Carbon;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Ramsey\Uuid\Uuid;
use Throwable;

class MidtransRepository
{
    protected $client;
    protected $params;
    public function __construct()
    {
        $this->client = new Client(['verify' => false]);
        $this->params = [
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ]
        ];
    }

    /* @
     * @param Request $request
     * @return string
     * @throws Exception
     */
    public function tokenMidtrans(Request $request): string
    {
        try {
            new SwitchDB("mysql");
            $gateway = PaymentGateway::where("id", $request->gateway)->first();
            Config::$serverKey = $gateway->keys->server_key;
            Config::$isSanitized = true;
            Config::$isProduction = $gateway->production;
            $parameter = json_decode($request->parameter,true);
            return Snap::getSnapToken($parameter);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return object
     * @throws Throwable
     */
    public function paymentNotification(Request $request): object
    {
        try {
            new SwitchDB("mysql");
            $gateway = PaymentGateway::where('id', $request->gateway)->first();
            $company = ClientCompany::where('id', $request->company)->first();
            $user = User::where('email','gateway@midtrans.com')->first();
            new SwitchDB("database.connections.radius",[
                'charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci', 'driver' => 'mysql',
                'host' => $company->radius_db_host, 'port' => env('DB_RADIUS_PORT'),
                'database' => $company->radius_db_name, 'username' => $company->radius_db_user,
                'password' => $company->radius_db_pass
            ]);
            $responseId = null;
            if ($request->has('transaction_status')) {
                $invoice = CustomerInvoice::where('order_id', $request->order_id)->first();
                if ($invoice->paid_at == null) {
                    if ($request->transaction_status == 'settlement') {
                        $payment = new CustomerInvoicePayment();
                        $payment->id = Uuid::uuid4()->toString();
                        $responseId = $payment->id;
                        $payment->invoice = $invoice->id;
                        $payment->code = generateCustomerPaymentCode(Carbon::parse($request->transaction_time));
                        $payment->paid_amount = $request->gross_amount;
                        $payment->note = $request->status_message;
                        $payment->pg_response = $request->all();
                        $payment->paid_at = Carbon::parse($request->transaction_time);
                        if ($user != null) {
                            $payment->paid_by = $user->id;
                        }
                        $payment->saveOrFail();

                        if ($this->sumTotalPaymentInvoice($invoice) >= $this->sumTotalInvoice($invoice)) {
                            $invoice->paid_at = Carbon::now();
                            if ($user != null) {
                                $invoice->paid_by = $user->id;
                            }
                            $invoice->saveOrFail();
                        }
                    }
                }
            }
            return (object) ['payment_id' => $responseId, 'amount' => $request->gross_amount];
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param CustomerInvoice $customerInvoice
     * @return int
     */
    private function sumTotalPaymentInvoice(CustomerInvoice $customerInvoice): int
    {
        try {
            $response = 0;
            foreach ($customerInvoice->payments()->get() as $item) {
                $response += $item->amount;
            }
            return $response;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return 0;
        }
    }
    private function sumTotalInvoice(CustomerInvoice $customerInvoice) {
        try {
            $subtotal = 0;
            $taxTotal = 0;
            $discountTotal = 0;
            foreach ($customerInvoice->services()->get() as $item) {
                $service = $item->serviceObj()->first();
                if ($service != null) {
                    $subtotal += $item->amount;
                }
            }
            new SwitchDB('mysql');
            foreach ($customerInvoice->taxes()->get() as $item) {
                $tax = $item->taxObj()->first();
                if ($tax != null) {
                    $taxTotal += ($subtotal * $tax->percent) / 100;
                }
            }
            foreach ($customerInvoice->discounts()->get() as $item) {
                $discount = $item->discountObj()->first();
                if ($discount != null) {
                    $discountTotal += $discount->amount;
                }
            }
            return $subtotal + $taxTotal - $discountTotal;
        } catch (Exception $exception) {
            Log::alert($exception->getMessage());
            return 0;
        }
    }

    /* @
     * @param Request $request
     * @return mixed|null
     * @throws Throwable
     */
    public function transactionStatus(Request $request) {
        try {
            $response = null;
            new SwitchDB('mysql');
            $company = ClientCompany::where('id', $request->company)->first();
            $gateway = PaymentGateway::where('id', $request->gateway)->first();
            $statusTx = $this->midtransTransactionStatus($gateway, $request->order_id);
            new SwitchDB();
            $invoice = CustomerInvoice::where('order_id', $request->order_id)->first();
            if ($statusTx != null) {
                $response = $statusTx;
                $response->statusMessage = $response->transaction_status;
                $response->invoice = $invoice;
                if (property_exists($statusTx,'payment_type')) {
                    if ($statusTx->payment_type == 'qris') {
                        if ($gateway->production) {
                            $response->qr_image = "https://api.midtrans.com/v2/qris/" . $statusTx->transaction_id . '/qr-code';
                        } else {
                            $response->qr_image = "https://api.sandbox.midtrans.com/v2/qris/" . $statusTx->transaction_id . '/qr-code';
                        }
                    }
                }
                return $response;
            }
            return null;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param PaymentGateway $paymentGateway
     * @param CustomerInvoice $customerInvoice
     * @param int $orderAmount
     * @return void
     * @throws Throwable
     */
    private function midtransGenerateQRIS(PaymentGateway $paymentGateway, CustomerInvoice $customerInvoice, int $orderAmount) {
        try {
            $url = $paymentGateway->keys->url . '/v2/charge';
            $this->generateAuth($paymentGateway);
            $customer = $customerInvoice->customerObj()->first();
            if ($customer != null) {
                $jsonBody = [
                    'payment_type' => 'qris',
                    'transaction_details' => [
                        'order_id' => $customerInvoice->order_id,
                        'gross_amount' => $orderAmount,
                    ],
                    'item_details' => $this->itemDetails($customerInvoice),
                    'customer_details' => [
                        'first_name' => $customer->name,
                    ],
                    'qris' => [
                        'acquirer' => 'gopay'
                    ],
                    'custom_field1' => $paymentGateway->company,
                    'custom_field2' => $paymentGateway->id,
                ];
                if ($customer->phone != null) {
                    $jsonBody['customer_details']['phone'] = $customerInvoice->customerObj()->first()->phone;
                }
                if ($customer->address != null) {
                    $jsonBody['customer_details']['billing_address']['address'] = $customer->address;
                    $jsonBody['customer_details']['billing_address']['country_code'] = 'IDN';
                }
                if ($customer->postal != null) {
                    $jsonBody['customer_details']['billing_address']['postal_code'] = $customer->postal;
                }
                if ($customer->cityObj()->first() != null) {
                    $jsonBody['customer_details']['billing_address']['city'] = ucwords(strtolower($customer->cityObj()->first()->name));
                }
                $this->params['body'] = json_encode($jsonBody);
                try {
                    $request = $this->client->request('post', $url, $this->params);
                    $response = json_decode($request->getBody()->getContents());
                    if (property_exists($response,'status_code')) {
                        if ($response->status_code == 200) {
                            $customerInvoice->pg_transaction = $response;
                            $customerInvoice->saveOrFail();
                        } else {
                            throw new Exception($response->status_message, $response->status_code);
                        }
                    }
                } catch (Exception|ClientException|RequestException|GuzzleException $exception) {
                    throw new Exception($exception->getMessage(),500);
                }
            }
            return;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param CustomerInvoice $customerInvoice
     * @return array
     * @throws Exception
     */
    private function itemDetails(CustomerInvoice $customerInvoice): array
    {
        try {
            $response = collect();
            $subtotal = 0;
            foreach ($customerInvoice->services()->get() as $item) {
                $service = $item->serviceObj()->first();
                if ($service != null) {
                    $response->push([ 'id' => $service->code, 'price' => (int) $item->amount, 'quantity' => 1,'name' => $item->note ]);
                    $subtotal += $item->amount;
                }
            }
            new SwitchDB('mysql');
            foreach ($customerInvoice->taxes()->get() as $item) {
                $tax = $item->taxObj()->first();
                if ($tax != null) {
                    $response->push([ 'id' => $tax->code, 'price' => (int) (( $tax->percent * $subtotal ) / 100), 'quantity' => 1, 'name' => $tax->name ]);
                }
            }
            foreach ($customerInvoice->discounts()->get() as $item) {
                $discount = $item->discountObj()->first();
                if ($discount != null) {
                    $response->push([ 'id' => $discount->code, 'price' => (int) 0 - $discount->amount, 'quantity' => 1, 'name' => $discount->name ]);
                }
            }
            return $response->toArray();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param PaymentGateway $paymentGateway
     * @param string $orderId
     * @return mixed|null
     * @throws GuzzleException
     */
    private function midtransTransactionStatus(PaymentGateway $paymentGateway, string $orderId) {
        try {
            $url = $paymentGateway->keys->url . '/v2/'.$orderId.'/status';
            $this->generateAuth($paymentGateway);
            if ($this->client != null) {
                $request = $this->client->request('get', $url, $this->params);
                $response = json_decode($request->getBody()->getContents());
                if (property_exists($response,'status_code')) {
                    if ($response->status_code != '404') {
                        return $response;
                    }
                }
            }
            return null;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    private function generateAuth(PaymentGateway $paymentGateway) {
        try {
            $this->params['headers']['Authorization'] = "Basic " . base64_encode($paymentGateway->keys->server_key . ':');
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
