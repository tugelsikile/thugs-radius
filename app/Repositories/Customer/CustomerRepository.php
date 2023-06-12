<?php /** @noinspection PhpUndefinedMethodInspection */

namespace App\Repositories\Customer;

use App\Helpers\SwitchDB;
use App\Models\Customer\Customer;
use App\Models\Customer\CustomerAdditionalService;
use App\Models\Customer\CustomerDiscount;
use App\Models\Customer\CustomerTax;
use App\Models\User\User;
use App\Models\User\UserLevel;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Ramsey\Uuid\Uuid;

class CustomerRepository
{
    protected $me;
    public function __construct()
    {
        if (auth()->guard('api')->user() != null) {
            $this->me = auth()->guard('api')->user();
        }
    }
    public function update(Request $request) {
        try {
            new SwitchDB("mysql");
            $user = User::where('id', $request[__('customers.form_input.id')])->first();
            $user->name = $request[__('customers.form_input.name')];
            $user->email = $request[__('customers.form_input.email')];
            $user->saveOrFail();

            new SwitchDB();
            $customer = Customer::where('id', $request[__('customers.form_input.id')])->first();
            $customer->profile = $request[__('profiles.form_input.name')];
            $customer->nas = $request[__('nas.form_input.name')];
            if ($request->has(__('customers.form_input.address.street'))) {
                $customer->address = $request[__('customers.form_input.address.street')];
            } else {
                $customer->address = null;
            }
            if ($request->has(__('customers.form_input.address.province'))) {
                $customer->province = $request[__('customers.form_input.address.province')];
            } else {
                $customer->province = null;
            }
            if ($request->has(__('customers.form_input.address.city'))) {
                $customer->city = $request[__('customers.form_input.address.city')];
            } else {
                $customer->city = null;
            }
            if ($request->has(__('customers.form_input.address.district'))) {
                $customer->district = $request[__('customers.form_input.address.district')];
            } else {
                $customer->district = null;
            }
            if ($request->has(__('customers.form_input.address.village'))) {
                $customer->village = $request[__('customers.form_input.address.village')];
            } else {
                $customer->village = null;
            }
            if ($request->has(__('customers.form_input.address.postal'))) {
                $customer->postal = $request[__('customers.form_input.address.postal')];
            } else {
                $customer->postal = '';
            }
            $customer->method_type = $request[__('customers.form_input.type')];
            $customer->nas_username = $request[__('customers.form_input.username')];
            $customer->nas_password = $request[__('customers.form_input.password')];
            $customer->updated_by = $this->me->id;
            $customer->saveOrFail();
            if ($request->has(__('customers.form_input.service.input'))) {
                foreach ($request[__('customers.form_input.service.input')] as $item) {
                    if (array_key_exists(__('customers.form_input.service.id'),$item)) {
                        $additional = CustomerAdditionalService::where('id', $item[__('customers.form_input.service.id')])->first();
                        $additional->updated_by = $this->me->id;
                    } else {
                        $additional = new CustomerAdditionalService();
                        $additional->id = Uuid::uuid4()->toString();
                        $additional->customer = $customer->id;
                        $additional->created_by = $this->me->id;
                    }
                    $additional->profile = $item[__('customers.form_input.service.name')];
                    $additional->saveOrFail();
                }
            }
            if ($request->has(__('customers.form_input.service.delete'))) {
                CustomerAdditionalService::whereIn('id', $request[__('customers.form_input.service.delete')])->delete();
            }

            if ($request->has(__('customers.form_input.taxes.input'))) {
                foreach ($request[__('customers.form_input.taxes.input')] as $item) {
                    if (array_key_exists(__('customers.form_input.taxes.id'), $item)) {
                        $tax = CustomerTax::where('id', $item[__('customers.form_input.taxes.id')])->first();
                        $tax->updated_by = $this->me->id;
                    } else {
                        $tax = new CustomerTax();
                        $tax->id = Uuid::uuid4()->toString();
                        $tax->customer = $customer->id;
                        $tax->created_by = $this->me->id;
                    }
                    $tax->tax = $item[__('customers.form_input.taxes.name')];
                    $tax->saveOrFail();
                }
            }
            if ($request->has(__('customers.form_input.taxes.delete'))) {
                CustomerTax::whereIn('id', $request[__('customers.form_input.taxes.delete')])->delete();
            }
            if ($request->has(__('customers.form_input.discounts.input'))) {
                foreach ($request[__('customers.form_input.discounts.input')] as $item) {
                    if (array_key_exists(__('customers.form_input.discounts.id'), $item)) {
                        $discount = CustomerDiscount::where('id', $item[__('customers.form_input.discounts.id')])->first();
                        $discount->updated_by = $this->me->id;
                    } else {
                        $discount = new CustomerDiscount();
                        $discount->id = Uuid::uuid4()->toString();
                        $discount->customer = $customer->id;
                        $discount->created_by = $this->me->id;
                    }
                    $discount->discount = $item[__('customers.form_input.discounts.name')];
                    $discount->saveOrFail();
                }
            }
            if ($request->has(__('customers.form_input.discounts.delete'))) {
                CustomerDiscount::whereIn('id', $request[__('customers.form_input.discounts.delete')])->delete();
            }
            return $this->table(new Request(['id' => $customer->id]))->first();
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function create(Request $request) {
        try {
            new SwitchDB("mysql");
            $user = new User();
            $user->id = Uuid::uuid4()->toString();
            $user->name = $request[__('customers.form_input.name')];
            $user->email = $request[__('customers.form_input.email')];
            $user->level = UserLevel::where('name','Customer')->first()->id;
            $user->company = $this->me->company;
            $user->password = Hash::make($request[__('customers.form_input.password')]);
            $user->locale = (object) ['lang' => 'id', 'date_format' => 'DD MMMM yyyy HH:mm:ss', 'time_zone' => 'Asia/Jakarta' ];
            $user->saveOrFail();

            new SwitchDB();
            $customer = new Customer();
            $customer->id = $user->id;
            $customer->profile = $request[__('profiles.form_input.name')];
            $customer->nas = $request[__('nas.form_input.name')];
            $customer->user = $user->id;
            $customer->code = generateCustomerCode();
            if ($request->has(__('customers.form_input.address.street'))) {
                $customer->address = $request[__('customers.form_input.address.street')];
            }
            if ($request->has(__('customers.form_input.address.province'))) {
                $customer->province = $request[__('customers.form_input.address.province')];
            }
            if ($request->has(__('customers.form_input.address.city'))) {
                $customer->city = $request[__('customers.form_input.address.city')];
            }
            if ($request->has(__('customers.form_input.address.district'))) {
                $customer->district = $request[__('customers.form_input.address.district')];
            }
            if ($request->has(__('customers.form_input.address.village'))) {
                $customer->village = $request[__('customers.form_input.address.village')];
            }
            if ($request->has(__('customers.form_input.address.postal'))) {
                $customer->postal = $request[__('customers.form_input.address.postal')];
            }
            $customer->method_type = $request[__('customers.form_input.type')];
            $customer->nas_username = $request[__('customers.form_input.username')];
            $customer->nas_password = $request[__('customers.form_input.password')];
            $customer->created_by = $this->me->id;
            $customer->saveOrFail();
            if ($request->has(__('customers.form_input.service.input'))) {
                foreach ($request[__('customers.form_input.service.input')] as $item) {
                    $additional = new CustomerAdditionalService();
                    $additional->id = Uuid::uuid4()->toString();
                    $additional->customer = $customer->id;
                    $additional->profile = $item[__('customers.form_input.service.name')];
                    $additional->created_by = $this->me->id;
                    $additional->saveOrFail();
                }
            }
            if ($request->has(__('customers.form_input.taxes.input'))) {
                foreach ($request[__('customers.form_input.taxes.input')] as $item) {
                    $tax = new CustomerTax();
                    $tax->id = Uuid::uuid4()->toString();
                    $tax->customer = $customer->id;
                    $tax->tax = $item[__('customers.form_input.taxes.name')];
                    $tax->created_by = $this->me->id;
                    $tax->saveOrFail();
                }
            }
            if ($request->has(__('customers.form_input.discounts.input'))) {
                foreach ($request[__('customers.form_input.discounts.input')] as $item) {
                    $discount = new CustomerDiscount();
                    $discount->id = Uuid::uuid4()->toString();
                    $discount->customer = $customer->id;
                    $discount->discount = $item[__('customers.form_input.discounts.name')];
                    $discount->created_by = $this->me->id;
                    $discount->saveOrFail();
                }
            }
            return $this->table(new Request(['id' => $customer->id]))->first();
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
            new SwitchDB();
            $response = collect();
            $customers = Customer::orderBy('created_at', 'asc');
            if (strlen($request->id) > 0) $customers = $customers->where('id', $request->id);
            $customers = $customers->get();
            foreach ($customers as $customer) {
                $response->push((object) [
                    'value' => $customer->id,
                    'label' => $customer->userObj->name,
                    'meta' => (object) [
                        'code' => $customer->code,
                        'user' => $customer->userObj,
                        'nas' => $customer->nasObj,
                        'profile' => $customer->profileObj,
                        'additional' => $this->additionalServices($customer),
                        'taxes' => $this->taxes($customer),
                        'discounts' => $this->discounts($customer),
                        'address' => (object) [
                            'street' => $customer->address == null ? '' : $customer->address,
                            'village' => $customer->villageObj,
                            'district' => $customer->districtObj,
                            'city' => $customer->cityObj,
                            'province' => $customer->provinceObj,
                            'phone' => $customer->phone == null ? '' : $customer->phone,
                            'postal' => $customer->postal == null ? '' : $customer->postal
                        ],
                        'auth' => (object) [
                            'user' => $customer->nas_username,
                            'pass' => $customer->nas_password,
                        ],
                        'timestamps' => (object) [
                            'create' => (object) [
                                'at' => $customer->created_at,
                                'by' => $customer->createdBy,
                            ],
                            'update' => (object) [
                                'at' => $customer->updated_at,
                                'by' => $customer->updatedBy
                            ],
                            'due' => (object) [
                                'at' => $customer->due_at,
                            ]
                        ]
                    ]
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function discounts(Customer $customer) {
        try {
            $response = collect();
            $discounts = CustomerDiscount::where('customer', $customer->id)->orderBy('created_at', 'desc')->get();
            foreach ($discounts as $discount) {
                $response->push((object) [
                    'value' => $discount->id,
                    'meta' => (object) [
                        'discount' => $discount->discountObj
                    ]
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
    public function taxes(Customer $customer) {
        try {
            $response = collect();
            $taxes = CustomerTax::where('customer', $customer->id)->orderBy('created_at', 'desc')->get();
            foreach ($taxes as $tax) {
                $response->push((object) [
                    'value' => $tax->id,
                    'meta' => (object) [
                        'tax' => $tax->taxObj,
                    ]
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getCode(),500);
        }
    }
    public function additionalServices(Customer $customer) {
        try {
            $response = collect();
            $services = CustomerAdditionalService::where('customer', $customer->id)->orderBy('created_at', 'desc')->get();
            foreach ($services as $service) {
                $response->push((object) [
                    'value' => $service->id,
                    'meta' => (object) [
                        'service' => $service->serviceObj
                    ]
                ]);
            }
            return $response;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(), 500);
        }
    }
}
