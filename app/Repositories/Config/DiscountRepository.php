<?php /** @noinspection DuplicatedCode */
/** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories\Config;

use App\Models\Discount;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;
use Throwable;

class DiscountRepository
{
    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function update(Request $request) {
        try {
            $me = auth()->guard('api')->user();
            $discount = Discount::where('id', $request[__('discounts.form_input.id')])->first();
            if ($request->has(__('companies.form_input.name'))) {
                $discount->company = $request[__('companies.form_input.name')];
            } else {
                $discount->company = null;
            }
            $discount->code = $request[__('discounts.form_input.code')];
            $discount->name = $request[__('discounts.form_input.name')];
            $discount->amount = $request[__('discounts.form_input.amount')];
            $discount->updated_by = $me->id;
            $discount->saveOrFail();

            return $this->table(new Request(['id' => $discount->id]))->first();
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
            $discount = new Discount();
            $discount->id = Uuid::uuid4()->toString();
            if ($request->has(__('companies.form_input.name'))) {
                $discount->company = $request[__('companies.form_input.name')];
            } else {
                $discount->company = null;
            }
            $discount->code = $request[__('discounts.form_input.code')];
            $discount->name = $request[__('discounts.form_input.name')];
            $discount->amount = $request[__('discounts.form_input.amount')];
            $discount->created_by = $me->id;
            $discount->saveOrFail();

            return $this->table(new Request(['id' => $discount->id]))->first();
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
            Discount::whereIn('id', $request->id)->delete();
            return true;
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
            $discounts = Discount::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $discounts = $discounts->where('id', $request->id);
            if ($me != null) {
                if ($me->company != null) $discounts = $discounts->where('company', $me->company);
            } else {
                $discounts = $discounts->whereNull('company');
            }
            $discounts = $discounts->get();
            if ($discounts->count() > 0) {
                foreach ($discounts as $discount) {
                    $response->push((object) [
                        'value' => $discount->id,
                        'label' => $discount->name,
                        'meta' => (object) [
                            'code' => $discount->code,
                            'description' => $discount->description,
                            'amount' => $discount->amount,
                            'company' => $discount->companyObj,
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => Carbon::parse($discount->created_at)->format('Y-m-d H:i:s'),
                                    'by' => $discount->createdBy,
                                ],
                                'update' => (object) [
                                    'at' => Carbon::parse($discount->updated_at)->format('Y-m-d H:i:s'),
                                    'by' => $discount->updatedBy,
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
