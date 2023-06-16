import React from "react";
import {CardOverlay, CardPreloader, formatLocaleString, randomString} from "../../../../../Components/mixedConsts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCashRegister,
    faFileInvoiceDollar,
    faMoneyBillWave,
    faSign,
    faSignal,
    faUserTie,
    faWifi
} from "@fortawesome/free-solid-svg-icons";
import {faCreditCard} from "@fortawesome/free-regular-svg-icons";
import BtnSort from "../../../../Auth/User/Tools/BtnSort";

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
export const sumPaymentInvoiceForm = (form) => {
    let response = 0;
    let subtotal = sumGrandTotalInvoice(form.invoice);
    form.payments.current.map((item)=>{
        response += item.amount;
    });
    return response;
}
export const CardInfoPageInvoice = (props) => {
    let total = 0,paid = 0, taxes = 0;
    if (props.filter.status.length > 0) {
        props.invoices.filtered.map((item)=>{
            total += sumGrandTotalInvoice(item);
        });
        props.invoices.filtered.map((item)=>{
            paid += sumTotalPaymentInvoice(item);
        });
        props.invoices.filtered.map((item)=>{
            let subtotal = sumSubtotalInvoice(item);
            if (item.meta.taxes.length > 0) {
                item.meta.taxes.map((tax)=>{
                    if (tax.meta.tax !== null) {
                        taxes += ( (subtotal * tax.meta.tax.percent ) / 100 );
                    }
                })
            }
        });
    } else {
        props.invoices.unfiltered.map((item)=>{
            total += sumGrandTotalInvoice(item);
        });
        props.invoices.unfiltered.map((item)=>{
            paid += sumTotalPaymentInvoice(item);
        });
        props.invoices.unfiltered.map((item)=>{
            let subtotal = sumSubtotalInvoice(item);
            if (item.meta.taxes.length > 0) {
                item.meta.taxes.map((tax)=>{
                    if (tax.meta.tax !== null) {
                        taxes += ( (subtotal * tax.meta.tax.percent ) / 100 );
                    }
                })
            }
        });
    }
    let left = total - paid;
    return (
        <React.Fragment>
            <div className="row">
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-info">
                        { props.loading && CardOverlay(true) }
                        <div className="inner">
                            <h3>{formatLocaleString(total)}</h3>
                            <p>{Lang.get('invoices.labels.cards.total')}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faCashRegister}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-success">
                        { props.loading && CardOverlay(true) }
                        <div className="inner">
                            <h3>{formatLocaleString(paid)}</h3>
                            <p>{Lang.get('invoices.labels.cards.paid')}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faMoneyBillWave}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-warning">
                        { props.loading && CardOverlay(true) }
                        <div className="inner">
                            <h3>{formatLocaleString(left)}</h3>
                            <p>{Lang.get('invoices.labels.cards.pending')}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faCreditCard}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-light">
                        { props.loading && CardOverlay(true) }
                        <div className="inner">
                            <h3>{formatLocaleString(taxes)}</h3>
                            <p>{Lang.get('invoices.labels.cards.tax')}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faFileInvoiceDollar}/>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
export const sumSubtotalInvoiceForm = (form) => {
    let response = 0;
    form.services.current.map((item)=>{
        if (item.service !== null) {
            response += (item.service.meta.price);
        }
    });
    return response;
}
export const sumSingleTaxInvoiceForm = (form, index) => {
    let response = 0;
    let subtotal = sumSubtotalInvoiceForm(form);
    if (form.taxes.current[index].tax !== null) {
        response = ( subtotal * form.taxes.current[index].tax.meta.percent) / 100;
    }
    return response;
}
export const sumTaxInvoiceForm = (form) => {
    let response = 0;
    let subtotal = sumSubtotalInvoiceForm(form);
    form.taxes.current.map((item)=>{
        if (item.tax !== null) {
            response += ( ( subtotal * item.tax.meta.percent) / 100 );
        }
    });
    return response;
}
export const sumDiscountInvoiceForm = (form) => {
    return form.discounts.current.reduce((a,b) => a + (b.discount === null ? 0 : b.discount.meta.amount), 0);
}
export const sumGrandTotalInvoiceForm = (form) => {
    return sumSubtotalInvoiceForm(form) + sumTaxInvoiceForm(form) - sumDiscountInvoiceForm(form);
}
export const TableHeaderRow = (props) => {
    let idCbx = randomString();
    return (
        <tr>
            {props.invoices.filtered.length > 0 &&
                <th className="align-middle text-center pl-2" width={30}>
                    <div style={{zIndex:0}} className="custom-control custom-checkbox">
                        <input id={idCbx} data-id="" disabled={props.loading} onChange={props.onCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                        <label htmlFor={idCbx} className="custom-control-label"/>
                    </div>
                </th>
            }
            <th className="align-middle" width={110}>
                <BtnSort sort="code"
                         name={Lang.get('invoices.labels.code')}
                         title={Lang.get('invoices.labels.sorts.code',{dir:Lang.get(`messages.sorts.dirs.${props.filter.sort.dir}`)})}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={110}>
                <BtnSort sort="id"
                         name={Lang.get('invoices.labels.order_id')}
                         title={Lang.get('invoices.labels.sorts.id',{dir:Lang.get(`messages.sorts.dirs.${props.filter.sort.dir}`)})}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="name"
                         name={Lang.get('customers.labels.name')}
                         title={Lang.get('invoices.labels.sorts.name',{dir:Lang.get(`messages.sorts.dirs.${props.filter.sort.dir}`)})}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={120}>
                <BtnSort sort="amount"
                         name={Lang.get('invoices.labels.amount.label')}
                         title={Lang.get('invoices.labels.sorts.amount',{dir:Lang.get(`messages.sorts.dirs.${props.filter.sort.dir}`)})}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={120}>
                <BtnSort sort="paid"
                         name={Lang.get('invoices.labels.paid.label')}
                         title={Lang.get('invoices.labels.sorts.paid',{dir:Lang.get(`messages.sorts.dirs.${props.filter.sort.dir}`)})}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={120}>
                <BtnSort sort="status"
                         name={Lang.get('invoices.labels.status.label')}
                         title={Lang.get('invoices.labels.sorts.status',{dir:Lang.get(`messages.sorts.dirs.${props.filter.sort.dir}`)})}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle text-center pr-2" width={50}>{Lang.get('messages.action')}</th>
        </tr>
    );
}
