import React from "react";
import {parseInputFloat, responseMessage, routerConnectionType} from "../../../../Components/mixedConsts";
import {crudNas, decryptEncryptPass, testNasConnection} from "../../../../Services/NasService";
import {showError, showSuccess} from "../../../../Components/Toaster";
import {Dialog, DialogContent} from "@mui/material";
import Select from "react-select";
import {InputText} from "../../../../Components/CustomInput";
import {ModalFooter, ModalHeader} from "../../../../Components/ModalComponent";

// noinspection JSCheckFunctionSignatures,CommaExpressionJS,JSUnresolvedVariable,DuplicatedCode,JSValidateTypes
class FormNas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, company : null, name : '', description : '',
                ip : '0.0.0.0', port : 8728, type : routerConnectionType[0],
                url : '',
                pass : {
                    user : { value : '', type : 'password' },
                    current : { value : '', type : 'password' },
                    confirm : { value : '', type : 'password' },
                },
                next : true,
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleIp = this.handleIp.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleInputType = this.handleInputType.bind(this);
        this.testConnection = this.testConnection.bind(this);
        this.checkNext = this.checkNext.bind(this);
    }
    componentWillReceiveProps(props) {
        this.setState({loading:true});
        let form = this.state.form;
        if (!props.open) {
            form.id = null, form.company = null, form.name = '', form.description = '',
                form.ip = '', form.port = 8728, form.type = routerConnectionType[1],
                form.pass.user.value = '', form.pass.user.type = 'password',
                form.url = '', form.next = true,
                form.pass.current.value = '', form.pass.current.type = 'password',
                form.pass.confirm.value = '', form.pass.confirm.type = 'password';
        } else {
            if (props.user !== null) {
                if (props.user.meta.company !== null) {
                    form.company = {
                        value : props.user.meta.company.id,
                        label : props.user.meta.company.name,
                        max : props.user.meta.company.package_obj === null ? 1 : props.user.meta.company.package_obj.max_routerboards,
                    };
                }
            }
            if (props.data !== null) {
                form.id = props.data.value, form.name = props.data.label, form.description = props.data.meta.description,
                    form.company = null, form.type = null, form.next = true,
                    form.ip = props.data.meta.auth.host, form.port = props.data.meta.auth.port,
                    form.pass.user.value = '', form.pass.user.type = 'password',
                    form.pass.current.value = '', form.pass.current.type = 'password',
                    form.pass.confirm.value = '', form.pass.confirm.type = 'password',
                    form.url = props.data.meta.url;
                let index = routerConnectionType.findIndex((f) => f.value === props.data.meta.auth.method);
                if (index >= 0) form.type = routerConnectionType[index];
                if (props.data.meta.company !== null) {
                    form.company = {
                        value : props.data.meta.company.id,
                        label : props.data.meta.company.name,
                        max : props.data.meta.company.package_obj === null ? 1 : props.data.meta.company.package_obj.max_routerboards,
                    };
                }
            }

        }
        this.setState({form,loading:false},()=>this.tryDecrypt());
    }
    handleInputType(event) {
        let form = this.state.form;
        form.pass[event.currentTarget.name].type = form.pass[event.currentTarget.name].type === 'password' ? 'text' : 'password';
        this.setState({form});
    }
    handleSelect(event, name) {
        let form = this.state.form;
        form[name] = event;
        if (form.type !== null) {
            form.port = form.type.value === 'api' ? 8728 : 443;
        }
        this.setState({form});
    }
    handleIp(event) {
        let form = this.state.form;
        form.ip = event.currentTarget.value;
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        if (['user','current','confirm'].indexOf(event.currentTarget.name) !== -1) {
            form.pass[event.currentTarget.name].value = event.currentTarget.value;
        } else if (['port'].indexOf(event.currentTarget.name) !== -1) {
            form[event.currentTarget.name] = parseInputFloat(event);
        } else {
            form[event.currentTarget.name] = event.currentTarget.value;
        }
        this.setState({form});
    }
    tryDecrypt() {
        if (this.props.open) {
            if (this.props.data !== null) {
                this.decryptPass('user',this.props.data.meta.auth.user)
                    .then(()=>this.decryptPass('current',this.props.data.meta.auth.pass));
            }
        }
    }
    checkNext() {
        let response = true;
        if (this.state.form.id === null) {
            if (this.props.user !== null) {
                if (this.props.user.meta.company !== null) {
                    if (this.props.user.meta.company.package_obj !== null) {
                        if (this.props.user.meta.company.package_obj.max_routerboards > 0) {
                            if (this.props.nasCounter !== null) {
                                if (this.props.nasCounter >= this.props.user.meta.company.package_obj.max_routerboards) {
                                    response = false;
                                }
                            }
                        }
                    }
                }
            }
        }
        return response;
    }
    async decryptPass(name, value) {
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('action','decrypt');
            formData.append('value', value);
            let response = await decryptEncryptPass(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                let form = this.state.form;
                form.pass[name].value = response.data.params;
                if (name === 'current') {
                    form.pass.confirm.value = response.data.params;
                }
                this.setState({form});
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    async testConnection() {
        this.setState({loading:true});
        try {
            const formData = new FormData();
            if (this.state.form.type !== null) {
                formData.append(Lang.get('nas.form_input.method'), this.state.form.type.value);
                if (this.state.form.type.value === 'api') {
                    formData.append(Lang.get('nas.form_input.ip'), this.state.form.ip);
                } else {
                    formData.append(Lang.get('nas.form_input.domain'), this.state.form.ip);
                }
            }
            formData.append(Lang.get('nas.form_input.port'), this.state.form.port);
            formData.append(Lang.get('nas.form_input.user'), this.state.form.pass.user.value);
            formData.append(Lang.get('nas.form_input.pass'), this.state.form.pass.current.value);
            formData.append(Lang.get('nas.form_input.pass_confirm'), this.state.form.pass.confirm.value);
            let response = await testNasConnection(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    async handleSave(e) {
        e.preventDefault();
        if (! this.checkNext()) {
            showError(Lang.get('nas.create.limited'));
        } else {
            this.setState({loading:true});
            try {
                const formData = new FormData();
                formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
                if (this.state.form.id !== null) formData.append(Lang.get('nas.form_input.id'), this.state.form.id);
                if (this.state.form.company !== null) formData.append(Lang.get('companies.form_input.name'), this.state.form.company.value);
                formData.append(Lang.get('nas.form_input.name'), this.state.form.name);
                formData.append(Lang.get('nas.form_input.description'), this.state.form.description);
                formData.append(Lang.get('nas.form_input.port'), this.state.form.port);
                if (this.state.form.type !== null) {
                    formData.append(Lang.get('nas.form_input.method'), this.state.form.type.value);
                    if (this.state.form.type.value === 'api') {
                        formData.append(Lang.get('nas.form_input.ip'), this.state.form.ip);
                    } else {
                        formData.append(Lang.get('nas.form_input.domain'), this.state.form.ip);
                    }
                }
                if (this.state.form.pass.user.value.length > 0) formData.append(Lang.get('nas.form_input.user'), this.state.form.pass.user.value);
                if (this.state.form.pass.current.value.length > 0) formData.append(Lang.get('nas.form_input.pass'), this.state.form.pass.current.value);
                if (this.state.form.pass.confirm.value.length > 0) formData.append(Lang.get('nas.form_input.pass_confirm'), this.state.form.pass.confirm.value);
                formData.append(Lang.get('nas.form_input.expire_url'), this.state.form.url);
                let response = await crudNas(formData);
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
                responseMessage(e);
            }
        }
    }
    render() {
        return (
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('nas.create.form'),update:Lang.get('nas.update.form')}}/>
                    <DialogContent dividers>
                        {this.props.user === null ? null :
                            this.props.user.meta.company !== null ? null :
                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">{Lang.get('companies.labels.name')}</label>
                                    <div className="col-sm-4">
                                        <Select options={this.props.companies}
                                                value={this.state.form.company} onChange={(e)=>this.handleSelect(e,'company')}
                                                noOptionsMessage={()=>Lang.get('companies.labels.no_select')}
                                                className="text-sm" placeholder={<small>{Lang.get('companies.labels.select')}</small>}
                                                isDisabled={this.state.loading || this.props.loadings.companies} isLoading={this.props.loadings.companies}/>
                                    </div>
                                </div>
                        }
                        <InputText labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-10' },
                            placeholder : Lang.get('nas.labels.name'), name : Lang.get('nas.labels.name') }}
                                   input={{ name : 'name', value : this.state.form.name, id : 'name', }} handleChange={this.handleChange} loading={this.state.loading}/>

                        <InputText type="textarea" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-10' },
                            placeholder : Lang.get('nas.labels.description'), name : Lang.get('nas.labels.description') }}
                                   input={{ name : 'description', value : this.state.form.description, id : 'description', }} handleChange={this.handleChange} loading={this.state.loading}/>

                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('nas.labels.method.label')}</label>
                            <div className="col-sm-3">
                                <Select isDisabled={this.state.loading}
                                        options={routerConnectionType} className="text-sm"
                                        onChange={(e)=>this.handleSelect(e,'type')}
                                        value={this.state.form.type}/>
                            </div>
                        </div>
                        {this.state.form.type === null ? null :
                            this.state.form.type.value === 'api' ?
                                <InputText type="ip" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-3' },
                                    placeholder : Lang.get('nas.labels.ip.label'), name : Lang.get('nas.labels.ip.label') }}
                                           input={{ name : 'ip', value : this.state.form.ip, id : 'ip', }} handleChange={this.handleIp} loading={this.state.loading}/>
                                :
                                <InputText type="text" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-3' },
                                    placeholder : Lang.get('nas.labels.domain.label'), name : Lang.get('nas.labels.domain.label') }} info={Lang.get('nas.labels.domain.info')}
                                           input={{ name : 'ip', value : this.state.form.ip, id : 'ip', }} handleChange={this.handleChange} loading={this.state.loading}/>
                        }

                        <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-2' },
                            placeholder : Lang.get('nas.labels.port.label'), name : Lang.get('nas.labels.port.label') }}
                                   input={{ name : 'port', value : this.state.form.port, id : 'port', decimal : 0 }} decimalSeparator="." thousandSeparator=""
                                   handleChange={this.handleChange} loading={this.state.loading}/>

                        <InputText type="password" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-3' },
                            placeholder : Lang.get('nas.labels.user.label'), name : Lang.get('nas.labels.user.label') }}
                                   input={{ name : 'user', value : this.state.form.pass.user.value, id : 'user', type : this.state.form.pass.user.type }}
                                   handleInputType={this.handleInputType}
                                   handleChange={this.handleChange} loading={this.state.loading}/>

                        <InputText type="password" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-3' },
                            placeholder : Lang.get('nas.labels.pass.label'), name : Lang.get('nas.labels.pass.label') }}
                                   input={{ name : 'current', value : this.state.form.pass.current.value, id : 'current', type : this.state.form.pass.current.type }}
                                   handleInputType={this.handleInputType}
                                   handleChange={this.handleChange} loading={this.state.loading}/>
                        <InputText type="password" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-3' },
                            placeholder : Lang.get('nas.labels.pass.confirm'), name : Lang.get('nas.labels.pass.confirm') }}
                                   input={{ name : 'confirm', value : this.state.form.pass.confirm.value, id : 'confirm', type : this.state.form.pass.confirm.type }}
                                   handleInputType={this.handleInputType}
                                   handleChange={this.handleChange} loading={this.state.loading}/>

                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        buttons={[
                            <button onClick={this.testConnection} type="button" className="btn btn-primary" disabled={this.state.loading}><i className="fas fa-link mr-1"/>{Lang.get('nas.labels.check_connection')}</button>
                        ]} loading={this.state.loading}
                        langs={{create:Lang.get('nas.create.button'),update:Lang.get('nas.update.button')}}/>
                </form>
            </Dialog>
        )
    }
}
export default FormNas;
