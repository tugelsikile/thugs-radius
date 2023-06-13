import React from "react";
import moment from "moment";
import {formatLocaleDate, formatLocaleString} from "../../../../Components/mixedConsts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSign, faSignal, faTicketAlt, faWifi} from "@fortawesome/free-solid-svg-icons";

export const StatusCustomer = (props) => {
    let response = <span className="badge badge-secondary">{Lang.get('customers.labels.status.register')}</span>
    if (props.customer.meta.timestamps.inactive.at !== null) {
        response = <span className="badge badge-warning">{Lang.get('customers.labels.status.inactive')}</span>
    } else if (props.customer.meta.timestamps.active.at !== null) {
        response = <span className="badge badge-success">{Lang.get('customers.labels.status.active')}</span>
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
export const FormatPrice = (price) => {
    let format = localStorage.getItem('locale_currency');
    if (format === null) {
        return (
            <React.Fragment>
                <span className="float-left">Rp.</span>
                <span className="float-right">{formatLocaleString(price)}</span>
            </React.Fragment>
        )
    } else {
        return (
            <React.Fragment>
                <span className="float-left">{format.symbols}</span>
                <span className="float-right">{formatLocaleString(price)}</span>
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
