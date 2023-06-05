import React from "react";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    CardToolMinimize,
    formatLocaleDate,
    formatLocalePeriode,
    formatLocaleString, sumGrandTotalInvoiceSingle, sumSubtotalDiscountInvoiceSingle,
    sumSubtotalFormInvoice,
    sumSubtotalInvoiceSingle,
    sumSubtotalTaxInvoiceSingle,
    sumTaxInvoiceSingle,
    sumTotalInvoiceSingle,
    sumTotalPackageSingle,
    sumTotalPaymentSingle,
    ucFirst
} from "../../../../../Components/mixedConsts";
import TableInvoicePackage from "./TableInvoicePackage";

// noinspection DuplicatedCode
class InvoiceInfo extends React.Component {
    user_collection;
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.props.handleClose()}>
                <DialogTitle>
                    <button type="button" className="close float-right" onClick={()=>this.props.handleClose()}>
                        <span aria-hidden="true">×</span>
                    </button>
                    <span className="modal-title text-sm">
                        {Lang.get('companies.invoices.labels.info')}
                    </span>
                </DialogTitle>
                {this.props.data !== null &&
                    <DialogContent dividers>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group row">
                                    <label className="col-sm-3 col-form-label">{Lang.get('companies.invoices.labels.code')}</label>
                                    <div className="col-sm-4">
                                        <div className="form-control text-sm">{this.props.data.label}</div>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-sm-3 col-form-label">{Lang.get('companies.invoices.labels.periode')}</label>
                                    <div className="col-sm-9">
                                        <div className="form-control text-sm">{formatLocalePeriode(this.props.data.meta.periode)}</div>
                                    </div>
                                </div>
                                <div className="card card-info card-outline collapsed-card">
                                    <div className="card-header">
                                        <h3 className="card-title">{Lang.get('companies.labels.info')}</h3>
                                        <CardToolMinimize hide={true}/>
                                    </div>
                                    <div className="card-body" style={{display:'none'}}>
                                        <div className="form-group row">
                                            <label className="col-sm-3 col-form-label">{Lang.get('companies.labels.name')}</label>
                                            <div className="col-sm-9">
                                                <div className="form-control text-sm">{this.props.data.meta.company.name}</div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-3 col-form-label">{Lang.get('companies.labels.address')}</label>
                                            <div className="col-sm-9 mb-3">
                                                <div className="form-control text-sm">
                                                    {this.props.data.meta.company.address},&nbsp;
                                                </div>
                                            </div>
                                            <div className="col-sm-9 offset-3 mb-3">
                                                <div className="form-control text-sm">
                                                    {this.props.data.meta.company.village_obj !== null && ucFirst(this.props.data.meta.company.village_obj.name)}&nbsp;
                                                    {this.props.data.meta.company.district_obj !== null && ucFirst(this.props.data.meta.company.district_obj.name)}&nbsp;
                                                </div>
                                            </div>
                                            <div className="col-sm-9 offset-3 mb-3">
                                                <div className="form-control text-sm">
                                                    {this.props.data.meta.company.city_obj !== null && ucFirst(this.props.data.meta.company.city_obj.name)}&nbsp;
                                                    {this.props.data.meta.company.province_obj !== null && ucFirst(this.props.data.meta.company.province_obj.name)}&nbsp;
                                                    {this.props.data.meta.company.postal}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                {this.props.data.meta.company.user_collection.length > 0 &&
                                    <>
                                        <div className="form-group row">
                                            <label className="col-sm-3 col-form-label">{Lang.get('companies.cps.labels.name')}</label>
                                            <div className="col-sm-9">
                                                <div className="form-control text-sm">{this.props.data.meta.company.user_collection[0].name}</div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-3 col-form-label">{Lang.get('companies.cps.labels.email')}</label>
                                            <div className="col-sm-9">
                                                <div className="form-control text-sm">{this.props.data.meta.company.user_collection[0].email}</div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-3 col-form-label">{Lang.get('companies.cps.labels.phone')}</label>
                                            <div className="col-sm-9">
                                                <div className="form-control text-sm">{this.props.data.meta.company.user_collection[0].phone}</div>
                                            </div>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                        <TableInvoicePackage data={this.props.data}/>

                        <div className="card card-success card-outline">
                            <div className="card-header">
                                <h3 className="card-title">{Lang.get('companies.invoices.payments.labels.menu')}</h3>
                                <div className="card-tools">
                                    <button type="button" className="btn btn-tool" data-card-widget="collapse"><i className="fas fa-minus"/></button>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <table className="table table-sm table-striped">
                                    <thead>
                                    <tr>
                                        <th className="align-middle" width={150}>{Lang.get('companies.invoices.payments.labels.code')}</th>
                                        <th className="align-middle" width={200}>{Lang.get('companies.invoices.payments.labels.date')}</th>
                                        <th className="align-middle">{Lang.get('companies.invoices.payments.labels.note')}</th>
                                        <th className="align-middle">{Lang.get('companies.invoices.payments.labels.by')}</th>
                                        <th className="align-middle" width={150}>{Lang.get('companies.invoices.payments.labels.amount')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.props.data.meta.timestamps.paid.payments.length === 0 ?
                                        <tr><td colSpan={5} className="text-center align-middle">{Lang.get('messages.no_data')}</td></tr>
                                        : this.props.data.meta.timestamps.paid.payments.map((item)=>
                                            <tr key={item.value}>
                                                <td className="align-middle text-center">{item.label}</td>
                                                <td className="align-middle">{formatLocaleDate(item.meta.timestamps.paid.at)}</td>
                                                <td className="align-middle">{item.meta.note}</td>
                                                <td className="align-middle">{item.meta.timestamps.paid.by !== null && item.meta.timestamps.paid.by.name}</td>
                                                <td className="align-middle">
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">{formatLocaleString(item.meta.amount)}</span>
                                                </td>
                                            </tr>
                                        )
                                    }
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={4}>{Lang.get('companies.invoices.labels.subtotal.main')}</th>
                                        <th className="align-middle">
                                            <span className="float-left">Rp.</span>
                                            <span className="float-right">{formatLocaleString(sumTotalInvoiceSingle(this.props.data),0)}</span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={4}>{Lang.get('companies.invoices.payments.labels.subtotal')}</th>
                                        <th className="align-middle">
                                            <span className="float-left">Rp.</span>
                                            <span className="float-right">{formatLocaleString(sumTotalPaymentSingle(this.props.data),0)}</span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={4}>{Lang.get('companies.invoices.payments.labels.amount_left')}</th>
                                        <th className="align-middle">
                                            <span className="float-left">Rp.</span>
                                            <span className="float-right">{formatLocaleString(sumTotalInvoiceSingle(this.props.data) - sumTotalPaymentSingle(this.props.data),0)}</span>
                                        </th>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </DialogContent>
                }
                <DialogActions className="justify-content-between">
                    <button type="button" className="btn btn-default" onClick={()=>this.props.handleClose()}>
                        <i className="fas fa-times mr-1"/> {Lang.get('messages.close')}
                    </button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default InvoiceInfo;
