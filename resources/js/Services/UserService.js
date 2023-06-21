import Axios from "axios";
import {axiosHeader} from "./Configs";

export const crudPrivileges = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/auth/users/privileges", data : data
    });
    return Promise.resolve(request);
}
export const setPrivileges = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/auth/users/privileges/set", data : data
    });
    return Promise.resolve(request);
}
export const crudUsers = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/auth/users", data : data
    });
    return Promise.resolve(request);
}
