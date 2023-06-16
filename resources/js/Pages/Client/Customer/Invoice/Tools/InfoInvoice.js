import React from "react";
import moment from "moment";
import {
    formatLocaleDate,
    formatLocalePeriode, formatLocaleString,
    FormControlSMReactSelect, LabelRequired,
    responseMessage,
    ucFirst
} from "../../../../../Components/mixedConsts";
import {crudCustomerInvoices} from "../../../../../Services/CustomerService";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {ModalFooter, ModalHeader} from "../../../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import id from "date-fns/locale/id";
import en from "date-fns/locale/en-US";
import DatePicker,{registerLocale} from "react-datepicker";
registerLocale("id", id);
registerLocale("en", en);
import Select from "react-select";
import {FormatPrice} from "../../Tools/Mixed";
import {
    sumDiscountInvoiceForm, sumGrandTotalInvoice,
    sumGrandTotalInvoiceForm, sumPaymentInvoiceForm,
    sumSingleTaxInvoiceForm,
    sumSubtotalInvoiceForm,
    sumTaxInvoiceForm
} from "./Mixed";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons/faTrashAlt";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons/faPlusCircle";
import {faTrashCan} from "@fortawesome/free-solid-svg-icons/faTrashCan";
import {NumericFormat} from "react-number-format";

