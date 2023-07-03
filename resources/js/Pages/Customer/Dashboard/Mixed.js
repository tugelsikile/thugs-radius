import React from "react";
import moment from "moment";
import {sumGrandTotalInvoice} from "../../Client/Customer/Invoice/Tools/Mixed";
import {formatLocaleString} from "../../../Components/mixedConsts";

export const currentMonthBilling = (invoices) => {
    if (invoices !== null) {
        if (invoices.length > 0) {
            if (invoices.filter((f)=> moment(f.meta.period).month().toFixed() === moment().month().toFixed()).length > 0) {
                let index = invoices.findIndex((f)=> moment(f.meta.period).month().toFixed() === moment().month().toFixed());
                if (index >= 0) {
                    return formatLocaleString(sumGrandTotalInvoice(invoices[index]),0);
                }
            }
        }
    }
    return '-';
}
export const lastMonthBilling = (invoices) => {
    if (invoices !== null) {
        if (invoices.length > 0) {
            if (invoices.filter((f)=> moment(f.meta.period).month().toFixed() === moment().add(-1,'months').month().toFixed()).length > 0) {
                let index = invoices.findIndex((f)=> moment(f.meta.period).month().toFixed() === moment().add(-1,'months').month().toFixed());
                if (index >= 0) {
                    return formatLocaleString(sumGrandTotalInvoice(invoices[index]),0);
                }
            }
        }
    }
    return '-';
}
