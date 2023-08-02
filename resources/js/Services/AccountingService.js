import Axios from "axios";
import {axiosHeader} from "./Configs";

export const crudPettyCash = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/accounting/petty-cash", data : data
    });
    return Promise.resolve(request);
}
