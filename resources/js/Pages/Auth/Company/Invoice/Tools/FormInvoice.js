// noinspection JSCheckFunctionSignatures,CommaExpressionJS,DuplicatedCode

import React from "react";
import moment from "moment";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {crudCompanyInvoice} from "../../../../../Services/CompanyService";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {logout} from "../../../../../Components/Authentication";
import {
    CardPreloader,
    formatLocaleDate,
    formatLocaleString,
    parseInputFloat, sumGrandTotalFormInvoice, sumSubtotalDiscountFormInvoice,
    sumSubtotalFormInvoice,
    sumSubtotalTaxFormInvoice,
    sumTaxPriceFormInvoice,
    ucFirst
} from "../../../../../Components/mixedConsts";
import {NumericFormat} from "react-number-format";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import id from "date-fns/locale/id";
import en from "date-fns/locale/en-US";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Select from "react-select";
registerLocale("id", id);
registerLocale("en", en);

class FormInvoice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, company : null, periode : null,
                discounts : {
                    current : [], delete : []
                },
                taxes : {
                    current : [], delete : [],
                },
                packages : {
                    current: [], delete: []
                },
                code : null, paid : false,
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleAddPackage = this.handleAddPackage.bind(this);
        this.handleRemovePackage = this.handleRemovePackage.bind(this);
        this.handleSelectCompany = this.handleSelectCompany.bind(this);
        this.handleSelectPackage = this.handleSelectPackage.bind(this);
        this.handleDate = this.handleDate.bind(this);
        this.handleAddTax = this.handleAddTax.bind(this);
        this.handleRemoveTax = this.handleRemoveTax.bind(this);
        this.handleSelectTax = this.handleSelectTax.bind(this);
        this.handleAddDiscount = this.handleAddDiscount.bind(this);
        this.handleRemoveDiscount = this.handleRemoveDiscount.bind(this);
        this.handleSelectDiscount = this.handleSelectDiscount.bind(this);
        this.handleGenInvoice = this.handleGenInvoice.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        if (! props.open) {
            form.id = null, form.company = null, form.packages.current = [], form.packages.delete = [],
                form.periode = props.periode === null ? new Date() : moment(props.periode).toDate(),
                form.discounts.current = [], form.discounts.delete = [],
                form.taxes.current = [], form.taxes.delete = [],
                form.code = null, form.paid = false;
        } else {
            if (props.data !== null) {
                form.id = props.data.value, form.periode = moment(props.data.meta.periode).toDate(),
                    form.code = props.data.label, form.packages.current = [], form.packages.delete = [],
                    form.paid = props.data.meta.timestamps.paid.at !== null,
                    form.packages.current = [],form.company = null,
                    form.discounts.current = [], form.discounts.delete = [],
                    form.taxes.current = [], form.taxes.delete = [];
                if (props.data.meta.discounts.length > 0) {
                    props.data.meta.discounts.map((item)=>{
                        form.discounts.current.push({
                            value : item.value,
                            discount : {
                                value : item.meta.discount.id,
                                label : item.meta.discount.code,
                                meta : {
                                    label : item.meta.discount.name,
                                    amount : item.meta.discount.amount,
                                }
                            }
                        });
                    });
                }
                if (props.data.meta.taxes.length > 0) {
                    props.data.meta.taxes.map((item)=>{
                        form.taxes.current.push({
                            value : item.value,
                            tax : {
                                value : item.meta.tax.id,
                                label : item.meta.tax.code,
                                meta : {
                                    label : item.meta.tax.name,
                                    percent : item.meta.tax.percent,
                                }
                            }
                        });
                    })
                }
                if (props.packages !== null) {
                    if (props.packages.length > 0) {
                        let index = -1;
                        props.data.meta.packages.map((item)=>{
                            index = props.packages.findIndex((f) => f.value === item.meta.package.value);
                            if (index >= 0) {
                                //item.meta.package = props.packages[index];
                                form.packages.current.push({
                                    value : item.value,
                                    label : props.packages[index].label,
                                    package : props.packages[index],
                                    qty : item.meta.prices.qty,
                                    price : item.meta.prices.price,
                                });
                            }
                        });
                    }
                }
                if (props.companies !== null) {
                    if (props.companies.length > 0) {
                        let index = props.companies.findIndex((f) => f.value === props.data.meta.company.id);
                        if (index >= 0) {
                            form.company = props.companies[index];
                        }
                    }
                }
                if (props.periode !== null) {
                    form.periode = props.periode;
                }
            }
        }
        this.setState({form});
    }
    handleSelectDiscount(event, index) {
        let form = this.state.form;
        form.discounts.current[index].discount = event;
        if (form.discounts.current[index].discount === null) {
            if (form.discounts.current[index].value !== null) {
                form.discounts.delete.push(form.discounts.current[index].value);
            }
            form.discounts.current.splice(index, 1);
        }
        this.setState({form});
    }
    handleRemoveDiscount(index) {
        let form = this.state.form;
        if (form.discounts.current[index].value !== null) {
            form.discounts.delete.push(form.discounts.current[index].value);
        }
        form.discounts.current.splice(index, 1);
        this.setState({form});
    }
    handleAddDiscount() {
        let form = this.state.form;
        form.discounts.current.push({value:null,discount:null});
        this.setState({form});
    }
    handleAddTax() {
        let form = this.state.form;
        form.taxes.current.push({value:null,tax:null});
        this.setState({form});
    }
    handleRemoveTax(index) {
        let form = this.state.form;
        if (form.taxes.current[index].value !== null) {
            form.taxes.delete.push(form.taxes.current[index].value);
        }
        form.taxes.current.splice(index, 1);
        this.setState({form});
    }
    handleSelectTax(event, index) {
        let form = this.state.form;
        form.taxes.current[index].tax = event;
        if (form.taxes.current[index].tax === null) {
            if (form.taxes.current[index].value !== null) {
                form.taxes.delete.push(form.taxes.current[index].value);
            }
            form.taxes.current.splice(index, 1);
        }
        this.setState({form});
    }
    handleSelectCompany(event) {
        let form = this.state.form;
        form.company = event;
        this.setState({form},()=>{
            if (form.company !== null) {
                if (this.props.invoices.length > 0) {
                    if (this.props.invoices.findIndex((f) => f.meta.company.id === form.company.value) < 0) {
                        this.handleGenInvoice();
                    }
                } else {
                    this.handleGenInvoice();
                }
            }
        });
    }
    handleGenInvoice() {
        let form = this.state.form;
        form.packages.current = [];
        form.packages.delete = [];
        form.taxes.current = [];
        form.taxes.delete = [];
        form.discounts.current = [];
        form.discounts.delete = [];
        form.company.meta.packages.map((item)=>{
            form.packages.current.push({
                value : item.value,
                label : item.meta.package === null ? '' : item.meta.package.label,
                package : item.meta.package,
                qty : item.meta.qty,
                price : item.meta.package === null ? 0 : item.meta.package.meta.prices,
            });
        });
        form.company.meta.taxes.map((item)=>{
            item.meta.tax.meta.label = item.meta.tax.label;
            item.meta.tax.label = item.meta.tax.meta.code;
            form.taxes.current.push({value:item.value,tax:item.meta.tax});
        });
        form.company.meta.discounts.map((item)=>{
            item.meta.discount.meta.label = item.meta.discount.label;
            item.meta.discount.label = item.meta.discount.meta.code;
            form.discounts.current.push({value:item.value,discount:item.meta.discount});
        });
        this.setState({form});
    }
    handleSelectPackage(event, index) {
        let form = this.state.form;
        form.packages.current[index].package = event;
        if (form.packages.current[index].package !== null) {
            form.packages.current[index].price = form.packages.current[index].package.meta.prices;
            form.packages.current[index].qty = 1;
        } else {
            if (form.packages.current[index].value !== null) {
                form.packages.delete.push(form.packages.current[index].value);
            }
            form.packages.current.splice(index, 1);
        }
        this.setState({form});
    }
    handleDate(event) {
        let form = this.state.form;
        form.periode = event;
        this.setState({form});
    }
    handleAddPackage() {
        let form = this.state.form;
        form.packages.current.push({
            value : null, label : '', package : null, qty : 0, price : 0,
        });
        this.setState({form});
    }
    handleRemovePackage(event) {
        let form = this.state.form;
        let index = parseInt(event.currentTarget.getAttribute('data-index'));
        if (index >= 0) {
            if (form.packages.current[index].value !== null) {
                form.packages.delete.push(form.packages.current[index].value);
            }
            form.packages.current.splice(index,1);
        }
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        if (event.currentTarget.getAttribute('data-index') !== null){
            let index = parseInt(event.currentTarget.getAttribute('data-index'));
            form.packages.current[index].qty = parseInputFloat(event);
        }
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            if (this.state.form.id !== null) formData.append(Lang.get('companies.invoices.form_input.id'), this.state.form.id);
            if (this.state.form.company !== null) formData.append(Lang.get('companies.form_input.name'), this.state.form.company.value);
            if (this.state.form.periode !== null) formData.append(Lang.get('companies.invoices.form_input.periode'), moment(this.state.form.periode).format('yyyy-MM-DD'));
            if (this.state.form.code !== null) formData.append(Lang.get('companies.invoices.form_input.code'), this.state.form.code);

            this.state.form.packages.current.map((item,index)=>{
                if (item.value !== null) formData.append(`${Lang.get('companies.invoices.form_input.package.input')}[${index}][${Lang.get('companies.invoices.form_input.package.id')}]`, item.value);
                if (item.package !== null) formData.append(`${Lang.get('companies.invoices.form_input.package.input')}[${index}][${Lang.get('companies.invoices.form_input.package.name')}]`, item.package.value);
                formData.append(`${Lang.get('companies.invoices.form_input.package.input')}[${index}][${Lang.get('companies.invoices.form_input.package.price')}]`, item.price);
                formData.append(`${Lang.get('companies.invoices.form_input.package.input')}[${index}][${Lang.get('companies.invoices.form_input.package.qty')}]`, item.qty);
            });
            this.state.form.packages.delete.map((item,index)=>{
                formData.append(`${Lang.get('companies.invoices.form_input.package.input_delete')}[${index}]`, item);
            });
            this.state.form.taxes.current.map((item,index)=>{
                if (item.value !== null) formData.append(`${Lang.get('companies.invoices.form_input.taxes.input')}[${index}][${Lang.get('companies.invoices.form_input.taxes.id')}]`, item.value);
                if (item.tax !== null) formData.append(`${Lang.get('companies.invoices.form_input.taxes.input')}[${index}][${Lang.get('companies.invoices.form_input.taxes.name')}]`, item.tax.value);
            });
            this.state.form.taxes.delete.map((item,index)=>{
                formData.append(`${Lang.get('companies.invoices.form_input.taxes.delete')}[${index}]`, item);
            });
            this.state.form.discounts.current.map((item,index)=>{
                if (item.value !== null) formData.append(`${Lang.get('companies.invoices.form_input.discounts.input')}[${index}][${Lang.get('companies.invoices.form_input.discounts.id')}]`, item.value);
                if (item.discount !== null) formData.append(`${Lang.get('companies.invoices.form_input.discounts.input')}[${index}][${Lang.get('companies.invoices.form_input.discounts.name')}]`, item.discount.value);
            });
            this.state.form.discounts.delete.map((item,index)=>{
                formData.append(`${Lang.get('companies.invoices.form_input.discounts.delete')}[${index}]`, item);
            })
            formData.append(Lang.get('companies.invoices.form_input.grand_total'), sumGrandTotalFormInvoice(this.state.form));

            let response = await crudCompanyInvoice(formData);
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
            console.log(e);
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
                            {this.state.form.id === null ? Lang.get('companies.invoices.create.form') : Lang.get('companies.invoices.update.form')}
                        </span>
                    </DialogTitle>
                    <DialogContent className="modal-body" dividers>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('companies.invoices.labels.code')}</label>
                            <div className="col-sm-4">
                                <div className="form-control text-sm">
                                    {this.state.form.code === null ? Lang.get('companies.invoices.labels.code_generate') : this.state.form.code}
                                </div>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('companies.invoices.labels.periode')}</label>
                            <div className="col-sm-3">
                                {this.state.form.id === null ?
                                    <DatePicker
                                                selected={this.state.form.periode} maxDate={new Date()} title={Lang.get('companies.invoices.labels.select_periode')}
                                                className="form-control text-sm" disabled={this.state.loading}
                                                locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                                                onChange={this.handleDate} dateFormat="dd MMMM yyyy"/>
                                    :
                                    <div className="form-control text-sm">{formatLocaleDate(this.state.form.periode)}</div>
                                }
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('companies.labels.name')}</label>
                            <div className="col-sm-4">
                                {this.state.form.id !== null ?
                                    <div className="form-control text-sm">{this.state.form.company.label}</div>
                                    :
                                    <Select noOptionsMessage={()=><small>{Lang.get('companies.labels.no_select')}</small>}
                                            className="text-sm"
                                            value={this.state.form.company}
                                            onChange={this.handleSelectCompany} placeholder={<small>{Lang.get('companies.labels.select')}</small>} options={this.props.companies.filter((f) => f.meta.timestamps.active.at !== null)} isLoading={this.props.loadings.companies} isDisabled={this.state.loading || this.props.loadings.companies}/>
                                }
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('companies.labels.address')}</label>
                            <div className="col-sm-10">
                                <div className="form-control text-sm">
                                    {this.state.form.company === null ?
                                        <span>&nbsp;</span>
                                        :
                                        <>
                                            {this.state.form.company.meta.address.street},&nbsp;
                                            {this.state.form.company.meta.address.village !== null && ucFirst(this.state.form.company.meta.address.village.name)}&nbsp;
                                            {this.state.form.company.meta.address.district !== null && ucFirst(this.state.form.company.meta.address.district.name)}&nbsp;
                                            {this.state.form.company.meta.address.city !== null && ucFirst(this.state.form.company.meta.address.city.name)}&nbsp;
                                            {this.state.form.company.meta.address.province !== null && ucFirst(this.state.form.company.meta.address.province.name)}&nbsp;
                                            {this.state.form.company.meta.address.postal}
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('companies.labels.phone')}</label>
                            <div className="col-sm-3">
                                <div className="form-control text-sm">
                                    {this.state.form.company === null ?
                                        <span>&nbsp;</span>
                                        :
                                        this.state.form.company.meta.address.phone
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="card card-outline card-info">
                            <div className="card-header">
                                <h3 className="card-title">{Lang.get('companies.invoices.labels.package.input')}</h3>
                                <div className="card-tools">
                                    {this.state.form.paid ? null :
                                        <button onClick={this.handleAddPackage} disabled={this.state.loading || this.state.form.company === null} type="button" className="btn btn-tool"><i className="fas fa-plus mr-1"/> {Lang.get('companies.invoices.labels.package.add')}</button>
                                    }
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <table className="table table-sm table-striped">
                                    <thead>
                                    <tr>
                                        <th className="align-middle text-center" width={30}>
                                            <i className="fas fa-trash-alt"/>
                                        </th>
                                        <th className="align-middle">{Lang.get('companies.invoices.labels.package.name')}</th>
                                        <th className="align-middle" width={100}>{Lang.get('companies.invoices.labels.package.qty')}</th>
                                        <th className="align-middle text-right" width={150}>{Lang.get('companies.invoices.labels.package.price')}</th>
                                        <th className="align-middle text-right" width={200}>{Lang.get('companies.invoices.labels.subtotal.item')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.state.form.packages.current.length === 0 ?
                                        <tr><td className="align-middle text-center" colSpan={5}>{Lang.get('messages.no_data')}</td></tr>
                                        :
                                        this.state.form.packages.current.map((item,index)=>
                                            <tr key={index}>
                                                <td className="align-middle text-center">
                                                    {this.state.form.paid ?
                                                        <i className="fas fa-trash-alt"/>
                                                        :
                                                        <button onClick={this.handleRemovePackage} disabled={this.state.loading} data-index={index} type="button" className="btn btn-outline-warning btn-sm"><i className="fas fa-trash-alt"/></button>
                                                    }
                                                </td>
                                                <td className={this.state.form.paid ? 'align-middle' : null}>
                                                    {this.state.form.paid ?
                                                        item.package.label
                                                        :
                                                        <Select options={this.props.packages} value={item.package}
                                                                noOptionsMessage={()=>Lang.get('companies.packages.labels.no_select')}
                                                                onChange={(e)=>this.handleSelectPackage(e, index)}
                                                                className="text-sm" isClearable
                                                                placeholder={<small>{Lang.get('companies.packages.labels.select')}</small>}
                                                                isDisabled={this.state.loading || this.props.loadings.packages}/>
                                                    }
                                                </td>
                                                <td className="align-middle text-center">
                                                    {this.state.form.paid ? item.qty :
                                                        <NumericFormat disabled={this.state.loading} className="form-control text-sm text-right"
                                                                       value={item.qty} placeholder={Lang.get('companies.packages.labels.qty')}
                                                                       data-index={index}
                                                                       name="qty" onChange={this.handleChange} allowLeadingZeros={false}
                                                                       decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                                    }
                                                </td>
                                                <td className="align-middle text-right">
                                                    {item.package === null ? '-' :
                                                        <>
                                                            <span className="float-left">Rp.</span>
                                                            <span className="float-right">{formatLocaleString(item.price,2)}</span>
                                                        </>
                                                    }
                                                </td>
                                                <td className="align-middle text-right">
                                                    {item.package === null ? '-' :
                                                        <>
                                                            <span className="float-left">Rp.</span>
                                                            <span className="float-right">{formatLocaleString(item.qty * item.price,2)}</span>
                                                        </>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    }
                                    </tbody>
                                    <tfoot>
                                    {this.state.form.company === null ? null :
                                        this.state.form.packages.current.length === 0 ? null :
                                            <tr>
                                                <th className="align-middle text-right" colSpan={4}>{Lang.get('companies.packages.labels.sub_total')}</th>
                                                <th className="align-middle text-right">
                                                    {sumSubtotalFormInvoice(this.state.form) === 0 ? '-' :
                                                        <>
                                                            <span className="float-left">Rp.</span>
                                                            <span className="float-right">{formatLocaleString(sumSubtotalFormInvoice(this.state.form),2)}</span>
                                                        </>
                                                    }
                                                </th>
                                            </tr>
                                    }
                                    {this.state.form.company === null ? null :
                                        this.state.form.packages.current.length === 0 ? null :
                                            this.state.form.taxes.current.length === 0 ?
                                                <tr>
                                                    <th className="align-middle text-right" colSpan={4}>{Lang.get('companies.invoices.labels.vat')}</th>
                                                    <th className="align-middle">
                                                        {this.state.form.paid ? null :
                                                            <button onClick={this.handleAddTax} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool"><i className="fas fa-plus mr-1"/>{Lang.get('taxes.create.button')}</button>
                                                        }
                                                    </th>
                                                </tr>
                                                :
                                                <>
                                                    {this.state.form.taxes.current.map((item,index)=>
                                                        <tr key={`tax_index_${index}`}>
                                                            <th className="align-middle text-right" colSpan={2}>
                                                                {Lang.get('companies.invoices.labels.vat')}
                                                                {this.state.form.paid ? null :
                                                                    <>
                                                                        <button onClick={this.handleAddTax} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool"><i className="fas fa-plus"/></button>
                                                                        <button onClick={()=>this.handleRemoveTax(index)} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool"><i className="fas fa-trash-alt"/></button>
                                                                    </>
                                                                }
                                                            </th>
                                                            <th className="align-middle text-right">
                                                                {item.tax === null ? '-' : `${formatLocaleString(item.tax.meta.percent)}%`}
                                                            </th>
                                                            <th className="align-middle">
                                                                {this.state.form.paid ? item.tax.label :
                                                                    <Select options={this.props.taxes} isClearable
                                                                            value={item.tax} onChange={(e)=>this.handleSelectTax(e,index)}
                                                                            noOptionsMessage={()=>Lang.get('taxes.labels.not_found')}
                                                                            placeholder={<small>{Lang.get('taxes.labels.select')}</small>}
                                                                            className="text-xs"
                                                                            isLoading={this.props.loadings.taxes} isDisabled={this.props.loadings.taxes || this.state.loading}/>
                                                                }
                                                            </th>
                                                            <th className="align-middle text-right">
                                                                {item.tax === null ? '-' :
                                                                    <>
                                                                        <span className="float-left">Rp.</span>
                                                                        <span className="float-right">{formatLocaleString(sumTaxPriceFormInvoice(this.state.form,index),2)}</span>
                                                                    </>
                                                                }
                                                            </th>
                                                        </tr>
                                                    )}
                                                    <tr>
                                                        <th className="align-middle text-right" colSpan={4}>{Lang.get('companies.invoices.labels.subtotal.tax')}</th>
                                                        <th className="align-middle text-right">
                                                            {sumSubtotalTaxFormInvoice(this.state.form) === 0 ? '-' :
                                                                <>
                                                                    <span className="float-left">Rp.</span>
                                                                    <span className="float-right">{formatLocaleString(sumSubtotalTaxFormInvoice(this.state.form),2)}</span>
                                                                </>
                                                            }
                                                        </th>
                                                    </tr>
                                                </>
                                    }
                                    {this.state.form.company === null ? null :
                                        this.state.form.packages.current.length === 0 ? null :
                                            this.state.form.discounts.current.length === 0 ?
                                                <tr>
                                                    <th className="align-middle text-right" colSpan={4}>{Lang.get('companies.invoices.labels.discount')}</th>
                                                    <th className="align-middle">
                                                        {this.state.form.paid ? null :
                                                            <button onClick={this.handleAddDiscount} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool"><i className="fas fa-plus mr-1"/>{Lang.get('discounts.create.button')}</button>
                                                        }
                                                    </th>
                                                </tr>
                                                :
                                                <>
                                                    {this.state.form.discounts.current.map((item, index)=>
                                                        <tr key={`discount_index_${index}`}>
                                                            <th className="align-middle text-right" colSpan={3}>
                                                                {Lang.get('companies.invoices.labels.discount')}
                                                                {this.state.form.paid ? null :
                                                                    <>
                                                                        <button onClick={this.handleAddDiscount} title={Lang.get('discounts.create.button')} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool"><i className="fas fa-plus"/></button>
                                                                        <button onClick={()=>this.handleRemoveDiscount(index)} title={Lang.get('discounts.delete.button')} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool"><i className="fas fa-trash-alt"/></button>
                                                                    </>
                                                                }
                                                            </th>
                                                            <th className="align-middle">
                                                                {this.state.form.paid ?
                                                                    item.discount.label :
                                                                    <Select options={this.props.discounts} isClearable
                                                                            value={item.discount} onChange={(e)=>this.handleSelectDiscount(e, index)}
                                                                            noOptionsMessage={()=>Lang.get('discounts.labels.not_found')}
                                                                            placeholder={<small>{Lang.get('discounts.labels.select')}</small>}
                                                                            className="text-xs"
                                                                            isLoading={this.props.loadings.discounts} isDisabled={this.props.loadings.discounts || this.state.loading}/>
                                                                }
                                                            </th>
                                                            <th className="align-middle text-right">
                                                                {item.discount === null ? '-' :
                                                                    <>
                                                                        <span className="float-left">Rp.</span>
                                                                        <span className="float-right">{formatLocaleString(item.discount.meta.amount)}</span>
                                                                    </>
                                                                }
                                                            </th>
                                                        </tr>
                                                    )}
                                                    <tr>
                                                        <th className="align-middle text-right" colSpan={4}>{Lang.get('discounts.labels.subtotal')}</th>
                                                        <th className="align-middle text-right">
                                                            {sumSubtotalDiscountFormInvoice(this.state.form) === 0 ? '-' :
                                                                <>
                                                                    <span className="float-left">Rp.</span>
                                                                    <span className="float-right">{formatLocaleString(sumSubtotalDiscountFormInvoice(this.state.form),2)}</span>
                                                                </>
                                                            }
                                                        </th>
                                                    </tr>
                                                </>
                                    }
                                    <tr>
                                        <th className="align-middle text-right" colSpan={4}>{Lang.get('companies.invoices.labels.subtotal.main')}</th>
                                        <th className="align-middle text-right">
                                            {sumGrandTotalFormInvoice(this.state.form) === 0 ? '-' :
                                                <>
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">{formatLocaleString(sumGrandTotalFormInvoice(this.state.form),2)}</span>
                                                </>
                                            }
                                        </th>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions className="justify-content-between">
                        {! this.state.form.paid &&
                            <button type="submit" className="btn btn-success" disabled={this.state.loading}>
                                {this.state.loading ?
                                    <FontAwesomeIcon icon="fa-circle-notch" className="fa-spin"/>
                                    :
                                    <FontAwesomeIcon icon="fas fa-save"/>
                                }
                                <span className="mr-1"/>
                                {this.state.form.id === null ? Lang.get('companies.packages.create.button') : Lang.get('companies.packages.update.button',null, 'id')}
                            </button>
                        }
                        <button type="button" className="btn btn-default" disabled={this.state.loading} onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <i className="fas fa-times mr-1"/> {Lang.get('messages.close')}
                        </button>
                    </DialogActions>
                </form>
            </Dialog>
        )
    }
}
export default FormInvoice;
