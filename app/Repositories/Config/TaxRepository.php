<?php /** @noinspection PhpUndefinedFieldInspection */

/** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories\Config;

use App\Models\Tax;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;
use Throwable;

class TaxRepository
{
    /* @
     * @param Request $request
     * @return bool
     * @throws Exception
     */
    public function delete(Request $request): bool
    {
        try {
            Tax::whereIn('id', $request->id)->delete();
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function update(Request $request) {
        try {
            $tax = Tax::where('id', $request[__('taxes.form_input.id')])->first();
            if ($request->has(__('companies.form_input.name'))) {
                $tax->company = $request[__('companies.form_input.name')];
            } else {
                $tax->company = null;
            }
            $tax->code = $request[__('taxes.form_input.code')];
            $tax->name = $request[__('taxes.form_input.name')];
            $tax->description = $request[__('taxes.form_input.description')];
            $tax->percent = $request[__('taxes.form_input.percent')];
            $tax->updated_by = auth()->guard('api')->user()->id;
            $tax->saveOrFail();

            return $this->table(new Request(['id' => $tax->id]))->first();
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
            $tax = new Tax();
            $tax->id = Uuid::uuid4()->toString();
            if ($request->has(__('companies.form_input.name'))) {
                $tax->company = $request[__('companies.form_input.name')];
            }
            $tax->code = $request[__('taxes.form_input.code')];
            $tax->name = $request[__('taxes.form_input.name')];
            $tax->description = $request[__('taxes.form_input.description')];
            $tax->percent = $request[__('taxes.form_input.percent')];
            $tax->created_by = auth()->guard('api')->user()->id;
            $tax->saveOrFail();

            return $this->table(new Request(['id' => $tax->id]))->first();
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
            $taxes = Tax::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $taxes = $taxes->where('id', $request->id);
            if ($me != null) {
                if ($me->company != null) $taxes = $taxes->where('company', $me->company);
            } else {
                $taxes = $taxes->whereNull('companies');
            }
            $taxes = $taxes->get();
            if ($taxes->count() > 0) {
                foreach ($taxes as $tax) {
                    $response->push((object) [
                        'value' => $tax->id,
                        'label' => $tax->name,
                        'meta' => (object) [
                            'code' => $tax->code,
                            'description' => $tax->description,
                            'percent' => $tax->percent,
                            'company' => $tax->companyObj,
                            'timestamps' => (object) [
                                'create' => (object) [
                                    'at' => Carbon::parse($tax->created_at)->format('Y-m-d H:i:s'),
                                    'by' => $tax->createdBy
                                ],
                                'update' => (object) [
                                    'at' => Carbon::parse($tax->updated_at)->format('Y-m-d H:i:s'),
                                    'by' => $tax->updatedBy
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
