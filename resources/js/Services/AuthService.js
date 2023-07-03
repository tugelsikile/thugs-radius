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
export const registerSubmit = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/register"
    });
    return Promise.resolve(request);
}
export const loginSubmitGoogle = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/login/google"
    });
    return Promise.resolve(request);
}
export const registerGoogleSubmit = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/register/google"
    });
    return Promise.resolve(request);
}
export const forgotPasswordSubmit = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/password/forgot"
    });
    return Promise.resolve(request);
}
export const resetPasswordSubmit = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/password/reset"
    });
    return Promise.resolve(request);
}
export const updateAvatar = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/auth/me/avatar"
    });
    return Promise.resolve(request);
}
export const updateAccount = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/auth/me/account"
    });
    return Promise.resolve(request);
}
export const updatePassword = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/auth/me/password"
    });
    return Promise.resolve(request);
}
export const updateLocale = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/auth/me/locale"
    });
    return Promise.resolve(request);
}
