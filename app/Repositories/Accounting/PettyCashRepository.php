<?php

namespace App\Repositories\Accounting;

use App\Helpers\SwitchDB;
use App\Models\Accounting\PettyCash;
use App\Repositories\User\UserRepository;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Exception;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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

    /* @
     * @param Carbon $period
     * @return Collection
     * @throws Exception
     */
    public function pettyCashPeriod(Carbon $period): Collection
    {
        try {
            new SwitchDB();
            $response = collect();
            $pettyCashes = PettyCash::whereDate('period', $period->format('Y-m-d'))->orderBy('period', 'asc')->get('id');
            if ($pettyCashes->count() > 0) {
                foreach ($pettyCashes as $pettyCash) {
                    $response = $response->merge($this->pettyCashDetail(new Request(['id' => $pettyCash])));
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
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
