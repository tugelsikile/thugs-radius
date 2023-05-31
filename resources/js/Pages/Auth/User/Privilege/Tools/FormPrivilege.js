import React from "react";
import {Dialog, DialogContent} from "@mui/material";
import Select from "react-select";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {logout} from "../../../../../Components/Authentication";
import {crudPrivileges} from "../../../../../Services/UserService";

// noinspection JSCheckFunctionSignatures,DuplicatedCode
class FormPrivilege extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                name : '', description : '', client : true, company : null, id : null,
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        if (props.open) {
            if (props.data !== null) {
                form.id = props.data.value,
                    form.name = props.data.label,
                    form.description = props.data.meta.description,
                    form.client = props.data.meta.client;
                if (props.data.meta.company !== null) {
                    if (props.companies !== null) {
                        if (props.companies.length > 0) {
                            let indexCompany = props.companies.findIndex((f) => f.value === props.data.meta.company.id);
                            if (indexCompany >= 0) {
                                form.company = props.companies[indexCompany];
                            }
                        }
                    }
                }
            }
        }
        this.setState({form});
    }
    handleSelect(e) {
        let form = this.state.form;
        form.company = e; this.setState({form});
    }
    handleChange(e) {
        let form = this.state.form;
        form[e.target.name] = e.target.value; this.setState({form});
    }
    handleCheck(e) {
        let form = this.state.form;
        form.client = e.target.checked;
        if (! form.client) {
            form.company = null;
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
            formData.append(Lang.get('messages.privileges.form_input.name'), this.state.form.name);
            formData.append(Lang.get('messages.privileges.form_input.description'), this.state.form.description);
            formData.append(Lang.get('messages.privileges.form_input.client'), this.state.form.client ? 'ya' : 'tidak');
            if (this.state.form.company !== null) formData.append(Lang.get('messages.privileges.form_input.company'), this.state.form.company.value);
            let response = await crudPrivileges(formData);
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
                <form onSubmit={this.handleSave} className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title text-sm">
                            {this.state.form.id === null ?
                                Lang.get('messages.privileges.create.form')
                                :
                                Lang.get('messages.privileges.update.form')
                            }
                        </h5>
                        <button type="button" className="close" onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <DialogContent>
                        <div className="form-group row">
                            <label className="col-sm-3 col-form-label" htmlFor="inputCheck">{Lang.get('messages.privileges.labels.client')}</label>
                            <div className="col-sm-9">
                                <div className="custom-control custom-checkbox">
                                    <input checked={this.state.form.client} disabled={this.state.loading} onChange={this.handleCheck} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox" id="for_client"/>
                                    <label htmlFor="for_client" className="custom-control-label"/>
                                </div>
                            </div>
                        </div>
                        {this.state.form.client &&
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">{Lang.get('messages.company.labels.name')}</label>
                                <div className="col-sm-3">
                                    <Select onChange={this.handleSelect} placeholder={<small>{Lang.get('messages.company.select.option')}</small>} options={this.props.companies} isLoading={this.props.loadings.companies} isDisabled={this.props.loadings.companies || this.state.loading} value={this.state.form.company}/>
                                </div>
                            </div>
                        }
                        <div className="form-group row">
                            <label className="col-sm-3 col-form-label" htmlFor="inputName">{Lang.get('messages.privileges.labels.name')}</label>
                            <div className="col-sm-9">
                                <input id="inputName" className="form-control text-sm" value={this.state.form.name} name="name" disabled={this.state.loading} onChange={this.handleChange} placeholder={Lang.get('messages.privileges.labels.name')}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-3 col-form-label" htmlFor="inputKeterangan">{Lang.get('messages.privileges.labels.description')}</label>
                            <div className="col-sm-9">
                                <textarea className="form-control text-sm" value={this.state.form.description} name="description" placeholder={Lang.get('messages.privileges.labels.description')} onChange={this.handleChange} disabled={this.state.loading} style={{resize:'none'}}/>
                            </div>
                        </div>
                    </DialogContent>
                    <div className="modal-footer justify-content-between">
                        <button type="submit" className="btn btn-success" disabled={this.state.loading}>
                            {this.state.loading ? <i className="fas fa-spin fa-circle-notch mr-1"/> : <i className="fas fa-save mr-1"/> }
                            {this.state.form.id === null ? Lang.get('messages.privileges.create.button') : Lang.get('messages.privileges.update.button',null, 'id')}
                        </button>
                        <button type="button" className="btn btn-default" disabled={this.state.loading} onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <i className="fas fa-times mr-1"/> {Lang.get('messages.close')}
                        </button>
                    </div>
                </form>
            </Dialog>
        );
    }
}
export default FormPrivilege;
