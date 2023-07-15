import Axios from "axios";
import {showPromise} from "../Components/Toaster";
import {axiosHeader} from "./Configs";

export const crudNas = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/nas", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('nas.labels.loading.pending'), success : Lang.get('nas.labels.loading.success'), error : Lang.get('nas.labels.loading.error') }, request);
    }
    return Promise.resolve(request);
}
export const testNasConnection = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/nas/test-connection", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('nas.labels.connection.loading.pending'), success : Lang.get('nas.labels.connection.loading.success'), error : Lang.get('nas.labels.connection.loading.error') }, request);
    }
    return Promise.resolve(request);
}
export const decryptEncryptPass = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/nas/decrypt-encrypt", data : data
    });
    return Promise.resolve(request);
}
export const crudProfilePools = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/nas/profiles/pools", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('nas.pools.labels.loading.pending'), success : Lang.get('nas.pools.labels.loading.success'), error : Lang.get('nas.pools.labels.loading.error') }, request);
    }
    return Promise.resolve(request);
}
export const crudProfileBandwidth = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/nas/profiles/bandwidths", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('bandwidths.labels.loading.pending'), success : Lang.get('bandwidths.labels.loading.success'), error : Lang.get('bandwidths.labels.loading.error') }, request);
    }
    return Promise.resolve(request);
}
export const crudProfile = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/nas/profiles", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('profiles.labels.loading.pending'), success : Lang.get('profiles.labels.loading.success'), error : Lang.get('profiles.labels.loading.error') }, request);
    }
    return Promise.resolve(request);
}
export const getParentQueue = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/nas/parent-queues", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('queue.labels.loading.pending'), success : Lang.get('queue.labels.loading.success'), error : Lang.get('queue.labels.loading.error') }, request);
    }
    return Promise.resolve(request);
}
export const reloadNasStatus = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/nas/reload-status", data : data
    });
    return Promise.resolve(request);
}
export const loadNasIPAddress = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/nas/ip-address", data : data
    });
    return Promise.resolve(request);
}
export const wizardTestCustomerConnection = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/customers/test-connection/wizard", data : data
    });
    return Promise.resolve(request);
}
export const kickOnlineUser = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/customers/kick-online", data : data
    });
    return Promise.resolve(request);
}
export const checkNasRequirements = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/nas/check-requirement", data : data
    });
    return Promise.resolve(request);
}
