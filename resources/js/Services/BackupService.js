import Axios from "axios";
import {axiosHeader} from "./Configs";

export const crudClientBackup = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/backups", data : data
    });
    return Promise.resolve(request);
}
export const crudImport = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/import", data : data
    });
    return Promise.resolve(request);
}
export const readDataRST = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/backups/import/rst/read", data : data
    });
    return Promise.resolve(request);
}
