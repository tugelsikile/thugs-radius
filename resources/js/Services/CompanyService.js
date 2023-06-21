import Axios from "axios";
import {showPromise} from "../Components/Toaster";
import {axiosHeader} from "./Configs";

export const crudCompany = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/auth/companies", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('companies.labels.loading.pending'), success : Lang.get('companies.labels.loading.success'), error : Lang.get('companies.labels.loading.error') }, request);
    }
    return Promise.resolve(request);
}
export const crudCompanyPackage = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/auth/companies/packages", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('companies.packages.labels.loading.pending'), success : Lang.get('companies.packages.labels.loading.success'), error : Lang.get('companies.packages.labels.loading.error') }, request);
    }
    return Promise.resolve(request);
}
export const crudCompanyInvoice = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/auth/companies/invoices", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('companies.invoices.labels.loading.pending'), success : Lang.get('companies.invoices.labels.loading.success'), error : Lang.get('companies.invoices.labels.loading.error') }, request);
    }
    return Promise.resolve(request);
}
export const crudCompanyInvoicePayment = async (data, show = false) => {
    let request = Axios({
        headers : axiosHeader(),
        method : "post", url : window.origin + "/api/auth/companies/invoices/payments", data : data
    });
    if (show) {
        showPromise({pending : Lang.get('companies.invoices.payments.labels.loading.pending'), success : Lang.get('companies.invoices.payments.labels.loading.success'), error : Lang.get('companies.invoices.payments.labels.loading.error') }, request);
    }
    return Promise.resolve(request);
}
