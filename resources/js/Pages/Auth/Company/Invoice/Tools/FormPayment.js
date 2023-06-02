// noinspection CommaExpressionJS

import React from "react";
import moment from "moment";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {logout} from "../../../../../Components/Authentication";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {crudCompanyInvoicePayment} from "../../../../../Services/CompanyService";
import {NumericFormat} from "react-number-format";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import id from "date-fns/locale/id";
import en from "date-fns/locale/en-US";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Select from "react-select";
import {
    parseInputFloat,
    sumTotalInvoiceSingle,
    sumTotalPackageSingle,
    sumTotalPaymentSingle
} from "../../../../../Components/mixedConsts";
registerLocale("id", id);
registerLocale("en", en);

// noinspection DuplicatedCode,JSCheckFunctionSignatures
class FormPayment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, company : null, invoice : null,
                packages : [], payments : [], paid : false,
                deletes : [],
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleAddPayment = this.handleAddPayment.bind(this);
        this.handleDate = this.handleDate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleDeletePayment = this.handleDeletePayment.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        if (! props.open) {
            form.id = null, form.company = null, form.packages = [], form.payments = [], form.invoice = null,
                form.paid = false, form.deletes = [];
        } else {
            if (props.data !== null) {
                form.id = props.data.value, form.invoice = props.data,
                    form.company = props.data.meta.company, form.deletes = [],
                    form.packages = props.data.meta.packages,
                form.paid = props.data.meta.timestamps.paid.at !== null;
                form.payments = [];
                props.data.meta.timestamps.paid.payments.map((item,index)=>{
                    item.meta.timestamps.paid.at = moment(item.meta.timestamps.paid.at).toDate();
                    form.payments.push(item);
                })
            }
        }
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        if (event.currentTarget.getAttribute('data-index') !== null){
            let index = parseInt(event.currentTarget.getAttribute('data-index'));
            if (index >= 0) {
                if (event.currentTarget.getAttribute('name') === 'note') {
                    form.invoice.meta.timestamps.paid.payments[index].meta.note = event.target.value;
                } else {
                    form.invoice.meta.timestamps.paid.payments[index].meta.amount = parseInputFloat(event);
                }
            }
        }
        this.setState({form});
    }
    handleDate(event, index) {
        let form = this.state.form;
        form.invoice.meta.timestamps.paid.payments[index].meta.timestamps.paid.at = event;
        this.setState({form});
    }
    handleDeletePayment(index) {
        let form = this.state.form;
        if (form.invoice.meta.timestamps.paid.payments[index].value !== null) {
            form.deletes.push(form.invoice.meta.timestamps.paid.payments[index].value);
        }
        form.invoice.meta.timestamps.paid.payments.splice(index,1);
        this.setState({form});
    }
    handleAddPayment() {
        let form = this.state.form;
        form.invoice.meta.timestamps.paid.payments.push({
            value : null, label : Lang.get('companies.invoices.payments.labels.code_temp'),
            meta : {
                amount : 0, note : '',
                timestamps : {
                    paid : {
                        at : new Date(),
                        by : {
                            name : JSON.parse(localStorage.getItem('user')).label,
                        },
                    }
                }
            }
        });
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            if (this.state.form.id !== null) formData.append(Lang.get('companies.invoices.form_input.name'), this.state.form.id);
            this.state.form.invoice.meta.timestamps.paid.payments.map((item,index)=>{
                if (item.value !== null) formData.append(`${Lang.get('companies.invoices.payments.form_input.name')}[${index}][${Lang.get('companies.invoices.payments.form_input.id')}]`, item.value);
                if (item.meta.timestamps.paid.at !== null) formData.append(`${Lang.get('companies.invoices.payments.form_input.name')}[${index}][${Lang.get('companies.invoices.payments.form_input.date')}]`, moment(item.meta.timestamps.paid.at).format('yyyy-MM-DD HH:mm:ss'));
                formData.append(`${Lang.get('companies.invoices.payments.form_input.name')}[${index}][${Lang.get('companies.invoices.payments.form_input.note')}]`, item.meta.note);
                formData.append(`${Lang.get('companies.invoices.payments.form_input.name')}[${index}][${Lang.get('companies.invoices.payments.form_input.amount')}]`, item.meta.amount);
            });
            this.state.form.deletes.map((item,index)=>{
                formData.append(`${Lang.get('companies.invoices.payments.form_input.delete')}[${index}]`, item);
            });
            formData.append(`${Lang.get('companies.invoices.payments.form_input.max_amount')}`, sumTotalInvoiceSingle(this.state.form.invoice))
            let response = await crudCompanyInvoicePayment(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
                this.props.handleUpdate(response.data.params);
                this.props.handleClose();
            }
        } catch (e) {
            this.setState({loading:false});
            if (e.response.status === 401) logout();
            showError(e.response.data.message);
        }
    }
    render() {
        return (
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <DialogTitle>
                        <button type="button" className="close float-right" onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <span className="modal-title text-sm">
                            {Lang.get('companies.invoices.payment.menu')}
                        </span>
                    </DialogTitle>
                    <DialogContent dividers>
                        {this.state.form.invoice !== null &&
                            <>
                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">{Lang.get('companies.invoices.labels.code')}</label>
                                    <div className="col-sm-3">
                                        <div className="form-control text-sm">{this.state.form.invoice.label}</div>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">{Lang.get('companies.labels.name')}</label>
                                    <div className="col-sm-4">
                                        <div className="form-control text-sm">{this.state.form.invoice.meta.company.name}</div>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">{Lang.get('companies.labels.address')}</label>
                                    <div className="col-sm-10">
                                        <div className="form-control text-sm">
                                            {this.state.form.invoice.meta.company.address}
                                        </div>
                                    </div>
                                </div>
                                <div className="card card-outline card-info">
                                    <div className="card-body p-0">
                                        <table className="table table-sm table-striped">
                                            <thead>
                                            <tr>
                                                <th width={100} className="align-middle">{Lang.get('companies.packages.labels.code')}</th>
                                                <th className="align-middle">{Lang.get('companies.invoices.labels.package.name')}</th>
                                                <th width={70} className="align-middle">{Lang.get('companies.invoices.labels.package.qty')}</th>
                                                <th width={120} className="align-middle">{Lang.get('companies.invoices.labels.package.price')}</th>
                                                <th width={100} className="align-middle">{Lang.get('companies.invoices.labels.package.vat')}</th>
                                                <th width={100} className="align-middle">{Lang.get('companies.invoices.labels.package.discount')}</th>
                                                <th width={150} className="align-middle text-right">{Lang.get('companies.invoices.labels.subtotal.item')}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.form.invoice.meta.packages.map((item)=>
                                                <tr key={item.value}>
                                                    <td className="align-middle text-center text-sm">{item.meta.package.code}</td>
                                                    <td className="align-middle text-sm">{item.meta.package.name}</td>
                                                    <td className="align-middle text-sm">{item.meta.prices.qty}</td>
                                                    <td className="align-middle text-sm">
                                                        <span className="float-left">Rp.</span>
                                                        <span className="float-right">{parseFloat(item.meta.prices.price).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US',{maximumFractionDigits:2})}</span>
                                                    </td>
                                                    <td className="align-middle text-sm">{parseFloat(item.meta.prices.vat).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US',{maximumFractionDigits:2})}%</td>
                                                    <td className="align-middle text-sm">
                                                        <span className="float-left">Rp.</span>
                                                        <span className="float-right">{parseFloat(item.meta.prices.discount).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US',{maximumFractionDigits:2})}</span>
                                                    </td>
                                                    <td className="align-middle text-sm">
                                                        <span className="float-left">Rp.</span>
                                                        <span className="float-right">{parseFloat(sumTotalPackageSingle(item)).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US',{maximumFractionDigits:0})}</span>
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                            <tfoot>
                                            <tr>
                                                <th colSpan={6} className="align-middle text-right">{Lang.get('companies.invoices.labels.vat')}</th>
                                                <th className="align-middle">
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">
                                                        {parseFloat(this.state.form.invoice.meta.vat).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID':'en-US',{maximumFractionDigits:0})}
                                                    </span>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th colSpan={6} className="align-middle text-right">{Lang.get('companies.invoices.labels.discount')}</th>
                                                <th className="align-middle">
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">
                                                        {parseFloat(this.state.form.invoice.meta.discount).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID':'en-US',{maximumFractionDigits:0})}
                                                    </span>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th colSpan={6} className="align-middle text-right">{Lang.get('companies.invoices.labels.subtotal.main')}</th>
                                                <th className="align-middle">
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">
                                                        {parseFloat(sumTotalInvoiceSingle(this.state.form.invoice)).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID':'en-US',{maximumFractionDigits:0})}
                                                    </span>
                                                </th>
                                            </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                                <div className="card card-outline card-success mt-5">
                                    <div className="card-header">
                                        <h3 className="card-title">{Lang.get('companies.invoices.payments.labels.menu')}</h3>
                                        <div className="card-tools">
                                            <button onClick={this.handleAddPayment} type="button" className="btn btn-tool" disabled={this.state.loading}><i className="fas fa-plus mr-1"/> {Lang.get('companies.invoices.payments.labels.add')}</button>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <table className="table table-sm table-striped">
                                            <thead>
                                            <tr>
                                                <th className="align-middle text-center" width={30}>
                                                    <i className="fas fa-trash-alt"/>
                                                </th>
                                                <th width={120} className="align-middle">{Lang.get('companies.invoices.payments.labels.code')}</th>
                                                <th width={200} className="align-middle">{Lang.get('companies.invoices.payments.labels.date')}</th>
                                                <th className="align-middle">{Lang.get('companies.invoices.payments.labels.note')}</th>
                                                <th className="align-middle">{Lang.get('companies.invoices.payments.labels.by')}</th>
                                                <th width={150} className="align-middle">{Lang.get('companies.invoices.payments.labels.amount')}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.form.invoice.meta.timestamps.paid.payments.length === 0 ?
                                                <tr><td className="align-middle text-center" colSpan={6}>{Lang.get('messages.no_data')}</td> </tr>
                                                :
                                                this.state.form.invoice.meta.timestamps.paid.payments.map((item,index)=>
                                                    <tr key={index}>
                                                        <td className="align-middle text-center">
                                                            <button onClick={()=>this.handleDeletePayment(index)} type="button" className="btn btn-sm btn-outline-warning" disabled={this.state.loading}>
                                                                <i className="fas fa-trash-alt"/>
                                                            </button>
                                                        </td>
                                                        <td className="align-middle">{item.value === null ? <span className="badge badge-warning">{item.label}</span> : item.label }</td>
                                                        <td>
                                                            <DatePicker showMonthYearDropdown
                                                                        selected={item.meta.timestamps.paid.at} maxDate={new Date()} title={Lang.get('companies.invoices.labels.date_select')}
                                                                        className="form-control text-sm" disabled={this.state.loading || item.value !== null}
                                                                        locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                                                                        onChange={(e)=>this.handleDate(e,index)} dateFormat={localStorage.getItem('locale_date_format').replaceAll('D','d')}/>
                                                        </td>
                                                        <td>
                                                            <input name="note" onChange={this.handleChange} data-index={index} className="form-control text-sm" disabled={this.state.loading || item.value !== null} value={item.meta.note} placeholder={Lang.get('companies.invoices.payments.labels.note')}/>
                                                        </td>
                                                        <td className="align-middle">{item.meta.timestamps.paid.by.name}</td>
                                                        <td>
                                                            <NumericFormat disabled={this.state.loading || item.value !== null} className="form-control text-sm"
                                                                           value={item.meta.amount} placeholder={Lang.get('companies.invoices.payments.labels.amount')}
                                                                           name="price" data-index={index} onChange={this.handleChange} allowLeadingZeros={false} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                            </tbody>
                                            <tfoot>
                                            <tr>
                                                <th className="align-middle text-right" colSpan={5}>{Lang.get('companies.invoices.payments.labels.subtotal')}</th>
                                                <th className="align-middle">
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">{parseFloat(sumTotalPaymentSingle(this.state.form.invoice)).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US',{maximumFractionDigits:2})}</span>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="align-middle text-right" colSpan={5}>{Lang.get('companies.invoices.labels.subtotal.main')}</th>
                                                <th className="align-middle">
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">{parseFloat(sumTotalInvoiceSingle(this.state.form.invoice)).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US',{maximumFractionDigits:2})}</span>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="align-middle text-right" colSpan={5}>{Lang.get('companies.invoices.payments.labels.amount_left')}</th>
                                                <th className="align-middle">
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">{parseFloat(sumTotalInvoiceSingle(this.state.form.invoice) - sumTotalPaymentSingle(this.state.form.invoice)).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-UD',{maximumFractionDigits:2})}</span>
                                                </th>
                                            </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </>
                        }
                    </DialogContent>
                    <DialogActions className="justify-content-between modal-footer">
                        <button type="submit" className="btn btn-success" disabled={this.state.loading}>
                            {this.state.loading ?
                                <FontAwesomeIcon icon="fa-circle-notch" className="fa-spin"/>
                                :
                                <FontAwesomeIcon icon="fas fa-save"/>
                            }
                            <span className="mr-1"/>
                            {Lang.get('companies.invoices.payments.labels.button')}
                        </button>
                        <button type="button" className="btn btn-default" disabled={this.state.loading} onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <i className="fas fa-times mr-1"/> {Lang.get('messages.close')}
                        </button>
                    </DialogActions>
                </form>
            </Dialog>
        )
    }
}
export default FormPayment;
