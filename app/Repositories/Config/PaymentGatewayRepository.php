<?php /** @noinspection PhpUndefinedMethodInspection */
/** @noinspection PhpSillyAssignmentInspection */
/** @noinspection PhpUndefinedFieldInspection */

/** @noinspection DuplicatedCode */

namespace App\Repositories\Config;

use App\Models\PaymentGateway\PaymentGateway;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Ramsey\Uuid\Uuid;
use Throwable;

class PaymentGatewayRepository
{
    protected $me;
    public function __construct()
    {
        $this->me = auth()->guard('api')->user();
    }

    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function delete(Request $request) {
        try {
            return PaymentGateway::whereIn('id', $request[__('gateways.form_input.id')])->delete();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    /* @
     * @param Request $request
     * @return mixed
     * @throws Exception
     */
    public function activate(Request $request) {
        try {
            $gateway = PaymentGateway::where('id', $request[__('gateways.form_input.id')])->first();
            if ($gateway->active_at == null) {
                $gateway->active_at = Carbon::now();
                $gateway->active_by = $this->me->id;
                $gateway->updated_at = $gateway->updated_at;
                if ($this->me->company != null) {
                    $activeGateways = PaymentGateway::where('company', $this->me->company)->whereNotNull('active_at')->first();
                } else {
                    $activeGateways = PaymentGateway::whereNotNull('active_at')->whereNull('company')->first();
                }
                if ($activeGateways != null) {
                    $activeGateways->active_by = null;
                    $activeGateways->active_at = null;
                    $activeGateways->saveOrFail();
                }
            } else {
                $gateway->active_at = null;
                $gateway->active_by = null;
                $gateway->updated_at = $gateway->updated_at;
            }
            $gateway->saveOrFail();
            return $this->table(new Request(['id' => $gateway->id]))->first();
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
            $gateway = PaymentGateway::where('id', $request[__('gateways.form_input.id')])->first();
            $updating = false;
            if ($request->has(__('companies.form_input.name'))) {
                if ($gateway->company != $request[__('companies.form_input.name')]) $updating = true;
                $gateway->company = $request[__('companies.form_input.name')];
            } else {
                if ($gateway->company != null) $updating = true;
                $gateway->company = null;
            }
            if ($gateway->name != $request[__('gateways.form_input.name')]) $updating = true;
            $gateway->name = $request[__('gateways.form_input.name')];
            if ($gateway->module != $request[__('gateways.form_input.module')]) $updating = true;
            $gateway->module = $request[__('gateways.form_input.module')];
            if ($request->has(__('gateways.form_input.description')) || $request[__('gateways.form_input.description')] != null) {
                if ($gateway->description != $request[__('gateways.form_input.description')]) $updating = true;
                $gateway->description = $request[__('gateways.form_input.description')];
            } else {
                if ($gateway->description != null) $updating = true;
                $gateway->description = '';
            }
            if ($gateway->production != !($request[__('gateways.form_input.production_mode')] == 0)) $updating = true;
            $gateway->production = !($request[__('gateways.form_input.production_mode')] == 0);

            $keys = $gateway->keys;

            if ($request->has(__('gateways.form_input.website'))) {
                if (property_exists($keys,'website')) {
                    if ($keys->website != $request[__('gateways.form_input.website')]) $updating = true;
                }
                $keys->website = $request[__('gateways.form_input.website')];
            } else {
                if (property_exists($keys,'website') && $keys->website != null) $updating = true;
                $keys->website = null;
            }
            if ($request->has(__('gateways.form_input.url'))) {
                if (!property_exists($keys,'url')) $updating = true;
                if (property_exists($keys,'url') && $keys->url != $request[__('gateways.form_input.url')]) $updating = true;
                $keys->url = $request[__('gateways.form_input.url')];
            } else {
                if (property_exists($keys,'url')) $updating = true;
                unset($keys->url);
            }

            if ($request->has(__('gateways.form_input.duitku.merchant_code')) && $request->has(__('gateways.form_input.duitku.api_key'))) {
                if (!property_exists($keys,'merchant_code')) $updating = true;
                if ($keys->merchant_code != $request[__('gateways.form_input.duitku.merchant_code')]) $updating = true;
                $keys->merchant_code = $request[__('gateways.form_input.duitku.merchant_code')];
                if (!property_exists($keys,'api_key')) $updating = true;
                if (property_exists($keys,'api_key') && $keys->api_key != $request[__('gateways.form_input.duitku.api_key')]) $updating = true;
                $keys->api_key = $request[__('gateways.form_input.duitku.api_key')];
            } else {
                if (property_exists($keys,'api_key')) $updating = true;
                unset($keys->api_key);
                if (property_exists($keys,'merchant_code')) $updating = true;
                unset($keys->merchant_code);
            }
            if ($request->has(__('gateways.form_input.briapi.consumer_key')) && $request->has(__('gateways.form_input.briapi.consumer_secret'))) {
                if (!property_exists($keys,'consumer_key')) $updating = true;
                if (property_exists($keys,'consumer_key') && $keys->consumer_key != $request[__('gateways.form_input.briapi.consumer_key')]) $updating = true;
                $keys->consumer_key = $request[__('gateways.form_input.briapi.consumer_key')];
                if (!property_exists($keys,'consumer_secret')) $updating = true;
                if (property_exists($keys,'consumer_secret') && $keys->consumer_secret != $request[__('gateways.form_input.briapi.consumer_secret')]) $updating = true;
                $keys->consumer_secret = $request[__('gateways.form_input.briapi.consumer_secret')];
            } else {
                if (property_exists($keys,'consumer_key')) $updating = true;
                unset($keys->consumer_key);
                if (property_exists($keys,'consumer_secret')) $updating = true;
                unset($keys->consumer_secret);
            }
            $gateway->keys = $keys;
            if ($updating) $gateway->updated_by = $this->me->id;
            $gateway->saveOrFail();

            return $this->table(new Request(['id' => $gateway->id]))->first();
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
            $gateway = new PaymentGateway();
            $gateway->id = Uuid::uuid4()->toString();
            if ($request->has(__('companies.form_input.name'))) {
                $gateway->company = $request[__('companies.form_input.name')];
            }
            $gateway->name = $request[__('gateways.form_input.name')];
            $gateway->module = $request[__('gateways.form_input.module')];
            $gateway->description = $request[__('gateways.form_input.description')] == null ? '' : $request[__('gateways.form_input.description')];
            $gateway->production = !($request[__('gateways.form_input.production_mode')] == 0);
            $gateway->created_by = $this->me->id;
            $keys = (object)[];
            if ($request->has(__('gateways.form_input.website'))) {
                $keys->website = $request[__('gateways.form_input.website')];
            }
            if ($request->has(__('gateways.form_input.url'))) {
                $keys->url = $request[__('gateways.form_input.url')];
            }
            if ($request->has(__('gateways.form_input.duitku.merchant_code')) && $request->has(__('gateways.form_input.duitku.api_key'))) {
                $keys->merchant_code = $request[__('gateways.form_input.duitku.merchant_code')];
                $keys->api_key = $request[__('gateways.form_input.duitku.api_key')];
            }
            if ($request->has(__('gateways.form_input.briapi.consumer_key')) && $request->has(__('gateways.form_input.briapi.consumer_secret'))) {
                $keys->consumer_key = $request[__('gateways.form_input.briapi.consumer_key')];
                $keys->consumer_secret = $request[__('gateways.form_input.briapi.consumer_secret')];
            }
            $gateway->keys = $keys;
            $gateway->saveOrFail();

            return $this->table(new Request(['id' => $gateway->id]))->first();
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
            $gateways = PaymentGateway::orderBy('created_at', 'asc');
            if ($request->has('id')) {
                $gateways = $gateways->where('id', $request->id);
            } else {
                if ($this->me != null) {
                    if ($this->me->company != null) $gateways = $gateways->where('company', $this->me->company);
                }
            }
            $gateways = $gateways->get();
            if ($gateways->count() > 0) {
                foreach ($gateways as $gateway) {
                    $response->push((object)[
                        'value' => $gateway->id,
                        'label' => $gateway->name,
                        'meta' => (object) [
                            'company' => $gateway->companyObj,
                            'module' => $gateway->module,
                            'description' => $gateway->description == null ? '' : $gateway->description,
                            'production' => $gateway->production,
                            'keys' => $gateway->keys,
                            'timestamps' => (object) [
                                'active' => (object) [
                                    'at' => $gateway->active_at,
                                    'by' => $gateway->activeBy,
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
