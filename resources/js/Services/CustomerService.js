import Axios from "axios";
import {showPromise} from "../Components/Toaster";

export const crudCustomers = async (data, show = false) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/customers", data : data
    });
    if (show) {
        showPromise({pending:Lang.get('customers.labels.loading.pending'),success:Lang.get('customers.labels.loading.success'),error:Lang.get('customers.labels.loading.error')}, request);
    }
    return Promise.resolve(request);
}
export const generateHotspot = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/customers/generate", data : data
    });
    return Promise.resolve(request);
}
export const crudCustomerInvoices = async (data, show = false) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/customers/invoices", data : data
    });
    if (show) {
        showPromise({pending:Lang.get('invoices.labels.loading.pending'),success:Lang.get('invoices.labels.loading.success'),error:Lang.get('invoices.labels.loading.error')}, request);
    }
    return Promise.resolve(request);
}
export const generateCustomerInvoice = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/customers/invoices/generate", data : data
    });
    return Promise.resolve(request);
}
export const crudCustomerInvoicePayments = async (data) => {
    let request = Axios({
        headers : { "Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}` },
        method : "post", url : window.origin + "/api/clients/customers/invoices/payments", data : data
    });
    return Promise.resolve(request);
}
