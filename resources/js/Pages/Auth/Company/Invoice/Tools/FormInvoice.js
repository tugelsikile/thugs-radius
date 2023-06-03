// noinspection JSCheckFunctionSignatures,CommaExpressionJS,DuplicatedCode

import React from "react";
import moment from "moment";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {crudCompanyInvoice} from "../../../../../Services/CompanyService";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {logout} from "../../../../../Components/Authentication";
import {CardPreloader, formatLocaleString, parseInputFloat, ucFirst} from "../../../../../Components/mixedConsts";
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
                discount : 0, vat : 0, code : null, paid : false,
                packages : { current: [], delete: [] },
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleAddPackage = this.handleAddPackage.bind(this);
        this.handleRemovePackage = this.handleRemovePackage.bind(this);
        this.handleSelectCompany = this.handleSelectCompany.bind(this);
        this.handleSelectPackage = this.handleSelectPackage.bind(this);
        this.handleDate = this.handleDate.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        if (! props.open) {
            form.id = null, form.company = null, form.packages.current = [], form.packages.delete = [],
                form.periode = props.periode === null ? new Date() : moment(props.periode).toDate(),
                form.discount = 0, form.vat = 0, form.code = null, form.paid = false;
        } else {
            if (props.data !== null) {
                form.id = props.data.value, form.periode = moment(props.data.meta.periode).toDate(),
                    form.discount = props.data.meta.discount, form.vat = props.data.meta.vat,
                    form.code = props.data.label, form.packages.current = [], form.packages.delete = [],
                    form.paid = props.data.meta.timestamps.paid.at !== null,
                    form.packages.current = [],form.company = null;
                if (props.packages !== null) {
                    if (props.packages.length > 0) {
                        let index = -1;
                        props.data.meta.packages.map((item)=>{
                            index = props.packages.findIndex((f) => f.value === item.meta.package.value);
                            if (index >= 0) {
                                item.meta.package = props.packages[index];
                                form.packages.current.push(item);
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
    handleSelectCompany(event) {
        let form = this.state.form; form.company = event;
        form.packages.current = [];
        form.packages.delete = [];
        if (form.company !== null) {
            form.company.meta.packages.map((item)=>{
                form.packages.current.push({
                    value : null, label : item.package.label,
                    meta : {
                        package : item.package,
                        prices : {
                            price : item.package.meta.prices.base,
                            vat : item.package.meta.prices.percent,
                            qty : 1, discount : 0
                        }
                    }
                });
            })
        }
        this.setState({form});
    }
    handleSelectPackage(event, index) {
        let form = this.state.form;
        form.packages.current[index].meta.package = event;
        if (form.packages.current[index].meta.package !== null) {
            form.packages.current[index].meta.prices.price = form.packages.current[index].meta.package.meta.prices.base;
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
            value : null,
            label : '',
            meta : {
                package : null, prices : {
                    price : 0, vat : 0, qty : 0, discount : 0,
                },
            }
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
        if (['discount','vat'].includes(event.currentTarget.getAttribute('name')) && event.currentTarget.getAttribute('data-index') === null) {
            form[event.currentTarget.getAttribute('name')] = parseInputFloat(event);
        } else if (event.currentTarget.getAttribute('data-index') !== null){
            let index = parseInt(event.currentTarget.getAttribute('data-index'));
            form.packages.current[index].meta.prices[event.currentTarget.name] = parseInputFloat(event);
        }
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            if (this.state.form.id !== null) formData.append('id', this.state.form.id);
            if (this.state.form.company !== null) formData.append(Lang.get('companies.form_input.name'), this.state.form.company.value);
            if (this.state.form.periode !== null) formData.append(Lang.get('companies.invoices.form_input.periode'), moment(this.state.form.periode).format('yyyy-MM-DD'));
            formData.append(Lang.get('companies.invoices.form_input.discount'), this.state.form.discount);
            formData.append(Lang.get('companies.invoices.form_input.vat'), this.state.form.vat);
            if (this.state.form.code !== null) formData.append(Lang.get('companies.invoices.form_input.code'), this.state.form.code);
            this.state.form.packages.current.map((item,index)=>{
                if (item.value !== null) formData.append(`${Lang.get('companies.invoices.form_input.package.input')}[${index}][id]`, item.value);
                if (item.meta.package !== null) formData.append(`${Lang.get('companies.invoices.form_input.package.input')}[${index}][${Lang.get('companies.invoices.form_input.package.name')}]`, item.meta.package.value);
                formData.append(`${Lang.get('companies.invoices.form_input.package.input')}[${index}][${Lang.get('companies.invoices.form_input.package.price')}]`, item.meta.prices.price);
                formData.append(`${Lang.get('companies.invoices.form_input.package.input')}[${index}][${Lang.get('companies.invoices.form_input.package.vat')}]`, item.meta.prices.vat);
                formData.append(`${Lang.get('companies.invoices.form_input.package.input')}[${index}][${Lang.get('companies.invoices.form_input.package.qty')}]`, item.meta.prices.qty);
                formData.append(`${Lang.get('companies.invoices.form_input.package.input')}[${index}][${Lang.get('companies.invoices.form_input.package.discount')}]`, item.meta.prices.discount);
            });
            this.state.form.packages.delete.map((item,index)=>{
                formData.append(`${Lang.get('companies.invoices.form_input.package.input_delete')}[${index}]`, item);
            });

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
                            {this.state.form.id === null ?
                                Lang.get('companies.invoices.create.form')
                                :
                                Lang.get('companies.invoices.update.form')
                            }
                        </span>
                    </DialogTitle>
                    <DialogContent className="modal-body" dividers>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('companies.invoices.labels.periode')}</label>
                            <div className="col-sm-3">
                                <DatePicker showMonthYearPicker
                                    selected={this.state.form.periode} maxDate={new Date()} title={Lang.get('companies.invoices.labels.select_periode')}
                                    className="form-control text-sm" disabled={this.state.loading}
                                    locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                                    onChange={this.handleDate} dateFormat="MMMM yyyy"/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('companies.labels.name')}</label>
                            <div className="col-sm-4">
                                {this.state.form.id !== null ?
                                    <div className="form-control text-sm">{this.state.form.company.label}</div>
                                    :
                                    <Select noOptionsMessage={()=><small>{Lang.get('companies.labels.no_select')}</small>} className="text-sm" onChange={this.handleSelectCompany} placeholder={<small>{Lang.get('companies.labels.select')}</small>} options={this.props.companies.filter((f) => f.meta.timestamps.active.at !== null)} value={this.state.form.company} isLoading={this.props.loadings.companies} isDisabled={this.state.loading || this.props.loadings.companies}/>
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
                                    <button onClick={this.handleAddPackage} disabled={this.state.loading || this.state.form.company === null} type="button" className="btn btn-tool"><i className="fas fa-plus mr-1"/> {Lang.get('companies.invoices.labels.package.add')}</button>
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
                                        <th className="align-middle" width={130}>{Lang.get('companies.invoices.labels.package.price')}</th>
                                        <th className="align-middle" width={100}>{Lang.get('companies.invoices.labels.package.vat')}</th>
                                        <th className="align-middle" width={130}>{Lang.get('companies.invoices.labels.package.discount')}</th>
                                        <th className="align-middle text-right" width={150}>{Lang.get('companies.invoices.labels.subtotal.item')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.state.form.packages.current.length === 0 ?
                                        <tr><td className="align-middle text-center" colSpan={8}>{Lang.get('messages.no_data')}</td></tr>
                                        :
                                        this.state.form.packages.current.map((item,index)=>
                                            <tr key={index}>
                                                <td className="align-middle text-center">
                                                    {this.state.form.paid ?
                                                        <i className="fas fa-trash-alt"/>
                                                        :
                                                        <button data-index={index} type="button" className="btn btn-outline-warning btn-sm" onClick={this.handleRemovePackage}>
                                                            <i className="fas fa-trash-alt"/>
                                                        </button>
                                                    }
                                                </td>
                                                <td className={this.state.form.paid ? 'align-middle' : null}>
                                                    {this.state.form.paid ?
                                                        item.meta.package.label
                                                        :
                                                        <Select onChange={(e)=>this.handleSelectPackage(e, index)} className="text-sm" placeholder={<small>{Lang.get('companies.packages.labels.select')}</small>} isDisabled={this.state.loading || this.props.loadings.packages} options={this.props.packages} value={item.meta.package}/>
                                                    }
                                                </td>
                                                <td className={this.state.form.paid ? 'align-middle' : null}>
                                                    {this.state.form.paid ?
                                                        item.meta.prices.qty
                                                        :
                                                        <NumericFormat disabled={this.state.loading} className="form-control text-sm"
                                                                       value={item.meta.prices.qty} placeholder={Lang.get('companies.invoices.labels.package.qty')}
                                                                       name="qty" data-index={index} data-parent="prices" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                                    }
                                                </td>
                                                <td className={this.state.form.paid ? 'align-middle' : null}>
                                                    {this.state.form.paid ?
                                                        <>
                                                            <span className="float-left">Rp.</span>
                                                            <span className="float-right">
                                                                {parseFloat(item.meta.prices.price).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US',{maximumFractionDigits:2})}
                                                            </span>
                                                        </>
                                                        :
                                                        <NumericFormat disabled={this.state.loading} className="form-control text-sm"
                                                                       value={item.meta.prices.price} placeholder={Lang.get('companies.invoices.labels.package.price')}
                                                                       name="price" data-index={index} data-parent="prices" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                                                    }
                                                </td>
                                                <td className={this.state.form.paid ? 'align-middle text-center' : null}>
                                                    {this.state.form.paid ?
                                                        `${parseFloat(item.meta.prices.vat).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US',{maximumFractionDigits:2})}%`
                                                        :
                                                        <NumericFormat disabled={this.state.loading} className="form-control text-sm"
                                                                       isAllowed={(values)=>{
                                                                           const { floatValue } = values;
                                                                           const MAX_LIMIT = 100;
                                                                           return floatValue <= MAX_LIMIT;
                                                                       }}
                                                                       value={item.meta.prices.vat} placeholder={Lang.get('companies.invoices.labels.package.vat')}
                                                                       name="vat" data-index={index} data-parent="prices" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                                                    }
                                                </td>
                                                <td className={this.state.form.paid ? 'align-middle' : null}>
                                                    {this.state.form.paid ?
                                                        <>
                                                            <span className="float-left">Rp.</span>
                                                            <span className="float-right">
                                                                {parseFloat(item.meta.prices.discount).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US',{maximumFractionDigits:2})}
                                                            </span>
                                                        </>
                                                        :
                                                        <NumericFormat disabled={this.state.loading} className="form-control text-sm"
                                                                       isAllowed={(values)=>{
                                                                           const { floatValue } = values;
                                                                           const MAX_LIMIT = item.meta.prices.price;
                                                                           return floatValue <= MAX_LIMIT;
                                                                       }}
                                                                       value={item.meta.prices.discount} placeholder={Lang.get('companies.invoices.labels.package.price')}
                                                                       name="discount" data-index={index} data-parent="prices" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                                                    }
                                                </td>
                                                <td className="align-middle">
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">
                                                        {parseFloat((((( item.meta.prices.price * item.meta.prices.qty) * item.meta.prices.vat ) / 100 ) + ( item.meta.prices.price * item.meta.prices.qty)) - item.meta.prices.discount).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US',{maximumFractionDigits:2})}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    }
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={6}>{Lang.get('companies.packages.labels.sub_total')}</th>
                                        <th className="align-middle">
                                            <span className="float-left">Rp.</span>
                                            <span className="float-right">
                                                {formatLocaleString(this.state.form.packages.current.reduce((a,b) => a + ( (((b.meta.prices.price * b.meta.prices.qty) * b.meta.prices.vat) / 100 ) + (b.meta.prices.price * b.meta.prices.qty))  - b.meta.prices.discount , 0))}
                                            </span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={6}>{Lang.get('companies.packages.labels.vat')}</th>
                                        <th className="align-middle">
                                            {this.state.form.paid ?
                                                `${formatLocaleString(this.state.form.vat)}%`
                                                :
                                                <NumericFormat disabled={this.state.loading} className="form-control text-sm text-right"
                                                               isAllowed={(values)=>{
                                                                   const { floatValue } = values;
                                                                   const MAX_LIMIT = 100;
                                                                   return floatValue <= MAX_LIMIT;
                                                               }}
                                                               value={this.state.form.vat} placeholder={Lang.get('companies.packages.labels.vat')}
                                                               name="vat" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                                            }
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={6}>{Lang.get('companies.packages.labels.discount')}</th>
                                        <th className="align-middle">
                                            {this.state.form.paid ?
                                                <>
                                                    <span className="float-left">Rp.</span>
                                                    <span className="float-right">
                                                        {formatLocaleString(this.state.form.discount)}
                                                    </span>
                                                </>
                                                :
                                                <NumericFormat disabled={this.state.loading} className="form-control text-sm text-right"
                                                               value={this.state.form.discount} placeholder={Lang.get('companies.packages.labels.discount')}
                                                               name="discount" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                                            }
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={6}>{Lang.get('companies.packages.labels.total')}</th>
                                        <th className="align-middle">
                                            <span className="float-left">Rp.</span>
                                            <span className="float-right">
                                                {
                                                    parseFloat(
                                                    ( ( ( (
                                                        this.state.form.packages.current.reduce((a,b) => a + ( (((b.meta.prices.price * b.meta.prices.qty) * b.meta.prices.vat) / 100 ) + (b.meta.prices.price * b.meta.prices.qty))  - b.meta.prices.discount , 0)
                                                    * this.state.form.vat ) / 100 )
                                                    + (this.state.form.packages.current.reduce((a,b) => a + ( (((b.meta.prices.price * b.meta.prices.qty) * b.meta.prices.vat) / 100 ) + (b.meta.prices.price * b.meta.prices.qty))  - b.meta.prices.discount , 0)) )
                                                    - this.state.form.discount )
                                                    ).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US', {maximumFractionDigits:0})
                                                }
                                            </span>
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
