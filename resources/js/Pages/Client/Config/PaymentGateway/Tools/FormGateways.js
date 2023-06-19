import React from "react";
import {ModalFooter, ModalHeader} from "../../../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import Select from "react-select";
import {FormControlSMReactSelect, LabelRequired, responseMessage} from "../../../../../Components/mixedConsts";
import {FormModule, listModulePaymentGateway} from "./Mixed";
import {crudPaymentGatewayClient} from "../../../../../Services/ConfigService";
import {showError, showSuccess} from "../../../../../Components/Toaster";

// noinspection DuplicatedCode,CommaExpressionJS
class FormGateways extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, company : null, module : null,
                name : '', description : '', production : false,
                keys : null
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        let index;
        if (! nextProps.open) {
            form.id = null, form.company = null, form.module = null,
                form.name = '', form.description = '', form.keys = null;
        } else {
            if (nextProps.data !== null) {
                form.id = nextProps.data.value, form.description = nextProps.data.meta.description,
                    form.production = nextProps.data.meta.production,
                    form.name = nextProps.data.label;
                if (nextProps.data.meta.module !== null) {
                    index = listModulePaymentGateway.findIndex((f) => f.value === nextProps.data.meta.module);
                    if (index >= 0) {
                        form.module = listModulePaymentGateway[index];
                        if (form.module !== null) {
                            if (nextProps.data.meta.keys !== null) {
                                form.keys = nextProps.data.meta.keys;
                            }
                        }
                    }
                }
            }
            if (nextProps.user !== null) {
                if (nextProps.user.meta.company !== null) {
                    form.company = { value : nextProps.user.meta.company.id, label : nextProps.user.meta.company.name };
                }
            }
        }
        this.setState({form});
    }
    handleCheck() {
        let form = this.state.form;
        form.production = ! this.state.form.production;
        this.setState({form});
    }
    handleSelect(event, name) {
        let form = this.state.form;
        form[name] = event;
        if (name === 'module') {
            if (form.module === null) {
                form.keys = null;
            } else {
                switch (form.module.value) {
                    case 'duitku':
                        form.keys = {
                            merchant_code : form.module.meta.merchant_code,
                            api_key : form.module.meta.api_key,
                        };
                        break;
                    case 'briapi':
                        form.keys = {
                            consumer_key : form.module.meta.consumer_key,
                            consumer_secret : form.module.meta.consumer_secret
                        }
                        break;
                }
            }
        }
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        let parent = event.currentTarget.getAttribute('data-parent');
        if (typeof parent === 'undefined' || parent === null) {
            form[event.target.name] = event.target.value;
        } else {
            form[parent][event.target.name] = event.target.value;
        }
        this.setState({form});
    }
    async handleSave(event) {
        event.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            if (this.state.form.id !== null) formData.append(Lang.get('gateways.form_input.id'), this.state.form.id);
            if (this.state.form.company !== null) formData.append(Lang.get('companies.form_input.name'), this.state.form.company.value);
            formData.append(Lang.get('gateways.form_input.name'), this.state.form.name);
            formData.append(Lang.get('gateways.form_input.description'), this.state.form.description);
            formData.append(Lang.get('gateways.form_input.production_mode'), this.state.form.production ? 1 : 0);
            if (this.state.form.module !== null) {
                formData.append(Lang.get('gateways.form_input.module'), this.state.form.module.value);
                formData.append(Lang.get('gateways.form_input.url'), this.state.form.production ? this.state.form.module.meta.urls.production : this.state.form.module.meta.urls.sandbox);
                formData.append(Lang.get('gateways.form_input.website'), this.state.form.module.meta.urls.website);
                switch (this.state.form.module.value) {
                    case 'duitku':
                        formData.append(Lang.get('gateways.form_input.duitku.merchant_code'), this.state.form.keys.merchant_code);
                        formData.append(Lang.get('gateways.form_input.duitku.api_key'), this.state.form.keys.api_key);
                        break;
                    case 'briapi':
                        formData.append(Lang.get('gateways.form_input.briapi.consumer_key'), this.state.form.keys.consumer_key);
                        formData.append(Lang.get('gateways.form_input.briapi.consumer_secret'), this.state.form.keys.consumer_secret);
                        break;
                }
            }
            let response = await crudPaymentGatewayClient(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
                this.props.handleClose();
                this.props.handleUpdate(response.data.params);
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    render() {
        return (
            <Dialog fullWidth maxWidth="sm" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('gateways.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('gateways.labels.menu')})}}/>
                    <DialogContent dividers>
                        {this.props.user !== null &&
                            this.props.user.meta.company === null &&
                                <div className="form-group row">
                                    <label className="col-md-4 col-form-label text-xs">{Lang.get('companies.labels.name')}</label>
                                    <div className="col-md-4">
                                        <Select isLoading={this.props.loadings.companies}
                                                isDisabled={this.state.loading || this.props.loadings.companies}
                                                styles={FormControlSMReactSelect}
                                                placeholder={<small>{Lang.get('labels.select.option',{Attribute:Lang.get('companies.labels.name')})}</small>}
                                                noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('companies.labels.name')})}
                                                options={this.props.companies} value={this.state.form.company} onChange={(e)=>this.handleSelect(e,'company')} className="text-xs"/>
                                    </div>
                                </div>
                        }
                        <div className="form-group row">
                            <label htmlFor="input-name" className="col-form-label col-md-4 text-xs"><LabelRequired/> {Lang.get('gateways.labels.name')}</label>
                            <div className="col-md-4">
                                <input id="input-name" className="form-control-sm form-control text-xs" disabled={this.state.loading} value={this.state.form.name} name="name" onChange={this.handleChange} placeholder={Lang.get('gateways.labels.name')}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="input-description" className="col-form-label col-md-4 text-xs">{Lang.get('gateways.labels.description')}</label>
                            <div className="col-md-8">
                                <textarea id="input-description" style={{resize:'none'}} className="form-control-sm form-control text-xs" disabled={this.state.loading} value={this.state.form.description} name="description" onChange={this.handleChange} placeholder={Lang.get('gateways.labels.description')}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-md-4 col-form-label text-xs"><LabelRequired/>{Lang.get('gateways.module.name')}</label>
                            <div className="col-md-4">
                                <Select options={listModulePaymentGateway} value={this.state.form.module} onChange={(e)=>this.handleSelect(e,'module')}
                                        styles={FormControlSMReactSelect} menuPlacement="top"
                                        isDisabled={this.state.loading} isClearable
                                        placeholder={<small>{Lang.get('labels.select.option',{Attribute:Lang.get('gateways.module.name')})}</small>}
                                        noOptionsMessage={()=>Lang.get('labels.select.no_option',{Attribute:Lang.get('gateways.module.name')})} className="text-xs"/>
                            </div>
                        </div>
                        {this.state.form.module !== null &&
                            <React.Fragment>
                                <div className="form-group row">
                                    <label className="col-md-4 col-form-label text-xs">{Lang.get('gateways.labels.mode.label')}</label>
                                    <div className="col-md-8">
                                        <div className="custom-control custom-radio mr-5" style={{display:'inline-block'}}>
                                            <input onChange={this.handleCheck} checked={this.state.form.production} className="custom-control-input-outline custom-control-input-success custom-control-input" type="radio" name="production-mode" id="production"/>
                                            <label htmlFor="production" className="custom-control-label text-xs">{Lang.get('gateways.labels.mode.production')}</label>
                                        </div>
                                        <div className="custom-control custom-radio" style={{display:'inline-block'}}>
                                            <input onChange={this.handleCheck} checked={! this.state.form.production} className="custom-control-input-outline custom-control-input custom-control-input-danger" type="radio" name="production-mode" id="sandbox"/>
                                            <label htmlFor="sandbox" className="custom-control-label text-xs">{Lang.get('gateways.labels.mode.sandbox')}</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-md-4 col-form-label text-xs">{Lang.get('gateways.labels.url.label')}</label>
                                    <div className="col-md-8">
                                        <div className="form-control-sm form-control text-xs">
                                            {this.state.form.production ? this.state.form.module.meta.urls.production : this.state.form.module.meta.urls.sandbox}
                                        </div>
                                    </div>
                                </div>
                                <FormModule loading={this.state.loading} form={this.state.form} onChange={this.handleChange}/>
                            </React.Fragment>
                        }
                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        loading={this.state.loading || this.props.loadings.nas || this.props.loadings.provinces || this.props.loadings.profiles}
                        langs={{create:Lang.get('labels.create.submit',{Attribute:Lang.get('gateways.labels.name')}),update:Lang.get('labels.update.submit',{Attribute:Lang.get('gateways.labels.name')})}}/>
                </form>
            </Dialog>
        )
    }
}
export default FormGateways;
