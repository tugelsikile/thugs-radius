import Axios from "axios";
import {axiosHeader} from "./Configs";

export const loginSubmit = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/login", data : data
    });
    return Promise.resolve(request);
}
export const getMe = async () => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/auth/me",
    });
    return Promise.resolve(request);
}
export const myPrivileges = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/auth/me/privileges", data : data
    });
    return Promise.resolve(request);
}
export const updateLang = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/auth/me/language", data : data
    });
    return Promise.resolve(request);
}
export const logoutSubmit = async () => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/auth/logout"
    });
    return Promise.resolve(request);
}
