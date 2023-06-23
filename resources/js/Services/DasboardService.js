import Axios from "axios";
import {axiosHeader} from "./Configs";

export const serverStatus = (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/dashboards/server-statuses", data : data
    });
    return Promise.resolve(request);
}
