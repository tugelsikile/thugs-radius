<?php /** @noinspection PhpUndefinedMethodInspection */

/** @noinspection PhpUndefinedFieldInspection */

namespace App\Repositories\Client;

use App\Models\Company\CompanyPackage;
use App\Models\Company\Invoice\CompanyInvoice;
use App\Models\Company\Invoice\CompanyInvoicePackage;
use App\Models\Company\Invoice\CompanyInvoicePayment;
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
            CompanyInvoice::whereIn('id', $request->id)->delete();
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
            $invoice = CompanyInvoice::where('id', $request->id)->first();
            $invoice->company = $request[__('companies.form_input.name')];
            $invoice->periode = Carbon::parse($request[__('companies.invoices.form_input.periode')])->format('Y-m-d');
            $invoice->discount = (float) $request[__('companies.invoices.form_input.discount')];
            $invoice->vat = (float) $request[__('companies.invoices.form_input.vat')];
            $invoice->updated_by = $me->id;
            $invoice->saveOrFail();

            if ($request->has(__('companies.invoices.form_input.package.input'))) {
                foreach ($request[__('companies.invoices.form_input.package.input')] as $item) {
                    if (array_key_exists('id', $item)) {
                        $additional = CompanyInvoicePackage::where('id', $item['id'])->first();
                        $additional->updated_by = $me->id;
                    } else {
                        $additional = new CompanyInvoicePackage();
                        $additional->created_by = $me->id;
                        $additional->id = Uuid::uuid4()->toString();
                        $additional->invoice = $invoice->id;
                    }
                    $additional->package = $item[__('companies.invoices.form_input.package.name')];
                    $package = CompanyPackage::where('id', $additional->package)->first();
                    if ($package != null) {
                        $additional->package_name = $package->name;
                        $additional->package_description = $package->package_description;
                    }
                    $additional->price = (float) $item[__('companies.invoices.form_input.package.price')];
                    $additional->vat = (float) $item[__('companies.invoices.form_input.package.vat')];
                    $additional->discount = (float) $item[__('companies.invoices.form_input.package.discount')];
                    $additional->qty = (int) $item[__('companies.invoices.form_input.package.qty')];
                    $additional->saveOrFail();
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
    public function create(Request $request) {
        try {
            $me = auth()->guard('api')->user();
            $invoice = new CompanyInvoice();
            $invoice->id = Uuid::uuid4()->toString();
            $invoice->code = generateCompanyInvoiceCode();
            $invoice->company = $request[__('companies.form_input.name')];
            $invoice->periode = Carbon::parse($request[__('companies.invoices.form_input.periode')])->format('Y-m-d');
            $invoice->discount = (float) $request[__('companies.invoices.form_input.discount')];
            $invoice->vat = (float) $request[__('companies.invoices.form_input.vat')];
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
                    $additional->vat = (float) $item[__('companies.invoices.form_input.package.vat')];
                    $additional->discount = (float) $item[__('companies.invoices.form_input.package.discount')];
                    $additional->qty = (int) $item[__('companies.invoices.form_input.package.qty')];
                    $additional->created_by = $me->id;
                    $additional->saveOrFail();
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
                            'periode' => Carbon::parse($invoice->periode),
                            'discount' => $invoice->discount,
                            'vat' => $invoice->vat,
                            'packages' => $this->packages($invoice),
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
                                'vat' => $package->vat,
                                'qty' => $package->qty,
                                'discount' => $package->discount,
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
