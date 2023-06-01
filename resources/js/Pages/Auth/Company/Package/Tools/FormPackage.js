// noinspection JSValidateTypes,CommaExpressionJS

import React from "react";
import {durationType} from "../../../../../Components/mixedConsts";
import {crudCompanyPackage} from "../../../../../Services/CompanyService";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {logout} from "../../../../../Components/Authentication";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {NumericFormat} from "react-number-format";
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

// noinspection DuplicatedCode,JSCheckFunctionSignatures,JSValidateTypes,CommaExpressionJS
class FormPackage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, name : '', description : '',
                prices : { base : 0, vat : 0 },
                duration : { type : durationType[0], ammount : 0 },
                max : {
                    customer : 0, user : 0, voucher : 0, router : 0,
                },
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        if (! props.open) {
            form.id = null, form.name = '', form.name = '', form.description = '',
                form.prices.base = 0, form.prices.vat = 0, form.duration.type = durationType[0], form.duration.ammount = 0,
                form.max.customer = 0, form.max.user = 0, form.max.voucher = 0, form.max.router = 0;
        } else {
            if (props.data !== null) {
                form.id = props.data.value,
                    form.name = props.data.label, form.description = props.data.meta.description,
                    form.prices.base = props.data.meta.prices.base, form.prices.vat = props.data.meta.prices.percent,
                    form.duration.type = durationType[durationType.findIndex((f) => f.value === props.data.meta.duration.string)],
                    form.duration.ammount = props.data.meta.duration.ammount,
                    form.max.customer = props.data.meta.max.customers, form.max.user = props.data.meta.max.users,
                    form.max.voucher = props.data.meta.max.vouchers, form.max.router = props.data.meta.max.routers;
            }
        }
        this.setState({form});
    }
    handleSelect(event, name) {
        let form = this.state.form;
        form.duration[name] = event; this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        if (event.target.getAttribute('name') === 'name' || event.target.getAttribute('name') === 'description') {
            form[event.target.name] = event.target.value;
        } else {
            let currentValue = event.currentTarget.value;
            let leftValue;
            let rightValue = 0;
            let decimalValue = currentValue.split(',');
            if (decimalValue.length === 2) {
                leftValue = decimalValue[0];
                if (decimalValue[1].length > 0) {
                    rightValue = decimalValue[1];
                }
            } else {
                leftValue = currentValue;
            }
            leftValue = leftValue.replaceAll('.','');
            leftValue = parseInt(leftValue);
            if (parseFloat(rightValue) > 0) {
                form[event.target.getAttribute('data-type')][event.target.getAttribute('name')] = parseFloat(leftValue + '.' + parseFloat(rightValue));
            } else {
                form[event.target.getAttribute('data-type')][event.target.getAttribute('name')] = parseFloat(leftValue);
            }
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
            formData.append(Lang.get('companies.packages.form_input.name'), this.state.form.name);
            formData.append(Lang.get('companies.packages.form_input.description'), this.state.form.description);
            formData.append(Lang.get('companies.packages.form_input.price'), this.state.form.prices.base);
            formData.append(Lang.get('companies.packages.form_input.vat'), this.state.form.prices.vat);
            if (this.state.form.duration.type !== null) formData.append(Lang.get('companies.packages.form_input.duration_type'), this.state.form.duration.type.value);
            formData.append(Lang.get('companies.packages.form_input.duration_ammount'), this.state.form.duration.ammount);
            formData.append(Lang.get('companies.packages.form_input.max_customer'), this.state.form.max.customer);
            formData.append(Lang.get('companies.packages.form_input.max_user'), this.state.form.max.user);
            formData.append(Lang.get('companies.packages.form_input.max_voucher'), this.state.form.max.voucher);
            formData.append(Lang.get('companies.packages.form_input.max_router'), this.state.form.max.router);
            let response = await crudCompanyPackage(formData);
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
            showError(e.response.data.message);
            if (e.response.status === 401) logout();
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
                                Lang.get('companies.packages.create.form')
                                :
                                Lang.get('companies.packages.update.form')
                            }
                        </span>
                    </DialogTitle>
                    <DialogContent dividers>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputName">{Lang.get('companies.packages.labels.name')}</label>
                            <div className="col-sm-10">
                                <input id="inputName" className="form-control text-sm" value={this.state.form.name} name="name" placeholder={Lang.get('companies.packages.labels.name')} disabled={this.state.loading} onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputDescription">{Lang.get('companies.packages.labels.description')}</label>
                            <div className="col-sm-10">
                                <textarea id="inputDescription" style={{resize:'none'}} className="form-control text-sm" value={this.state.form.description} name="description" placeholder={Lang.get('companies.packages.labels.description')} disabled={this.state.loading} onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputPrice">{Lang.get('companies.packages.labels.price')}</label>
                            <div className="col-sm-2">
                                <NumericFormat disabled={this.state.loading} id="inputPrice" className="form-control text-sm text-right"
                                               name="base" data-type="prices" onChange={this.handleChange} allowLeadingZeros={false} value={this.state.form.prices.base} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                            </div>
                            <label className="col-sm-2 col-form-label" htmlFor="inputVat">{Lang.get('companies.packages.labels.vat')}</label>
                            <div className="col-sm-1">
                                <NumericFormat disabled={this.state.loading} id="inputVat" className="form-control text-sm text-right" isAllowed={(values) => {
                                    const { floatValue } = values;
                                    const MAX_LIMIT = 100;
                                    return floatValue <= MAX_LIMIT;
                                }} name="vat" data-type="prices" onChange={this.handleChange} allowLeadingZeros={false} value={this.state.form.prices.vat} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                            </div>
                            <label className="col-sm-2 col-form-label">{Lang.get('messages.users.labels.date_format.preview')}</label>
                            <div className="col-sm-3">
                                <div className="form-control text-sm text-right">
                                    {parseFloat(((this.state.form.prices.base * this.state.form.prices.vat) / 100) + this.state.form.prices.base).toLocaleString('id-ID',{maximumFractionDigits:2}) }
                                </div>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputDurationType">{Lang.get('companies.packages.labels.duration_type')}</label>
                            <div className="col-sm-2">
                                <Select onChange={(e)=>this.handleSelect(e,'type')} options={durationType} value={this.state.form.duration.type} isDisabled={this.state.loading} placeholder={<small>{Lang.get('companies.packages.labels.duration_type_select')}</small>}/>
                            </div>
                            <label className="col-sm-2 col-form-label" htmlFor="inputDuration">{Lang.get('companies.packages.labels.duration_ammount')}</label>
                            <div className="col-sm-2">
                                <NumericFormat disabled={this.state.loading} id="inputDuration" className="form-control text-sm text-right"
                                               name="ammount" data-type="duration" onChange={this.handleChange} allowLeadingZeros={false} value={this.state.form.duration.ammount} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputMaxRouter">{Lang.get('companies.packages.labels.max_router')}</label>
                            <div className="col-sm-2">
                                <NumericFormat disabled={this.state.loading} id="inputMaxRouter" className="form-control text-sm text-right"
                                               value={this.state.form.max.router} placeholder={Lang.get('companies.packages.labels.max_router')}
                                               name="router" data-type="max" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputMaxUser">{Lang.get('companies.packages.labels.max_user')}</label>
                            <div className="col-sm-2">
                                <NumericFormat disabled={this.state.loading} id="inputMaxUser" className="form-control text-sm text-right"
                                               value={this.state.form.max.user} placeholder={Lang.get('companies.packages.labels.max_user')}
                                               name="user" data-type="max" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputMaxCustomer">{Lang.get('companies.packages.labels.max_customer')}</label>
                            <div className="col-sm-2">
                                <NumericFormat disabled={this.state.loading} id="inputMaxCustomer" className="form-control text-sm text-right"
                                               value={this.state.form.max.customer} placeholder={Lang.get('companies.packages.labels.max_customer')}
                                               name="customer" data-type="max" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputMaxVoucher">{Lang.get('companies.packages.labels.max_voucher')}</label>
                            <div className="col-sm-2">
                                <NumericFormat disabled={this.state.loading} id="inputMaxVoucher" className="form-control text-sm text-right"
                                               value={this.state.form.max.voucher} placeholder={Lang.get('companies.packages.labels.max_voucher')}
                                               name="voucher" data-type="max" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions className="justify-content-between">
                        <button type="submit" className="btn btn-success" disabled={this.state.loading}>
                            {this.state.loading ?
                                <FontAwesomeIcon icon="fa-circle-notch" className="fa-spin"/>
                                :
                                <FontAwesomeIcon icon="fas fa-save"/>
                            }
                            <span className="mr-1"/>
                            {this.state.form.id === null ? Lang.get('companies.packages.create.button') : Lang.get('companies.packages.update.button',null, 'id')}
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
export default FormPackage;
