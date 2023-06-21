// noinspection JSCheckFunctionSignatures

import React from "react";
import {FormControlSMReactSelect, hasWhiteSpace, responseMessage} from "../../../../../../Components/mixedConsts";
import {crudProfilePools} from "../../../../../../Services/NasService";
import {showError, showSuccess} from "../../../../../../Components/Toaster";
import {ModalFooter, ModalHeader} from "../../../../../../Components/ModalComponent";
import {Dialog, DialogContent, Tooltip} from "@mui/material";
import Select from "react-select";
import {InputText, LabelRequired} from "../../../../../../Components/CustomInput";
import FormNas from "../../../Tools/FormNas";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus} from "@fortawesome/free-solid-svg-icons";


// noinspection DuplicatedCode,CommaExpressionJS
class FormPool extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, name : '', description : '', nas : null,
                first : '', last : '', upload : true,
            },
            name_invalid : false,
            modals : { open : false, data : null }
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
        if (! props.open) {
            form.id = null, form.name = '', form.description = '', form.first = '', form.last = '',
                form.nas = null, form.upload = true;
        } else {
            if (props.data !== null) {
                form.id = props.data.value, form.name = props.data.label, form.description = props.data.meta.description,
                    form.upload = true,
                    form.first = props.data.meta.address.first, form.last = props.data.meta.address.last,
                    form.nas = props.data.meta.nas === null ? null : {
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
                    }
            }
        }
        this.setState({form,loading:false});
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
        form[name] = event; this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        form[event.currentTarget.name] = event.currentTarget.value;
        if (event.currentTarget.name === 'name') {
            if (hasWhiteSpace(event.currentTarget.value)) {
                this.setState({name_invalid:true});
            } else {
                this.setState({name_invalid:false});
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
            if (this.state.form.id !== null) formData.append(Lang.get('nas.pools.form_input.id'), this.state.form.id);
            if (this.state.form.nas !== null) formData.append(Lang.get('nas.form_input.name'), this.state.form.nas.value);
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
                            <InputText type="text" labels={{ cols:{ label : 'col-md-3', input : 'col-md-9' },
                                placeholder : Lang.get('nas.pools.labels.name'), name : Lang.get('nas.pools.labels.name') }}
                                       input={{ name : 'name', value : this.state.form.name, id : 'name', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>
                            {this.state.name_invalid ?
                                <div className="form-group mt-0">
                                    <div className="col-md-10 offset-2 text-danger">
                                        {Lang.get('nas.pools.labels.invalid_name')}
                                    </div>
                                </div>
                                : null}

                            <InputText type="textarea" labels={{ cols:{ label : 'col-md-3', input : 'col-md-9' },
                                placeholder : Lang.get('nas.pools.labels.description'), name : Lang.get('nas.pools.labels.description') }}
                                       input={{ name : 'description', value : this.state.form.description, id : 'description', }} required={false} handleChange={this.handleChange} loading={this.state.loading}/>

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
