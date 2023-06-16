import React from "react";
import {ModalFooter, ModalHeader} from "../../../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import moment from "moment";
import {
    formatLocaleDate, formatLocalePeriode,
    parseInputFloat,
    responseMessage,
    ucFirst
} from "../../../../../Components/mixedConsts";
import {crudCustomerInvoicePayments} from "../../../../../Services/CustomerService";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {FormatPrice} from "../../Tools/Mixed";
import {sumGrandTotalInvoice, sumPaymentInvoiceForm, sumSubtotalInvoice} from "./Mixed";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashCan} from "@fortawesome/free-solid-svg-icons/faTrashCan";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons/faTrashAlt";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons/faPlusCircle";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import id from "date-fns/locale/id";
import en from "date-fns/locale/en-US";
import {NumericFormat} from "react-number-format";
registerLocale("id", id);
registerLocale("en", en);

// noinspection CommaExpressionJS
class FormPayment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, invoice : null,
                payments : { current : [], deleted : [] },
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleAddPayment = this.handleAddPayment.bind(this);
        this.handleRemovePayment = this.handleRemovePayment.bind(this);
        this.handleDate = this.handleDate.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        this.setState({loading:true});
        if (! nextProps.open) {
            form.id = null, form.invoice = null, form.payments.current = [], form.payments.deleted = [];
        } else {
            if (nextProps.data !== null) {
                form.id = nextProps.data.value, form.invoice = nextProps.data,
                    form.payments.current = [], form.payments.deleted = [];
                nextProps.data.meta.timestamps.paid.payments.map((item)=>{
                    form.payments.current.push({
                        value : item.value,
                        note : item.meta.note,
                        amount : item.meta.amount,
                        at : moment(item.meta.timestamps.paid.at).toDate(),
                        by : item.meta.timestamps.created.by === null ? '' : item.meta.timestamps.created.by.name,
                    });
                });
            }
        }
        this.setState({form,loading:false});
    }
    handleDate(event, name, index = null) {
        let form = this.state.form;
        if (index !== null && Number.isInteger(index) && index >= 0) {
            form.payments.current[index].at = event;
        } else {
            form[name] = event;
        }
        this.setState({form});
    }
    handleRemovePayment(event) {
        let form = this.state.form;
        let index = parseInt(event.target.getAttribute('data-index'));
        if (index >= 0 && Number.isInteger(index) && index !== null) {
            if (form.payments.current[index].value !== null) {
                form.payments.deleted.push(form.payments.current[index].value);
            }
            form.payments.current.splice(index, 1);
        }
        this.setState({form});
    }
    handleAddPayment() {
        let form = this.state.form;
        form.payments.current.push({value:null,note:'',amount:0,at:new Date(),by:JSON.parse(localStorage.getItem('user')).label});
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        let index = parseInt(event.target.getAttribute('data-index'));
        if (index >= 0 && index !== null && Number.isInteger(index)) {
            if (event.target.name === 'amount') {
                form.payments.current[index].amount = parseInputFloat(event);
            } else {
                form.payments.current[index][event.target.name] = event.target.value;
            }
        } else {
            form[event.target.name] = event.target.value;
        }
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', 'put');
            if (this.state.invoice !== null) formData.append(Lang.get('invoices.form_input.id'), this.state.form.invoice.value);
            this.state.form.payments.current.map((item,index)=>{
                if (item.value !== null) formData.append(`${Lang.get('invoices.payments.form_input.payment.input')}[${index}][${Lang.get('invoices.payments.form_input.payment.id')}]`, item.value);
                if (item.at !== null) formData.append(`${Lang.get('invoices.payments.form_input.payment.input')}[${index}][${Lang.get('invoices.payments.form_input.payment.date')}]`, moment(item.at).format('yyyy-MM-DD HH:mm:ss'));
                formData.append(`${Lang.get('invoices.payments.form_input.payment.input')}[${index}][${Lang.get('invoices.payments.form_input.payment.note')}]`, item.note);
                formData.append(`${Lang.get('invoices.payments.form_input.payment.input')}[${index}][${Lang.get('invoices.payments.form_input.payment.amount')}]`, item.amount);
            });
            this.state.form.payments.deleted.map((item,index)=>{
                formData.append(`${Lang.get('invoices.payments.form_input.payment.delete')}[${index}]`, item);
            });
            formData.append(Lang.get('invoices.payments.form_input.total.payment'), sumGrandTotalInvoice(this.state.form.invoice) - sumPaymentInvoiceForm(this.state.form));
            let response = await crudCustomerInvoicePayments(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
                this.props.handleClose();
                this.props.handleUpdate(response.data.params);
            }
        } catch (err) {
            this.setState({loading:false});
            responseMessage(err);
        }
    }
    render() {
        return (
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('invoices.payments.form'),update:Lang.get('invoices.payments.form')}}/>
                    <DialogContent dividers>
                        {this.state.form.invoice !== null &&
                            <React.Fragment>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="card card-outline card-primary">
                                            <div className="card-body">
                                                <div className="form-group row">
                                                    <label className="col-md-4 col-form-label text-xs">{Lang.get('invoices.labels.code')}</label>
                                                    <div className="col-md-4">
                                                        <div className="form-control form-control-sm text-xs">#{this.state.form.invoice.label}</div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label className="col-md-4 col-form-label text-xs">{Lang.get('invoices.labels.order_id')}</label>
                                                    <div className="col-md-4">
                                                        <div className="form-control form-control-sm text-xs">{this.state.form.invoice.meta.order_id}</div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label className="col-md-4 col-form-label text-xs">{Lang.get('invoices.labels.bill_period.label')}</label>
                                                    <div className="col-md-4">
                                                        <div className="form-control form-control-sm text-xs">{formatLocalePeriode(this.state.form.invoice.meta.period,'MMMM yyyy')}</div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label className="col-md-4 col-form-label text-xs">{Lang.get('invoices.labels.note')}</label>
                                                    <div className="col-md-8">
                                                        <div className="form-control form-control-sm text-xs">{this.state.form.invoice.meta.note}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        {this.state.form.invoice.meta.customer !== null &&
                                            <div className="card card-outline card-info">
                                                <div className="card-body">
                                                    <div className="form-group row">
                                                        <label className="col-md-3 col-form-label text-xs">{Lang.get('customers.labels.code')}</label>
                                                        <div className="col-md-4">
                                                            <div className="form-control form-control-sm text-xs">
                                                                {this.state.form.invoice.meta.customer.code}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-md-3 col-form-label text-xs">{Lang.get('customers.labels.name')}</label>
                                                        <div className="col-md-9">
                                                            <div className="form-control form-control-sm text-xs">
                                                                {this.state.form.invoice.meta.customer.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-md-3 col-form-label text-xs">{Lang.get('customers.labels.address.tab')}</label>
                                                        <div className="col-md-9">
                                                            <div style={{minHeight:80}} className="form-control form-control-sm text-xs">
                                                                {this.state.form.invoice.meta.customer.address} {this.state.form.invoice.meta.customer.village_obj !== null && ucFirst(this.state.form.invoice.meta.customer.village_obj.name)} {this.state.form.invoice.meta.customer.district_obj !== null && ucFirst(this.state.form.invoice.meta.customer.district_obj.name)} {this.state.form.invoice.meta.customer.city_obj !== null && ucFirst(this.state.form.invoice.meta.customer.city_obj.name)} {this.state.form.invoice.meta.customer.province_obj !== null && ucFirst(this.state.form.invoice.meta.customer.province_obj.name)} {this.state.form.invoice.meta.customer.postal}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="card card-outline card-primary">
                                            <div className="card-header py-1 px-2">
                                                <label className="card-title text-xs text-bold">{Lang.get('profiles.labels.short_name')}</label>
                                            </div>
                                            <div className="card-body p-0 table-responsive">
                                                <table className="table table-sm table-striped">
                                                    <thead>
                                                    <tr>
                                                        <th className="pl-1 align-middle text-xs" width={30}>#</th>
                                                        <th className="align-middle text-xs">{Lang.get('profiles.labels.name')}</th>
                                                        <th className="pr-1 align-middle text-right text-xs" width={120}>{Lang.get('profiles.labels.price')}</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {this.state.form.invoice.meta.services.map((item,index)=>
                                                        <tr key={item.value}>
                                                            <td className="pl-1 align-middle text-xs">{index + 1}.</td>
                                                            <td className="align-middle text-xs">{item.meta.note}</td>
                                                            <td className="align-middle pr-1">{FormatPrice(item.meta.price)}</td>
                                                        </tr>
                                                    )}
                                                    {this.state.form.invoice.meta.taxes.map((item,index)=>
                                                        <tr key={item.value}>
                                                            <td className="align-middle text-xs pl-1">{index + this.state.form.invoice.meta.services.length + 1}.</td>
                                                            <td className="align-middle text-xs">{item.meta.tax.name}</td>
                                                            <td className="align-middle pr-1">{FormatPrice((item.meta.tax.percent * sumSubtotalInvoice(this.state.form.invoice) / 100))}</td>
                                                        </tr>
                                                    )}
                                                    {this.state.form.invoice.meta.discounts.map((item,index)=>
                                                        <tr key={item.value}>
                                                            <td className="align-middle text-xs pl-1">{index + this.state.form.invoice.meta.taxes.length + this.state.form.invoice.meta.services.length + 1}.</td>
                                                            <td className="align-middle text-xs">{item.meta.discount.name}</td>
                                                            <td className="align-middle pr-1">{FormatPrice(0 - item.meta.discount.amount)}</td>
                                                        </tr>
                                                    )}
                                                    </tbody>
                                                    <tfoot>
                                                    <tr>
                                                        <th className="align-middle text-success pl-1 text-right text-sm" colSpan={2}>{Lang.get('invoices.labels.cards.total')}</th>
                                                        <th className="align-middle text-success pr-1 text-sm">{FormatPrice(sumGrandTotalInvoice(this.state.form.invoice))}</th>
                                                    </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="card card-outline card-success">
                                            <div className="card-header py-1 px-2">
                                                <label className="card-title text-xs text-bold">{Lang.get('invoices.payments.name')}</label>
                                                <div className="card-tools">
                                                    {this.state.form.invoice.meta.timestamps.paid.at === null &&
                                                        <button type="button" className="btn btn-tool text-xs" disabled={this.state.loading} onClick={this.handleAddPayment}><FontAwesomeIcon icon={faPlusCircle} size="xs" className="mr-1"/><span className="text-xs">{Lang.get('invoices.payments.add')}</span></button>
                                                    }
                                                </div>
                                            </div>
                                            <div className="card-body p-0 table-responsive">
                                                <table className="table table-sm table-striped">
                                                    <thead>
                                                    <tr>
                                                        <th width={40} className="align-middle pl-1 text-center text-xs"><FontAwesomeIcon icon={faTrashCan}/></th>
                                                        <th width={150} className="align-middle text-xs">{Lang.get('invoices.payments.date.label')}</th>
                                                        <th className="align-middle text-xs">{Lang.get('invoices.payments.note.label')}</th>
                                                        <th width={120} className="align-middle text-xs">{Lang.get('invoices.payments.by')}</th>
                                                        <th width={120} className="align-middle text-right text-xs pr-1">{Lang.get('invoices.payments.amount.label')}</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {this.state.form.payments.current.map((item,index)=>
                                                        <tr key={`pf_${index}`}>
                                                            <td className="align-middle pl-1 text-center text-xs">
                                                                {this.state.form.invoice.meta.timestamps.paid.at === null ?
                                                                    <button type="button" data-index={index} className="btn btn-xs btn-warning btn-block" disabled={this.state.loading} onClick={this.handleRemovePayment}><FontAwesomeIcon icon={faTrashAlt} size="xs"/></button>
                                                                    :
                                                                    <FontAwesomeIcon icon={faTrashAlt} size="xs"/>
                                                                }
                                                            </td>
                                                            <td className="align-middle text-xs">
                                                                {item.value === null ?
                                                                    <DatePicker showTimeInput
                                                                                selected={item.at} maxDate={new Date()}
                                                                                placeholderText={Lang.get('invoices.payments.date.select')}
                                                                                className="form-control form-control-sm text-xs" disabled={this.state.loading}
                                                                                locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                                                                                onChange={(e)=>this.handleDate(e,'at',index)}
                                                                                dateFormat={localStorage.getItem('locale_date_format').replaceAll('D','d')}/>
                                                                    : formatLocaleDate(item.at)
                                                                }
                                                            </td>
                                                            <td className="align-middle">
                                                                {item.value === null ?
                                                                    <input className={item.note.length > 5 ? "form-control-sm form-control text-xs" : "is-invalid form-control-sm form-control text-xs"}
                                                                           value={item.note}
                                                                           onChange={this.handleChange}
                                                                           data-index={index} name="note" disabled={this.state.loading}
                                                                           placeholder={Lang.get('invoices.payments.note.input')}/>
                                                                    :
                                                                    item.note
                                                                }
                                                            </td>
                                                            <td className="align-middle text-xs">{item.by}</td>
                                                            <td className="align-middle pr-1">
                                                                {item.value === null ?
                                                                    <NumericFormat disabled={this.state.loading} className="form-control text-right text-xs form-control-sm"
                                                                                   value={item.amount} placeholder={Lang.get('invoices.payments.amount.input')}
                                                                                   isAllowed={(values)=>{
                                                                                       const {floatValue} = values;
                                                                                       const MAX_LIMIT = sumGrandTotalInvoice(this.state.form.invoice);
                                                                                       return floatValue <= MAX_LIMIT;
                                                                                   }}
                                                                                   name="amount" data-index={index} onChange={this.handleChange}
                                                                                   allowLeadingZeros={false} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                                                                    :
                                                                    FormatPrice(item.amount)
                                                                }
                                                            </td>
                                                        </tr>
                                                    )}
                                                    </tbody>
                                                    <tfoot>
                                                    <tr>
                                                        <th className="align-middle text-right text-xs" colSpan={4}>{Lang.get('invoices.payments.amount.total')}</th>
                                                        <th className="align-middle text-xs pr-1">
                                                            {FormatPrice(sumPaymentInvoiceForm(this.state.form))}
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th className="align-middle text-right text-xs" colSpan={4}>{Lang.get('invoices.payments.amount.left')}</th>
                                                        <th className={sumGrandTotalInvoice(this.state.form.invoice) - sumPaymentInvoiceForm(this.state.form) >= 0 ? "align-middle text-xs pr-1" : "align-middle text-xs pr-1 text-danger" }>
                                                            {FormatPrice(sumGrandTotalInvoice(this.state.form.invoice) - sumPaymentInvoiceForm(this.state.form))}
                                                        </th>
                                                    </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </React.Fragment>
                        }
                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        loading={this.state.loading}
                        hideSubmit={this.state.form.invoice === null ? false : this.state.form.invoice.meta.timestamps.paid.at !== null}
                        langs={{create:Lang.get('invoices.payments.submit'),update:Lang.get('invoices.payments.submit')}}/>
                </form>
            </Dialog>
        )
    }
}
export default FormPayment;
