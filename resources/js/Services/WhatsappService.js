import Axios from "axios";
import {axiosHeader} from "./Configs";

export const crudWhatsapp = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/clients/configs/whatsapp", data : data
    });
    return Promise.resolve(request);
}
