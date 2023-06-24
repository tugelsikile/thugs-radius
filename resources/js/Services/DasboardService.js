import Axios from "axios";
import {axiosHeader} from "./Configs";

export const serverStatus = (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/dashboards/server-statuses", data : data
    });
    return Promise.resolve(request);
}
export const onlineCustomers = (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/dashboards/online-customers", data : data
    });
    return Promise.resolve(request);
}
export const topCards = (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/dashboards/top-cards", data : data
    });
    return Promise.resolve(request);
}