// noinspection CommaExpressionJS,DuplicatedCode
class InfoInvoice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, customer : null, bill_period : new Date(),
                note : '', invoice : null,
                payments : { current : [], deleted : [] },
                services : { current : [], deleted : [] },
                taxes : { current : [], deleted : [] },
                discounts : { current : [], deleted : [] },
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleDate = this.handleDate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleAddService = this.handleAddService.bind(this);
        this.handleRemoveService = this.handleRemoveService.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleAddTax = this.handleAddTax.bind(this);
        this.handleRemoveTax = this.handleRemoveTax.bind(this);
        this.handleAddDiscount = this.handleAddDiscount.bind(this);
        this.handleRemoveDiscount = this.handleRemoveDiscount.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        let index,curService = null;
        if (! nextProps.open) {
            form.id = null, form.customer = null, form.bill_period = new Date(),
                form.note = '', form.invoice = null,
                form.services.current = [], form.services.deleted = [],
                form.taxes.current = [], form.taxes.deleted = [],
                form.discounts.current = [], form.discounts.deleted = [],
                form.payments.current = [], form.payments.deleted = [];
        } else {
            if (nextProps.bill_period !== null) {
                form.bill_period = nextProps.bill_period;
            }
            if (nextProps.data !== null) {
                form.id = nextProps.data.value, form.customer = null,
                    form.invoice = nextProps.data,
                    form.note = nextProps.data.meta.note,
                    form.bill_period = moment(nextProps.data.meta.period).toDate(),
                    form.services.current = [], form.services.deleted = [],
                    form.taxes.current = [], form.taxes.deleted = [],
                    form.discounts.current = [], form.discounts.deleted = [];
                if (nextProps.customers !== null) {
                    if (nextProps.customers.length > 0) {
                        index = nextProps.customers.findIndex((f) => f.value === nextProps.data.meta.customer.id);
                        if (index >= 0) {
                            form.customer = nextProps.customers[index];
                        }
                    }
                }
                if (nextProps.profiles !== null) {
                    if (nextProps.profiles.length > 0) {
                        nextProps.data.meta.services.map((item)=>{
                            if (item.meta.service !== null) {
                                index = nextProps.profiles.findIndex((f) => f.value === item.meta.service.id);
                                if (index >= 0) {
                                    curService = nextProps.profiles[index];
                                }
                            }
                            form.services.current.push({
                                value : item.value,
                                price : item.meta.price,
                                note : item.meta.note,
                                service : curService,
                            })
                        });
                    }
                }
                if (nextProps.taxes !== null) {
                    if (nextProps.taxes.length > 0) {
                        nextProps.data.meta.taxes.map((item)=>{
                            if (item.meta.tax !== null) {
                                index = nextProps.taxes.findIndex((f) => f.value === item.meta.tax.id);
                                if (index >= 0) {
                                    form.taxes.current.push({
                                        value : item.value,
                                        tax : nextProps.taxes[index]
                                    })
                                }
                            }
                        });
                    }
                }
                if (nextProps.discounts !== null) {
                    if (nextProps.discounts.length > 0) {
                        nextProps.data.meta.discounts.map((item)=>{
                            if (item.meta.discount !== null) {
                                index = nextProps.discounts.findIndex((f) => f.value === item.meta.discount.id);
                                if (index >= 0) {
                                    form.discounts.current.push({
                                        value : item.value,
                                        discount : nextProps.discounts[index]
                                    })
                                }
                            }
                        });
                    }
                }
                if (nextProps.data.meta.timestamps.paid.payments.length > 0) {
                    form.payments.current = [], form.payments.deleted = [];
                    nextProps.data.meta.timestamps.paid.payments.map((item)=>{
                        form.payments.current.push({
                            value:item,
                            note:item.meta.note,
                            amount:item.meta.amount,
                            at : moment(item.meta.timestamps.paid.at).toDate(),
                            by : item.meta.timestamps.created.by === null ? '' : item.meta.timestamps.created.by.name,
                        })
                    });
                }
            }
        }
        this.setState({form});
    }
    handleAddDiscount() {
        let form = this.state.form;
        form.discounts.current.push({value:null,discount:null});
        this.setState({form});
    }
    handleRemoveDiscount(event) {
        let form = this.state.form;
        let index = parseInt(event.currentTarget.getAttribute('data-index'));
        if (index >= 0 && index !== null && Number.isInteger(index)) {
            if (form.discounts.current[index].value !== null) {
                form.discounts.deleted.push(form.discounts.current[index].value);
            }
            form.discounts.current.splice(index, 1);
        }
        this.setState({form});
    }
    handleAddTax() {
        let form = this.state.form;
        form.taxes.current.push({value:null,tax:null});
        this.setState({form});
    }
    handleRemoveTax(event) {
        let form = this.state.form;
        let index = parseInt(event.currentTarget.getAttribute('data-index'));
        if (index >= 0 && index !== null && Number.isInteger(index)) {
            if (form.taxes.current[index].value !== null) {
                form.taxes.deleted.push(form.taxes.current[index].value);
            }
            form.taxes.current.splice(index,1);
        }
        this.setState({form});
    }
    handleSelect(event, name, parent = null, index = null) {
        let form = this.state.form;
        if (index !== null && parent !== null) {
            form[parent].current[index][name] = event;
            if (name === 'service') {
                form[parent].current[index].price = event.meta.price;
            }
        } else {
            form[name] = event;
        }
        if (name === 'customer') {
            if (this.props.invoices !== null) {
                if (this.props.invoices.length > 0) {
                    if (this.props.invoices.filter((f) => f.meta.customer !== null && f.meta.customer.id === event.value).length < 0) {
                        let otherIndex;
                        if (this.props.services !== null) {
                            if (this.props.services.length > 0) {
                                form.services.current = [], form.services.deleted = [];
                                let otherIndex = this.props.services.findIndex((f) => f.value === event.meta.profile.id);
                                if (otherIndex >= 0) {
                                    form.services.current.push({
                                        value : null,
                                        price : this.props.services[otherIndex].meta.price,
                                        note : this.props.services[otherIndex].label,
                                        service : this.props.services[otherIndex]
                                    });
                                }
                            }
                        }
                        if (this.props.taxes !== null) {
                            if (this.props.taxes.length > 0) {
                                if (event.meta.taxes.length > 0) {
                                    form.taxes.current = [], form.taxes.deleted = [];
                                    event.meta.taxes.map((item)=>{
                                        form.taxes.current.push({
                                            value : null, tax : item.meta.tax
                                        });
                                    });
                                }
                            }
                        }
                        if (this.props.discounts !== null) {
                            if (this.props.discounts.length > 0) {
                                if (event.meta.discounts.length > 0) {
                                    form.discounts.current = [], form.discounts.deleted = [];
                                    event.meta.discounts.map((item)=>{
                                        form.discounts.current.push({value:null,discount:item.meta.discount});
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        this.setState({form});
    }
    handleRemoveService(event) {
        let form = this.state.form;
        let index = parseInt(event.currentTarget.getAttribute('data-index'));
        if (index !== null && Number.isInteger(index) && index >= 0) {
            if (form.services.current[index].value !== null) {
                form.services.deleted.push(form.services.current[index].value);
            }
            form.services.current.splice(index,1);
        }
        this.setState({form});
    }
    handleAddService() {
        let form = this.state.form;
        form.services.current.push({value:null,service:null});
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        let parent = event.target.getAttribute('data-parent');
        let index = parseInt(event.target.getAttribute('data-index'));
        let name = event.target.name;
        if (name === 'note') {
            form[name] = event.target.value;
        } else if (parent !== null && Number.isInteger(index) && index >= 0){
            form[parent].current[index][name] = event.target.value;
        }
        this.setState({form});
    }
    handleDate(event, name) {
        let form = this.state.form;
        form[name] = event;
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            if (this.state.form.id !== null) formData.append(Lang.get('invoices.form_input.id'), this.state.form.id);
            if (this.state.form.bill_period !== null) formData.append(Lang.get('invoices.form_input.bill_period'), moment(this.state.form.bill_period).format('yyyy-MM-DD'));
            if (this.state.form.customer !== null) formData.append(Lang.get('customers.form_input.name'), this.state.form.customer.value);
            formData.append(Lang.get('invoices.form_input.note'), this.state.form.note);
            this.state.form.services.current.map((item,index)=>{
                if (item.value !== null) formData.append(`${Lang.get('invoices.form_input.service.input')}[${index}][${Lang.get('invoices.form_input.service.id')}]`, item.value);
                formData.append(`${Lang.get('invoices.form_input.service.input')}[${index}][${Lang.get('profiles.form_input.name')}]`, item.service === null ? null : item.service.value);
            });
            this.state.form.services.deleted.map((item,index)=>{
                formData.append(`${Lang.get('invoices.form_input.service.delete')}[${index}]`, item);
            });
            this.state.form.taxes.current.map((item,index)=>{
                if (item.value !== null) formData.append(`${Lang.get('invoices.form_input.taxes.input')}[${index}][${Lang.get('invoices.form_input.taxes.id')}]`, item.value);
                formData.append(`${Lang.get('invoices.form_input.taxes.input')}[${index}][${Lang.get('taxes.form_input.name')}]`, item.tax === null ? null : item.tax.value);
            });
            this.state.form.taxes.deleted.map((item,index)=>{
                formData.append(`${Lang.get('invoices.form_input.service.taxes.delete')}[${index}]`, item);
            });
            this.state.form.discounts.current.map((item,index)=>{
                if (item.value !== null) formData.append(`${Lang.get('invoices.form_input.discounts.input')}[${index}][${Lang.get('invoices.form_input.discounts.id')}]`, item.value);
                formData.append(`${Lang.get('invoices.form_input.discounts.input')}[${index}][${Lang.get('discounts.form_input.name')}]`, item.discount === null ? null : item.discount.value);
            });
            this.state.form.discounts.deleted.map((item,index)=>{
                formData.append(`${Lang.get('invoices.form_input.discounts.delete')}[${index}]`, item);
            });
            formData.append(Lang.get('invoices.form_input.total'), sumGrandTotalInvoiceForm(this.state.form));
            let response = await crudCustomerInvoices(formData);
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
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('invoices.info.form'),update:Lang.get('invoices.info.form')}}/>
                    <DialogContent dividers>
                        <div className="row">

                            <div className="col-md-6">
                                <div className="card card-outline card-primary">
                                    <div className="card-body pb-0">
                                        <div className="form-group row">
                                            <label className="col-md-4 col-form-label text-xs">{Lang.get('invoices.labels.code')}</label>
                                            <div className="col-md-4">
                                                <div className="form-control form-control-sm text-xs">{this.props.data === null ? Lang.get('invoices.labels.will_generate') : `#${this.props.data.label}`}</div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-md-4 col-form-label text-xs">{Lang.get('invoices.labels.order_id')}</label>
                                            <div className="col-md-4">
                                                <div className="form-control form-control-sm text-xs">{this.props.data === null ? Lang.get('invoices.labels.will_generate') : this.props.data.meta.order_id}</div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-md-4 col-form-label text-xs">{Lang.get('invoices.labels.bill_period.label')}</label>
                                            <div className="col-md-4">
                                                <div className="form-control form-control-sm text-xs">{formatLocalePeriode(this.state.form.bill_period,'MMMM yyyy')}</div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label htmlFor="input-note" className="col-md-4 col-form-label text-xs">{Lang.get('invoices.labels.note')}</label>
                                            <div className="col-md-8">
                                                <div className="form-control form-control-sm text-xs">{this.state.form.note}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {this.state.form.customer !== null &&
                                <div className="col-md-6">
                                    <div className="card card-outline card-info">
                                        <div className="card-body pb-0">
                                            <div className="form-group row">
                                                <label className="col-md-3 col-form-label text-xs">{Lang.get('customers.labels.name')}</label>
                                                <div className="col-md-9">
                                                    <div className="form-control form-control-sm text-xs">{this.state.form.customer.label}</div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label
                                                    className="col-md-3 col-form-label text-xs">{Lang.get('customers.labels.code')}</label>
                                                <div className="col-md-4">
                                                    <div className="form-control form-control-sm text-xs">
                                                        {this.state.form.customer.meta.code}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label
                                                    className="col-md-3 col-form-label text-xs">{Lang.get('customers.labels.address.tab')}</label>
                                                <div className="col-md-9">
                                                    <div style={{minHeight: 111}}
                                                         className="form-control form-control-sm text-xs">
                                                        {this.state.form.customer.meta.address.street} {this.state.form.customer.meta.address.village !== null && ucFirst(this.state.form.customer.meta.address.village.name)} {this.state.form.customer.meta.address.district !== null && ucFirst(this.state.form.customer.meta.address.district.name)} {this.state.form.customer.meta.address.city !== null && ucFirst(this.state.form.customer.meta.address.city.name)} {this.state.form.customer.meta.address.province !== null && ucFirst(this.state.form.customer.meta.address.province.name)} {this.state.form.customer.meta.address.postal}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }

                        </div>

                        <div className="row">
                            <div className="col-md-5">
                                <div className="card card-outline card-secondary">
                                    <div className="card-header py-1 px-2">
                                        <label className="card-title text-xs text-bold">{Lang.get('taxes.labels.menu')}</label>
                                    </div>
                                    <div className="card-body p-0 mb-0">
                                        <table className="table table-sm table-striped">
                                            <thead>
                                            <tr>
                                                <th className="align-middle pl-1 text-center text-xs" width={30}>#</th>
                                                <th className="align-middle text-xs">{Lang.get('taxes.labels.name')}</th>
                                                <th width={100} className="align-middle text-xs">{Lang.get('taxes.labels.percent')}</th>
                                                <th width={120} className="align-middle pr-1 text-right text-xs">{Lang.get('invoices.labels.taxes.value')}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.form.taxes.current.map((item,index)=>
                                                <tr key={`txF_${index}`}>
                                                    <td className="align-middle text-xs pl-1 text-center">{index + 1}</td>
                                                    <td className="align-middle text-xs">{item.tax.label}</td>
                                                    <td className="align-middle text-xs text-right">{`${formatLocaleString(item.tax.meta.percent, 2)}%`}</td>
                                                    <td className="align-middle text-xs pr-1">
                                                        {FormatPrice(sumSingleTaxInvoiceForm(this.state.form,index))}
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                            <tfoot>
                                            <tr>
                                                <th className="align-middle text-right text-xs" colSpan={3}>{Lang.get('invoices.labels.taxes.total.sub')}</th>
                                                <th className="align-middle text-xs pr-1">{FormatPrice(sumTaxInvoiceForm(this.state.form))}</th>
                                            </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                <div className="card card-outline card-success">
                                    <div className="card-header py-1 px-2">
                                        <label className="card-title text-xs text-bold">{Lang.get('discounts.labels.menu')}</label>
                                    </div>
                                    <div className="card-body p-0 mb-0">
                                        <table className="table table-sm table-striped">
                                            <thead>
                                            <tr>
                                                <th className="align-middle text-center pl-1 text-xs" width={30}>#</th>
                                                <th className="align-middle text-xs">{Lang.get('discounts.labels.name')}</th>
                                                <th width={120} className="align-middle pr-1 text-right text-xs">{Lang.get('discounts.labels.amount')}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.form.discounts.current.map((item,index)=>
                                                <tr key={`dcF_${index}`}>
                                                    <td className="align-middle text-xs pl-1 text-center">{index + 1}</td>
                                                    <td className="align-middle text-xs">{item.discount.label}</td>
                                                    <td className="align-middle text-xs pr-1">
                                                        {FormatPrice(item.discount.meta.amount)}
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                            <tfoot>
                                            <tr>
                                                <th className="align-middle text-right text-xs pl-1" colSpan={2}>{Lang.get('invoices.labels.discounts.total.sub')}</th>
                                                <th className="align-middle text-xs pr-1">{FormatPrice(sumDiscountInvoiceForm(this.state.form))}</th>
                                            </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-7">
                                <div className="card card-outline card-primary">
                                    <div className="card-header py-1 px-2">
                                        <label className="card-title text-xs text-bold">{Lang.get('profiles.labels.short_name')}</label>
                                    </div>
                                    <div className="card-body p-0 mb-0">
                                        <table className="table table-sm table-striped">
                                            <thead>
                                            <tr>
                                                <th className="pl-1 align-middle text-center text-xs" width={30}>#</th>
                                                <th className="align-middle text-xs">{Lang.get('profiles.labels.name')}</th>
                                                <th className="pr-1 align-middle text-right text-xs" width={120}>{Lang.get('profiles.labels.price')}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.form.services.current.map((item,index)=>
                                                <tr key={`svf_${index}`}>
                                                    <td className="pl-1 align-middle text-center text-xs">{index + 1}</td>
                                                    <td className="align-middle text-xs">{item.service.label}</td>
                                                    <td className="align-middle text-xs pr-1">{FormatPrice(item.price)}</td>
                                                </tr>
                                            )}
                                            </tbody>
                                            <tfoot>
                                            <tr>
                                                <th className="align-middle pl-1 text-info text-right text-xs" colSpan={2}>{Lang.get('invoices.labels.service.total.sub')}</th>
                                                <th className="align-middle pr-1 text-info text-xs">{FormatPrice(sumSubtotalInvoiceForm(this.state.form))}</th>
                                            </tr>
                                            {sumTaxInvoiceForm(this.state.form) > 0 &&
                                                <tr>
                                                    <th className="align-middle pl-1 text-warning text-right text-xs" colSpan={2}>{Lang.get('invoices.labels.taxes.total.label')}</th>
                                                    <th className="align-middle pr-1 text-warning text-xs">{FormatPrice(sumTaxInvoiceForm(this.state.form))}</th>
                                                </tr>
                                            }
                                            {sumDiscountInvoiceForm(this.state.form) > 0 &&
                                                <tr>
                                                    <th className="align-middle pl-1 text-primary text-right text-xs" colSpan={2}>{Lang.get('invoices.labels.discounts.total.label')}</th>
                                                    <th className="align-middle pr-1 text-primary text-xs">{FormatPrice(sumDiscountInvoiceForm(this.state.form))}</th>
                                                </tr>
                                            }
                                            <tr>
                                                <th className="align-middle text-success pl-1 text-right text-sm" colSpan={2}>{Lang.get('invoices.labels.cards.total')}</th>
                                                <th className="align-middle text-success pr-1 text-sm">{FormatPrice(sumGrandTotalInvoiceForm(this.state.form))}</th>
                                            </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {this.state.form.invoice !== null &&
                                    <div className="card card-outline card-success">
                                        <div className="card-header py-1 px-2">
                                            <label className="card-title text-xs text-bold">{Lang.get('invoices.payments.name')}</label>
                                        </div>
                                        <div className="card-body p-0 table-responsive">
                                            <table className="table table-sm table-striped">
                                                <thead>
                                                <tr>
                                                    <th width={40} className="align-middle pl-1 text-center text-xs">#</th>
                                                    <th width={150} className="align-middle text-xs">{Lang.get('invoices.payments.date.label')}</th>
                                                    <th className="align-middle text-xs">{Lang.get('invoices.payments.note.label')}</th>
                                                    <th width={120} className="align-middle text-xs">{Lang.get('invoices.payments.by')}</th>
                                                    <th width={120} className="align-middle text-right text-xs pr-1">{Lang.get('invoices.payments.amount.label')}</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {this.state.form.payments.current.map((item,index)=>
                                                    <tr key={`pf_${index}`}>
                                                        <td className="align-middle pl-1 text-center text-xs">{index + 1}</td>
                                                        <td className="align-middle text-xs">{formatLocaleDate(item.at)}</td>
                                                        <td className="align-middle">{item.note}</td>
                                                        <td className="align-middle text-xs">{item.by}</td>
                                                        <td className="align-middle pr-1">{FormatPrice(item.amount)}</td>
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
                                }
                            </div>
                        </div>
                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        loading={this.state.loading}
                        hideSubmit={true}
                        langs={{create:Lang.get('invoices.info.submit'),update:Lang.get('invoices.info.submit')}}/>
                </form>
            </Dialog>
        );
    }
}
export default InfoInvoice;
