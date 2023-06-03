// noinspection DuplicatedCode

import React from "react";
import moment from "moment";
import {guestSiteConfig} from "../Services/ConfigService";

Lang.setLocale(localStorage.getItem('locale_lang'));
export const langSelect = [
    { value : 'id', label : 'Bahasa Indonesia'},
    { value : 'en', label : 'English' }
]
export const dateFormatSelect = [
    { value : 'DD/MM/yyyy HH:mm:ss', label : 'DD/MM/yyyy HH:mm:ss'},
    { value : 'DD/MM/yyyy HH:mm', label : 'DD/MM/yyyy HH:mm'},
    { value : 'DD/MM/yy HH:mm', label : 'DD/MM/yy HH:mm'},
    { value : 'DD-MM-yyyy HH:mm:ss', label : 'DD-MM-yyyy HH:mm:ss'},
    { value : 'DD MMMM yyyy HH:mm:ss', label : 'DD MMMM yyyy HH:mm:ss'},
    { value : 'dd, DD MMMM yyyy HH:mm:ss', label : 'dd, DD MMMM yyyy HH:mm:ss'},
    { value : 'ddd, DD MMMM yyyy HH:mm:ss', label : 'ddd, DD MMMM yyyy HH:mm:ss'},
    { value : 'dddd, DD MMMM yyyy HH:mm:ss', label : 'dddd, DD MMMM yyyy HH:mm:ss'},
    { value : 'DD MMM yyyy HH:mm:ss', label : 'DD MMM yyyy HH:mm:ss'},
    { value : 'yyyy/MM/DD HH:mm:ss', label : 'yyyy/MM/DD HH:mm:ss'},
    { value : 'yyyy/MM/DD HH:mm', label : 'yyyy/MM/DD HH:mm'},
    { value : 'yy/MM/DD HH:mm', label : 'yy/MM/DD HH:mm'},
]
export const ucFirst = (string) => {
    return string.toLowerCase().replace(/\b[a-z]/g, (letter) => {
        return letter.toUpperCase();
    })
}
export const durationType = [
    { value : 'minutes', label : Lang.get('durations.minutes') },
    { value : 'hours', label : Lang.get('durations.hours') },
    { value : 'days', label : Lang.get('durations.days') },
    { value : 'weeks', label : Lang.get('durations.weeks') },
    { value : 'months', label : Lang.get('durations.months') },
    { value : 'years', label : Lang.get('durations.years') },
]
export const durationBy = (ammount, type) => {
    let response = 0;
    switch (type) {
        case 'minutes' : response = ammount * 60; break;
        case 'hours' : response = ammount * ( 60 * 60 ); break;
        case 'days' : response = ammount * ( ( 60 * 60 ) * 24 ); break;
        case 'weeks' : response = ammount * ( (60 * 60 )* 24 ) * 7; break;
        case 'months' : response = ammount * ( ( (60 * 60 )* 24 ) * 7 ) * 30; break;
        case 'years' : response = ammount * ( ( ( (60 * 60 )* 24 ) * 7 ) * 30 ) * 12 ; break;
    }
    return response;
}
export const sumTotalInvoiceSingle = (data) => {
    return ( ( ( data.meta.packages.reduce((a,b) => a + ( ( ( ( b.meta.prices.price * b.meta.prices.qty ) * b.meta.prices.vat ) / 100 ) + (b.meta.prices.price * b.meta.prices.qty) ) - b.meta.prices.discount , 0 ) * data.meta.vat ) / 100 ) + data.meta.packages.reduce((a,b) => a + ( ( ( ( b.meta.prices.price * b.meta.prices.qty ) * b.meta.prices.vat ) / 100 ) + (b.meta.prices.price * b.meta.prices.qty) ) - b.meta.prices.discount , 0 ) ) - data.meta.discount;
}
export const sumTotalPaymentSingle = (data) => {
    return data.meta.timestamps.paid.payments.reduce((a,b) => a + b.meta.amount, 0);
}
export const sumTotalPackageSingle = (item) => {
    return (((( item.meta.prices.price * item.meta.prices.qty) * item.meta.prices.vat ) / 100 ) + ( item.meta.prices.price * item.meta.prices.qty)) - item.meta.prices.discount;
}
export const CardPreloader = () => {
    return <div className="overlay"><img src={window.origin + '/preloader.svg'} style={{height:100}}/></div>
}
export const formatLocaleString = (number, maximumFractionDigits = 2) => {
    let response = number;
    switch (localStorage.getItem('locale_lang')){
        default :
        case 'id' :
            response = parseFloat(number).toLocaleString('id-ID',{maximumFractionDigits:maximumFractionDigits});
            break;
        case 'en':
            response = parseFloat(number).toLocaleString('en-US',{maximumFractionDigits:maximumFractionDigits});
            break;
    }
    return response;
}
export const sortActiveCompany = (data) => {
    return data.meta.timestamps.active.at === null ? 'x' : data.meta.timestamps.active.at;
}
export const sortStatusPaid = (data) => {
    return data.meta.timestamps.paid.payments.length === 0 ? 'c' : data.meta.timestamps.paid.at === null ? 'b' : 'a';
}
export const formatLocalePeriode = (dateString, format = null) => {
    let response = moment(dateString).format('MMMM yyyy');
    if (format != null) {
        switch (localStorage.getItem('locale_lang')) {
            default :
            case 'id' :
                response = moment(dateString).locale('id-ID').format(format);
                break;
            case 'en' :
                response = moment(dateString).locale('en-US').format(format);
                break;
        }

    } else {
        switch (localStorage.getItem('locale_lang')) {
            default :
            case 'id' :
                response = moment(dateString).locale('id-ID').format("MMMM yyyy");
                break;
            case 'en' :
                response = moment(dateString).locale('en-US').format("MMMM yyyy");
                break;
        }
    }
    return response;
}
export const formatLocaleDate = (dateString) => {
    let response = moment(dateString).format('yyyy-MM-dd');
    switch (localStorage.getItem('locale_lang')) {
        default :
        case 'id' :
            response = moment(dateString).locale('id-ID').format(localStorage.getItem('locale_date_format'));
            break;
        case 'en' :
            response = moment(dateString).locale('en-US').format(localStorage.getItem('locale_date_format'));
            break;
    }
    return response;
}
export const parseInputFloat = (event) => {
    let currentValue = event.currentTarget.value;
    let leftValue;
    let rightValue = 0;
    let decimalValue = currentValue.split(',');
    if (decimalValue.length === 2) {
        leftValue = decimalValue[0];
        if (decimalValue[1].length > 0) {
            rightValue = decimalValue[1];
        }
    } else {
        leftValue = currentValue;
    }
    leftValue = leftValue.replaceAll('.','');
    leftValue = parseInt(leftValue);
    if (parseFloat(rightValue) > 0) {
        return parseFloat(leftValue + '.' + parseFloat(rightValue));
    } else {
        return parseFloat(leftValue);
    }
}
export const CardToolMinimize = (hide = false) => {
    return (
        <div className="card-tools">
            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                {hide ? <i className="fas fa-plus"/> : <i className="fas fa-minus"/> }

            </button>
        </div>
    );
}
export const siteData = async () => {
    let resp = null;
    try {
        let response = await guestSiteConfig();
        if (response.data.params !== null) {
            resp = response.data.params;
        }
    } catch (e) {
        resp = null;
    }
    return resp;
}
