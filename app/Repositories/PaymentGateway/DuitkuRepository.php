<?php

namespace App\Repositories\PaymentGateway;

use App\Helpers\SwitchDB;
use App\Models\Accounting\Account;
use App\Models\Company\ClientCompany;
use App\Models\Customer\Customer;
use App\Models\Customer\CustomerInvoice;
use App\Models\Customer\CustomerInvoicePayment;
use App\Models\Nas\NasProfile;
use App\Models\PaymentGateway\PaymentGateway;
use App\Models\User\User;
use App\Models\User\UserLevel;
use App\Repositories\Accounting\CashFlowRepository;
use App\Repositories\Customer\CustomerRepository;
use Carbon\Carbon;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Ramsey\Uuid\Uuid;
use Throwable;

class DuitkuRepository
{
    public $client;
    public $headers;
    public function __construct()
    {
        $this->client = new Client(['verify' => false]);
        $this->headers = [
            //'debug' => true,
            'Content-Type' => 'x-www-form-urlencoded',
            'Accept' => 'application/json',
        ];
    }
    private function dbSwitching(ClientCompany $company) {
        try {
            new SwitchDB("database.connections.radius",[
                'charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci', 'driver' => 'mysql',
                'host' => $company->radius_db_host, 'port' => env('DB_RADIUS_PORT'),
                'database' => $company->radius_db_name, 'username' => $company->radius_db_user,
                'password' => $company->radius_db_pass
            ]);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception|GuzzleException
     */
    public function paymentChannel(Request $request): Collection
    {
        try {
            $response = collect();
            $paymentGateway = PaymentGateway::where('id', $request->gateway)->first();
            $timestamp = Carbon::now()->format('Y-m-d H:i:s');
            $signature = hash('sha256', $paymentGateway->keys->merchant_code . $request->order_amount . $timestamp . $paymentGateway->keys->api_key);
            $uri = $paymentGateway->keys->url . '/webapi/api/merchant/paymentmethod/getpaymentmethod';
            $this->headers['body'] = json_encode([
                'merchantcode' => $paymentGateway->keys->merchant_code,
                'amount' => $request->order_amount,
                'datetime' => $timestamp,
                'signature' => $signature
            ]);
            $this->headers['headers']['Content-Type'] = 'application/json';
            $this->headers['headers']['Content-Length'] = strlen($this->headers['body']);
            $gzRequest = $this->client->request('post', $uri, $this->headers);
            $gzResponse = json_decode($gzRequest->getBody()->getContents());
            if (property_exists($gzResponse,'paymentFee')) {
                foreach ($gzResponse->paymentFee as $item) {
                    $response->push((object) [
                        'value' => $item->paymentMethod,
                        'label' => $item->paymentName,
                        'logo' => $item->paymentImage,
                        'fee' => (float) $item->totalFee
                    ]);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed|null
     * @throws GuzzleException
     */
    public function generateQR(Request $request) {
        try {
            new SwitchDB("mysql");
            $paymentGateway = PaymentGateway::where('id', $request->gateway)->first();
            $company = ClientCompany::where('id', $request->company)->first();
            $admin = User::where('level', UserLevel::where('name','Admin')->first()->id)->where('company', $company->id)->first();
            $this->dbSwitching($company);
            $invoice = CustomerInvoice::where('order_id', $request->order_id)->first();

            $uri = "https://api-sandbox.duitku.com/api/merchant/createInvoice";
            $uri = $paymentGateway->keys->url . '/webapi/api/merchant/v2/inquiry';
            $customerName = explode(' ',$invoice->customerObj->name);
            $firstName = $lastName = "-";
            if (count($customerName) > 0) $firstName = $customerName[0];
            if (count($customerName) > 1) $lastName = $customerName[1];
            $billingAddress = [
                'firstName' => $firstName,
                'lastName' => $firstName,
                'address' => $invoice->customerObj->address,
                'city' => $invoice->customerObj->cityObj == null ? ucwords(strtolower($company->cityObj->name)) : ucwords(strtolower($invoice->customerObj->cityObj->name)),
                'postalCode' => $invoice->customerObj->postal,
                //'phone' => '',
                'countryCode' => 'ID'
            ];
            $shippingAddress = [
                'firstName' => $company->name,
                'lastName' => $admin->name,
                'address' => $company->address,
                'city' => $company->cityObj == null ? '-' : ucwords(strtolower($company->cityObj->name)),
                'postalCode' => $company->postal,
                //'phone' => '',
                'countryCode' => 'ID'
            ];
            $customerDetail = [
                'firstName' => $firstName,
                'lastName' => $firstName,
                'email' => $invoice->customerObj->userObj == null ? $company->email : $invoice->customerObj->userObj->email,
                'billingAddress' => (object) $billingAddress,
                'shippingAddress' => (object) $shippingAddress,
            ];
            if ($invoice->customerObj->phone != null) $customerDetail['phoneNumber'] = $invoice->customerObj->phone;
            $itemDetails = collect();
            $subtotal = $taxTotal = $discountTotal = 0;
            foreach ($invoice->services as $service) {
                $subtotal += $service->amount;
                $itemDetails->push((object) [
                    'name' => $service->note,
                    'price' => (int) $service->amount,
                    'quantity' => (int) 1
                ]);
            }

            foreach ($invoice->taxes as $tax) {
                $itemDetails->push((object) [
                    'name' => $tax->taxObj->name,
                    'price' => (int) ( ( $subtotal * $tax->taxObj->percent ) / 100 ),
                    'quantity' => (int) 1
                ]);
                $taxTotal += ( ( $subtotal * $tax->taxObj->percent ) / 100 );
            }
            foreach ($invoice->discounts as $discount) {
                $discountTotal += $discount->discountObj->amount;
                $itemDetails->push((object) [
                    'name' => $discount->discountObj->name,
                    'price' => (int) 0 - $discount->discountObj->amount,
                    'quantity' => (int) 1
                ]);
            }
            $signature = md5($paymentGateway->keys->merchant_code . $invoice->order_id . ($subtotal + $taxTotal - $discountTotal) . $paymentGateway->keys->api_key);
            $this->headers['form_params'] = [
                'merchantCode' => $paymentGateway->keys->merchant_code,
                'paymentAmount' => (int) ( $subtotal + $taxTotal - $discountTotal ),
                'paymentMethod' => $request->channel,
                'merchantOrderId' => $invoice->order_id,
                'productDetails' => "Pembayaran " . $invoice->order_id,
                'additionalParam' => 'company=' . $company->id,
                'merchantUserInfo' => $invoice->customerObj->code,
                'customerVaName' => $firstName,
                'email' => $customerDetail['email'],
                //'phoneNumber' => '',
                'itemDetails' => $itemDetails->toArray(),
                'customerDetail' => (object) $customerDetail,
                'callbackUrl' => $paymentGateway->keys->callback_url,
                'returnUrl' => $paymentGateway->keys->return_url,
                'signature' => $signature,
                'expiryPeriod' => 1440
            ];
            $this->headers['Content-Length'] = strlen(json_encode($this->headers['form_params']));
            $this->headers['Content-Type'] = 'application/json';

            $GZrequest = $this->client->request('POST', $uri, $this->headers);
            $response = json_decode($GZrequest->getBody()->getContents());
            $response->channel = $request->channel;
            $response->fee = $request->fee;
            $invoice->pg_transaction = $response;
            $invoice->saveOrFail();
            return $this->transactionStatus($request);
            //return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed|void
     * @throws GuzzleException
     */
    public function transactionStatus(Request $request) {
        try {
            if ($request->has('gateway') && $request->has('company') && $request->has('order_id')) {
                new SwitchDB("mysql");
                $paymentGateway = PaymentGateway::where('id', $request->gateway)->first();
                $company = ClientCompany::where('id', $request->company)->first();
                $this->dbSwitching($company);
                $invoice = CustomerInvoice::where('order_id', $request->order_id)->first();
                $uri = $paymentGateway->keys->url . '/webapi/api/merchant/transactionStatus';
                $signature = $this->generateSignature($paymentGateway->keys->merchant_code, $invoice->order_id, $paymentGateway->keys->api_key);
                $this->headers['form_params'] = [
                    'merchantCode' => $paymentGateway->keys->merchant_code,
                    'merchantOrderId' => $invoice->order_id,
                    'signature' => $signature
                ];
                $this->headers['headers']['Content-Length'] = strlen(json_encode($this->headers['form_params']));
                try {
                    $request = $this->client->request('POST', $uri, $this->headers);
                    $response = json_decode($request->getBody()->getContents());
                    if (property_exists($response,'statusMessage')) {
                        if (strtolower($response->statusMessage) == 'expired') {
                            $invoice->order_id = randomNumeric(15);
                            $invoice->saveOrFail();
                            $request->order_id = $invoice->order_id;
                            return $this->transactionStatus(new Request([
                                'order_id' => $invoice->order_id, 'company' => $company->id, 'gateway' => $paymentGateway->id,
                            ]));
                        }
                    }
                    $response->invoice = $invoice;
                    return $response;
                } catch (ClientException $exception) {
                    $exception = json_decode($exception->getResponse()->getBody()->getContents());
                    if (property_exists($exception,'Message')) throw new Exception($exception->Message,500);
                }
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param string $merchantCode
     * @param string $merchantOrderId
     * @param string $apiKey
     * @return string
     * @throws Exception
     */
    private function generateSignature(string $merchantCode = "", string $merchantOrderId = "", string $apiKey = ""): string
    {
        try {
            return md5($merchantCode . $merchantOrderId . $apiKey);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return object
     * @throws Throwable
     */
    public function callback(Request $request): object
    {
        try {
            Log::info(json_encode($request->all()));
            new SwitchDB("mysql");
            $by = User::where('email', 'gateway@duitku.com')->first();
            $company = ClientCompany::where('id', $request->company)->first();
            $paymentGateway = PaymentGateway::where('id', $request->gateway)->first();
            $this->dbSwitching($company);
            $invoice = CustomerInvoice::where('order_id', $request->merchantOrderId)->first();
            $statusText = "PROCESS";
            if ($invoice->paid_at == null) {
                $payment = new CustomerInvoicePayment();
                $payment->id = Uuid::uuid4()->toString();
                $payment->invoice = $invoice->id;
                $payment->code = substr($request->publisherOrderId,0,49);
                $payment->amount = (int) $request->amount;
                $payment->note = $request->productDetail;
                $payment->pg_response = $request->all();
                $payment->paid_at = Carbon::now();
                $payment->created_by = $by->id;
                $payment->saveOrFail();

                $customer = Customer::where('id', $invoice->customer)->first();
                if ($customer != null) {
                    $account = Account::where('code','000001')->first();
                    if ($account != null) {
                        (new CashFlowRepository())->store(new Request([
                            __('cash_flow.form_input.periods.label') => $payment->paid_at->format('Y-m-d'),
                            __('cash_flow.form_input.account.label') => $account->id,
                            __('cash_flow.form_input.category.label') => __('invoices.payments.online', ['Customer' => $customer->name]),
                            __('cash_flow.form_input.description') => __('invoices.payments.online', ['Customer' => $customer->name]),
                            __('cash_flow.form_input.type') => 'credit',
                            __('cash_flow.form_input.amount') => $payment->amount,
                            __('cash_flow.form_input.periods.label') => $payment->paid_at,
                        ]));
                    }
                }
                if ($this->sumPayment($invoice) >= $this->sumInvoice($invoice)) {
                    $invoice->paid_at = Carbon::now();
                    $invoice->paid_by = $by->id;
                    $invoice->saveOrFail();
                    $statusText = "SETTLEMENT";
                    $customer = Customer::where('code', $request->merchantUserId)->first();
                    (new CustomerRepository())->renewCustomer(new Request(['id' => $customer->id]));
                }
            } else {
                $statusText = "SETTLEMENT";
            }
            return (object) [
                'orderId' => $invoice->order_id,
                'totalInvoice' => $this->sumInvoice($invoice),
                'totalPaidAmount' => $this->sumPayment($invoice),
                'customerId' => $invoice->customerObj()->first()->code,
                'status' => $statusText,
                'merchantCode' => $paymentGateway->keys->merchant_code
            ];
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param CustomerInvoice $invoice
     * @return int
     * @throws Exception
     */
    private function sumPayment(CustomerInvoice $invoice): int
    {
        try {
            $response = 0;
            foreach ($invoice->payments()->get() as $payment) {
                $response += $payment->amount;
            }
            return (int) $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param CustomerInvoice $invoice
     * @return int
     * @throws Exception
     */
    private function sumInvoice(CustomerInvoice $invoice): int
    {
        try {
            $response = $subtotal = $taxTotal = $discountTotal = 0;
            foreach ($invoice->services()->get() as $service) {
                $subtotal += $service->amount;
            }
            foreach ($invoice->taxes()->get() as $tax) {
                if ($tax->taxObj != null) {
                    $taxTotal += ( ( $subtotal * $tax->taxObj->percent ) / 100 );
                }
            }
            foreach ($invoice->discounts()->get() as $discount) {
                if ($discount->discountObj()->first() != null) {
                    $discountTotal += $discount->discountObj()->first()->amount;
                }
            }
            if ($subtotal > 0 || $taxTotal > 0 || $discountTotal > 0) {
                $response = (int) ( $subtotal + $taxTotal ) - $discountTotal;
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
