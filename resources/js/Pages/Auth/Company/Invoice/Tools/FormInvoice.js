// noinspection JSCheckFunctionSignatures,CommaExpressionJS,DuplicatedCode

import React from "react";
import moment from "moment";
import {Dialog, DialogActions, DialogContent, DialogTitle, Tooltip} from "@mui/material";
import {crudCompanyInvoice} from "../../../../../Services/CompanyService";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {logout} from "../../../../../Components/Authentication";
import {
    CardPreloader,
    formatLocaleDate,
    formatLocaleString, FormControlSMReactSelect,
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
import {ModalFooter, ModalHeader} from "../../../../../Components/ModalComponent";
import {faPencilAlt, faPencilSquare, faPlus} from "@fortawesome/free-solid-svg-icons";
import FormCompany from "../../Tools/FormCompany";
import FormPackage from "../../Package/Tools/FormPackage";
import {faPlusSquare, faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {FormatPrice} from "../../../../Client/Customer/Tools/Mixed";
import FormTax from "../../../Configs/Tax/Tools/FormTax";
import FormDiscount from "../../../Configs/Discount/Tools/FormDiscount";
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
            },
            modals : {
                company : { open : false, data : null },
                package : { open : false, data : null },
                tax : { open : false, data : null },
                discount : { open : false, data : null },
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
        this.toggleCompany = this.toggleCompany.bind(this);
        this.togglePackage = this.togglePackage.bind(this);
        this.toggleDiscount = this.toggleDiscount.bind(this);
        this.toggleTax = this.toggleTax.bind(this);
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
    toggleCompany(data = null) {
        let modals = this.state.modals;
        modals.company.open = ! this.state.modals.company.open;
        modals.company.data = data;
        this.setState({modals});
    }
    togglePackage(data = null) {
        let modals = this.state.modals;
        modals.package.open = ! this.state.modals.package.open;
        modals.package.data = data;
        this.setState({modals});
    }
    toggleDiscount(data = null) {
        let modals = this.state.modals;
        modals.discount.open = ! this.state.modals.discount.open;
        modals.discount.data = data;
        this.setState({modals});
    }
    toggleTax(data = null) {
        let modals = this.state.modals;
        modals.tax.open = ! this.state.modals.tax.open;
        modals.tax.data = data;
        this.setState({modals});
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
            <React.Fragment>
                <FormDiscount user={this.props.user} loadings={this.props.loadings} open={this.state.modals.discount.open} data={this.state.modals.discount.data} companies={this.props.companies} handleClose={this.toggleDiscount} handleUpdate={this.props.onUpdateDiscounts}/>
                <FormTax user={this.props.user} loadings={this.props.loadings} open={this.state.modals.tax.open} data={this.state.modals.tax.data} companies={this.props.companies} handleClose={this.toggleTax} handleUpdate={this.props.onUpdateTaxes}/>
                <FormPackage privilege={this.props.privilege} loadings={this.props.loadings} user={this.props.user} open={this.state.modals.package.open} data={this.state.modals.package.data} handleClose={this.togglePackage} handleUpdate={this.props.onUpdatePackages}/>
                <FormCompany privilege={this.props.privilege} provinces={[]} loadings={this.props.loadings} user={this.props.user} packages={this.props.packages} discounts={this.props.discounts} taxes={this.props.taxes} open={this.state.modals.company.open} data={this.state.modals.company.data} handleClose={this.toggleCompany} handleUpdate={this.props.onUpdateCompanies}/>

                <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                    <form onSubmit={this.handleSave}>
                        <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('companies.invoices.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('companies.invoices.labels.menu')})}}/>
                        <DialogContent className="modal-body" dividers>
                            <div className="form-group row">
                                <label className="col-md-2 text-xs col-form-label">{Lang.get('companies.invoices.labels.code')}</label>
                                <div className="col-md-4">
                                    <div className="form-control form-control-sm text-xs">
                                        {this.state.form.code === null ? Lang.get('companies.invoices.labels.code_generate') : this.state.form.code}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-md-2 text-xs col-form-label">{Lang.get('companies.invoices.labels.periode')}</label>
                                <div className="col-md-2">
                                    {this.state.form.id === null ?
                                        <DatePicker
                                            selected={this.state.form.periode} maxDate={new Date()} title={Lang.get('companies.invoices.labels.select_periode')}
                                            className="form-control form-control-sm text-xs" disabled={this.state.loading}
                                            locale={localStorage.getItem('locale_lang') === 'id' ? id : en } showMonthYearPicker showFullMonthYearPicker
                                            onChange={this.handleDate} dateFormat="MMMM yyyy"/>
                                        :
                                        <div className="form-control form-control-sm text-xs">{formatLocaleDate(this.state.form.periode)}</div>
                                    }
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-md-2 text-xs col-form-label">{Lang.get('companies.labels.name')}</label>
                                <div className="col-md-4">
                                    {this.state.form.id !== null ?
                                        <div className="form-control form-control-sm text-xs">{this.state.form.company.label}</div>
                                        :
                                        <Select noOptionsMessage={()=><small>{Lang.get('companies.labels.no_select')}</small>}
                                                className="text-xs" styles={FormControlSMReactSelect}
                                                value={this.state.form.company}
                                                onChange={this.handleSelectCompany} placeholder={<small>{Lang.get('companies.labels.select')}</small>} options={this.props.companies.filter((f) => f.meta.timestamps.active.at !== null)} isLoading={this.props.loadings.companies} isDisabled={this.state.loading || this.props.loadings.companies}/>
                                    }
                                </div>
                                {this.state.form.id === null &&
                                    this.props.privilege !== null &&
                                        typeof this.props.privilege.clients !== 'undefined' &&
                                            this.props.privilege.clients !== null &&
                                                <div className="col-md-6">
                                                    {this.props.privilege.clients.create && this.state.form.company === null &&
                                                        <Tooltip title={Lang.get('labels.create.label',{Attribute:Lang.get('companies.labels.menu')})}>
                                                            <button onClick={()=>this.toggleCompany(null)} type="button" disabled={this.state.loading} className="btn btn-sm btn-outline-primary"><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                        </Tooltip>
                                                    }
                                                    {this.props.privilege.clients.update && this.state.form.company !== null &&
                                                        <Tooltip title={Lang.get('labels.update.label',{Attribute:Lang.get('companies.labels.menu')})}>
                                                            <button onClick={()=>this.toggleCompany(this.state.form.company)} type="button" disabled={this.state.loading} className="btn btn-sm btn-outline-primary"><FontAwesomeIcon icon={faPencilAlt} size="sm"/></button>
                                                        </Tooltip>
                                                    }
                                                </div>
                                }
                            </div>
                            <div className="form-group row">
                                <label className="col-md-2 text-xs col-form-label">{Lang.get('companies.labels.address')}</label>
                                <div className="col-md-10">
                                    <div className="form-control form-control-sm text-xs">
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
                                <label className="col-md-2 text-xs col-form-label">{Lang.get('companies.labels.phone')}</label>
                                <div className="col-md-3">
                                    <div className="form-control form-control-sm text-xs">
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
                                    <h3 className="card-title text-sm">{Lang.get('companies.invoices.labels.package.input')}</h3>
                                    <div className="card-tools">
                                        {this.state.form.paid ? null :
                                            <React.Fragment>
                                                {this.state.form.company !== null &&
                                                    this.props.privilege !== null &&
                                                        typeof this.props.privilege.packages !== 'undefined' &&
                                                            this.props.privilege.packages.create &&
                                                                <button type="button" className="btn btn-sm btn-outline-info mr-1 text-xs" disabled={this.state.loading} onClick={()=>this.togglePackage()}><FontAwesomeIcon icon={faPencilAlt} size="sm" className="mr-1"/>{Lang.get('labels.create.label',{Attribute:Lang.get('companies.packages.labels.menu')})}</button>
                                                }
                                                {this.state.form.company !== null &&
                                                    <button onClick={this.handleAddPackage} disabled={this.state.loading || this.state.form.company === null} type="button" className="btn btn-outline-primary btn-sm text-xs"><FontAwesomeIcon icon={faPlus} size="sm" className="mr-1"/> {Lang.get('companies.invoices.labels.package.add')}</button>
                                                }
                                            </React.Fragment>
                                        }
                                    </div>
                                </div>
                                <div className="card-body p-0 table-responsive">
                                    <table className="table table-sm table-striped">
                                        <thead>
                                        <tr>
                                            <th className="align-middle text-center pl-2" width={30}>
                                                <FontAwesomeIcon icon={faTrashAlt} size="sm"/>
                                            </th>
                                            {this.props.privilege !== null &&
                                                typeof this.props.privilege.packages !== 'undefined' &&
                                                    this.props.privilege.packages.update &&
                                                        <th className="align-middle text-center" width={30}>
                                                            <FontAwesomeIcon icon={faPencilAlt} size="sm"/>
                                                        </th>
                                            }
                                            <th className="align-middle text-xs">{Lang.get('companies.invoices.labels.package.name')}</th>
                                            <th className="align-middle text-xs" width={100}>{Lang.get('companies.invoices.labels.package.qty')}</th>
                                            <th className="align-middle text-xs text-right" width={150}>{Lang.get('companies.invoices.labels.package.price')}</th>
                                            <th className="align-middle text-xs text-right pr-2" width={200}>{Lang.get('companies.invoices.labels.subtotal.item')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.form.packages.current.length === 0 ?
                                            <tr><td className="align-middle text-center" colSpan={6}>{Lang.get('messages.no_data')}</td></tr>
                                            :
                                            this.state.form.packages.current.map((item,index)=>
                                                <tr key={index}>
                                                    <td className="align-middle text-center text-xs pl-2">
                                                        {this.state.form.paid ?
                                                            <i className="fas fa-trash-alt"/>
                                                            :
                                                            <button onClick={this.handleRemovePackage} disabled={this.state.loading} data-index={index} type="button" className="btn btn-outline-warning btn-sm"><i className="fas fa-trash-alt"/></button>
                                                        }
                                                    </td>
                                                    {this.props.privilege !== null &&
                                                        typeof this.props.privilege.packages !== 'undefined' &&
                                                            this.props.privilege.packages.update &&
                                                                <td className="align-middle text-center text-xs" width={30}>
                                                                    {this.state.form.paid ?
                                                                        <FontAwesomeIcon icon={faPencilAlt} size="sm"/>
                                                                        : item.package === null ? <FontAwesomeIcon icon={faPencilAlt} size="sm"/>
                                                                            :
                                                                            <Tooltip title={Lang.get('labels.update.label',{Attribute:Lang.get('companies.packages.labels.menu')})}>
                                                                                <button type="button" disabled={this.state.loading} className="btn btn-outline-info btn-sm text-xs" onClick={()=>this.togglePackage(item.package)}><FontAwesomeIcon icon={faPencilAlt} size="sm"/></button>
                                                                            </Tooltip>
                                                                    }
                                                                </td>
                                                    }
                                                    <td className={this.state.form.paid ? 'align-middle text-xs' : 'text-xs'}>
                                                        {this.state.form.paid ?
                                                                item.package.label
                                                                :
                                                                <Select options={this.props.packages} value={item.package}
                                                                        noOptionsMessage={()=>Lang.get('companies.packages.labels.no_select')}
                                                                        styles={FormControlSMReactSelect} menuPlacement="top" maxMenuHeight={150}
                                                                        onChange={(e)=>this.handleSelectPackage(e, index)}
                                                                        className="text-xs" isClearable
                                                                        placeholder={<small>{Lang.get('companies.packages.labels.select')}</small>}
                                                                        isDisabled={this.state.loading || this.props.loadings.packages}/>
                                                        }
                                                    </td>
                                                    <td className="align-middle text-xs text-center">
                                                        {this.state.form.paid ? item.qty :
                                                            <NumericFormat disabled={this.state.loading} className="form-control text-xs form-control-sm text-right"
                                                                           value={item.qty} placeholder={Lang.get('companies.packages.labels.qty')}
                                                                           data-index={index}
                                                                           name="qty" onChange={this.handleChange} allowLeadingZeros={false}
                                                                           decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                                        }
                                                    </td>
                                                    <td className="align-middle text-xs text-right">
                                                        {item.package === null ? '-' :
                                                            FormatPrice(item.price)
                                                        }
                                                    </td>
                                                    <td className="align-middle text-right text-xs pr-2">
                                                        {item.package === null ? '-' :
                                                            FormatPrice(item.qty * item.price)
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
                                                    <th colSpan={this.props.privilege === null ? 4 : typeof this.props.privilege.packages === 'undefined' ? 4 : this.props.privilege.packages.update ? 5 : 4}
                                                        className="align-middle text-right text-xs">{Lang.get('companies.packages.labels.sub_total')}</th>
                                                    <th className="align-middle text-right text-xs pr-2">
                                                        {sumSubtotalFormInvoice(this.state.form) === 0 ? '-' :
                                                            FormatPrice(sumSubtotalFormInvoice(this.state.form))
                                                        }
                                                    </th>
                                                </tr>
                                        }
                                        {this.state.form.company === null ? null :
                                            this.state.form.packages.current.length === 0 ? null :
                                                this.state.form.taxes.current.length === 0 ?
                                                    <tr>
                                                        <th className="align-middle text-right text-xs" colSpan={this.props.privilege === null ? 4 : typeof this.props.privilege.packages === 'undefined' ? 4 : this.props.privilege.packages.update ? 5 : 4}>{Lang.get('companies.invoices.labels.vat')}</th>
                                                        <th className="align-middle text-xs pr-2">
                                                            {this.state.form.paid ? null :
                                                                <React.Fragment>
                                                                    <button onClick={this.handleAddTax} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool btn-sm text-xs"><FontAwesomeIcon icon={faPlus} size="sm" className="mr-1"/> {Lang.get('taxes.create.button')}</button>
                                                                </React.Fragment>
                                                            }
                                                        </th>
                                                    </tr>
                                                    :
                                                    <React.Fragment>
                                                        {this.state.form.taxes.current.map((item,index)=>
                                                            <tr key={`tax_index_${index}`}>
                                                                <th className="align-middle text-xs text-right" colSpan={this.props.privilege === null ? 2 : typeof this.props.privilege.packages === 'undefined' ? 2 : this.props.privilege.packages.update ? 3 : 2}>
                                                                    {Lang.get('companies.invoices.labels.vat')}
                                                                    {this.state.form.paid ? null :
                                                                        <React.Fragment>
                                                                            {this.props.privilege !== null &&
                                                                                    typeof this.props.privilege.taxes !== 'undefined' &&
                                                                                        <React.Fragment>
                                                                                            {this.props.privilege.taxes.create &&
                                                                                                <Tooltip title={Lang.get('labels.create.label',{Attribute:Lang.get('taxes.labels.menu')})}>
                                                                                                    <button type="button" disabled={this.state.loading} className="btn btn-sm btn-outline-primary text-xs mr-1 ml-1" onClick={()=>this.toggleTax()}><FontAwesomeIcon icon={faPlusSquare} size="sm"/></button>
                                                                                                </Tooltip>
                                                                                            }
                                                                                            {item.tax !== null &&
                                                                                                this.props.privilege.taxes.update &&
                                                                                                    <Tooltip title={Lang.get('labels.update.label',{Attribute:Lang.get('taxes.labels.menu')})}>
                                                                                                        <button type="button" disabled={this.state.loading} className="btn btn-outline-info btn-sm text-xs mr-1 ml-1" onClick={()=>this.toggleTax(item.tax)}><FontAwesomeIcon icon={faPencilSquare} size="sm"/></button>
                                                                                                    </Tooltip>
                                                                                            }
                                                                                        </React.Fragment>
                                                                            }
                                                                            <button onClick={this.handleAddTax} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool btn-sm text-xs"><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                                            <button onClick={()=>this.handleRemoveTax(index)} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool btn-sm text-xs"><FontAwesomeIcon icon={faTrashAlt} size="sm"/></button>
                                                                        </React.Fragment>
                                                                    }
                                                                </th>
                                                                <th className="align-middle text-xs text-right">
                                                                    {item.tax === null ? '-' : `${formatLocaleString(item.tax.meta.percent)}%`}
                                                                </th>
                                                                <th className="align-middle">
                                                                    {this.state.form.paid ? item.tax.label :
                                                                        <Select options={this.props.taxes.filter((f) => f.meta.company === null)} isClearable
                                                                                styles={FormControlSMReactSelect} menuPlacement="top" maxMenuHeight={150}
                                                                                value={item.tax} onChange={(e)=>this.handleSelectTax(e,index)}
                                                                                noOptionsMessage={()=>Lang.get('taxes.labels.not_found')}
                                                                                placeholder={<small>{Lang.get('taxes.labels.select')}</small>}
                                                                                className="text-xs"
                                                                                isLoading={this.props.loadings.taxes} isDisabled={this.props.loadings.taxes || this.state.loading}/>
                                                                    }
                                                                </th>
                                                                <th className="align-middle text-right text-xs pr-2">
                                                                    {item.tax === null ? '-' :
                                                                        FormatPrice(sumTaxPriceFormInvoice(this.state.form,index))
                                                                    }
                                                                </th>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <th className="align-middle text-xs text-right" colSpan={this.props.privilege === null ? 4 : typeof this.props.privilege.packages === 'undefined' ? 4 : this.props.privilege.packages.update ? 5 : 4}>{Lang.get('companies.invoices.labels.subtotal.tax')}</th>
                                                            <th className="align-middle text-xs text-right pr-2">
                                                                {sumSubtotalTaxFormInvoice(this.state.form) === 0 ? '-' :
                                                                    FormatPrice(sumSubtotalTaxFormInvoice(this.state.form))
                                                                }
                                                            </th>
                                                        </tr>
                                                    </React.Fragment>
                                        }
                                        {this.state.form.company === null ? null :
                                            this.state.form.packages.current.length === 0 ? null :
                                                this.state.form.discounts.current.length === 0 ?
                                                    <tr>
                                                        <th className="align-middle text-xs text-right" colSpan={this.props.privilege === null ? 4 : typeof this.props.privilege.packages === 'undefined' ? 4 : this.props.privilege.packages.update ? 5 : 4}>
                                                            {Lang.get('companies.invoices.labels.discount')}
                                                        </th>
                                                        <th className="align-middle text-xs pr-2">
                                                            {this.state.form.paid ? null :
                                                                <React.Fragment>
                                                                    <button onClick={this.handleAddDiscount} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool btn-sm text-xs"><FontAwesomeIcon icon={faPlus} size="sm" className="mr-1"/>{Lang.get('discounts.create.button')}</button>
                                                                </React.Fragment>
                                                            }
                                                        </th>
                                                    </tr>
                                                    :
                                                    <>
                                                        {this.state.form.discounts.current.map((item, index)=>
                                                            <tr key={`discount_index_${index}`}>
                                                                <th className="align-middle text-xs text-right" colSpan={this.props.privilege === null ? 3 : typeof this.props.privilege.packages === 'undefined' ? 3 : this.props.privilege.packages.update ? 4 : 3}>
                                                                    {Lang.get('companies.invoices.labels.discount')}
                                                                    {this.state.form.paid ? null :
                                                                        <React.Fragment>
                                                                            {this.props.privilege !== null &&
                                                                                typeof this.props.privilege.discounts !== 'undefined' &&
                                                                                    <React.Fragment>
                                                                                        {this.props.privilege.discounts.create &&
                                                                                            <button type="button" disabled={this.state.loading} className="btn btn-outline-primary btn-sm text-xs ml-1 mr-1" onClick={()=>this.toggleDiscount()}><FontAwesomeIcon icon={faPlusSquare} size="sm"/></button>
                                                                                        }
                                                                                        {this.props.privilege.discounts.update && item.discount !== null &&
                                                                                            <button onClick={()=>this.toggleDiscount(item.discount)} type="button" className="btn btn-outline-info btn-sm text-xs mr-1" disabled={this.state.loading}><FontAwesomeIcon icon={faPencilAlt} size="sm"/></button>
                                                                                        }
                                                                                    </React.Fragment>
                                                                            }
                                                                            <button onClick={this.handleAddDiscount} title={Lang.get('discounts.create.button')} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool btn-sm text-xs"><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                                            <button onClick={()=>this.handleRemoveDiscount(index)} title={Lang.get('discounts.delete.button')} type="button" disabled={this.state.loading || this.state.company === null} className="btn btn-tool"><FontAwesomeIcon icon={faTrashAlt} size="sm"/></button>
                                                                        </React.Fragment>
                                                                    }
                                                                </th>
                                                                <th className="align-middle text-xs">
                                                                    {this.state.form.paid ?
                                                                        item.discount.label :
                                                                        <Select options={this.props.discounts} isClearable
                                                                                styles={FormControlSMReactSelect}
                                                                                value={item.discount} onChange={(e)=>this.handleSelectDiscount(e, index)}
                                                                                noOptionsMessage={()=>Lang.get('discounts.labels.not_found')}
                                                                                placeholder={<small>{Lang.get('discounts.labels.select')}</small>}
                                                                                className="text-xs"
                                                                                isLoading={this.props.loadings.discounts} isDisabled={this.props.loadings.discounts || this.state.loading}/>
                                                                    }
                                                                </th>
                                                                <th className="align-middle text-right text-xs pr-2">
                                                                    {item.discount === null ? '-' :
                                                                        FormatPrice(item.discount.meta.amount)
                                                                    }
                                                                </th>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <th className="align-middle text-right text-xs" colSpan={this.props.privilege === null ? 4 : typeof this.props.privilege.packages === 'undefined' ? 4 : this.props.privilege.packages.update ? 5 : 4}>{Lang.get('discounts.labels.subtotal')}</th>
                                                            <th className="align-middle text-right text-xs pr-2">
                                                                {sumSubtotalDiscountFormInvoice(this.state.form) === 0 ? '-' :
                                                                    FormatPrice(sumSubtotalDiscountFormInvoice(this.state.form))
                                                                }
                                                            </th>
                                                        </tr>
                                                    </>
                                        }
                                        <tr>
                                            <th className="align-middle text-right text-xs" colSpan={this.props.privilege === null ? 4 : typeof this.props.privilege.packages === 'undefined' ? 4 : this.props.privilege.packages.update ? 5 : 4}>{Lang.get('companies.invoices.labels.subtotal.main')}</th>
                                            <th className="align-middle text-right text-xs pr-2">
                                                {sumGrandTotalFormInvoice(this.state.form) === 0 ? '-' :
                                                    FormatPrice(sumGrandTotalFormInvoice(this.state.form))
                                                }
                                            </th>
                                        </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </DialogContent>
                        <ModalFooter
                            form={this.state.form} handleClose={()=>this.props.handleClose()}
                            loading={this.state.loading}
                            langs={{create:Lang.get('labels.create.submit',{Attribute:Lang.get('companies.invoices.labels.menu')}),update:Lang.get('labels.update.submit',{Attribute:Lang.get('companies.invoices.labels.menu')})}}/>
                    </form>
                </Dialog>
            </React.Fragment>
        )
    }
}
export default FormInvoice;
