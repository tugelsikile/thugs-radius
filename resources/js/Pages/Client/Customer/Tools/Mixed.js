import React from "react";
import moment from "moment";
import {CardPreloader, formatLocaleDate, formatLocaleString, ucFirst} from "../../../../Components/mixedConsts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCalendarTimes,
    faCheckCircle,
    faSign,
    faSignal,
    faTicketAlt,
    faTimesCircle,
    faUserTie,
    faWifi
} from "@fortawesome/free-solid-svg-icons";

export const StatusCustomer = (props) => {
    let response = <span className="badge badge-secondary">{Lang.get('customers.labels.status.register')}</span>
    if (props.customer.meta.auth.type === 'voucher') {
        if (props.customer.meta.timestamps.active.at === null) {
            response = <span className="badge badge-secondary">{Lang.get('customers.hotspot.labels.status.generated')}</span>
        } else {
            response = <span className="badge badge-secondary">{Lang.get('customers.hotspot.labels.status.used')}</span>
        }
    } else {
        if (props.customer.meta.timestamps.inactive.at !== null) {
            response = <span className="badge badge-warning">{Lang.get('customers.labels.status.inactive')}</span>
        } else if (props.customer.meta.timestamps.active.at !== null) {
            response = <span className="badge badge-success">{Lang.get('customers.labels.status.active')}</span>
        }
    }
    return response;
}
export const sortStatus = (props) => {
    let response = null;
    if (props.meta.timestamps.inactive.at !== null) {
        response = 3;
    } else if (props.meta.timestamps.active.at !== null) {
        response = 10;
    }
    return response;
}
export const DueAtCustomer = (props) => {
    let response = null;
    if (props.customer.meta.timestamps.active.at !== null) {
        if (props.customer.meta.timestamps.due.at === null) {
            response = <span className="badge badge-primary">UNLIMITED</span>
        } else if (moment().isAfter(moment(props.customer.meta.timestamps.due.at))){
            response = <span className="badge badge-danger">{formatLocaleDate(props.customer.meta.timestamps.due.at)}</span>
        } else {
            response = <span className="badge badge-success">{formatLocaleDate(props.customer.meta.timestamps.due.at)}</span>
        }
    }
    return response;
}
export const FormatPrice = (price, popover = null, addSuffix = true) => {
    let format = localStorage.getItem('locale_currency');
    if (format === null) {
        return (
            <React.Fragment>
                {popover !== null && popover}
                <small className="float-left">Rp.</small>
                <span className="float-right">{formatLocaleString(price)}{addSuffix && ',-'}</span>
            </React.Fragment>
        )
    } else {
        return (
            <React.Fragment>
                {popover !== null && popover}
                <small className="float-left">{format.symbols}</small>
                <span className="float-right">{formatLocaleString(price)}{addSuffix && ',-'}</span>
            </React.Fragment>
        )
    }
}
export const PriceCustomerPage = (props) => {
    return FormatPrice(sumGrandtotalCustomer(props.customer));
}
export const CustomerTypeIcon = (props) => {
    let response = null;
    switch (props.customer.meta.auth.type) {
        case 'pppoe' : response = <FontAwesomeIcon className="text-muted" icon={faSign} title="PPPoE"/>; break;
        case 'hotspot' : response = <FontAwesomeIcon className="text-muted" icon={faSignal} title="Hotspot"/>; break;
        case 'voucher' : response = <FontAwesomeIcon className="text-muted" icon={faWifi} title="Voucher Hotspot"/>; break;
    }
    return response;
}
export const sumGrandtotalCustomer = (customer) => {
    let subtotal = sumSubtotalCustomer(customer);
    let taxTotal = sumSubtotalTax(customer);
    let discountTotal = sumSubtotalDiscount(customer);
    return ( subtotal + taxTotal ) - discountTotal;
}
export const sumSubtotalDiscount = (customer) => {
    let response = 0;
    if (customer.meta.discounts.length > 0) {
        customer.meta.discounts.map((item)=>{
            if (item.meta.discount !== null) {
                response += item.meta.discount.amount;
            }
        });
    }
    return response;
}
export const sumSubtotalTax = (customer) => {
    let response = 0;
    if (customer.meta.taxes.length > 0) {
        let subtotal = sumSubtotalCustomer(customer);
        customer.meta.taxes.map((item)=>{
            if (item.meta.tax !== null) {
                response += ( ( subtotal * item.meta.tax.percent ) / 100 );
            }
        });
    }
    return response;
}
export const sumSubtotalCustomer = (customer) => {
    let response = 0;
    if (customer.meta.profile !== null) {
        response += customer.meta.profile.price;
    }
    if (customer.meta.additional.length > 0) {
        customer.meta.additional.map((item)=>{
            if (item.meta.service !== null) {
                response += item.meta.service.price;
            }
        });
    }
    return response;
}
export const sumTaxCustomer = (customer) => {
    let response = 0;
}
export const sumCustomerSubtotalForm = (form) => {
    let response = 0;
    if (form.profile !== null) {
        response += form.profile.meta.price;
    }
    if (form.services.current.length > 0) {
        form.services.current.map((item)=>{
            if (item.package !== null) {
                response += item.package.meta.price;
            }
        });
    }
    return response;
}
export const sumCustomerTaxLineForm = (form, index) => {
    let response = 0;
    let subtotal = sumCustomerSubtotalForm(form);
    if (form.taxes.current.length > 0) {
        if (form.taxes.current[index].tax !== null) {
            response = ( form.taxes.current[index].tax.meta.percent * subtotal ) / 100;
        }
    }
    return response;
}
export const sumCustomerTaxForm = (form) => {
    let subtotal = sumCustomerSubtotalForm(form);
    let response = 0;
    form.taxes.current.map((item)=>{
        if (item.tax !== null) {
            response += ( (subtotal * item.tax.meta.percent) / 100 );
        }
    });
    return response;
}
export const sumCustomerDiscountForm = (form) => {
    let response = 0;
    form.discounts.current.map((item)=>{
        if (item.discount !== null) {
            response += item.discount.meta.amount;
        }
    })
    return response;
}
export const sumGrandTotalForm = (form) => {
    let subtotal = sumCustomerSubtotalForm(form);
    let tax = sumCustomerTaxForm(form);
    let discount = sumCustomerDiscountForm(form);
    return FormatPrice(( subtotal + tax ) - discount);
}
export const generatePrefix = (type, length) => {
    let response = '';
    let charactersLength = 0;
    let characters = "";
    switch (type) {
        default :
        case 'none': response = ''; break;
        case 'alnum' :
            characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz123456789';
            charactersLength = characters.length;
        break;
        case 'alnum-lower' :
            characters = 'abcdefghijklmnpqrstuvwxyz123456789';
            charactersLength = characters.length;
            break;
        case 'alnum-upper' :
            characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
            charactersLength = characters.length;
            break;
        case 'alpha' :
            characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz';
            charactersLength = characters.length;
            break;
        case 'alpha-lower' :
            characters = 'abcdefghijklmnpqrstuvwxyz';
            charactersLength = characters.length;
            break;
        case 'alpha-upper' :
            characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';
            charactersLength = characters.length;
            break;
        case 'numeric' :
            characters = '0123456789';
            charactersLength = characters.length;
            break;
    }
    let counter = 0;
    while (counter < length) {
        response += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter++;
    }
    return response;
}
export const generateType = [
    { value: 'none', label : Lang.get('customers.hotspot.generate.types.none') },
    { value : 'alnum', label : Lang.get('customers.hotspot.generate.types.alnum') },
    { value : 'alnum-lower', label : Lang.get('customers.hotspot.generate.types.alnum-lower') },
    { value : 'alnum-upper', label : Lang.get('customers.hotspot.generate.types.alnum-upper') },
    { value : 'alpha', label : Lang.get('customers.hotspot.generate.types.alpha') },
    { value : 'alpha-lower', label : Lang.get('customers.hotspot.generate.types.alpha-lower') },
    { value : 'alpha-upper', label : Lang.get('customers.hotspot.generate.types.alpha-upper') },
    { value : 'numeric', label : Lang.get('customers.hotspot.generate.types.numeric') }
];
export const CardInfoPageCustomer = (props) => {
    return (
        <React.Fragment>
            <div className="row">
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-info">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.length}</h3>
                            <p>Total</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faUserTie}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-primary">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.filter((f) => f.meta.auth.type === 'pppoe').length}</h3>
                            <p>PPPoE</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faSign}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-cyan">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.filter((f) => f.meta.auth.type === 'hotspot').length}</h3>
                            <p>Hotspot</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faSignal}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-light">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.filter((f) => f.meta.auth.type === 'voucher').length}</h3>
                            <p>Voucher</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faWifi}/>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export const PageInfoPPPoEPage = (props) => {
    return (
        <React.Fragment>
            <div className="row">
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-primary">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.length}</h3>
                            <p>Total</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faUserTie}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-success">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.filter((f) => f.meta.timestamps.inactive.at === null && f.meta.timestamps.active.at !== null).length}</h3>
                            <p>{ucFirst(Lang.get('customers.labels.status.active'))}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faCheckCircle}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-danger">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.filter((f) => f.meta.timestamps.inactive.at !== null).length}</h3>
                            <p>{ucFirst(Lang.get('customers.labels.status.inactive'))}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faTimesCircle}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-warning">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.filter((f) => f.meta.timestamps.due.at !== null && moment(f.meta.timestamps.due.at).isBefore(moment())).length}</h3>
                            <p>{ucFirst(Lang.get('customers.labels.status.expired'))}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faCalendarTimes}/>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
export const PageInfoHotspotPage = (props) => {
    return (
        <React.Fragment>
            <div className="row">
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-primary">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.length}</h3>
                            <p>Total</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faUserTie}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-success">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.filter((f) => f.meta.timestamps.inactive.at === null && f.meta.timestamps.active.at !== null).length}</h3>
                            <p>{ucFirst(Lang.get('customers.labels.status.active'))}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faCheckCircle}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-danger">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.filter((f) => f.meta.timestamps.inactive.at !== null).length}</h3>
                            <p>{ucFirst(Lang.get('customers.labels.status.inactive'))}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faTimesCircle}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-warning">
                        { props.loading && <CardPreloader/> }
                        <div className="inner">
                            <h3>{props.customers.unfiltered.filter((f) => f.meta.timestamps.due.at !== null && moment(f.meta.timestamps.due.at).isBefore(moment())).length}</h3>
                            <p>{ucFirst(Lang.get('customers.labels.status.expired'))}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faCalendarTimes}/>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
export const listSeparator = [
    { value : '-', label : '-' },
    { value : '_', label : '_' },
    { value : '+', label : '+' },
    { value : '*', label : '*' },
    { value : '=', label : '=' },
];
