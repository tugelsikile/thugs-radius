import React from "react";
import {
    CardPreloader,
    formatLocalePeriode,
    formatLocaleString,
    sumGrandTotalInvoiceSingle,
    sumSubtotalDiscountInvoiceSingle,
    sumSubtotalInvoiceSingle,
    sumSubtotalTaxInvoiceSingle,
    sumTaxInvoiceSingle,
    ucFirst
} from "../../../../../Components/mixedConsts";

class BodyInvoice extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="invoice p-3 mb-3">
                {this.props.loadings.invoice &&
                    <CardPreloader/>
                }
                <div className="row">
                    <div className="col-12">
                        <h4>
                            <i className="fas fa-globe mr-1"/>{this.props.site.name}
                            <small className="float-right">
                                {Lang.get('companies.invoices.labels.periode')} : {formatLocalePeriode(this.props.invoice.meta.periode,'D MMMM yyyy')}
                            </small>
                        </h4>
                    </div>
                </div>

                <div className="row invoice-info">
                    <div className="col-sm-4 invoice-col">
                        From
                        <address>
                            <strong>{this.props.user.label}</strong><br/>
                            {this.props.site.address.street}, {this.props.site.address.village !== null && ucFirst(this.props.site.address.village.name)} {this.props.site.address.district !== null && ucFirst(this.props.site.address.district.name)} {this.props.site.address.city !== null && ucFirst(this.props.site.address.city.name)} {this.props.site.address.province !== null && ucFirst(this.props.site.address.province.name)} {this.props.site.address.postal}<br/>
                            Phone: {this.props.site.phone}<br/>
                            Email: {this.props.site.email}
                        </address>
                    </div>
                    <div className="col-sm-4 invoice-col">
                        To
                        <address>
                            <strong>{this.props.invoice.meta.company.name}</strong><br/>
                            {this.props.invoice.meta.company.address}, {this.props.invoice.meta.company.village_obj !== null && ucFirst(this.props.invoice.meta.company.village_obj.name)} {this.props.invoice.meta.company.district_obj !== null && ucFirst(this.props.invoice.meta.company.district_obj.name)} {this.props.invoice.meta.company.city_obj !== null && ucFirst(this.props.invoice.meta.company.city_obj.name)} {this.props.invoice.meta.company.province_obj !== null && ucFirst(this.props.invoice.meta.company.province_obj.name)} {this.props.invoice.meta.company.postal}<br/>
                            Phone: {this.props.invoice.meta.company.phone}<br/>
                            Email: {this.props.invoice.meta.company.email}
                        </address>
                    </div>

                    <div className="col-sm-4 invoice-col">
                        <b>Invoice #{this.props.invoice.label}</b><br/>
                        <b>Order ID:{this.props.invoice.meta.order_id}</b>
                        <br/>
                        {this.props.invoice.meta.timestamps.paid.due !== null &&
                            <>
                                <b>Payment Due:</b> {formatLocalePeriode(this.props.invoice.meta.timestamps.paid.due,'DD MMMM yyyy')}
                                <br/>
                            </>
                        }
                    </div>
                </div>


                <div className="row">
                    <div className="col-12 table-responsive">
                        <table className="table table-striped">
                            <thead>
                            <tr>
                                <th>{Lang.get('companies.invoices.labels.package.name')}</th>
                                <th width={100}>{Lang.get('companies.invoices.labels.package.qty')}</th>
                                <th width={150}>{Lang.get('companies.invoices.labels.package.price')}</th>
                                <th width={150}>{Lang.get('companies.invoices.labels.subtotal.item')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.props.invoice.meta.packages.map((item)=>
                                <tr key={item.value}>
                                    <td>{item.label}</td>
                                    <td>{item.meta.prices.qty}</td>
                                    <td>{formatLocaleString(item.meta.prices.price)}</td>
                                    <td>{formatLocaleString(item.meta.prices.qty * item.meta.prices.price)}</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                </div>

                <div className="row">

                    <div className="col-6">
                        <p className="lead">Payment Methods:</p>
                        <p className="text-muted well well-sm shadow-none mt-2">
                            Etsy doostang zoodles disqus groupon greplin oooj voxy zoodles, weebly ning heekya handango imeem plugg dopplr jibjab, movity jajah plickers sifteo edmodo ifttt zimbra.
                        </p>
                    </div>

                    <div className="col-6">
                        <p className="lead">Amount Due {this.props.invoice.meta.timestamps.paid.due !== null && formatLocalePeriode(this.props.invoice.meta.timestamps.paid.due,'DD MMMM yyyy')}</p>
                        <div className="table-responsive">
                            <table className="table">
                                <tbody>
                                <tr>
                                    <th style={{width:'50%'}}>{Lang.get('companies.invoices.labels.subtotal.item')}:</th>
                                    <td>{formatLocaleString(sumSubtotalInvoiceSingle(this.props.invoice),0)}</td>
                                </tr>
                                {this.props.invoice.meta.taxes.length === 0 ? null :
                                    this.props.invoice.meta.taxes.length === 1 ?
                                        <tr>
                                            <th>{this.props.invoice.meta.taxes[0].meta.tax.code} ({formatLocaleString(this.props.invoice.meta.taxes[0].meta.tax.percent,2)}%)</th>
                                            <td>{formatLocaleString(sumTaxInvoiceSingle(this.props.invoice,0),2)}</td>
                                        </tr>
                                        :
                                        <>
                                            {this.props.invoice.meta.taxes.map((item,index)=>
                                                <tr key={item.value}>
                                                    <th>{item.meta.tax.code} ({formatLocaleString(item.meta.tax.percent)}%)</th>
                                                    <td>{formatLocaleString(sumTaxInvoiceSingle(this.props.invoice,index),2)}</td>
                                                </tr>
                                            )}
                                            <tr>
                                                <th>{Lang.get('companies.invoices.labels.vat')}</th>
                                                <td>{formatLocaleString(sumSubtotalTaxInvoiceSingle(this.props.invoice),2)}</td>
                                            </tr>
                                        </>
                                }
                                {this.props.invoice.meta.discounts.length === 0 ? null :
                                    this.props.invoice.meta.discounts.length === 1 ?
                                        <tr>
                                            <th>{this.props.invoice.meta.discounts[0].meta.discount.name}</th>
                                            <td>{formatLocaleString(this.props.invoice.meta.discounts[0].meta.discount.amount,2)}</td>
                                        </tr>
                                        :
                                        <>
                                            {this.props.invoice.meta.discounts.map((item)=>
                                                <tr key={item.value}>
                                                    <th>{item.meta.discount.name}</th>
                                                    <td>{formatLocaleString(item.meta.discount.amount,2)}</td>
                                                </tr>
                                            )}
                                            <tr>
                                                <th>{Lang.get('companies.invoices.labels.discount')}</th>
                                                <td>{formatLocaleString(sumSubtotalDiscountInvoiceSingle(this.props.invoice),2)}</td>
                                            </tr>
                                        </>
                                }
                                {this.props.invoice.meta.vat > 0 &&
                                    <tr>
                                        <th>Tax ({this.props.invoice.meta.vat}%)</th>
                                        <td>$10.34</td>
                                    </tr>
                                }
                                <tr>
                                    <th>{Lang.get('companies.invoices.labels.subtotal.main')}</th>
                                    <td>{formatLocaleString(sumGrandTotalInvoiceSingle(this.props.invoice),0)}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="row no-print">
                    <div className="col-12">
                        <a href="#" onClick={(e)=>{
                            e.preventDefault();
                            window.print();
                        }} rel="noopener" target="_blank" className="btn btn-default"><i className="fas fa-print"></i> Print</a>
                        <button type="button" className="btn btn-success float-right"><i className="far fa-credit-card"></i> Submit Payment
                        </button>
                        <button type="button" className="btn btn-primary float-right" style={{marginRight:'5px'}}>
                            <i className="fas fa-download"></i> Generate PDF
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}
export default BodyInvoice;
