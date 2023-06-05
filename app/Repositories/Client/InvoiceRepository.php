<?php /** @noinspection DuplicatedCode */
/** @noinspection PhpUndefinedMethodInspection */

/** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories\Client;

use App\Models\Company\AdditionalPackage;
use App\Models\Company\ClientCompany;
use App\Models\Company\CompanyDiscount;
use App\Models\Company\CompanyPackage;
use App\Models\Company\CompanyTax;
use App\Models\Company\Invoice\CompanyInvoice;
use App\Models\Company\Invoice\CompanyInvoiceDiscount;
use App\Models\Company\Invoice\CompanyInvoicePackage;
use App\Models\Company\Invoice\CompanyInvoicePayment;
use App\Models\Company\Invoice\CompanyInvoiceTax;
use App\Models\Discount;
use App\Models\Tax;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;
use Throwable;

class InvoiceRepository
{
    protected $packageRepository;
    public function __construct()
    {
        $this->packageRepository = new PackageRepository();
    }

    /* @
     * @param Request $request
     * @return bool
     * @throws Throwable
     */
    public function generate(Request $request): bool
    {
        try {
            $dataCount = 0;
            $me = auth()->guard('api')->user();
            $currentPeriode = Carbon::parse($request->id);
            $existing = CompanyInvoice::whereMonth('periode', Carbon::parse($request->id)->format('m'))->whereYear('periode', Carbon::parse($request->id)->format('Y'))->get('company')->map(function ($data) { return $data->company; })->toArray();
            $companies = ClientCompany::whereNotIn('id', $existing)->whereDate('active_at', '<=', Carbon::parse($request->id)->toDateString())->whereNotNull('active_at')->get();
            if ($companies->count() > 0) {
                foreach ($companies as $company) {
                    $mainPackage = CompanyPackage::where('id', $company->package)->first();
                    if ($mainPackage != null) {
                        $invoice = new CompanyInvoice();
                        $invoice->id = Uuid::uuid4()->toString();
                        $invoice->order_id = Uuid::uuid4()->toString();
                        $invoice->code = generateCompanyInvoiceCode();
                        $invoice->company = $company->id;
                        $invoice->periode = $currentPeriode->firstOfMonth()->addDays(5)->format('Y-m-d');
                        $invoice->payment_due = Carbon::parse($invoice->periode)->format('Y-m-') . '20';
                        $invoice->created_by = $me->id;
                        $invoice->saveOrFail();
                        $invoicePackage = new CompanyInvoicePackage();
                        $invoicePackage->id = Uuid::uuid4()->toString();
                        $invoicePackage->invoice = $invoice->id;
                        $invoicePackage->package = $mainPackage->id;
                        $invoicePackage->package_name = $mainPackage->name;
                        $invoicePackage->package_description = $mainPackage->description;
                        $invoicePackage->price = $mainPackage->base_price;
                        $invoicePackage->qty = 1;
                        $invoicePackage->created_by = $me->id;
                        $invoicePackage->saveOrFail();
                        //create discount
                        $companyDiscounts = CompanyDiscount::where('company', $company->id)->orderBy('created_at', 'asc')->get();
                        foreach ($companyDiscounts as $companyDiscount) {
                            $discount = Discount::where('id', $companyDiscount->discount)->first();
                            if ($discount != null) {
                                $invoiceDiscount = new CompanyInvoiceDiscount();
                                $invoiceDiscount->id = Uuid::uuid4()->toString();
                                $invoiceDiscount->invoice = $invoice->id;
                                $invoiceDiscount->discount = $discount->id;
                                $invoiceDiscount->saveOrFail();
                            }
                        }
                        //create taxes
                        $companyTaxes = CompanyTax::where('company', $company->id)->orderBy('created_at', 'asc')->get();
                        foreach ($companyTaxes as $companyTax) {
                            $tax = Tax::where('id', $companyTax->tax)->first();
                            if ($tax != null) {
                                $invoiceTax = new CompanyInvoiceTax();
                                $invoiceTax->id = Uuid::uuid4()->toString();
                                $invoiceTax->invoice = $invoice->id;
                                $invoiceTax->tax = $tax->id;
                                $invoiceTax->saveOrFail();
                            }
                        }

                        $additionalPackages = AdditionalPackage::where('company', $company->id)->orderBy('created_at', 'asc')->get();
                        foreach ($additionalPackages as $additionalPackage) {
                            if ($additionalPackage->otp) { //cari invoice sebelum ini
                                $lastInvoice = CompanyInvoice::whereMonth('periode', Carbon::parse($request->id)->addMonths(-1)->format('m'))
                                    ->whereYear('periode',Carbon::parse($request->id)->format('Y'))->where('company', $company->id)->first();
                            } else if ($additionalPackage->paid_every_ammount > 0){
                                $lastInvoice = CompanyInvoice::whereMonth('periode', Carbon::parse($request->id)->addMonths(0 - $additionalPackage->paid_every_ammount)->format(','))
                                    ->whereYear('periode', Carbon::parse($request->id)->addMonths(0-$additionalPackage->paid_every_ammount))->where('company', $company->id)->first();
                            } else {
                                $lastInvoice = (object) ['exists' => true ];
                            }
                            if ($lastInvoice == null) {
                                $package = CompanyPackage::where('id', $additionalPackage->package)->first();
                                if ($package != null) {
                                    $invoicePackage = new CompanyInvoicePackage();
                                    $invoicePackage->id = Uuid::uuid4()->toString();
                                    $invoicePackage->invoice = $invoice->id;
                                    $invoicePackage->package = $package->id;
                                    $invoicePackage->package_name = $package->name;
                                    $invoicePackage->package_description = $package->description;
                                    $invoicePackage->price = $package->base_price;
                                    $invoicePackage->qty = $additionalPackage->qty;
                                    $invoicePackage->created_by = $me->id;
                                    $invoicePackage->saveOrFail();
                                }
                            }
                        }
                        $dataCount++;
                    }
                }
            }
            return $dataCount > 0;
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
            $me = auth()->guard('api')->user();
            $invoice = CompanyInvoice::where('id', $request[__('companies.invoices.form_input.name')])->first();
            $sumInvoice = collect($request[__('companies.invoices.payments.form_input.name')])->sum(__('companies.invoices.payments.form_input.amount'));
            if ($sumInvoice > $request[__('companies.invoices.payments.form_input.max_amount')]) throw new Exception(__('companies.invoices.payments.labels.error_amount'),400);
            if ($request->has(__('companies.invoices.payments.form_input.name'))) {
                foreach ($request[__('companies.invoices.payments.form_input.name')] as $item) {
                    if (array_key_exists(__('companies.invoices.payments.form_input.id'), $item)) {
                        $payment = CompanyInvoicePayment::where('id', $item[__('companies.invoices.payments.form_input.id')])->first();
                    } else {
                        $payment = new CompanyInvoicePayment();
                        $payment->id = Uuid::uuid4()->toString();
                        $payment->code = generateCompanyInvoicePaymentCode($item[__('companies.invoices.payments.form_input.date')]);
                        $payment->invoice = $invoice->id;
                    }
                    $payment->paid_amount = (float) $item[__('companies.invoices.payments.form_input.amount')];
                    $payment->note = $item[__('companies.invoices.payments.form_input.note')];
                    $payment->paid_at = Carbon::parse($item[__('companies.invoices.payments.form_input.date')])->format('Y-m-d H:i:s');
                    $payment->paid_by = $me->id;
                    $payment->created_by = $me->id;
                    $payment->saveOrFail();
                }
            }
            if ($request->has(__('companies.invoices.payments.form_input.delete'))) {
                CompanyInvoicePayment::whereIn('id', $request[__('companies.invoices.payments.form_input.delete')])->delete();
            }
            if ($sumInvoice == $request[__('companies.invoices.payments.form_input.max_amount')]) {
                $invoice->paid_at = Carbon::now()->format('Y-m-d H:i:s');
                $invoice->paid_by = $me->id;
            } else {
                $invoice->paid_at = null;
                $invoice->paid_by = null;
            }
            $invoice->saveOrFail();

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
            $me = auth()->guard('api')->user();
            $invoices = CompanyInvoice::whereIn('id', $request->id)->get();
            foreach ($invoices as $invoice) {
                $invoice->deleted_by = $me->id;
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
     * @return mixed
     * @throws Throwable
     */
    public function update(Request $request) {
        try {
            $me = auth()->guard('api')->user();
            $invoice = CompanyInvoice::where('id', $request[__('companies.invoices.form_input.id')])->first();
            $invoice->company = $request[__('companies.form_input.name')];
            $invoice->periode = Carbon::parse($request[__('companies.invoices.form_input.periode')])->format('Y-m-d');
            $invoice->updated_by = $me->id;
            $invoice->saveOrFail();

            if ($request->has(__('companies.invoices.form_input.package.input'))) {
                foreach ($request[__('companies.invoices.form_input.package.input')] as $item) {
                    if (array_key_exists(__('companies.invoices.form_input.package.id'), $item)) {
                        $additional = CompanyInvoicePackage::where('id', $item[__('companies.invoices.form_input.package.id')])->first();
                        $additional->updated_by = $me->id;
                    } else {
                        $additional = new CompanyInvoicePackage();
                        $additional->id = Uuid::uuid4()->toString();
                        $additional->invoice = $invoice->id;
                        $additional->created_by = $me->id;
                    }
                    $additional->package = $item[__('companies.invoices.form_input.package.name')];
                    $package = CompanyPackage::where('id', $additional->package)->first();
                    if ($package != null) {
                        $additional->package_name = $package->name;
                        $additional->package_description = $package->package_description;
                    }
                    $additional->price = (float) $item[__('companies.invoices.form_input.package.price')];
                    $additional->qty = (int) $item[__('companies.invoices.form_input.package.qty')];
                    $additional->saveOrFail();
                }
            }
            if ($request->has(__('companies.invoices.form_input.taxes.input'))) {
                foreach ($request[__('companies.invoices.form_input.taxes.input')] as $item) {
                    $tax = Tax::where('id', $item[__('companies.invoices.form_input.taxes.name')])->first();
                    if ($tax != null) {
                        if (array_key_exists(__('companies.invoices.form_input.taxes.id'), $item)) {
                            $invoiceTax = CompanyInvoiceTax::where('id', $item[__('companies.invoices.form_input.taxes.id')])->first();
                            $invoiceTax->updated_by = $me->id;
                        } else {
                            $invoiceTax = new CompanyInvoiceTax();
                            $invoiceTax->id = Uuid::uuid4()->toString();
                            $invoiceTax->invoice = $invoice->id;
                            $invoiceTax->created_by = $me->id;
                        }
                        $invoiceTax->tax = $tax->id;
                        $invoiceTax->saveOrFail();
                    }
                }
            }
            if ($request->has(__('companies.invoices.form_input.discounts.input'))) {
                foreach ($request[__('companies.invoices.form_input.discounts.input')] as $item) {
                    $discount = Discount::where('id', $item[__('companies.invoices.form_input.discounts.name')])->first();
                    if ($discount != null) {
                        if (array_key_exists(__('companies.invoices.form_input.discounts.id'), $item)) {
                            $invoiceDiscount = CompanyInvoiceDiscount::where('id', $item[__('companies.invoices.form_input.discounts.id')])->first();
                        } else {
                            $invoiceDiscount = new CompanyInvoiceDiscount();
                            $invoiceDiscount->id = Uuid::uuid4()->toString();
                            $invoiceDiscount->invoice = $invoice->id;
                        }
                        $invoiceDiscount->discount = $discount->id;
                        $invoiceDiscount->saveOrFail();
                    }
                }
            }
            if ($request->has(__('companies.invoices.form_input.package.input_delete'))) {
                CompanyInvoicePackage::whereIn('id', $request[__('companies.invoices.form_input.package.input_delete')])->delete();
            }
            if ($request->has(__('companies.invoices.form_input.taxes.delete'))) {
                CompanyInvoiceTax::whereIn('id', $request[__('companies.invoices.form_input.taxes.delete')])->delete();
            }
            if ($request->has(__('companies.invoices.form_input.discounts.delete'))) {
                CompanyInvoiceDiscount::whereIn('id', $request[__('companies.invoices.form_input.discounts.delete')])->delete();
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
            $me = auth()->guard('api')->user();
            $invoice = new CompanyInvoice();
            $invoice->id = Uuid::uuid4()->toString();
            $invoice->order_id = Uuid::uuid4()->toString();
            $invoice->code = generateCompanyInvoiceCode();
            $invoice->company = $request[__('companies.form_input.name')];
            $invoice->periode = Carbon::parse($request[__('companies.invoices.form_input.periode')])->format('Y-m-d');
            $invoice->payment_due = Carbon::parse($invoice->periode)->format('Y-m-') . '20';
            $invoice->created_by = $me->id;
            $invoice->saveOrFail();

            if ($request->has(__('companies.invoices.form_input.package.input'))) {
                foreach ($request[__('companies.invoices.form_input.package.input')] as $item) {
                    $additional = new CompanyInvoicePackage();
                    $additional->id = Uuid::uuid4()->toString();
                    $additional->invoice = $invoice->id;
                    $additional->package = $item[__('companies.invoices.form_input.package.name')];
                    $package = CompanyPackage::where('id', $additional->package)->first();
                    if ($package != null) {
                        $additional->package_name = $package->name;
                        $additional->package_description = $package->package_description;
                    }
                    $additional->price = (float) $item[__('companies.invoices.form_input.package.price')];
                    $additional->qty = (int) $item[__('companies.invoices.form_input.package.qty')];
                    $additional->created_by = $me->id;
                    $additional->saveOrFail();
                }
            }
            if ($request->has(__('companies.invoices.form_input.taxes.input'))) {
                foreach ($request[__('companies.invoices.form_input.taxes.input')] as $item) {
                    $tax = Tax::where('id', $item[__('companies.invoices.form_input.taxes.name')])->first();
                    if ($tax != null) {
                        $invoiceTax = new CompanyInvoiceTax();
                        $invoiceTax->id = Uuid::uuid4()->toString();
                        $invoiceTax->invoice = $invoice->id;
                        $invoiceTax->tax = $tax->id;
                        $invoiceTax->created_by = $me->id;
                        $invoiceTax->saveOrFail();
                    }
                }
            }
            if ($request->has(__('companies.invoices.form_input.discounts.input'))) {
                foreach ($request[__('companies.invoices.form_input.discounts.input')] as $item) {
                    $discount = Discount::where('id', $item[__('companies.invoices.form_input.discounts.name')])->first();
                    if ($discount != null) {
                        $invoiceDiscount = new CompanyInvoiceDiscount();
                        $invoiceDiscount->id = Uuid::uuid4()->toString();
                        $invoiceDiscount->invoice = $invoice->id;
                        $invoiceDiscount->discount = $discount->id;
                        $invoiceDiscount->saveOrFail();
                    }
                }
            }

            return $this->table(new Request(['id' => $invoice->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function table(Request $request): Collection
    {
        try {
            $me = auth()->guard('api')->user();
            $response = collect();
            $invoices = CompanyInvoice::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $invoices = $invoices->where('id', $request->id);
            if (strlen($request[__('companies.invoices.form_input.periode')]) > 0) {
                $periode = Carbon::parse($request[__('companies.invoices.form_input.periode')]);
                $invoices = $invoices->whereMonth('periode', $periode->format('m'))->whereYear('periode', $periode->format('Y'));
            }
            if ($me != null) {
                if ($me->company != null) $invoices = $invoices->where('company', $me->company);
            }
            $invoices = $invoices->get();
            if ($invoices->count() > 0) {
                foreach ($invoices as $invoice) {
                    $response->push((object) [
                        'value' => $invoice->id,
                        'label' => $invoice->code,
                        'meta' => (object) [
                            'company' => $invoice->companyObj,
                            'order_id' => $invoice->order_id,
                            'periode' => Carbon::parse($invoice->periode),
                            'packages' => $this->packages($invoice),
                            'discounts' => $this->discounts($invoice),
                            'taxes' => $this->taxes($invoice),
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => Carbon::parse($invoice->created_at)->format('Y-m-d H:i:s'),
                                    'by' => $invoice->createdBy
                                ],
                                'update' => (object) [
                                    'at' => Carbon::parse($invoice->updated_at)->format('Y-m-d H:i:s'),
                                    'by' => $invoice->updatedBy
                                ],
                                'deleted' => (object) [
                                    'at' => $invoice->deleted_at == null ? null : Carbon::parse($invoice->deleted_at)->format('Y-m-d H:i:s'),
                                    'by' => $invoice->deletedBy
                                ],
                                'paid' => (object) [
                                    'at' => $invoice->paid_at == null ? null : Carbon::parse($invoice->paid_at)->format('Y-m-d H:i:s'),
                                    'by' => $invoice->paidBy,
                                    'payments' => $this->payments($invoice),
                                    'due' => $invoice->payment_due === null ? null : Carbon::parse($invoice->payment_due)->format('Y-m-d H:i:s'),
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

    /* @
     * @param CompanyInvoice $invoice
     * @return Collection
     * @throws Exception
     */
    private function discounts(CompanyInvoice $invoice): Collection
    {
        try {
            $response = collect();
            $discounts = CompanyInvoiceDiscount::where('invoice', $invoice->id)->orderBy('created_at', 'asc')->get();
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
     * @param CompanyInvoice $invoice
     * @return Collection
     * @throws Exception
     */
    private function taxes(CompanyInvoice $invoice): Collection
    {
        try {
            $response = collect();
            $taxes = CompanyInvoiceTax::where('invoice', $invoice->id)->orderBy('created_at', 'asc')->get();
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
     * @param CompanyInvoice $invoice
     * @return Collection
     * @throws Exception
     */
    private function payments(CompanyInvoice $invoice): Collection
    {
        try {
            $response = collect();
            $payments = CompanyInvoicePayment::orderBy('code', 'asc')->where('invoice', $invoice->id)->get();
            if ($payments->count() > 0) {
                foreach ($payments as $payment) {
                    $response->push((object) [
                        'value' => $payment->id,
                        'label' => $payment->code,
                        'meta' => (object) [
                            'amount' => $payment->paid_amount,
                            'note' => $payment->note,
                            'pg' => (object) [
                                'response' => $payment->pg_response,
                                'fee' => $payment->pg_fee,
                            ],
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => Carbon::parse($payment->created_at)->format('Y-m-d H:i:s'),
                                    'by' => $payment->createdBy
                                ],
                                'update' => (object) [
                                    'at' => Carbon::parse($payment->updated_at)->format('Y-m-d H:i:s'),
                                    'by' => $payment->updatedBy
                                ],
                                'paid' => (object) [
                                    'at' => $payment->paid_at == null ? null : Carbon::parse($payment->paid_at)->format('Y-m-d H:i:s'),
                                    'by' => $payment->paidBy,
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

    /* @
     * @param CompanyInvoice $invoice
     * @return Collection
     * @throws Exception
     */
    private function packages(CompanyInvoice $invoice): Collection
    {
        try {
            $response = collect();
            $packages = CompanyInvoicePackage::orderBy('created_at', 'asc')->where('invoice', $invoice->id)->get();
            if ($packages->count() > 0) {
                foreach ($packages as $package) {
                    $response->push((object) [
                        'value' => $package->id,
                        'label' => $package->package_name,
                        'meta' => (object) [
                            'package' => $this->packageRepository->table(new Request(['id' => $package->package]))->first(),
                            'description' => (object) [
                                'package' => $package->package_description,
                                'user' => $package->user_note,
                            ],
                            'prices' => (object) [
                                'price' => $package->price,
                                'qty' => $package->qty,
                            ],
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => Carbon::parse($package->created_at)->format('Y-m-d H:i:s'),
                                    'by' => $package->createdBy,
                                ],
                                'update' => (object) [
                                    'at' => Carbon::parse($package->updated_at)->format('Y-m-d H:i:s'),
                                    'by' => $package->updatedBy,
                                ],
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
