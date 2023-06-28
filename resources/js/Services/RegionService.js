import Axios from "axios";
import {axiosHeader} from "./Configs";

export const allProvinces = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/regions/all", data : data
    });
    return Promise.resolve(request);
}
export const loadVillages = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/regions/villages", data : data
    });
    return Promise.resolve(request);
}
export const loadDistricts = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/regions/districts", data : data
    });
    return Promise.resolve(request);
}
export const loadCities = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/regions/cities", data : data
    });
    return Promise.resolve(request);
}
export const loadProvinces = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/regions/provinces", data : data
    });
    return Promise.resolve(request);
}
export const searchRegions = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/regions/search", data : data
    });
    return Promise.resolve(request);
}
export const fileRegions = async (data) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "get", url : window.origin + "/api/regions/file", data : data
    });
    return Promise.resolve(request);
}
