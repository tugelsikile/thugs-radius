import Axios from "axios";

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
