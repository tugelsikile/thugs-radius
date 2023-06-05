import React from "react";
import {
    formatLocaleString, sumGrandTotalInvoiceSingle, sumSubtotalDiscountInvoiceSingle,
    sumSubtotalInvoiceSingle,
    sumSubtotalTaxInvoiceSingle,
    sumTaxInvoiceSingle
} from "../../../../../Components/mixedConsts";

class TableInvoicePackage extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="card card-info card-outline">
                <div className="card-header">
                    <h3 className="card-title">{Lang.get('companies.packages.labels.menu')}</h3>
                    <div className="card-tools">
                        <button type="button" className="btn btn-tool" data-card-widget="collapse"><i className="fas fa-minus"/></button>
                    </div>
                </div>
                <div className="card-body p-0">
                    <table className="table table-sm table-striped">
                        <thead>
                        <tr>
                            <th width={100} className="align-middle">{Lang.get('companies.packages.labels.code')}</th>
                            <th className="align-middle">{Lang.get('companies.invoices.labels.package.name')}</th>
                            <th width={100} className="align-middle">{Lang.get('companies.invoices.labels.package.qty')}</th>
                            <th width={150} className="align-middle">{Lang.get('companies.invoices.labels.package.price')}</th>
                            <th width={200} className="align-middle">{Lang.get('companies.invoices.labels.subtotal.item')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.props.data.meta.packages.map((item)=>
                            <tr key={item.value}>
                                <td className="align-middle text-center">{item.meta.package.meta.code}</td>
                                <td className="align-middle">{item.label}</td>
                                <td className="align-middle text-center">{item.meta.prices.qty}</td>
                                <td className="align-middle">
                                    <span className="float-left">Rp.</span>
                                    <span className="float-right">{formatLocaleString(item.meta.prices.price)}</span>
                                </td>
                                <td className="align-middle">
                                    <span className="float-left">Rp.</span>
                                    <span className="float-right">{formatLocaleString(item.meta.prices.qty * item.meta.prices.price)}</span>
                                </td>
                            </tr>
                        )}
                        </tbody>
                        <tfoot>
                        <tr>
                            <th className="align-middle text-right" colSpan={4}>{Lang.get('companies.invoices.labels.subtotal.item')}</th>
                            <th className="align-middle text-right">
                                <span className="float-left">Rp.</span>
                                <span className="float-right">{formatLocaleString(sumSubtotalInvoiceSingle(this.props.data),2)}</span>
                            </th>
                        </tr>
                        {this.props.data.meta.taxes.length === 0 ? null :
                            <>
                                {this.props.data.meta.taxes.length > 1 ?
                                    <>
                                        {this.props.data.meta.taxes.map((item,index)=>
                                            <tr key={item.value}>
                                                <th className="align-middle text-right" colSpan={4}>{item.meta.tax.name} ({formatLocaleString(item.meta.tax.percent,2)}%)</th>
                                                <th className="align-middle text-right">
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">{formatLocaleString(sumTaxInvoiceSingle(this.props.data, index),2)}</span>
                                                </th>
                                            </tr>
                                        )}
                                        <tr>
                                            <th className="align-middle text-right" colSpan={4}>{Lang.get('companies.invoices.labels.subtotal.tax')}</th>
                                            <th className="align-middle text-right">
                                                <span className="float-left">Rp.</span>
                                                <span className="float-right">{formatLocaleString(sumSubtotalTaxInvoiceSingle(this.props.data),2)}</span>
                                            </th>
                                        </tr>
                                    </>
                                    :
                                    <tr>
                                        <th className="align-middle text-right" colSpan={4}>{this.props.data.meta.taxes[0].meta.tax.name} ({formatLocaleString(this.props.data.meta.taxes[0].meta.tax.percent,2)}%)</th>
                                        <th className="align-middle text-right">
                                            <span className="float-left">Rp.</span>
                                            <span className="float-right">{formatLocaleString(sumSubtotalTaxInvoiceSingle(this.props.data),2)}</span>
                                        </th>
                                    </tr>
                                }
                            </>
                        }
                        {this.props.data.meta.discounts.length === 0 ? null :
                            <>
                                {this.props.data.meta.discounts.length > 1 ?
                                    <>
                                        {this.props.data.meta.discounts.map((item)=>
                                            <tr key={item.value}>
                                                <th colSpan={4} className="align-middle text-right">{Lang.get('discounts.labels.menu')} - {item.meta.discount.name} ({item.meta.discount.code})</th>
                                                <th className="align-middle text-right">
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">{formatLocaleString(item.meta.discount.amount,2)}</span>
                                                </th>
                                            </tr>
                                        )}
                                        <tr>
                                            <th colSpan={4} className="align-middle text-right">{Lang.get('discounts.labels.subtotal')}</th>
                                            <th className="align-middle text-right">
                                                <span className="float-left">Rp.</span>
                                                <span className="float-right">{formatLocaleString(sumSubtotalDiscountInvoiceSingle(this.props.data),2)}</span>
                                            </th>
                                        </tr>
                                    </>
                                    :
                                    <tr>
                                        <th colSpan={4} className="align-middle text-right">{this.props.data.meta.discounts[0].meta.discount.name} ({this.props.data.meta.discounts[0].meta.discount.code})</th>
                                        <th className="align-middle text-right">
                                            <span className="float-left">Rp.</span>
                                            <span className="float-right">{formatLocaleString(sumSubtotalDiscountInvoiceSingle(this.props.data),2)}</span>
                                        </th>
                                    </tr>
                                }
                            </>
                        }
                        <tr>
                            <th className="align-middle text-right" colSpan={4}>{Lang.get('companies.invoices.labels.subtotal.main')}</th>
                            <th className="align-middle text-right">
                                <span className="float-left">Rp.</span>
                                <span className="float-right">{formatLocaleString(sumGrandTotalInvoiceSingle(this.props.data),2)}</span>
                            </th>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        )
    }
}
export default TableInvoicePackage;
