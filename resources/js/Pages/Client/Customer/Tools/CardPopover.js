import React from "react";
import {formatLocaleString, formatPhone, ucFirst} from "../../../../Components/mixedConsts";
import {DetailBandwidth} from "../../Nas/Profile/Tools/DetailCard";
import {FormatPrice, sumGrandtotalCustomer, sumSubtotalDiscount, sumSubtotalTax} from "./Mixed";

export const CardInfoPrice = (props) => {
    return (
        props.data !== null &&
            <div className="card card-info card-outline mb-0">
                <div className="card-header py-1 px-2"><strong className="card-title text-sm">{Lang.get('customers.labels.service.tab')}</strong></div>
                <div className="card-body p-0" style={{minWidth:300,maxWidth:600}}>
                    <table className="table text-xs table-striped">
                        <thead>
                        <tr>
                            <th className="align-middle p-1" width={20}>#</th>
                            <th className="align-middle py-1 px-1">{Lang.get('customers.labels.service.name')}</th>
                            <th className="align-middle py-1 px-1" width={100}>{Lang.get('customers.labels.service.price')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="align-middle p-1 text-right">1.</td>
                            <td className="align-middle py-1 px-1">{props.data.meta.profile.name}</td>
                            <td className="align-middle py-1 px-1">
                                {FormatPrice(props.data.meta.profile.price)}
                            </td>
                        </tr>
                        {props.data.meta.additional.map((item,index)=>
                            <tr key={item.value}>
                                <td className="align-middle p-1 text-right">{index + 2}.</td>
                                <td className="align-middle p-1">{item.meta.service.name}</td>
                                <td className="align-middle p-1">{FormatPrice(item.meta.service.price)}</td>
                            </tr>
                        )}
                        {sumSubtotalTax(props.data) > 0 &&
                            <tr>
                                <td colSpan={2} className="align-middle p-1 text-warning">{Lang.get('customers.labels.service.taxes.label')}</td>
                                <td className="align-middle p-1 text-warning">{FormatPrice(sumSubtotalTax(props.data))}</td>
                            </tr>
                        }
                        {sumSubtotalDiscount(props.data) > 0 &&
                            <tr>
                                <td colSpan={2} className="align-middle p-1 text-info">{Lang.get('customers.labels.service.discount.label')}</td>
                                <td className="align-middle p-1 text-info">{FormatPrice(0 - sumSubtotalDiscount(props.data))}</td>
                            </tr>
                        }
                        <tr>
                            <td colSpan={2} className="align-middle p-1 text-bold text-success">{Lang.get('customers.labels.service.grand_total.label')}</td>
                            <td className="align-middle p-1 text-bold text-success">{FormatPrice(sumGrandtotalCustomer(props.data))}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
    );
}
export const CardInfoProfile = (props) => {
    return (
        props.data !== null &&
            <div className="card card-info card-outline mb-0">
                <div className="card-header py-1 px-2"><strong className="card-title text-sm">#{props.data.label}</strong></div>
                <div className="card-body p-0" style={{minWidth:200,maxWidth:600}}>
                    <table className="table text-xs">
                        <tbody>
                            <tr>
                                <td className="align-middle p-1">{Lang.get('profiles.labels.name')}</td><td className="align-middle text-center p-1" width="1px">:</td><td className="p-1 align-middle">{props.data.label}</td>
                            </tr>
                            <tr>
                                <td className="align-middle p-1">{Lang.get('profiles.labels.description')}</td><td className="align-middle text-center p-1" width="1px">:</td><td className="p-1 align-middle">{props.data.meta.description}</td>
                            </tr>
                            <tr>
                                <td className="align-middle p-1">{Lang.get('profiles.labels.price')}</td><td className="align-middle text-center p-1" width="1px">:</td><td className="p-1 align-middle">{formatLocaleString(props.data.meta.price,2)}</td>
                            </tr>
                            <tr>
                                <td className="align-middle p-1">{Lang.get('nas.pools.labels.name')}</td><td className="align-middle text-center p-1" width="1px">:</td><td className="p-1 align-middle">{props.data.meta.pool.name}</td>
                            </tr>
                            <tr>
                                <td className="align-middle p-1">{Lang.get('nas.pools.labels.address.full')}</td><td className="align-middle text-center p-1" width="1px">:</td><td className="p-1 align-middle">{props.data.meta.pool.first_address}-{props.data.meta.pool.last_address}</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="align-middle p-2">
                                    <DetailBandwidth data={props.data}/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
    )
}
export const CardInfoNas = (props) => {
    return (
        props.data !== null &&
            <div className="card card-info card-outline mb-0">
                <div className="card-header py-1 px-2"><strong className="card-title text-sm">#{props.data.shortname}</strong></div>
                <div className="card-body p-0" style={{minWidth:200,maxWidth:400}}>
                    <table className="table text-xs">
                        <tbody>
                            <tr>
                                <td className="align-middle p-1">{Lang.get('nas.labels.name')}</td><td className="align-middle text-center p-1" width="1px">:</td><td className="p-1 align-middle">{props.data.shortname}</td>
                            </tr>
                            <tr>
                                <td className="align-middle p-1">{Lang.get('nas.labels.ip.label')}</td><td className="p-1 align-middle text-center">:</td><td className="align-middle p-1">{props.data.nasname}</td>
                            </tr>
                            <tr>
                                <td className="align-middle p-1">{Lang.get('nas.labels.port.label')}</td><td className="align-middle text-center p-1">:</td><td className="align-middle p-1">{props.data.method_port}</td>
                            </tr>
                            <tr>
                                <td className="align-middle p-1">{Lang.get('nas.labels.method.label')}</td><td className="align-middle text-center p-1">:</td><td className="align-middle p-1">{props.data.method}</td>
                            </tr>
                            <tr>
                                <td className="align-middle p-1">{Lang.get('nas.labels.domain.label')}</td><td className="align-middle text-center p-1">:</td><td className="align-middle p-1">{props.data.method_domain}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
    )
}
export const CardInfoCustomer = (props) => {
    return (
        typeof props.data !== 'undefined' &&
            props.data !== null &&
                <div className="card card-info card-outline mb-0">
                    <div className="card-header py-1 px-2"><strong className="card-title text-sm">#{props.data.meta.code}</strong></div>
                    <div className="card-body p-0" style={{minWidth:200,maxWidth:600}}>
                        <table className="table text-xs">
                            <tbody>
                                {props.data.meta.auth.type === 'voucher' ?
                                    <>
                                    </>
                                    :
                                    <>
                                        <tr>
                                            <td className="align-middle p-1">{Lang.get('customers.labels.name')}</td><td className="p-1 align-middle text-center" width="1px">:</td><td className="p-1 align-middle">{props.data.label}</td>
                                        </tr>
                                        <tr>
                                            <td className="align-middle p-1">{Lang.get('customers.labels.address.tab')}</td><td className="p-1 align-middle text-center">:</td>
                                            <td className="align-middle p-1">
                                                {props.data.meta.address.street.length > 0 && `${props.data.meta.address.street}, `} {props.data.meta.address.village !== null && ucFirst(props.data.meta.address.village.name)} {props.data.meta.address.district !== null && ucFirst(props.data.meta.address.district.name)} {props.data.meta.address.city !== null && ucFirst(props.data.meta.address.city.name)} {props.data.meta.address.province !== null && ucFirst(props.data.meta.address.province.name)} {props.data.meta.address.postal}
                                            </td>
                                        </tr>
                                        {props.data.meta.user !== null && props.data.meta.user.email.length > 0 &&
                                            <tr>
                                                <td className="align-middle p-1">{Lang.get('customers.labels.address.email')}</td><td className="align-middle p-1">:</td><td className="align-middle p-1">{props.data.meta.user !== null && props.data.meta.user.email}</td>
                                            </tr>
                                        }
                                        {props.data.meta.address.phone !== null &&
                                            props.data.meta.address.phone.length > 4 &&
                                                <tr>
                                                    <td className="align-middle p-1">{Lang.get('customers.labels.address.phone')}</td><td className="align-middle p-1">:</td><td className="align-middle p-1">{formatPhone(props.data.meta.address.phone)}</td>
                                                </tr>
                                        }
                                    </>
                                }
                                <tr>
                                    <td className="align-middle p-1">{Lang.get('customers.labels.type')}</td><td className="align-middle p-1">:</td><td className="align-middle p-1">{props.data.meta.auth.type}</td>
                                </tr>
                                <tr>
                                    <td className="align-middle p-1">{Lang.get('customers.labels.username.label')}</td><td className="align-middle p-1">:</td><td className="align-middle p-1">{props.data.meta.auth.user}</td>
                                </tr>
                                <tr>
                                    <td className="align-middle p-1">{Lang.get('customers.labels.password.label')}</td><td className="align-middle p-1">:</td><td className="align-middle p-1">{props.data.meta.auth.pass}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
    );
}
