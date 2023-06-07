// noinspection JSCheckFunctionSignatures

import React from "react";
import {hasWhiteSpace, responseMessage} from "../../../../../../Components/mixedConsts";
import {crudProfilePools} from "../../../../../../Services/NasService";
import {showError, showSuccess} from "../../../../../../Components/Toaster";
import {ModalFooter, ModalHeader} from "../../../../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import Select from "react-select";
import {InputText, LabelRequired} from "../../../../../../Components/CustomInput";


// noinspection DuplicatedCode,CommaExpressionJS
class FormPool extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, company : null, name : '', description : '', nas : null,
                first : '', last : '', upload : true,
            },
            name_invalid : false,
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
    }
    componentWillReceiveProps(props) {
        this.setState({loading:true});
        let form = this.state.form;
        if (! props.open) {
            form.id = null, form.company = null, form.name = '', form.description = '', form.first = '', form.last = '',
                form.nas = null, form.upload = true;
        } else {
            if (props.user !== null) {
                if (props.user.meta.company !== null) {
                    form.company = {
                        label : props.user.meta.company.name,
                        value : props.user.meta.company.id,
                    };
                }
            }
            if (props.data !== null) {
                form.id = props.data.value, form.name = props.data.label, form.description = props.data.meta.description,
                    form.upload = true,
                    form.company = props.data.meta.company === null ? null : { value : props.data.meta.company.id, label : props.data.meta.company.name },
                    form.first = props.data.meta.address.first, form.last = props.data.meta.address.last,
                    form.nas = props.data.meta.nas === null ? null : {
                        value : props.data.meta.nas.id, label : props.data.meta.nas.name,
                        meta : {
                            auth : {
                                host : props.data.meta.nas.hostname,
                                port : props.data.meta.nas.port,
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
            if (this.state.form.company !== null) formData.append(Lang.get('companies.form_input.name'), this.state.form.company.value);
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
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('nas.pools.create.form'),update:Lang.get('nas.pools.update.form')}}/>
                    <DialogContent dividers>
                        {this.props.user === null ? null :
                            this.props.user.meta.company !== null ? null :
                            <div className="form-group row">
                                <label className="col-sm-2 col-form-label">
                                    {this.state.form.id === null ? <LabelRequired/> : null}
                                    {Lang.get('companies.labels.name')}
                                </label>
                                <div className="col-sm-4">
                                    {this.state.form.id !== null ?
                                        <div className="form-control text-sm">{this.state.form.company.label}</div>
                                        :
                                        <Select onChange={(e)=>this.handleSelect(e,'company')} noOptionsMessage={()=>Lang.get('companies.labels.not_found')} options={this.props.companies} value={this.state.form.company} isLoading={this.props.loadings.companies} isDisabled={this.state.loading || this.state.loadings.companies}/>
                                    }
                                </div>
                            </div>
                        }
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">
                                {this.state.form.id === null ? <LabelRequired/> : null}
                                {Lang.get('nas.labels.name')}
                            </label>
                            <div className="col-sm-4">
                                {this.state.form.id === null ?
                                    <Select isClearable className="text-sm" placeholder={Lang.get('nas.labels.select')} onChange={(e)=>this.handleSelect(e,'nas')} value={this.state.form.nas} noOptionsMessage={()=>Lang.get('nas.labels.not_found')} options={this.props.nas} isDisabled={this.state.loading || this.props.loadings.nas} isLoading={this.props.loadings.nas}/>
                                    :
                                    <div className="form-control text-sm">{this.state.form.nas.label}</div>
                                }
                            </div>
                        </div>
                        <InputText type="text" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-10' },
                            placeholder : Lang.get('nas.pools.labels.name'), name : Lang.get('nas.pools.labels.name') }}
                                   input={{ name : 'name', value : this.state.form.name, id : 'name', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>
                        {this.state.name_invalid ?
                            <div className="form-group mt-0">
                                <div className="col-sm-10 offset-2 text-danger">
                                    {Lang.get('nas.pools.labels.invalid_name')}
                                </div>
                            </div>
                            : null}

                        <InputText type="textarea" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-10' },
                            placeholder : Lang.get('nas.pools.labels.description'), name : Lang.get('nas.pools.labels.description') }}
                                   input={{ name : 'description', value : this.state.form.description, id : 'description', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>

                        <InputText type="ip" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-4' },
                            placeholder : Lang.get('nas.pools.labels.address.first'), name : Lang.get('nas.pools.labels.address.first') }}
                                   input={{ name : 'first', value : this.state.form.first, id : 'first', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>

                        <InputText type="ip" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-4' },
                            placeholder : Lang.get('nas.pools.labels.address.last'), name : Lang.get('nas.pools.labels.address.last') }}
                                   input={{ name : 'last', value : this.state.form.last, id : 'last', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>

                        <div className="form-group row">
                            <div className="col-sm-10 offset-2">
                                <div className="custom-control custom-checkbox">
                                    <input checked={this.state.form.upload} onChange={this.handleCheck} className="custom-control-input" type="checkbox" id="upload"/>
                                    <label htmlFor="upload" className="custom-control-label">
                                        {this.state.form.upload ? Lang.get('nas.pools.labels.upload.true') : Lang.get('nas.pools.labels.upload.false')}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        buttons={[]} loading={this.state.loading}
                        langs={{create:Lang.get('nas.pools.create.button'),update:Lang.get('nas.pools.update.button')}}/>
                </form>
            </Dialog>
        )
    }
}
export default FormPool;