import Axios from "axios";

export const crudNas = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/nas", data : data
    });
    return Promise.resolve(request);
}
export const testNasConnection = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/nas/test-connection", data : data
    });
    return Promise.resolve(request);
}
export const decryptEncryptPass = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/nas/decrypt-encrypt", data : data
    });
    return Promise.resolve(request);
}
