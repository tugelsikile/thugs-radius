<?php

namespace App\Repositories\Accounting;

use App\Helpers\SwitchDB;
use App\Models\Accounting\PettyCash;
use App\Models\Company\ClientCompany;
use App\Repositories\User\UserRepository;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Exception;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use PhpOffice\PhpSpreadsheet\Settings;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Ramsey\Uuid\Uuid;

class PettyCashRepository
{
    protected ?Authenticatable $me = null;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
    }

    /* @
     * @param Request $request
     * @return bool
     * @throws Exception
     */
    public function delete(Request $request): bool
    {
        try {
            new SwitchDB();
            PettyCash::whereIn('id', $request[__('petty_cash.form_input.id')])->delete();
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function store(Request $request) {
        try {
            new SwitchDB();
            if ($request->has(__('petty_cash.form_input.id'))) {
                $pettyCash = PettyCash::where('id', $request[__('petty_cash.form_input.id')])->first();
                if ($this->me != null) {
                    $pettyCash->updated_by = $this->me->id;
                }
                $pettyCash->type = $request[__('petty_cash.form_input.type')];
            } else {
                $pettyCash = new PettyCash();
                $pettyCash->id = Uuid::uuid4()->toString();
                $pettyCash->type = $request[__('petty_cash.form_input.type')];
                if ($this->me != null) {
                    $pettyCash->created_by = $this->me->id;
                }
                if ($pettyCash->type == 'input') {
                    if ($this->me != null) {
                        $pettyCash->approved_by = $this->me->id;
                    }
                    $pettyCash->approved_at = Carbon::now()->format('Y-m-d H:i:s');
                }
            }
            $pettyCash->name = $request[__('petty_cash.form_input.name')];
            $pettyCash->period = Carbon::parse($request[__('petty_cash.form_input.period')])->format('Y-m-d H:i:s');
            $pettyCash->description = $request[__('petty_cash.form_input.description')];
            $pettyCash->amount = (double) $request[__('petty_cash.form_input.amount')];
            $pettyCash->has_approval = false;
            if ($pettyCash->type != 'input') {
                $pettyCash->amount = 0 - $pettyCash->amount;
                $pettyCash->has_approval = true;
            }
            $pettyCash->saveOrFail();
            return $this->pettyCashDetail(new Request(['id' => $pettyCash->id]))->first();
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
            $response = collect();
            if ($request->has(__('petty_cash.form_input.period'))) {
                $endDate = Carbon::parse($request[__('petty_cash.form_input.period')])->endOfMonth();
                $startDate = Carbon::parse($endDate)->firstOfMonth();
                $periods = CarbonPeriod::between($startDate, $endDate);
                foreach ($periods as $period) {
                    //$data = $this->pettyCashPeriod(Carbon::parse($period));
                    $response->push((object) [
                        'value' => $period->format('Y-m-d'),
                        'label' => $period->format('Y-m-d'),
                        'data' => $this->pettyCashDetail(new Request([
                            __('petty_cash.form_input.period') => $period->format('Y-m-d')
                        ])),
                    ]);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    public function print(Request $request): Collection
    {
        try {
            $response = collect();
            $period = Carbon::parse($request->period);
            $pettyCashes = PettyCash::whereYear('period', $period->format('Y'))->whereMonth('period', $period->format('m'))->orderBy('period', 'asc')->get('id');
            if ($pettyCashes->count() > 0) {
                foreach ($pettyCashes as $pettyCash) {
                    $response = $response->merge($this->pettyCashDetail(new Request(['id' => $pettyCash->id])));
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function pettyCashDetail(Request $request): Collection
    {
        try {
            new SwitchDB();
            $response = collect();
            //dd($request->all(), __('petty_cash.form_input.period'), $request[__('petty_cash.form_input.period')]);
            $pettyCashes = PettyCash::orderBy('period', 'asc');
            if (strlen($request->id) > 0) $pettyCashes = $pettyCashes->where('id', $request->id);
            if ($request->has(__('petty_cash.form_input.period'))) $pettyCashes = $pettyCashes->whereDate('period', Carbon::parse($request[__('petty_cash.form_input.period')])->format('Y-m-d'));
            $pettyCashes = $pettyCashes->get();
            foreach ($pettyCashes as $pettyCash) {
                $createdBy = null;
                $updatedBy = null;
                $approvedBy = null;
                $description = "";
                if ($pettyCash->description != null) $description = $pettyCash->description;
                if ($pettyCash->approved_by != null) {
                    $approvedBy = (new UserRepository())->table(new Request(['id' => $pettyCash->approved_by]))->first();
                }
                if ($pettyCash->created_by != null) {
                    $createdBy = (new UserRepository())->table(new Request(['id' => $pettyCash->created_by]))->first();
                }
                if ($pettyCash->updated_by != null) {
                    $updatedBy = (new UserRepository())->table(new Request(['id' => $pettyCash->updated_by]))->first();
                }
                $response->push((object) [
                    'value' => $pettyCash->id,
                    'label' => $pettyCash->name,
                    'period' => Carbon::parse($pettyCash->period)->format('Y-m-d'),
                    'meta' => (object) [
                        'description' => $description,
                        'type' => $pettyCash->type,
                        'amount' => $pettyCash->amount,
                        'remarks' => $pettyCash->remarks,
                        'timestamps' => (object) [
                            'approve' => (object) [
                                'has' => $pettyCash->has_approval,
                                'at' => $pettyCash->approved_at,
                                'by' => $approvedBy,
                            ],
                            'create' => (object) [
                                'at' => $pettyCash->created_at,
                                'by' => $createdBy,
                            ],
                            'update' => (object) [
                                'at' => $pettyCash->updated_at,
                                'by' => $updatedBy,
                            ]
                        ],
                    ]
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed|null
     * @throws Exception
     */
    public function approve(Request $request) {
        try {
            $pettyCash = PettyCash::where('id', $request[__('petty_cash.form_input.id')])->first();
            if ($pettyCash != null) {
                if ($this->me != null) {
                    $pettyCash->approved_by = $this->me->id;
                }
                $pettyCash->approved_at = Carbon::now()->format('Y-m-d H:i:s');
                $pettyCash->saveOrFail();
                return $this->pettyCashDetail(new Request(['id' => $pettyCash->id]))->first();
            }
            return null;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function download(Request $request) {
        try {
            $company = ClientCompany::where('id', $request->id)->first();
            if ($company == null) {
                throw new Exception("Invalid parameter",400);
            } else {
                $dbParam = [
                    'charset' => 'utf8mb4',
                    'collation' => 'utf8mb4_unicode_ci',
                    'driver' => 'mysql',
                    'host' => $company->radius_db_host,
                    'port' => env('DB_RADIUS_PORT'),
                    'database' => $company->radius_db_name,
                    'username' => $company->radius_db_user,
                    'password' => $company->radius_db_pass
                ];
                new SwitchDB("database.connections.radius", $dbParam);
                if ($request->has('period')) {
                    $formatFile = storage_path() . '/templates/format_petty_cash.xlsx';
                    if (! File::exists($formatFile)) {
                        throw new Exception("Format file not found",400);
                    } else {
                        $reader = new Xlsx();
                        $spreadsheet = $reader->load($formatFile);
                        if (! $spreadsheet->sheetNameExists("data")) {
                            throw new Exception("invalid format file",400);
                        } else {
                            $spreadsheet->getDefaultStyle()->getFont()->setName('Tahoma');
                            $spreadsheet->getDefaultStyle()->getFont()->setSize(8);
                            $validLocale = Settings::setLocale(excelLocale());
                            if (!$validLocale) {
                                Settings::setLocale("en_US");
                            }
                            $currentDate    = Carbon::now();
                            $targetMonth    = Carbon::parse($request->period);
                            $name           = __('petty_cash.labels.menu') . ' ' . $targetMonth->translatedFormat('F Y');
                            $fileName       = Str::slug($name) . ".xlsx";
                            $spreadsheet->getProperties()->setTitle($name)->setSubject($name);
                            $pettyCashes    = PettyCash::whereMonth('period', $targetMonth->format('m'))->whereYear('period', $targetMonth->format('Y'))->orderBy('period', 'asc')->whereNotNull('approved_at')->get();

                            $sheet = $spreadsheet->setActiveSheetIndexByName("data");
                            $sheet  ->setCellValue("A1", __('petty_cash.labels.menu'))
                                ->setCellValue("A4",__('labels.date', [ 'Attribute' => __('labels.download', [ 'Attribute' => '' ]) ]) . " : " . $currentDate->translatedFormat('d F Y, H:i:s'))
                                ->setCellValue("A3", __('petty_cash.labels.period') . " : " . Carbon::parse($targetMonth)->translatedFormat('F Y'))
                                ->setCellValue("B6", __('labels.date', ['Attribute' => '']))
                                ->setCellValue("C6", __('petty_cash.labels.name'))
                                ->setCellValue("D6", __('petty_cash.labels.description'))
                                ->setCellValue("E6", __('petty_cash.labels.type'))
                                ->setCellValue("F6", __('petty_cash.labels.amount'))
                                ->setCellValue("G6", __('petty_cash.labels.balance'));
                            $sheet->getRowDimension(6)->setRowHeight(20);
                            $row = 8;
                            $firstRow = 8;
                            if ($pettyCashes->count() > 0) {
                                foreach ($pettyCashes as $index => $pettyCash) {
                                    $endBalance = $pettyCash->amount;
                                    if ($index > 0) {
                                        $endBalance = "=G" . ($row - 1) . "+F$row";
                                    }
                                    $sheet  ->setCellValue("A$row", $index + 1)
                                            ->setCellValue("B$row", $pettyCash->period->translatedFormat('d F Y'))
                                            ->setCellValue("C$row", $pettyCash->name)
                                            ->setCellValue("D$row", $pettyCash->description)
                                            ->setCellValue("E$row", __('petty_cash.labels.' . $pettyCash->type))
                                            ->setCellValue("F$row", $pettyCash->amount)
                                            ->setCellValue("G$row", $endBalance);
                                    $row++;
                                }
                                $row--;
                            }
                            $sheet->getStyle("F$firstRow:G$row")->getNumberFormat()->setFormatCode(excelNumberFormat());
                            $sheet->getStyle("A$firstRow:A$row")->getAlignment()->setHorizontal("center")->setVertical("center");
                            $sheet->getStyle("A$firstRow:G$row")->applyFromArray(excelProperBorder());

                            $row++;
                            $sheet->mergeCells("A$row:F$row");
                            $sheet->getRowDimension($row)->setRowHeight(20);
                            $sheet  ->setCellValue("A$row", __('petty_cash.labels.end_balance.label'))
                                    ->setCellValue("G$row", "=G" . ( $row - 1 ));
                            $sheet->getStyle("A$row:G$row")->getAlignment()->setHorizontal("right")->setVertical("center");
                            $sheet->getStyle("A$row:G$row")->getFont()->setBold(true);
                            $sheet->getStyle("G$row")->getNumberFormat()->setFormatCode(excelNumberFormat());
                            $sheet->getStyle("A$row:G$row")->applyFromArray(excelProperBorder());

                            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                            header('Content-Disposition: attachment;filename="' . $fileName . '"');
                            header('Cache-Control: max-age=0');
                            $writer = IOFactory::createWriter($spreadsheet,"Xlsx");
                            $writer->save("php://output");
                        }
                    }
                } else {
                    throw new Exception("no period selected",400);
                }
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function switchDBManual(Request $request) {
        try {
            $company = ClientCompany::where('id', $request->id)->first();
            if ($company == null) {
                throw new Exception("Invalid parameter",400);
            } else {
                $dbParam = [
                    'charset' => 'utf8mb4',
                    'collation' => 'utf8mb4_unicode_ci',
                    'driver' => 'mysql',
                    'host' => $company->radius_db_host,
                    'port' => env('DB_RADIUS_PORT'),
                    'database' => $company->radius_db_name,
                    'username' => $company->radius_db_user,
                    'password' => $company->radius_db_pass
                ];
                new SwitchDB("database.connections.radius", $dbParam);
            }
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
