import Axios from "axios";
import {axiosHeader} from "./Configs";

const CancelToken = Axios.CancelToken;
const cancelTokenSource = CancelToken.source();

export const crudOlt = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/olt", data : data
    });
    return Promise.resolve(request);
}
export const testConnection = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/olt/test-connection", data : data
    });
    return Promise.resolve(request);
}
export const crudGponStates = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/olt/gpon/state", data : data
    });
    return Promise.resolve(request);
}
export const getGponCustomer = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/olt/gpon/customer", data : data
    });
    return Promise.resolve(request);
}
export const cancelOltService = () => {
    cancelTokenSource.cancel('operation canceled');
    console.log('operation cancel');
}
