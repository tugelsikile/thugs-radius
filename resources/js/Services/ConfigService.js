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
