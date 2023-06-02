import Axios from "axios";

export const crudCompany = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/auth/companies", data : data
    });
    return Promise.resolve(request);
}
export const crudCompanyPackage = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/auth/companies/packages", data : data
    });
    return Promise.resolve(request);
}
export const crudCompanyInvoice = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/auth/companies/invoices", data : data
    });
    return Promise.resolve(request);
}
export const crudCompanyInvoicePayment = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/auth/companies/invoices/payments", data : data
    });
    return Promise.resolve(request);
}
