<?php /** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUndefinedMethodInspection */

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
use App\Models\Nas\NasProfile;
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
    public function update(Request $request) {
        try {
            $isUpdating = false;
            $invoice = CustomerInvoice::where('id', $request[__('invoices.form_input.id')])->first();
            if ($request->has(__('invoices.form_input.note'))) {
                if ($invoice->note != $request[__('invoices.form_input.note')]) {
                    $isUpdating = true;
                }
                $invoice->note = $request[__('invoices.form_input.note')];
            } else {
                $invoice->note = null;
            }

            if ($request->has(__('invoices.form_input.service.input'))) {
                foreach ($request[__('invoices.form_input.service.input')] as $index => $item) {
                    $service = NasProfile::where('id', $item[__('profiles.form_input.name')])->first();
                    if ($service != null) {
                        if (array_key_exists(__('invoices.form_input.service.id'), $item)) {
                            $invoiceService = CustomerInvoiceService::where('id', $item[__('invoices.form_input.service.id')])->first();
                            if ($invoiceService->amount != $service->price ||
                                $invoiceService->service != $service->id ||
                                $invoiceService->note != $service->name
                            ) {
                                $invoiceService->updated_by = $this->me->id;
                                $isUpdating = true;
                            }
                        } else {
                            $invoiceService = new CustomerInvoiceService();
                            $invoiceService->id = Uuid::uuid4()->toString();
                            $invoiceService->invoice = $invoice->id;
                            $invoiceService->order = $index;
                            $invoiceService->created_by = $this->me->id;
                        }
                        $invoiceService->service = $service->id;
                        $invoiceService->amount = $service->price;
                        $invoiceService->note = $service->name;
                        $invoiceService->saveOrFail();
                    }
                }
            }
            if ($request->has(__('invoices.form_input.service.delete'))) {
                $invoiceServices = CustomerInvoiceService::whereIn('id', $request[__('invoices.form_input.service.delete')])->get();
                foreach ($invoiceServices as $invoiceService) {
                    $invoiceService->deleted_by = $this->me->id;
                    $invoiceService->saveOrFail();
                    $invoiceService->delete();
                }
                $isUpdating = true;
            }
            if ($request->has(__('invoices.form_input.taxes.input'))) {
                foreach ($request[__('invoices.form_input.taxes.input')] as $item) {
                    if (array_key_exists(__('invoices.form_input.taxes.id'), $item)) {
                        $invoiceTax = CustomerInvoiceTax::where('id', $item[__('invoices.form_input.taxes.id')])->first();
                        if ($invoiceTax->tax != $item[__('taxes.form_input.name')]) {
                            $invoiceTax->updated_by = $this->me->id;
                            $isUpdating = true;
                        }
                    } else {
                        $invoiceTax = new CustomerInvoiceTax();
                        $invoiceTax->id = Uuid::uuid4()->toString();
                        $invoiceTax->invoice = $invoice->id;
                        $invoiceTax->created_by = $this->me->id;
                    }
                    $invoiceTax->tax = $item[__('taxes.form_input.name')];
                    $invoiceTax->saveOrFail();
                }
            }
            if ($request->has(__('invoices.form_input.service.taxes.delete'))) {
                $invoiceTaxes = CustomerInvoiceTax::whereIn('id', $request[__('invoices.form_input.service.taxes.delete')])->get();
                foreach ($invoiceTaxes as $invoiceTax) {
                    $invoiceTax->deleted_by = $this->me->id;
                    $invoiceTax->saveOrFail();
                    $invoiceTax->delete();
                }
                $isUpdating = true;
            }
            if ($request->has(__('invoices.form_input.discounts.input'))) {
                foreach ($request[__('invoices.form_input.discounts.input')] as $item) {
                    if (array_key_exists(__('invoices.form_input.discounts.id'), $item)) {
                        $invoiceDiscount = CustomerInvoiceDiscount::where('id', $item[__('invoices.form_input.discounts.id')])->first();
                        if ($invoiceDiscount->discount != $item[__('discounts.form_input.name')]) {
                            $invoiceDiscount->updated_by = $this->me->id;
                            $isUpdating = true;
                        }
                    } else {
                        $invoiceDiscount = new CustomerInvoiceDiscount();
                        $invoiceDiscount->id = Uuid::uuid4()->toString();
                        $invoiceDiscount->invoice = $invoice->id;
                        $invoiceDiscount->created_by = $this->me->id;
                    }
                    $invoiceDiscount->discount = $item[__('discounts.form_input.name')];
                    $invoiceDiscount->saveOrFail();
                }
            }
            if ($request->has(__('invoices.form_input.discounts.delete'))) {
                $invoiceDiscounts = CustomerInvoiceDiscount::whereIn('id', $request[__('invoices.form_input.discounts.delete')])->get();
                foreach ($invoiceDiscounts as $invoiceDiscount) {
                    $invoiceDiscount->deleted_by = $this->me->id;
                    $invoiceDiscount->saveOrFail();
                    $invoiceDiscount->delete();
                }
                $isUpdating = true;
            }
            if ($isUpdating) {
                $invoice->updated_by = $this->me->id;
                $invoice->saveOrFail();
            }
            return $this->table(new Request(['id' => $invoice->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return mixed
     * @throws Throwable
     */
    public function create(Request $request) {
        try {
            $billPeriod = Carbon::parse($request[__('invoices.form_input.bill_period')]);
            $invoice = new CustomerInvoice();
            $invoice->id = Uuid::uuid4()->toString();
            $orderId = mt_rand(1111111111,9999999999);
            while (CustomerInvoice::where('order_id', $orderId)->get('id')->count() > 0) {
                $orderId = mt_rand(1111111111,9999999999);
            }
            $invoice->order_id = $orderId;
            $invoice->customer = $request[__('customers.form_input.name')];
            $invoice->code = generateCustomerInvoiceCode($billPeriod);
            $invoice->bill_period = $billPeriod->format('Y-m-d');
            if ($request->has(__('invoices.form_input.note'))) {
                $invoice->note = $request[__('invoices.form_input.note')];
            }
            $invoice->due_at = $billPeriod->addDays(5)->format('Y-m-d H:i:s');
            $invoice->created_by = $this->me->id;
            $invoice->saveOrFail();

            if ($request->has(__('invoices.form_input.service.input'))) {
                foreach ($request[__('invoices.form_input.service.input')] as $index => $item) {
                    $service = NasProfile::where('id', $item[__('profiles.form_input.name')])->first();
                    if ($service != null) {
                        $invoiceService = new CustomerInvoiceService();
                        $invoiceService->id = Uuid::uuid4()->toString();
                        $invoiceService->invoice = $invoice->id;
                        $invoiceService->service = $service->id;
                        $invoiceService->order = $index;
                        $invoiceService->amount = $service->price;
                        $invoiceService->note = $service->name;
                        $invoiceService->created_by = $this->me->id;
                        $invoiceService->saveOrFail();
                    }
                }
            }
            if ($request->has(__('invoices.form_input.taxes.input'))) {
                foreach ($request[__('invoices.form_input.taxes.input')] as $item) {
                    $invoiceTax = new CustomerInvoiceTax();
                    $invoiceTax->id = Uuid::uuid4()->toString();
                    $invoiceTax->invoice = $invoice->id;
                    $invoiceTax->tax = $item[__('taxes.form_input.name')];
                    $invoiceTax->created_by = $this->me->id;
                    $invoiceTax->saveOrFail();
                }
            }
            if ($request->has(__('invoices.form_input.discounts.input'))) {
                foreach ($request[__('invoices.form_input.discounts.input')] as $item) {
                    $invoiceDiscount = new CustomerInvoiceDiscount();
                    $invoiceDiscount->id = Uuid::uuid4()->toString();
                    $invoiceDiscount->invoice = $invoice->id;
                    $invoiceDiscount->discount = $item[__('discounts.form_input.name')];
                    $invoiceDiscount->created_by = $this->me->id;
                    $invoiceDiscount->saveOrFail();
                }
            }
            return $this->table(new Request(['id' => $invoice->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return mixed
     * @throws Throwable
     */
    public function payment(Request $request) {
        try {
            $invoice = CustomerInvoice::where('id', $request[__('invoices.form_input.id')])->first();
            if ($request->has(__('invoices.payments.form_input.payment.input'))) {
                foreach ($request[__('invoices.payments.form_input.payment.input')] as $item) {
                    if (array_key_exists(__('invoices.payments.form_input.payment.id'), $item)) {
                        $payment = CustomerInvoicePayment::where('id', $item[__('invoices.payments.form_input.payment.id')])->first();
                        if ($payment->amount != (float) $item[__('invoices.payments.form_input.payment.amount')]) {
                            $payment->updated_by = $this->me->id;
                        }
                        if ($payment->note != $item[__('invoices.payments.form_input.payment.note')]) {
                            $payment->updated_by = $this->me->id;
                        }
                        if (! Carbon::parse($item[__('invoices.payments.form_input.payment.date')])->isSameAs(Carbon::parse($invoice->paid_at))) {
                            $payment->updated_by = $this->me->id;
                        }
                    } else {
                        $payment = new CustomerInvoicePayment();
                        $payment->id = Uuid::uuid4()->toString();
                        $payment->invoice = $invoice->id;
                        $payment->code = generateCustomerPaymentCode(Carbon::parse($item[__('invoices.payments.form_input.payment.date')]));
                        $payment->created_by = $this->me->id;
                    }
                    $payment->paid_at = Carbon::parse($item[__('invoices.payments.form_input.payment.date')])->format('Y-m-d H:i:s');
                    $payment->amount = (float) $item[__('invoices.payments.form_input.payment.amount')];
                    $payment->note = $item[__('invoices.payments.form_input.payment.note')];
                    $payment->saveOrFail();
                }
            }
            if ($request->has(__('invoices.payments.form_input.payment.delete'))) {
                $payments = CustomerInvoicePayment::whereIn('id', $request[__('invoices.payments.form_input.payment.delete')])->get();
                foreach ($payments as $payment) {
                    $payment->deleted_by = $this->me->id;
                    $payment->saveOrFail();
                    $payment->delete();
                }
            }
            if ($request->has(__('invoices.payments.form_input.total.payment'))) {
                if ($request[__('invoices.payments.form_input.total.payment')] == 0) {
                    if ($invoice->paid_at == null) {
                        $invoice->paid_at = Carbon::now()->format('Y-m-d H:i:s');
                        $invoice->paid_by = $this->me->id;
                    }
                } else {
                    $invoice->paid_at = null;
                    $invoice->paid_by = null;
                }
                $invoice->saveOrFail();
            }
            return $this->table(new Request(['id' => $invoice->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
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
