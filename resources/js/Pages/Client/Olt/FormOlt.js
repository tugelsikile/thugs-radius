import React from "react";
import {FormControlSMReactSelect, parseInputFloat, pipeIp, responseMessage} from "../../../Components/mixedConsts";
import {crudOlt, testConnection} from "../../../Services/OltService";
import {showError, showSuccess} from "../../../Components/Toaster";
import {Dialog, DialogContent} from "@mui/material";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";
import MaskedInput from "react-text-mask";
import {NumericFormat} from "react-number-format";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLink} from "@fortawesome/free-solid-svg-icons";
import HtmlParser from "react-html-parser";
import Select from "react-select";
import {oltBrandLists, oltZteLists} from "./Mixed";

// noinspection CommaExpressionJS
class FormOlt extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, name : '',
                hostname : '', port : 23,
                comRead : '', comWrite : '', brand : oltBrandLists[0], model : oltZteLists[0],
                user : '', pass : '',
                user_prompt : 'Username:', pass_prompt : 'Password:',
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.testConnection = this.testConnection.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        if (! nextProps.open) {
            form.id = null, form.name = '', form.hostname = '',
                form.port = 23, form.comRead = '', form.comWrite = '',
                form.user = '', form.pass = '', form.brand = oltBrandLists[0],
                form.model = form.brand.models[0],
                form.user_prompt = 'Username:', form.pass_prompt = 'Password:';
        } else {
            if (nextProps.data !== null) {
                form.id = nextProps.data.value,
                    form.name = nextProps.data.label,
                    form.hostname = nextProps.data.meta.auth.host,
                    form.port = nextProps.data.meta.auth.port,
                    form.comRead = nextProps.data.meta.communities.read,
                    form.comWrite = nextProps.data.meta.communities.write,
                    form.user = nextProps.data.meta.auth.user,
                    form.pass = nextProps.data.meta.auth.pass;
                if (nextProps.data.meta.brand !== null) {
                    if (typeof nextProps.data.meta.brand.name !== 'undefined') {
                        let index = oltBrandLists.findIndex((f)=> f.value === nextProps.data.meta.brand.name);
                        if (index >= 0) {
                            form.brand = oltBrandLists[index];
                        }
                    }
                    if (form.brand !== null) {
                        if (typeof nextProps.data.meta.brand.model !== 'undefined') {
                            let index = form.brand.models.findIndex((f)=> f.value === nextProps.data.meta.brand.model);
                            if (index >= 0) {
                                form.model = form.brand.models[index];
                            }
                        }
                    }
                }
                if (nextProps.data.meta.auth.prompts !== null) {
                    if (typeof nextProps.data.meta.auth.prompts.user_prompt !== 'undefined') {
                        form.user_prompt = nextProps.data.meta.auth.prompts.user_prompt;
                    }
                    if (typeof nextProps.data.meta.auth.prompts.pass_prompt !== 'undefined') {
                        form.pass_prompt = nextProps.data.meta.auth.prompts.pass_prompt;
                    }
                }
            }
        }
        this.setState({form});
    }
    handleSelect(value ,name) {
        let form = this.state.form;
        form[name] = value;
        this.setState({form});
    }
    handleChange(e) {
        let form = this.state.form;
        if (e.target.name === 'port') {
            form.port = parseInputFloat(e);
        } else {
            form[e.target.name] = e.target.value;
        }
        this.setState({form});
    }
    async testConnection() {
        if (! this.state.loading) {
            this.setState({loading:true});
            try {
                const formData = new FormData();
                formData.append(Lang.get('olt.form_input.port'), this.state.form.port);
                formData.append(Lang.get('olt.form_input.host'), this.state.form.hostname);
                formData.append(Lang.get('olt.form_input.read'), this.state.form.comRead);
                formData.append(Lang.get('olt.form_input.user'), this.state.form.user);
                formData.append(Lang.get('olt.form_input.pass'), this.state.form.pass);
                formData.append(Lang.get('olt.form_input.brand'), this.state.form.brand.value);
                formData.append(Lang.get('olt.form_input.prompts.user'), this.state.form.user_prompt);
                formData.append(Lang.get('olt.form_input.prompts.pass'), this.state.form.pass_prompt);
                let response = await testConnection(formData);
                if (response.data.params === null) {
                    this.setState({loading:false});
                    showError(response.data.message);
                } else {
                    let form = this.state.form;
                    if (form.name !== response.data.params) {
                        form.name = response.data.params;
                    }
                    this.setState({loading:false,form});
                    showSuccess(response.data.message);
                }
            } catch (e) {
                this.setState({loading:false});
                responseMessage(e);
            }
        }
    }
    async handleSave(e) {
        e.preventDefault();
        if (! this.state.loading) {
            this.setState({loading:true});
            try {
                const formData = new FormData();
                formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
                if (this.state.form.id !== null) formData.append(Lang.get('olt.form_input.id'), this.state.form.id);
                formData.append(Lang.get('olt.form_input.name'), this.state.form.name);
                formData.append(Lang.get('olt.form_input.port'), this.state.form.port);
                formData.append(Lang.get('olt.form_input.host'), this.state.form.hostname);
                formData.append(Lang.get('olt.form_input.read'), this.state.form.comRead);
                formData.append(Lang.get('olt.form_input.write'), this.state.form.comWrite);
                formData.append(Lang.get('olt.form_input.user'), this.state.form.user);
                formData.append(Lang.get('olt.form_input.pass'), this.state.form.pass);
                formData.append(Lang.get('olt.form_input.brand'), this.state.form.brand.value);
                formData.append(Lang.get('olt.form_input.model'), this.state.form.model.value);
                formData.append(Lang.get('olt.form_input.prompts.user'), this.state.form.user_prompt);
                formData.append(Lang.get('olt.form_input.prompts.pass'), this.state.form.pass_prompt);
                let response = await crudOlt(formData);
                if (response.data.params === null) {
                    this.setState({loading:false});
                    showError(response.data.message);
                } else {
                    this.setState({loading:false});
                    showSuccess(response.data.message);
                    this.props.onClose();
                    this.props.onUpdate(response.data.params);
                }
            } catch (e) {
                this.setState({loading:false});
                responseMessage(e);
            }
        }
    }
    render() {
        return (
            <React.Fragment>
                <Dialog fullWidth maxWidth="sm" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.onClose()}>
                    <form onSubmit={this.handleSave}>
                        <ModalHeader handleClose={()=>this.props.onClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('olt.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('olt.labels.menu')})}}/>
                        <DialogContent dividers>
                            <div className="row">
                                <div className="col-md-7">
                                    <div className="form-group row">
                                        <label className="col-md-5 col-form-label text-xs">{Lang.get('olt.labels.brand')}</label>
                                        <div className="col-md-7">
                                            <Select styles={FormControlSMReactSelect}
                                                    options={oltBrandLists} isDisabled={this.state.loading}
                                                    value={this.state.form.brand} onChange={(e)=>this.handleSelect(e,'brand')}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-5 col-form-label text-xs">{Lang.get('olt.labels.model')}</label>
                                        <div className="col-md-7">
                                            <Select styles={FormControlSMReactSelect} isDisabled={this.state.loading}
                                                    options={this.state.form.brand === null ? [] : this.state.form.brand.models}
                                                    value={this.state.form.model} onChange={(e)=>this.handleSelect(e,'model')}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label htmlFor="inputName" className="col-md-5 col-form-label text-xs">{Lang.get('olt.labels.name')}</label>
                                        <div className="col-md-7">
                                            <input value={this.state.form.name} name="name" onChange={this.handleChange} disabled={this.state.loading} id="inputName" placeholder={Lang.get('olt.labels.name')} className="form-control-sm form-control text-xs" />
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label htmlFor="inputHostname" className="col-md-5 col-form-label text-xs">{Lang.get('olt.labels.host')}</label>
                                        <div className="col-md-7">
                                            <MaskedInput name="hostname" guide={false} placeholderChar={'\u2000'}
                                                         onChange={this.handleChange} id="inputHostname" value={this.state.form.hostname}
                                                         pipe={pipeIp}
                                                         disabled={this.state.loading} mask={value => Array(value.length).fill(/[\d.]/)}
                                                         placeholder={Lang.get('olt.labels.host')}
                                                         className="form-control form-control-sm text-xs"/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-5 col-form-label text-xs">{Lang.get('olt.labels.port')}</label>
                                        <div className="col-md-4">
                                            <NumericFormat disabled={this.state.loading}
                                                           name="port" onChange={this.handleChange} value={this.state.form.port}
                                                           className="form-control form-control-sm text-xs"
                                                           allowLeadingZeros={false} placeholder={Lang.get('olt.labels.port')}
                                                           decimalScale={0} decimalSeparator="," thousandSeparator=""/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label htmlFor="inputUser" className="col-md-5 col-form-label text-xs">{Lang.get('olt.labels.username')}</label>
                                        <div className="col-md-7">
                                            <input id="inputUser" value={this.state.form.user} name="user" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('olt.labels.username')} className="form-control form-control-sm text-xs"/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label htmlFor="inputUserPrompt" className="col-md-5 col-form-label text-xs">{Lang.get('olt.labels.prompts.user')}</label>
                                        <div className="col-md-7">
                                            <input id="inputUserPrompt" value={this.state.form.user_prompt} name="user_prompt" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('olt.labels.prompts.user')} className="form-control form-control-sm text-xs"/>
                                            <small>{HtmlParser(Lang.get('olt.labels.prompts.info'))}</small>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label htmlFor="inputPassword" className="col-md-5 col-form-label text-xs">{Lang.get('olt.labels.password')}</label>
                                        <div className="col-md-7">
                                            <input id="inputPassword" value={this.state.form.pass} name="pass" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('olt.labels.password')} className="form-control form-control-sm text-xs"/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label htmlFor="inputPassPrompt" className="col-md-5 col-form-label text-xs">{Lang.get('olt.labels.prompts.pass')}</label>
                                        <div className="col-md-7">
                                            <input id="inputPassPrompt" value={this.state.form.pass_prompt} name="pass_prompt" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('olt.labels.prompts.pass')} className="form-control form-control-sm text-xs"/>
                                            <small>{HtmlParser(Lang.get('olt.labels.prompts.info'))}</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-5">
                                    <div className="card card-outline card-info">
                                        <div className="card-body">
                                            {HtmlParser(Lang.get('olt.labels.form_info'))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                        <ModalFooter
                            buttons={[
                                <button disabled={this.state.loading || this.state.form.hostname.length < 8 || this.state.form.user.length === 0 || this.state.form.pass.length === 0 || this.state.form.port.length === 0 } type="button" className="btn btn-outline-primary" onClick={this.testConnection}><FontAwesomeIcon icon={faLink}/> {Lang.get('labels.connection.submit')}</button>
                            ]}
                            form={this.state.form} handleClose={()=>this.props.onClose()}
                            loading={this.state.loading}
                            pendings={{create:Lang.get('labels.create.pending',{Attribute:Lang.get('olt.labels.menu')}),update:Lang.get('labels.update.pending',{Attribute:Lang.get('olt.labels.menu')})}}
                            langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('olt.labels.menu')}),update:Lang.get('labels.update.label',{Attribute:Lang.get('olt.labels.menu')})}}/>
                    </form>
                </Dialog>
            </React.Fragment>
        );
    }
}
export default FormOlt;
