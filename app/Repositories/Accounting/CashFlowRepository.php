<?php

namespace App\Repositories\Accounting;

use App\Helpers\SwitchDB;
use App\Models\Accounting\Account;
use App\Models\Accounting\CashFlow;
use App\Models\Accounting\Category;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;

class CashFlowRepository
{
    protected $me;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
        if ($this->me != null) {
            if ($this->me->company != null) {
                new SwitchDB();
            }
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
            $cashFlows = CashFlow::orderBy('period', 'asc');
            if ($request->has(__('cash_flow.form_input.id'))) $cashFlows = $cashFlows->where('id', $request[__('cash_flow.form_input.id')]);
            if ($request->has(__('cash_flow.form_input.periods.start')) && $request->has(__('cash_flow.form_input.periods.end'))) $cashFlows = $cashFlows->whereBetween('period', [$request[__('cash_flow.form_input.periods.start')], $request[__('cash_flow.form_input.periods.end')]]);
            if ($request->has(__('cash_flow.form_input.account.name'))) $cashFlows = $cashFlows->where('account', $request[__('cash_flow.form_input.account.name')]);
            $cashFlows = $cashFlows->get();
            if ($cashFlows->count() > 0) {
                foreach ($cashFlows as $cashFlow) {
                    $response->push((object) [
                        'value' => $cashFlow->id,
                        'label' => $cashFlow->description,
                        'meta' => (object) [
                            'code' => $cashFlow->code,
                            'account' => $this->accountTable(new Request([__('cash_flow.form_input.account.id') => $cashFlow->account]))->first(),
                            'category' => $this->categoryTable(new Request([__('cash_flow.form_input.category.id') => $cashFlow->category]))->first(),
                            'type' => $cashFlow->type,
                            'amount' => [
                                'credit' => $cashFlow->type == 'credit' ? $cashFlow->amount : 0,
                                'debit' => $cashFlow->type == 'debit' ? $cashFlow->amount : 0,
                                'amount' => $cashFlow->amount,
                            ],
                            'period' => $cashFlow->period,
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
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function categoryTable(Request $request): Collection
    {
        try {
            $response = collect();
            $categories = Category::orderBy('created_at', 'asc');
            if ($request->has(__('cash_flow.form_input.category.id'))) $categories = $categories->where('id', $request[__('cash_flow.form_input.category.id')]);
            $categories = $categories->get();
            if ($categories->count() > 0) {
                foreach ($categories as $category) {
                    $response->push((object) [
                        'value' => $category->id,
                        'label' => $category->name,
                        'meta' => (object) [
                            'description' => $category->description == null ? '' : $category->description,
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
     * @param Request $request
     * @return Collection
     * @throws Exception
     */
    public function accountTable(Request $request): Collection
    {
        try {
            $response = collect();
            $accounts = Account::orderBy('created_at', 'asc');
            if ($request->has(__('cash_flow.form_input.account.id'))) $accounts = $accounts->where('id', $request[__('cash_flow.form_input.account.id')]);
            $accounts = $accounts->get();
            if ($accounts->count() > 0) {
                foreach ($accounts as $account) {
                    $response->push((object) [
                        'value' => $account->id,
                        'label' => $account->name,
                        'meta' => (object) [
                            'description' => $account->description == null ? '' : $account->description,
                        ]
                    ]);
                }
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function storeCategory(Request $request) {
        try {
            if ($request->has(__('cash_flow.form_input.category.id'))) {
                $category = Category::where('id', $request[__('cash_flow.form_input.category.id')])->first();
            } else {
                $category = new Category();
                $category->code = generateCategoryCode();
                $category->id = Uuid::uuid4()->toString();
            }
            $category->name = $request[__('cash_flow.form_input.category.name')];
            $category->description = $request[__('cash_flow.form_input.category.description')];
            $category->saveOrFail();
            return $this->categoryTable(new Request([__('cash_flow.form_input.category.id') => $category->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    public function storeAccount(Request $request) {
        try {
            if ($request->has(__('cash_flow.form_input.account.id'))) {
                $account = Account::where('id', $request[__('cash_flow.form_input.account.id')])->first();
            } else {
                $account = new Account();
                $account->id = Uuid::uuid4()->toString();
                $account->code = generateAccountCode();
            }
            $account->name = $request[__('cash_flow.form_input.account.name')];
            $account->description = $request[__('cash_flow.form_input.account.description')];
            $account->saveOrFail();
            return $this->accountTable(new Request([__('cash_flow.form_input.account.id') => $account->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    public function store(Request $request) {
        try {
            if ($request->has(__('cash_flow.form_input.id'))) {
                $cashFlow = CashFlow::where('id', $request[__('cash_flow.form_input.id')])->first();
            } else {
                $cashFlow = new CashFlow();
                $cashFlow->id = Uuid::uuid4()->toString();
                $cashFlow->code = generateCashFlowCode($request[__('cash_flow.form_input.periods.label')]);
            }
            $cashFlow->account = $request[__('cash_flow.form_input.account.label')];
            $cashFlow->category = $request[__('cash_flow.form_input.category.label')];
            $cashFlow->description = $request[__('cash_flow.form_input.description')];
            $cashFlow->type = $request[__('cash_flow.form_input.type')];
            $cashFlow->amount = $request[__('cash_flow.form_input.amount')];
            $cashFlow->period = $request[__('cash_flow.form_input.periods.label')];
            $cashFlow->saveOrFail();
            return $this->table(new Request([__('cash_flow.form_input.id') => $cashFlow->id]))->first();
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
            CashFlow::whereIn('id', $request[__('cash_flow.form_input.id')])->delete();
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
