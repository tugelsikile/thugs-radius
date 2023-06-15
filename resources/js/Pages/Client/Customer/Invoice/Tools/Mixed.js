import React from "react";

export const sortStatusPaymentInvoice = (invoice) => {
    let response = 0;
    if (sumTotalPaymentInvoice(invoice) > 0) {
        if (sumPaymentLeftInvoice(invoice) > 0) {
            response = 1;
        } else if (sumPaymentLeftInvoice(invoice) === 0) {
            response = 2;
        }
    }
    return response;
}
export const StatusPaymentInvoice = (invoice) => {
    let response = <span className="badge badge-secondary">{Lang.get('companies.invoices.payments.labels.status.pending')}</span>;
    if (sumTotalPaymentInvoice(invoice) > 0) {
        if (sumPaymentLeftInvoice(invoice) > 0) {
            response = <span className="badge badge-warning">{Lang.get('companies.invoices.payments.labels.status.partial')}</span>
        } else if (sumPaymentLeftInvoice(invoice) === 0) {
            response = <span className="badge badge-success">{Lang.get('companies.invoices.payments.labels.status.success')}</span>
        }
    }
    return response;
}
export const sumPaymentLeftInvoice = (invoice) => {
    return sumGrandTotalInvoice(invoice) - sumTotalPaymentInvoice(invoice);
}
export const sumGrandTotalInvoice = (invoice) => {
    return ( sumSubtotalInvoice(invoice) + sumSubtotalTaxInvoice(invoice) ) - sumSubtotalDiscountInvoice(invoice);
}
export const sumTotalPaymentInvoice = (invoice) => {
    let response = 0;
    if (invoice.meta.timestamps.paid.payments.length > 0) {
        invoice.meta.timestamps.paid.payments.map((item)=>{
            response += item.meta.amount;
        });
    }
    return response;
}
export const sumSubtotalInvoice = (invoice) => {
    let response = 0;
    if (invoice.meta.services.length > 0) {
        invoice.meta.services.map((item)=>{
            response += item.meta.price;
        });
    }
    return response;
}
export const sumSubtotalTaxInvoice = (invoice) => {
    let response = 0;
    let subtotal = sumSubtotalInvoice(invoice);
    if (invoice.meta.taxes.length > 0) {
        invoice.meta.taxes.map((item)=>{
            if (item.meta.tax !== null) {
                response += ( (subtotal * item.meta.tax.percent) / 100 );
            }
        });
    }
    return response;
}
export const sumSubtotalDiscountInvoice = (invoice) => {
    let response = 0;
    if (invoice.meta.discounts.length > 0) {
        invoice.meta.discounts.map((item)=>{
            if (item.meta.discount !== null) {
                response += item.meta.discount.amount;
            }
        })
    }
    return response;
}
