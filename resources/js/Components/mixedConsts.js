// noinspection DuplicatedCode,SpellCheckingInspection

import React from "react";
import moment from "moment";
import {guestSiteConfig} from "../Services/ConfigService";
import {showError} from "./Toaster";
import {logout} from "./Authentication";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAsterisk, faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import {faSyncAlt} from "@fortawesome/free-solid-svg-icons/faSyncAlt";

Lang.setLocale(localStorage.getItem('locale_lang'));
export const langSelect = [
    { value : 'id', label : 'Bahasa Indonesia'},
    { value : 'en', label : 'English' }
]
export const wordLimit = (words, maxWord = 20, separator = ' ') => {
    if (words === null) return words;
    if (words.length <= maxWord) return words;
    let cut = words.indexOf(separator, maxWord);
    if (cut === -1) return words;
    return words.substr(0, cut);
}
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
export const ucWord = (string) => {
    return string.toLowerCase().replace(/\b[a-z]/g, (letter) => {
        return letter.toUpperCase();
    });
}
export const serviceType = [
    { value : 'pppoe', label : 'PPPoE' },
    { value : 'hotspot', label : 'Hotspot' }
];
export const limitType = [
    { value : 'time', label : Lang.get('limits.time') },
    { value : 'data', label : Lang.get('limits.data') },
]
export const durationTypeByte = [
    { value : 'K', label : 'KB' },
    { value : 'M', label : 'MB' },
    { value : 'G', label : 'GB' },
];
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
export const sumTotalTaxes = (data) => {
    let response = 0;
    data.map((item)=>{
        if (sumTotalPaymentSingle(item) >= sumGrandTotalInvoiceSingle(item)) {
            response += sumSubtotalTaxInvoiceSingle(item);
        }
    });
    return response;
}
export const sumTotalPaid = (data) => {
    let response = 0;
    data.map((item)=>{
        response += sumTotalPaymentSingle(item);
    })
    return response;
}
export const sumTotalInvoices = (data) => {
    let response = 0;
    data.map((item)=>{
        response += sumGrandTotalInvoiceSingle(item);
    });
    return response;
}
export const sumTotalPaidFormPayment = (data) => {
    let response = 0;
    data.payments.map((item)=>{
        response += item.amount;
    })
    return response;
}
export const sumGrandTotalInvoiceSingle = (data) => {
    let subtotal = sumSubtotalInvoiceSingle(data);
    let taxtotal = sumSubtotalTaxInvoiceSingle(data);
    let discount = sumSubtotalDiscountInvoiceSingle(data);
    return subtotal + taxtotal - discount;
}
export const sumSubtotalDiscountInvoiceSingle = (data) => {
    let response = 0;
    data.meta.discounts.map((item)=>{
        if (item.meta.discount !== null) {
            response += item.meta.discount.amount;
        }
    });
    return response;
}
export const sumSubtotalTaxInvoiceSingle = (data) => {
    let response = 0;
    let subtotal = sumSubtotalInvoiceSingle(data);
    data.meta.taxes.map((item)=>{
        if (item.meta.tax !== null) {
            response += ( item.meta.tax.percent * subtotal ) / 100;
        }
    })
    return response;
}
export const sumTaxInvoiceSingle = (data, index) => {
    let response = 0;
    let subtotal = sumSubtotalInvoiceSingle(data);
    if (data.meta.taxes[index].meta.tax !== null) {
        response = ( subtotal * data.meta.taxes[index].meta.tax.percent) / 100;
    }
    return response;
}
export const sumSubtotalInvoiceSingle = (data) => {
    let response = 0;
    data.meta.packages.map((item)=>{
        response += (item.meta.prices.qty * item.meta.prices.price);
    });
    return response;
}
export const sumGrandTotalFormInvoice = (form) => {
    let response = sumSubtotalFormInvoice(form);
    let taxes = sumSubtotalTaxFormInvoice(form);
    let discounts = sumSubtotalDiscountFormInvoice(form);
    response = response + taxes - discounts;
    return response;
}
export const sumSubtotalDiscountFormInvoice = (form) => {
    let response = 0;
    form.discounts.current.map((item)=>{
        if (item.discount != null) {
            response += item.discount.meta.amount;
        }
    });
    return response;
}
export const sumSubtotalTaxFormInvoice = (form) => {
    let response = 0;
    let subtotal = sumSubtotalFormInvoice(form);
    form.taxes.current.map((item)=>{
        if (item.tax != null) {
            response += ( subtotal * item.tax.meta.percent ) / 100;
        }
    });
    return response;
}
export const sumTaxPriceFormInvoice = (form, index) => {
    let subtotal = sumSubtotalFormInvoice(form);
    let response = 0;
    if (form.taxes.current[index].tax !== null) {
        response = ( form.taxes.current[index].tax.meta.percent * subtotal) / 100;
    }
    return response;
}
export const sumSubtotalFormInvoice = (form) => {
    let response = 0;
    form.packages.current.map((item)=>{
        if (item.package !== null) {
            response += (item.qty * item.price);
        }
    })
    return response;
}
export const sumSubtotalInvoicePackage = (data) => {
    return data.meta.prices.qty * data.meta.prices.price;
}
export const sumTotalInvoiceSingle = (data) => {
    let response;
    let subtotalPackage = 0;
    let subtotalTax = 0;
    let subtotalDiscount = 0;
    data.meta.packages.map((item)=>{
        subtotalPackage += sumSubtotalInvoicePackage(item);
    });
    data.meta.discounts.map((item)=>{
        if (item.meta.discount !== null) {
            subtotalDiscount += item.meta.discount.amount;
        }
    });
    data.meta.taxes.map((item)=>{
        if (item.meta.tax !== null) {
            subtotalTax += item.meta.tax.percent;
        }
    })
    response = ( subtotalPackage * subtotalTax ) / 100;
    response = response + subtotalPackage;
    response = response - subtotalDiscount;
    return response;
    //return ( ( ( data.meta.packages.reduce((a,b) => a + ( ( ( ( b.meta.prices.price * b.meta.prices.qty ) * b.meta.prices.vat ) / 100 ) + (b.meta.prices.price * b.meta.prices.qty) ) - b.meta.prices.discount , 0 ) * data.meta.vat ) / 100 ) + data.meta.packages.reduce((a,b) => a + ( ( ( ( b.meta.prices.price * b.meta.prices.qty ) * b.meta.prices.vat ) / 100 ) + (b.meta.prices.price * b.meta.prices.qty) ) - b.meta.prices.discount , 0 ) ) - data.meta.discount;
}
export const sumTotalPaymentSingle = (data) => {
    return data.meta.timestamps.paid.payments.reduce((a,b) => a + b.meta.amount, 0);
}
export const sumTotalPackageSingle = (item) => {
    return (((( item.meta.prices.price * item.meta.prices.qty) * item.meta.prices.vat ) / 100 ) + ( item.meta.prices.price * item.meta.prices.qty)) - item.meta.prices.discount;
}
export const CardPreloaderBackup = () => {
    return <div className="overlay"><img alt="Loading ..." className="animation__shake" src={window.origin + '/preloader.svg'} style={{height:100}}/></div>
}
export const CardPreloader = (dark = false) => {
    return <div className={`overlay`}><FontAwesomeIcon icon={faCircleNotch} spin={true} size="3x"/></div>
}
export const CardOverlay = (dark = false) => {
    return (
        <div className={`overlay ${dark ? 'dark' : null}`}>
            <FontAwesomeIcon icon={faSyncAlt} size="3x" spin={true}/>
        </div>
    );
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
export const subtotalFormCompany = (form) => {
    let response = 0;
    form.packages.map((item)=>{
        if (item.package !== null) {
            response += ( item.package.meta.prices * item.qty );
        }
    });
    return response;
}
export const subtotalDiscountFormCompany = (form) => {
    let response = 0;
    form.discounts.map((item)=>{
        if (item.discount !== null) {
            response += item.discount.meta.amount;
        }
    });
    return response;
}
export const subtotalAfterTaxFormCompany = (form) => {
    let subtotal = subtotalFormCompany(form);
    let taxsubtotal = subtotalTaxFormCompany(form);
    return subtotal + taxsubtotal;
}
export const subtotalTaxFormCompany = (form) => {
    let response = subtotalFormCompany(form);
    let taxTotal = 0;
    form.taxes.map((item)=>{
        if (item.tax !== null) {
            taxTotal += item.tax.meta.percent;
        }
    });
    response = ( (taxTotal * response) / 100 );
    return response;
}
export const grandTotalCompanyForm = (form) => {
    let subtotal = subtotalAfterTaxFormCompany(form);
    let discount = subtotalDiscountFormCompany(form);
    return subtotal - discount;
}
export const sumTotalAfterTaxCompanyPackageForm = (form) => {
    let response = 0;
    let tax = sumTotalTaxCompanyPackageForm(form);
    form.packages.map((item)=>{
        if (item.package !== null) {
            response += item.package.meta.price * item.qty;
        }
    })
    return response + tax;
    //return sumTotalTaxCompanyPackageForm(form) + form.packages.reduce((a,b) => a + b.package === null ? 0 : b.package.meta.prices * b.qty, 0);
}
export const sumTaxCompanyPackageForm = (form, currentTax) => {
    let response = 0;
    let subtotal = 0;
    form.packages.map((item)=>{
        if (item.package !== null) {
            subtotal += item.package.meta.prices * item.qty;
        }
    })
    //form.packages.reduce((a,b) => a + b.package === null ? 0 : b.package.meta.prices * b.qty, 0);
    if (currentTax.tax !== null) {
        response = ( currentTax.tax.meta.percent * subtotal ) / 100;
    }
    return response;
}
export const sumTotalTaxCompanyPackageForm = (form) => {
    let response = 0;
    let totalTax = 0;
    let subtotal = form.packages.reduce((a,b) => a + b.package === null ? 0 : b.package.meta.prices * b.qty, 0);
    form.taxes.map((item)=>{
        if (item.tax !== null) {
            totalTax += item.tax.meta.percent;
        }
    });
    response = ( subtotal * totalTax ) / 100;
    return response;
}
export const sortByCompany = (data) => {
    return data.meta.company === null ? 'z' : data.meta.company.label;
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
export const pipeIp = (value) => {
    if (value === '.' || value.endsWith('..')) return false;
    const parts = value.split('.');
    if (
        parts.length > 4 ||
        parts.some(part => part === '00' || part < 0 || part > 255)
    ) {
        return false;
    }
    return value;
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
export const customPreventDefault = (event) => {
    event.preventDefault();
}
export const responseMessage = (error) => {
    let message = Lang.get('messages.method');
    try {
        if (typeof error.response !== 'undefined') {
            switch (error.response.status) {
                case 401 :
                    showError("Unauthenticated");
                    logout();
                break;
                case 404 :
                    showError(Lang.get('messages.404'));
                    break;
            }
            if (typeof error.response.data === 'undefined') {
                showError(Lang.get('messages.undefined'));
            } else if (typeof error.response.data.message === 'undefined') {
                showError(Lang.get('messages.undefined'));
            } else if (error.response.data.message.length > 0){
                showError(error.response.data.message);
            }
        } else {
            showError(message);
        }
    } catch (e) {
        showError(e.message);
    }
}
export const routerConnectionType = [
    { value : 'api', label : Lang.get('nas.labels.connection.type.api') },
    //{ value : 'ssl', label : Lang.get('nas.labels.connection.type.ssl') }
];
export const hasWhiteSpace = (string) => {
    return /\s/g.test(string);
}
export const priorityList = [
    { value : 8, label : 8 },
    { value : 7, label : 7 },
    { value : 6, label : 6 },
    { value : 5, label : 5 },
    { value : 4, label : 4 },
    { value : 3, label : 3 },
    { value : 2, label : 2 },
    { value : 1, label : 1 },
]
export const formatBytes = (bytes, decimals = 0, real = false) => {
    if (!+bytes) return '0 Bytes'
    let k = 1000
    if (real) k = 1024;
    bytes = bytes * k;
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
export const LabelRequired = () => {
    return (
        <sup className="float-left text-danger"><FontAwesomeIcon size="2xs" icon={faAsterisk}/></sup>
    );
}
export const listDataPerPage = [
    { value : 10, label : 10 },
    { value : 20, label : 20 },
    { value : 30, label : 30 },
    { value : 50, label : 50 },
    { value : 100, label : 100 },
    { value : 500, label : 500 },
];
export const FormControlSMReactSelect = {
    container: (provided, state) => ({
        ...provided,
        padding: '0',
        border: '0',
        fontSize: '0.875rem !important',
    }),
    control: (provided, state) => ({
        ...provided,
        height: 'calc(1.8125rem + 2px)',
        minHeight: 'calc(1.8125rem + 2px)',
        fontSize: '0.875rem !important',
        borderColor: '#d8dbe0',
        lineHeight: 1.5,
        boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
        transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
        ':hover': {
            borderColor: state.isFocused ? '#66afe9' : '#d8dbe0',
            boxShadow: state.isFocused ?
                'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)' :
                'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
        }
    }),
    valueContainer: (provided, state) => ({
        ...provided,
        fontSize: '0.875rem !important',
        marginTop: '0',
        marginLeft: '6px',
        padding: '0',
        border: '0',
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        marginTop: '0',
        padding: '0',
        border: '0',
        width: '16px',
    }),
    clearIndicator: (provided, state) => ({
        ...provided,
        marginTop: '0',
        padding: '0',
        border: '0',
        width: '16px',
    }),
    indicatorsContainer: (provided, state) => ({
        ...provided,
        paddingRight: '4px',
        border: '0',
    }),
}
export const formatPhone = (phone, separator = ' ') => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(62|)?(\d{4})(\d{4})(\d{2}|\d{3}|\d{4})$/);
    if (match) {
        const intlCode = `+${match[1]}${separator}`; // (match[1] ? '+62 ' : '');
        return [intlCode, match[2], match[3], match[4]].join(separator);
    }
    return null;
}
export const randomString = (length = 10) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
export const listSupportedLanguage = [
    { value : 'id', label : "Bahasa Indonesia", flag : 'fi fi-id' },
    { value : 'en', label : "English US", flag : 'fi fi-us' },
];
const imageExtensions = ['.gif', '.jpg', '.jpeg', '.png'];
export const subnet2Mask = (subnet)=> {
    return subnet
        .split('.')
        .reduce((nbb, byte) => (
            [...Array(8).reverse().keys()]
                .reduce((nb, i) => (nb + ((byte >> i) & 1)), nbb)), 0)
}


export const mask2Subnet = (val) => {
    return [255, 255, 255, 255]
        .map(() => [...Array(8).keys()]
            .reduce((rst) => (rst * 2 + (val-- > 0)), 0))
        .join('.')
}
export const createNetmaskAddr = (bitCount) =>{
    let mask = [], i, n;
    for(i=0; i<4; i++) {
        n = Math.min(bitCount, 8);
        mask.push(256 - Math.pow(2, 8-n));
        bitCount -= n;
    }
    return mask.join('.');
}
export const getIpRangeFromAddressAndNetmask = (str) => {
    let part = str.split("/"); // part[0] = base address, part[1] = netmask
    let ipaddress = part[0].split('.');
    let netmaskblocks = ["0","0","0","0"];
    if(!/\d+\.\d+\.\d+\.\d+/.test(part[1])) {
        // part[1] has to be between 0 and 32
        netmaskblocks = ("1".repeat(parseInt(part[1], 10)) + "0".repeat(32-parseInt(part[1], 10))).match(/.{1,8}/g);
        netmaskblocks = netmaskblocks.map(function(el) { return parseInt(el, 2); });
    } else {
        // xxx.xxx.xxx.xxx
        netmaskblocks = part[1].split('.').map(function(el) { return parseInt(el, 10) });
    }
    // invert for creating broadcast address (highest address)
    let invertedNetmaskblocks = netmaskblocks.map(function(el) { return el ^ 255; });
    let baseAddress = ipaddress.map(function(block, idx) { return block & netmaskblocks[idx]; });
    let broadcastaddress = baseAddress.map(function(block, idx) { return block | invertedNetmaskblocks[idx]; });
    return [baseAddress.join('.'), broadcastaddress.join('.')];
}
