<?php /** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories\Customer;

use App\Helpers\SwitchDB;
use App\Models\Customer\Customer;
use App\Models\Customer\CustomerAdditionalService;
use App\Models\Customer\CustomerDiscount;
use App\Models\Customer\CustomerInvoice;
use App\Models\Customer\CustomerInvoiceDiscount;
use App\Models\Customer\CustomerInvoicePayment;
use App\Models\Customer\CustomerInvoiceService;
use App\Models\Customer\CustomerInvoiceTax;
use App\Models\Customer\CustomerTax;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;
use Throwable;

class InvoiceRepository
{
    protected $me;
    protected $response;
    public function __construct()
    {
        if (auth()->guard('api')->user() != null) {
            $this->me = auth()->guard('api')->user();
        }
        $this->response = null;
        new SwitchDB();
    }

    /* @
     * @param Request $request
     * @return bool
     * @throws Exception
     */
    public function delete(Request $request): bool
    {
        try {
            $invoices = CustomerInvoice::whereIn('id', $request[__('invoices.form_input.id')])->get();
            foreach ($invoices as $invoice) {
                $invoice->deleted_by = $this->me->id;
                $invoice->saveOrFail();
                $invoice->delete();
            }
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return bool
     * @throws Throwable
     */
    public function generate(Request $request): bool
    {
        try {
            $excludes = CustomerInvoice::whereMonth('bill_period', Carbon::parse($request[__('invoices.form_input.bill_period')])->format('m'))
                ->whereYear('bill_period', Carbon::parse($request[__('invoices.form_input.bill_period')])->format('Y'))
                ->get('customer')->map(function ($q){ return $q->customer; })->toArray();
            $customers = Customer::orderBy('created_at', 'asc')
                ->whereDate('active_at', '<=', Carbon::parse($request[__('invoices.form_input.bill_period')])->format('Y-m-d'))
                ->whereNotIn('id', $excludes)
                ->whereNull('inactive_at')->whereNotNull('active_at')->get();
            foreach ($customers as $customer) {
                $subtotalDiscount = $subtotalTax = $subtotal = 0;

                if ($customer->profileObj->price > 0) {
                    $subtotal = $customer->profileObj->price;
                }
                $taxes = CustomerTax::where('customer', $customer->id)->orderBy('created_at', 'asc')->get();
                $additionalServices = CustomerAdditionalService::where('customer', $customer->id)->orderBy('created_at', 'asc')->get();
                $discounts = CustomerDiscount::where('customer', $customer->id)->orderBy('created_at', 'asc')->get();
                if ($additionalServices->count() > 0) {
                    foreach ($additionalServices as $additionalService) {
                        if ($additionalService->serviceObj->price > 0) {
                            $subtotal += $additionalService->serviceObj->price;
                        }
                    }
                }
                if ($taxes->count() > 0) {
                    foreach ($taxes as $tax) {
                        if ($tax->taxObj != null) {
                            if ($tax->taxObj->percent > 0) {
                                $subtotalTax += ( ($subtotal * $tax->taxObj->percent) / 100 );
                            }
                        }
                    }
                }
                if ($discounts->count() > 0) {
                    foreach ($discounts as $discount) {
                        if ($discount->discountObj != null) {
                            if ($discount->discountObj->amount > 0) {
                                $subtotalDiscount += $discount->discountObj->amount;
                            }
                        }
                    }
                }

                if ((($subtotal + $subtotalTax) - $subtotalDiscount) > 0) {
                    $invoice = new CustomerInvoice();
                    $invoice->id = Uuid::uuid4()->toString();
                    $invoice->order_id = mt_rand(1111111111,9999999999);
                    $invoice->customer = $customer->id;
                    $invoice->code = generateCustomerInvoiceCode(Carbon::parse($request[__('invoices.form_input.bill_period')]));
                    $invoice->bill_period = Carbon::parse($request[__('invoices.form_input.bill_period')])->format('Y-m-d');
                    $invoice->note = "Manually generated";
                    $invoice->created_by = $this->me->id;
                    $invoice->saveOrFail();
                    if ($customer->profileObj != null) {
                        $invoiceService = new CustomerInvoiceService();
                        $invoiceService->id = Uuid::uuid4()->toString();
                        $invoiceService->invoice = $invoice->id;
                        $invoiceService->service = $customer->profileObj->id;
                        $invoiceService->amount = $customer->profileObj->price;
                        $invoiceService->note = $customer->profileObj->name;
                        $invoiceService->created_by = $this->me->id;
                        $invoiceService->saveOrFail();
                    }
                    if ($additionalServices->count() > 0) {
                        foreach ($additionalServices as $index => $additionalService) {
                            if ($additionalService->serviceObj != null) {
                                $invoiceService = new CustomerInvoiceService();
                                $invoiceService->id = Uuid::uuid4()->toString();
                                $invoiceService->invoice = $invoice->id;
                                $invoiceService->service = $additionalService->profile;
                                $invoiceService->amount = $additionalService->serviceObj->price;
                                $invoiceService->note = $additionalService->serviceObj->name;
                                $invoiceService->order = $index + 1;
                                $invoiceService->created_by = $this->me->id;
                                $invoiceService->saveOrFail();
                            }
                        }
                    }
                    if ($taxes->count() > 0) {
                        foreach ($taxes as $tax) {
                            if ($tax->taxObj != null) {
                                $invoiceTax = new CustomerInvoiceTax();
                                $invoiceTax->id = Uuid::uuid4()->toString();
                                $invoiceTax->invoice = $invoice->id;
                                $invoiceTax->tax = $tax->taxObj->id;
                                $invoiceTax->created_by = $this->me->id;
                                $invoiceTax->saveOrFail();
                            }
                        }
                    }
                    if ($discounts->count() > 0) {
                        foreach ($discounts as $discount) {
                            if ($discount->discountObj != null) {
                                $invoiceDiscount = new CustomerInvoiceDiscount();
                                $invoiceDiscount->id = Uuid::uuid4()->toString();
                                $invoiceDiscount->invoice = $invoice->id;
                                $invoiceDiscount->discount = $discount->discountObj->id;
                                $invoiceDiscount->created_by = $this->me->id;
                                $invoiceDiscount->saveOrFail();
                            }
                        }
                    }
                }
            }
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return Collection|null
     * @throws Exception
     */
    public function table(Request $request): ?Collection
    {
        try {
            $this->response = collect();
            $invoices = CustomerInvoice::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $invoices = $invoices->where('id', $request->id);
            if ($request->has(__('invoices.form_input.bill_period'))) {
                $invoices = $invoices->whereMonth('bill_period', Carbon::parse($request[__('invoices.form_input.bill_period')])->format('m'))
                    ->whereYear('bill_period', Carbon::parse($request[__('invoices.form_input.bill_period')])->format('Y'));
            }
            $invoices = $invoices->get();
            if ($invoices->count() > 0) {
                foreach ($invoices as $invoice) {
                    $this->response->push((object) [
                        'value' => $invoice->id,
                        'label' => $invoice->code,
                        'meta' => (object) [
                            'order_id' => $invoice->order_id,
                            'customer' => $invoice->customerObj,
                            'period' => $invoice->bill_period,
                            'note' => $invoice->note,
                            'services' => $this->services($invoice),
                            'taxes' => $this->taxes($invoice),
                            'discounts' => $this->discounts($invoice),
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => $invoice->created_at,
                                    'by' => $invoice->createdBy,
                                ],
                                'paid' => (object) [
                                    'at' => $invoice->paid_at,
                                    'by' => $invoice->paidBy,
                                    'payments' => $this->payments($invoice)
                                ]
                            ]
                        ]
                    ]);
                }
            }
            return $this->response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param CustomerInvoice $customerInvoice
     * @return Collection
     * @throws Exception
     */
    public function discounts(CustomerInvoice $customerInvoice): Collection
    {
        try {
            new SwitchDB();
            $response = collect();
            $discounts = CustomerInvoiceDiscount::orderBy('created_at', 'asc')->where('invoice', $customerInvoice->id)->get();
            if ($discounts->count() > 0) {
                foreach ($discounts as $discount) {
                    $response->push((object) [
                        'value' => $discount->id,
                        'meta' => (object) [
                            'discount' => $discount->discountObj
                        ]
                    ]);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param CustomerInvoice $customerInvoice
     * @return Collection
     * @throws Exception
     */
    public function taxes(CustomerInvoice $customerInvoice): Collection
    {
        try {
            new SwitchDB();
            $response = collect();
            $taxes = CustomerInvoiceTax::orderBy('created_at', 'asc')->where('invoice', $customerInvoice->id)->get();
            if ($taxes->count() > 0) {
                foreach ($taxes as $tax) {
                    $response->push((object) [
                        'value' => $tax->id,
                        'meta' => (object) [
                            'tax' => $tax->taxObj
                        ]
                    ]);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param CustomerInvoice $customerInvoice
     * @return Collection
     * @throws Exception
     */
    public function services(CustomerInvoice $customerInvoice): Collection
    {
        try {
            new SwitchDB();
            $response = collect();
            $services = CustomerInvoiceService::orderBy('order', 'asc')->where('invoice', $customerInvoice->id)->get();
            if ($services->count() > 0) {
                foreach ($services as $service) {
                    $response->push((object) [
                        'value' => $service->id,
                        'meta' => (object) [
                            'price' => $service->amount,
                            'note' => $service->note,
                            'service' => $service->serviceObj
                        ]
                    ]);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param CustomerInvoice $customerInvoice
     * @return Collection
     * @throws Exception
     */
    public function payments(CustomerInvoice $customerInvoice): Collection
    {
        try {
            $response = collect();
            $payments = CustomerInvoicePayment::orderBy('created_at', 'asc')->where('invoice', $customerInvoice->id)->get();
            if ($payments->count() > 0) {
                foreach ($payments as $payment) {
                    $response->push((object) [
                        'value' => $payment->id,
                        'label' => $payment->code,
                        'meta' => (object) [
                            'amount' => $payment->amount,
                            'note' => $payment->note,
                            'pg' => $payment->pg_response,
                            'timestamps' => (object) [
                                'created' => (object) [
                                    'at' => $payment->created_at,
                                    'by' => $payment->createdBy,
                                ],
                                'update' => (object) [
                                    'at' => $payment->updated_at,
                                    'by' => $payment->updatedBy
                                ],
                                'paid' => (object) [
                                    'at' => $payment->paid_at,
                                ]
                            ]
                        ]
                    ]);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
