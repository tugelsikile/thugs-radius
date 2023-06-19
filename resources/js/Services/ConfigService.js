import Axios from "axios";
import {showPromise} from "../Components/Toaster";

export const guestSiteConfig = async () => {
    let request = Axios({
        headers : { "Accept" : "application/json" },
        method : "post", url : window.origin + "/api/configs/site",
    });
    return Promise.resolve(request);
}
export const crudSiteConfig = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/configs/site", data : data
    });
    return Promise.resolve(request);
}
export const crudTimeZone = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/auth/configs/timezones", data : data
    });
    return Promise.resolve(request);
}
export const guestTimezones = async () => {
    let request = Axios({
        headers : { "Accept" : "application/json" },
        method : "post", url : window.origin + "/api/configs/timezones",
    });
    return Promise.resolve(request);
}
export const crudConfigCurrency = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/auth/configs/currencies", data : data
    });
    return Promise.resolve(request);
}
export const crudTaxes = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/auth/configs/taxes", data : data
    });
    return Promise.resolve(request);
}
export const crudDiscounts = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/auth/configs/discounts", data : data
    });
    return Promise.resolve(request);
}
export const getServerTime = async () => {
    let request = Axios({
        headers : { "Accept" : "application/json" }, method : "get", url : window.origin + "/api/configs/times",
    });
    return Promise.resolve(request);
}
export const crudCompanyConfig = async (data, show = false) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/configs", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('configs.promises.pending'), success : Lang.get('configs.promises.success'), error : Lang.get('configs.promises.error') }, request);
    }
    return Promise.resolve(request);
}
export const crudPaymentGatewayClient = async (data, show = false) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/configs/payment-gateways", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('gateways.promises.pending'), success : Lang.get('gateways.promises.success'), error : Lang.get('gateways.promises.error') }, request);
    }
    return Promise.resolve(request);
}
