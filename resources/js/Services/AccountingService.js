import Axios from "axios";
import {axiosHeader} from "./Configs";

export const crudPettyCash = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/accounting/petty-cash", data : data
    });
    return Promise.resolve(request);
}
export const crudCashFlow = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/accounting/cash-flows", data : data
    });
    return Promise.resolve(request);
}
export const crudAccount = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/accounting/cash-flows/accounts", data : data
    });
    return Promise.resolve(request);
}
export const crudCategory = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/accounting/cash-flows/categories", data : data
    });
    return Promise.resolve(request);
}
