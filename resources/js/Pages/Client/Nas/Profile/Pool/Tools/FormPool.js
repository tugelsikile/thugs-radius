// noinspection JSCheckFunctionSignatures

import React from "react";
import {
    FormControlSMReactSelect,
    getIpRangeFromAddressAndNetmask,
    hasWhiteSpace,
    responseMessage
} from "../../../../../../Components/mixedConsts";
import {checkNasRequirements, crudProfilePools, loadNasIPAddress} from "../../../../../../Services/NasService";
import {showError, showSuccess} from "../../../../../../Components/Toaster";
import {ModalFooter, ModalHeader} from "../../../../../../Components/ModalComponent";
import {Dialog, DialogContent, Tooltip} from "@mui/material";
import Select from "react-select";
import {InputText, LabelRequired} from "../../../../../../Components/CustomInput";
import FormNas from "../../../Tools/FormNas";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus} from "@fortawesome/free-solid-svg-icons";
import {poolModuleList} from "./Mixed";


// noinspection DuplicatedCode,CommaExpressionJS
class FormPool extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, name : '', description : '', nas : null, module : poolModuleList[0],
                first : '', last : '', upload : true, code : '', interface : null,
            },
            name_invalid : false, interfaces : { loading : false, list : [] },
            modals : { open : false, data : null },
            nas_requirements : { status : false, checks : [], },
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.toggleNas = this.toggleNas.bind(this);
    }
    componentWillReceiveProps(props) {
        this.setState({loading:true});
        let form = this.state.form;
        let index;
        if (! props.open) {
            form.id = null, form.name = '', form.description = '', form.first = '', form.last = '',
                form.nas = null, form.upload = true, form.code = '', form.module = poolModuleList[0];
        } else {
            if (props.data !== null) {
                form.id = props.data.value, form.name = props.data.label, form.description = props.data.meta.description,
                    form.upload = true, form.code = props.data.meta.address.code,
                    form.first = props.data.meta.address.first, form.last = props.data.meta.address.last,
                    form.nas = null;
                    /*form.nas = props.data.meta.nas === null ? null : {
                        value : props.data.meta.nas.id, label : props.data.meta.nas.shortname,
                        meta : {
                            auth : {
                                host : props.data.meta.nas.method_domain,
                                ip : props.data.meta.nas.nasname,
                                port : props.data.meta.nas.method_port,
                                method : props.data.meta.nas.method,
                                user : props.data.meta.nas.user,
                                pass : props.data.meta.nas.password
                            }
                        }
                    };*/
                if (props.data.meta.nas !== null && props.nas !== null) {
                    if (props.nas.length > 0) {
                        index = props.nas.findIndex((f)=> f.value === props.data.meta.nas.id);
                        if (index >= 0) {
                            form.nas = props.nas[index];
                        }
                    }
                }
                index = poolModuleList.findIndex((f)=> f.value === props.data.meta.address.module);
                if (index >= 0) {
                    form.module = poolModuleList[index];
                }
            }
        }
        this.setState({form,loading:false},()=>{
            if (props.open) {
                if (form.nas !== null) {
                    this.loadInteraces();
                }
            }
        });
    }
    toggleNas(data = null) {
        let modals = this.state.modals;
        modals.open = ! this.state.modals.open;
        modals.data = data;
        this.setState({modals});
    }
    handleCheck(event) {
        let form = this.state.form;
        form.upload = event.currentTarget.checked;
        this.setState({form});
    }
    handleSelect(event, name) {
        let form = this.state.form;
        form[name] = event;
        if (name === 'interface') {
            if (form.interface !== null ) {
                let ipranges = getIpRangeFromAddressAndNetmask(form.interface.meta.address);
                if (ipranges.length === 2) {
                    let fIps = ipranges[0].split('.');
                    if (fIps.length === 4) {
                        fIps[3] = parseInt(fIps[3]) + 1;
                        form.first = fIps.join('.');
                    }
                    let lIps = ipranges[1].split('.');
                    if (lIps.length === 4) {
                        lIps[3] = parseInt(lIps[3]) - 1;
                        form.last = lIps.join('.');
                    }
                }
            }
        }
        this.setState({form},()=>{
            if (name === 'nas') {
                if (form.nas !== null) {
                    this.checkRequirements()
                        .then(()=>this.loadInteraces());
                }
            }
        });
    }
    handleChange(event) {
        let form = this.state.form;
        form[event.currentTarget.name] = event.currentTarget.value;
        if (event.currentTarget.name === 'code') {
            if (hasWhiteSpace(event.currentTarget.value)) {
                this.setState({name_invalid:true});
            } else {
                this.setState({name_invalid:false});
            }
        }
        this.setState({form});
    }
    async checkRequirements() {
        if (! this.state.loading) {
            /*let nas_requirements = this.state.nas_requirements;
            nas_requirements.status = false; nas_requirements.checks = [];
            this.setState({loading:true,nas_requirements});
            try {
                const formData = new FormData();
                formData.append(Lang.get('nas.form_input.user'), this.state.form.nas.meta.auth.user);
                formData.append(Lang.get('nas.form_input.pass'), this.state.form.nas.meta.auth.pass);
                formData.append(Lang.get('nas.form_input.method'), this.state.form.nas.meta.auth.method);
                formData.append(Lang.get('nas.form_input.ip'), this.state.form.nas.meta.auth.ip);
                formData.append(Lang.get('nas.form_input.port'), this.state.form.nas.meta.auth.port);
                formData.append(Lang.get('nas.form_input.domain'), this.state.form.nas.meta.auth.host);
                let response = await checkNasRequirements(formData);
                if (response.data.params === null) {
                    this.setState({loading:false});
                    showError(response.data.message);
                } else {
                    console.log(response.data.params);
                    this.setState({loading:false});
                }
            } catch (e) {
                this.setState({loading:false});
                responseMessage(e);
            }*/
        }
    }
    async loadInteraces() {
        if (! this.state.interfaces.loading) {
            if (this.state.form.nas !== null) {
                let interfaces = this.state.interfaces;
                interfaces.loading = true;
                this.setState({interfaces});
                try {
                    const formData = new FormData();
                    formData.append(Lang.get('nas.form_input.user'), this.state.form.nas.meta.auth.user);
                    formData.append(Lang.get('nas.form_input.pass'), this.state.form.nas.meta.auth.pass);
                    formData.append(Lang.get('nas.form_input.method'), this.state.form.nas.meta.auth.method);
                    formData.append(Lang.get('nas.form_input.ip'), this.state.form.nas.meta.auth.ip);
                    formData.append(Lang.get('nas.form_input.port'), this.state.form.nas.meta.auth.port);
                    formData.append(Lang.get('nas.form_input.domain'), this.state.form.nas.meta.auth.host);
                    let response = await loadNasIPAddress(formData);
                    if (response.data.params === null) {
                        interfaces.loading = false;
                        this.setState({interfaces});
                        showError(response.data.message);
                    } else {
                        interfaces.loading = false;
                        interfaces.list = response.data.params;
                        this.setState({interfaces});
                    }
                } catch (e) {
                    interfaces.loading = false;
                    this.setState({interfaces});
                    responseMessage(e);
                }
            }
        }
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            if (this.state.form.id !== null) formData.append(Lang.get('nas.pools.form_input.id'), this.state.form.id);
            if (this.state.form.nas !== null) formData.append(Lang.get('nas.form_input.name'), this.state.form.nas.value);
            if (this.state.form.module !== null) formData.append(Lang.get('nas.pools.form_input.module'), this.state.form.module.value);
            formData.append(Lang.get('nas.pools.form_input.code'), this.state.form.code);
            formData.append(Lang.get('nas.pools.form_input.name'), this.state.form.name);
            formData.append(Lang.get('nas.pools.form_input.description'), this.state.form.description);
            formData.append(Lang.get('nas.pools.form_input.address.first'), this.state.form.first);
            formData.append(Lang.get('nas.pools.form_input.address.last'), this.state.form.last);
            formData.append(Lang.get('nas.pools.form_input.upload'), this.state.form.upload ? 1 : 0);
            let response = await crudProfilePools(formData);
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
    render() {
        return (
            <React.Fragment>
                <FormNas user={this.props.user} loadings={this.props.loadings} companies={this.props.companies} open={this.state.modals.open} data={this.state.modals.data} handleClose={this.toggleNas} handleUpdate={this.props.onUpdateNas}/>
                <Dialog fullWidth maxWidth="sm" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                    <form onSubmit={this.handleSave}>
                        <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('nas.pools.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('nas.pools.labels.menu')})}}/>
                        <DialogContent dividers>
                            <div className="form-group row">
                                <label className="col-md-3 col-form-label text-xs">
                                    {this.state.form.id === null ? <LabelRequired/> : null}
                                    {Lang.get('nas.labels.name')}
                                </label>
                                <div className="col-md-6">
                                    {this.state.form.id === null ?
                                        <Select
                                            styles={FormControlSMReactSelect}
                                            isClearable className="text-xs"
                                            placeholder={Lang.get('nas.labels.select')}
                                            onChange={(e)=>this.handleSelect(e,'nas')}
                                            value={this.state.form.nas}
                                            noOptionsMessage={()=>Lang.get('nas.labels.not_found')}
                                            options={this.props.nas}
                                            isDisabled={this.state.loading || this.props.loadings.nas}
                                            isLoading={this.props.loadings.nas}/>
                                        :
                                        this.state.form.nas === null ? null :
                                            <div className="form-control form-control-sm text-xs">{this.state.form.nas.label}</div>
                                    }
                                </div>
                                <div className="col-md-3">
                                    {this.state.form.id !== null ? null :
                                        this.state.form.nas === null ?
                                            typeof this.props.privilege !== 'undefined' && this.props.privilege !== null && typeof this.props.privilege.nas !== 'undefined' && this.props.privilege.nas.create &&
                                                <Tooltip title={Lang.get('labels.create.label',{Attribute:Lang.get('nas.labels.menu')})}>
                                                    <button onClick={()=>this.toggleNas()} type="button" disabled={this.state.loading || this.props.loadings.nas} className="btn btn-sm btn-outline-primary text-xs"><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                </Tooltip>
                                            :
                                            typeof this.props.privilege !== 'undefined' && this.props.privilege !== null && typeof this.props.privilege.nas !== 'undefined' && this.props.privilege.nas.update &&
                                                <Tooltip title={Lang.get('labels.update.label',{Attribute:Lang.get('nas.labels.menu')})}>
                                                    <button onClick={()=>this.toggleNas(this.state.form.nas)} type="button" disabled={this.state.loading || this.props.loadings.nas} className="btn btn-sm btn-outline-info text-xs"><FontAwesomeIcon icon={faPencilAlt} size="sm"/></button>
                                                </Tooltip>
                                    }
                                </div>
                            </div>

                            {this.state.form.nas === null ? null :
                                <div className="form-group row">
                                    <label className="col-md-3 col-form-label text-xs">{this.state.form.nas.meta.auth.method === 'api' ? Lang.get('nas.labels.ip.label') : Lang.get('nas.labels.domain.label')}</label>
                                    <div className="col-md-4">
                                        <div className="form-control form-control-sm text-xs">{this.state.form.nas.meta.auth.method === 'api' ? `${this.state.form.nas.meta.auth.ip}:${this.state.form.nas.meta.auth.port}` : `${this.state.form.nas.meta.auth.host}:${this.state.form.nas.meta.auth.port}`}</div>
                                    </div>
                                </div>
                            }
                            <div className="form-group row">
                                <label className="col-md-3 col-form-label text-xs"><LabelRequired/> {Lang.get('nas.pools.labels.module')}</label>
                                <div className="col-md-6">
                                    <Select options={poolModuleList} value={this.state.form.module}
                                            className="text-xs"
                                            styles={FormControlSMReactSelect}
                                            noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('nas.pools.labels.module')})}
                                            placeholder={<small>{Lang.get('labels.select.option',{Attribute:Lang.get('nas.pools.labels.module')})}</small>}
                                            onChange={(event)=>this.handleSelect(event,'module')}/>
                                </div>
                            </div>

                            <InputText type="text" labels={{ cols:{ label : 'col-md-3', input : 'col-md-9' },
                                placeholder : Lang.get('nas.pools.labels.name'), name : Lang.get('nas.pools.labels.name') }}
                                       input={{ name : 'name', value : this.state.form.name, id : 'name', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>

                            {this.state.form.module !== null && this.state.form.module.value === 'mikrotik' &&
                                <div className="form-group row">
                                    <label htmlFor="input-code" className="col-form-label text-xs col-md-3"><LabelRequired/>{Lang.get('nas.pools.labels.code.label')}</label>
                                    <div className="col-md-9">
                                        <div className="row">
                                            <div className="col-md-7">
                                                <input id="input-code" placeholder={Lang.get('nas.pools.labels.code.label')} className="form-control form-control-sm text-xs" value={this.state.form.code} name="code" onChange={this.handleChange} disabled={this.state.loading}/>
                                            </div>
                                        </div>
                                        {this.state.name_invalid ?
                                            <small className="text-danger">{Lang.get('nas.pools.labels.invalid_name')}</small>
                                            :
                                            <small className="text-warning">{Lang.get('nas.pools.labels.code.info')}</small>
                                        }
                                    </div>
                                </div>
                            }

                            <InputText type="textarea" labels={{ cols:{ label : 'col-md-3', input : 'col-md-9' },
                                placeholder : Lang.get('nas.pools.labels.description'), name : Lang.get('nas.pools.labels.description') }}
                                       input={{ name : 'description', value : this.state.form.description, id : 'description', }} required={false} handleChange={this.handleChange} loading={this.state.loading}/>

                            <div className="form-group row">
                                <label className="col-md-3 col-form-label text-xs">{Lang.get('nas.labels.interface',{Attribute:Lang.get('nas.labels.menu')})}</label>
                                <div className="col-md-7">
                                    <Select options={this.state.interfaces.list}
                                            value={this.state.form.interface}
                                            onChange={(e)=>this.handleSelect(e,'interface')}
                                            maxMenuHeight={150} styles={FormControlSMReactSelect} menuPlacement="top"
                                            isLoading={this.state.interfaces.loading}
                                            isDisabled={this.state.loading || this.state.interfaces.loading}
                                            loadingMessage={Lang.get('labels.loading',{Attribute:Lang.get('nas.labels.interface',{Attribute:Lang.get('nas.labels.menu')})})}
                                            noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('nas.labels.interface',{Attribute:Lang.get('nas.labels.menu')})})}
                                            placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('nas.labels.interface',{Attribute:Lang.get('nas.labels.menu')})})}/>
                                </div>
                            </div>

                            <InputText type="ip" labels={{ cols:{ label : 'col-md-3', input : 'col-md-4' },
                                placeholder : Lang.get('nas.pools.labels.address.first'), name : Lang.get('nas.pools.labels.address.first') }}
                                       input={{ name : 'first', value : this.state.form.first, id : 'first', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>

                            <InputText type="ip" labels={{ cols:{ label : 'col-md-3', input : 'col-md-4' },
                                placeholder : Lang.get('nas.pools.labels.address.last'), name : Lang.get('nas.pools.labels.address.last') }}
                                       input={{ name : 'last', value : this.state.form.last, id : 'last', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>

                        </DialogContent>
                        <ModalFooter
                            form={this.state.form} handleClose={()=>this.props.handleClose()}
                            buttons={[]} loading={this.state.loading}
                            pendings={{create:Lang.get('labels.create.pending',{Attribute:Lang.get('nas.pools.labels.menu')}),update:Lang.get('labels.update.pending',{Attribute:Lang.get('nas.pools.labels.menu')})}}
                            langs={{create:Lang.get('labels.create.submit',{Attribute:Lang.get('nas.pools.labels.menu')}),update:Lang.get('labels.update.submit',{Attribute:Lang.get('nas.pools.labels.menu')})}}/>
                    </form>
                </Dialog>
            </React.Fragment>
        )
    }
}
export default FormPool;
