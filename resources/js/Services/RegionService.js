import Axios from "axios";

export const allProvinces = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json" },
        method : "post", url : window.origin + "/api/regions/all", data : data
    });
    return Promise.resolve(request);
}
