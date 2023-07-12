import React from "react";
import {parseInputFloat, pipeIp, responseMessage} from "../../../Components/mixedConsts";
import {crudOlt, testConnection} from "../../../Services/OltService";
import {showError, showSuccess} from "../../../Components/Toaster";
import {Dialog, DialogContent} from "@mui/material";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";
import MaskedInput from "react-text-mask";
import {NumericFormat} from "react-number-format";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLink} from "@fortawesome/free-solid-svg-icons";
import HtmlParser from "react-html-parser";

// noinspection CommaExpressionJS
class FormOlt extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, name : '',
                hostname : '', port : 23,
                comRead : '', comWrite : '',
                user : '', pass : '',
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.testConnection = this.testConnection.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        if (! nextProps.open) {
            form.id = null, form.name = '', form.hostname = '',
                form.port = 23, form.comRead = '', form.comWrite = '';
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
            }
        }
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
                                        <label htmlFor="inputPassword" className="col-md-5 col-form-label text-xs">{Lang.get('olt.labels.password')}</label>
                                        <div className="col-md-7">
                                            <input id="inputPassword" value={this.state.form.pass} name="pass" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('olt.labels.password')} className="form-control form-control-sm text-xs"/>
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
