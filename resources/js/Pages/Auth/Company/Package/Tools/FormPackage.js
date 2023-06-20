// noinspection JSValidateTypes,CommaExpressionJS

import React from "react";
import {
    durationType,
    FormControlSMReactSelect,
    LabelRequired,
    parseInputFloat
} from "../../../../../Components/mixedConsts";
import {crudCompanyPackage} from "../../../../../Services/CompanyService";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {logout} from "../../../../../Components/Authentication";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {NumericFormat} from "react-number-format";
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ModalFooter, ModalHeader} from "../../../../../Components/ModalComponent";
import {listCompanyPackageType} from "./Mixed";

// noinspection DuplicatedCode,JSCheckFunctionSignatures,JSValidateTypes,CommaExpressionJS
class FormPackage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, name : '', description : '', additional : listCompanyPackageType[0],
                prices : { base : 0, vat : 0 },
                duration : { type : durationType[0], amount : 0 },
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
                form.prices.base = 0, form.duration.type = durationType[0], form.duration.amount = 0,
                form.additional = listCompanyPackageType[0],
                form.max.customer = 0, form.max.user = 0, form.max.voucher = 0, form.max.router = 0;
        } else {
            if (props.data !== null) {
                form.id = props.data.value,
                    form.name = props.data.label, form.description = props.data.meta.description,
                    form.prices.base = props.data.meta.prices,
                    form.additional = props.data.meta.additional ? listCompanyPackageType[0] : listCompanyPackageType[1],
                    form.duration.type = durationType[durationType.findIndex((f) => f.value === props.data.meta.duration.string)],
                    form.duration.amount = props.data.meta.duration.amount,
                    form.max.customer = props.data.meta.max.customers, form.max.user = props.data.meta.max.users,
                    form.max.voucher = props.data.meta.max.vouchers, form.max.router = props.data.meta.max.routers;
            }
        }
        this.setState({form});
    }
    handleSelect(event, name) {
        let form = this.state.form;
        if (name === 'additional') {
            form[name] = event;
        } else {
            form.duration[name] = event;
        }
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        if (event.target.getAttribute('name') === 'name' || event.target.getAttribute('name') === 'description') {
            form[event.target.name] = event.target.value;
        } else {
            form[event.target.getAttribute('data-type')][event.target.getAttribute('name')] = parseInputFloat(event);
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
            formData.append(Lang.get('companies.packages.form_input.type'), this.state.form.additional.value ? 1 : 0);
            formData.append(Lang.get('companies.packages.form_input.name'), this.state.form.name);
            formData.append(Lang.get('companies.packages.form_input.description'), this.state.form.description);
            formData.append(Lang.get('companies.packages.form_input.price'), this.state.form.prices.base);
            if (this.state.form.duration.type !== null) formData.append(Lang.get('companies.packages.form_input.duration_type'), this.state.form.duration.type.value);
            formData.append(Lang.get('companies.packages.form_input.duration_amount'), this.state.form.duration.amount);
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
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('companies.packages.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('companies.packages.labels.menu')})}}/>
                    <DialogContent dividers>
                        <div className="form-group row">
                            <label className="col-md-2 col-form-label text-xs"><LabelRequired/> {Lang.get('labels.type',{Attribute:Lang.get('companies.packages.labels.menu')})}</label>
                            <div className="col-md-4">
                                <Select options={listCompanyPackageType} value={this.state.form.additional}
                                        onChange={(e)=>this.handleSelect(e,'additional')}
                                        styles={FormControlSMReactSelect}
                                        noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('labels.type',{Attribute:Lang.get('companies.packages.labels.menu')})})}
                                        placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('labels.type',{Attribute:Lang.get('companies.packages.labels.menu')})})}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-md-2 col-form-label text-xs" htmlFor="inputName"><LabelRequired/>{Lang.get('companies.packages.labels.name')}</label>
                            <div className="col-md-10">
                                <input id="inputName" className="form-control text-xs form-control-sm" value={this.state.form.name} name="name" placeholder={Lang.get('companies.packages.labels.name')} disabled={this.state.loading} onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-md-2 col-form-label text-xs" htmlFor="inputDescription">{Lang.get('companies.packages.labels.description')}</label>
                            <div className="col-md-10">
                                <textarea id="inputDescription" style={{resize:'none'}} className="form-control form-control-sm text-xs" value={this.state.form.description} name="description" placeholder={Lang.get('companies.packages.labels.description')} disabled={this.state.loading} onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-md-2 col-form-label text-xs" htmlFor="inputPrice"><LabelRequired/>{Lang.get('companies.packages.labels.price')}</label>
                            <div className="col-md-2">
                                <NumericFormat disabled={this.state.loading} id="inputPrice" className="form-control form-control-sm text-sm text-right"
                                               name="base" data-type="prices" onChange={this.handleChange} allowLeadingZeros={false} value={this.state.form.prices.base} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                            </div>
                        </div>
                        {! this.state.form.additional.value &&
                            <React.Fragment>
                                <div className="form-group row">
                                    <label className="col-md-2 col-form-label text-xs" htmlFor="inputDurationType">{Lang.get('companies.packages.labels.duration_type')}</label>
                                    <div className="col-md-2">
                                        <Select styles={FormControlSMReactSelect} onChange={(e)=>this.handleSelect(e,'type')} options={durationType} value={this.state.form.duration.type} isDisabled={this.state.loading} placeholder={<small>{Lang.get('companies.packages.labels.duration_type_select')}</small>}/>
                                    </div>
                                    <label className="col-md-2 col-form-label text-xs" htmlFor="inputDuration">{Lang.get('companies.packages.labels.duration_amount')}</label>
                                    <div className="col-md-2">
                                        <NumericFormat disabled={this.state.loading} id="inputDuration" className="form-control text-xs form-control-sm text-right"
                                                       name="amount" data-type="duration" onChange={this.handleChange} allowLeadingZeros={false} value={this.state.form.duration.amount} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-md-2 col-form-label text-xs" htmlFor="inputMaxRouter">{Lang.get('companies.packages.labels.max_router')}</label>
                                    <div className="col-md-2">
                                        <NumericFormat disabled={this.state.loading} id="inputMaxRouter" className="form-control form-control-sm text-xs text-right"
                                                       value={this.state.form.max.router} placeholder={Lang.get('companies.packages.labels.max_router')}
                                                       name="router" data-type="max" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-md-2 col-form-label text-xs" htmlFor="inputMaxUser">{Lang.get('companies.packages.labels.max_user')}</label>
                                    <div className="col-md-2">
                                        <NumericFormat disabled={this.state.loading} id="inputMaxUser" className="form-control text-xs form-control-sm text-right"
                                                       value={this.state.form.max.user} placeholder={Lang.get('companies.packages.labels.max_user')}
                                                       name="user" data-type="max" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-md-2 col-form-label text-xs" htmlFor="inputMaxCustomer">{Lang.get('companies.packages.labels.max_customer')}</label>
                                    <div className="col-md-2">
                                        <NumericFormat disabled={this.state.loading} id="inputMaxCustomer" className="form-control text-xs form-control-sm text-right"
                                                       value={this.state.form.max.customer} placeholder={Lang.get('companies.packages.labels.max_customer')}
                                                       name="customer" data-type="max" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-md-2 col-form-label text-xs" htmlFor="inputMaxVoucher">{Lang.get('companies.packages.labels.max_voucher')}</label>
                                    <div className="col-md-2">
                                        <NumericFormat disabled={this.state.loading} id="inputMaxVoucher" className="form-control text-xs form-control-sm text-right"
                                                       value={this.state.form.max.voucher} placeholder={Lang.get('companies.packages.labels.max_voucher')}
                                                       name="voucher" data-type="max" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        loading={this.state.loading}
                        langs={{create:Lang.get('labels.create.submit',{Attribute:Lang.get('companies.packages.labels.menu')}),update:Lang.get('labels.update.submit',{Attribute:Lang.get('companies.packages.labels.menu')})}}/>
                </form>
            </Dialog>
        )
    }
}
export default FormPackage;
