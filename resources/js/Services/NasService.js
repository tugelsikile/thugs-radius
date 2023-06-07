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
export const crudProfilePools = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/nas/profiles/pools", data : data
    });
    return Promise.resolve(request);
}
export const crudProfileBandwidth = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/nas/profiles/bandwidths", data : data
    });
    return Promise.resolve(request);
}
export const crudProfile = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/nas/profiles", data : data
    });
    return Promise.resolve(request);
}
