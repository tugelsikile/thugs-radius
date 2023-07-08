import Axios from "axios";
import {axiosHeader} from "./Configs";

export const statusTransactionBRIAPI = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/payment-gateways/bri/status"
    });
    return Promise.resolve(request);
}
export const statusTransactionDUITKU = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/payment-gateways/duitku/status"
    });
    return Promise.resolve(request);
}
export const statusTransactionMidtrans = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/payment-gateways/midtrans/status"
    });
    return Promise.resolve(request);
}
export const generateQRTransactionDUITKU = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/payment-gateways/duitku/qr"
    });
    return Promise.resolve(request);
}
export const paymentChannelDUITKU = async (data) => {
    let request = Axios({
        headers : axiosHeader(), data : data,
        method : "post", url : window.origin + "/api/payment-gateways/duitku/channels"
    });
    return Promise.resolve(request);
}
