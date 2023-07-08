<?php

namespace App\Repositories\PaymentGateway;

use App\Helpers\SwitchDB;
use App\Models\Company\ClientCompany;
use App\Models\Customer\CustomerInvoice;
use App\Models\PaymentGateway\PaymentGateway;
use App\Repositories\Customer\InvoiceRepository;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Http\Request;

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

    public function transactionStatus(Request $request) {
        try {
            $response = null;
            new SwitchDB('mysql');
            $company = ClientCompany::where('id', $request->company)->first();
            $gateway = PaymentGateway::where('id', $request->gateway)->first();
            $statusTx = $this->midtransTransactionStatus($gateway, $request->order_id);
            if ($statusTx != null) {
                $response = $statusTx;
            } else {
                new SwitchDB();
                $invoice = CustomerInvoice::where('order_id', $request->order_id)->first();
                $qris = $this->midtransGenerateQRIS($gateway, $invoice, $request->order_amount);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    private function midtransGenerateQRIS(PaymentGateway $paymentGateway, CustomerInvoice $customerInvoice, int $orderAmount) {
        try {
            $url = $paymentGateway->keys->url . '/v2/charge';
            $this->generateAuth($paymentGateway);
            $customer = $customerInvoice->customerObj()->first();
            $this->params['form_params'] = [
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
                ]
            ];

            if ($customer->phone != null) {
                $this->params['form_params']['customer_details']['phone'] = $customerInvoice->customerObj()->first()->phone;
            }
            if ($customer->address != null) {
                $this->params['form_params']['customer_details']['billing_address']['address'] = $customer->address;
                $this->params['form_params']['customer_details']['billing_address']['country_code'] = 'IDN';
            }
            if ($customer->postal != null) {
                $this->params['form_params']['customer_details']['billing_address']['postal_code'] = $customer->postal;
            }
            if ($customer->cityObj()->first() != null) {
                $this->params['form_params']['customer_details']['billing_address']['city'] = ucwords(strtolower($customer->cityObj()->first()->name));
            }
            $this->params['body'] = json_encode($this->params['form_params']);
            unset($this->params['form_params']);
            //dd($this->params);
            $request = $this->client->request('post', $url, $this->params);
            $response = json_decode($request->getBody()->getContents());
            dd($response);
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    private function itemDetails(CustomerInvoice $customerInvoice) {
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
