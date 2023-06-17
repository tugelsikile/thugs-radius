import React from "react";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import Select from "react-select";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {logout} from "../../../../../Components/Authentication";
import {crudPrivileges} from "../../../../../Services/UserService";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faTimes} from "@fortawesome/free-solid-svg-icons";
import {faSave} from "@fortawesome/free-regular-svg-icons";

// noinspection JSCheckFunctionSignatures,DuplicatedCode,CommaExpressionJS
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
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        let index;
        if (!nextProps.open) {
            form.name = '', form.description = '', form.client = true, form.company = null, form.id = null;
        } else {
            if (nextProps.data === null) {
                if (typeof nextProps.user !== 'undefined') {
                    if (nextProps.user !== null) {
                        if (nextProps.user.meta.company !== null) {
                            index = nextProps.companies.findIndex((f) => f.value === nextProps.user.meta.company.id);
                            if (index >= 0) {
                                form.client = true;
                                form.company = nextProps.companies[index];
                            }
                        }
                    }
                }
            } else {
                form.id = nextProps.data.value,
                    form.name = nextProps.data.label,
                    form.description = nextProps.data.meta.description,
                    form.client = nextProps.data.meta.client;
                if (nextProps.companies !== null) {
                    if (nextProps.companies.length > 0) {
                        if (nextProps.data.meta.company !== null) {
                            index = nextProps.companies.findIndex((f) => f.value === nextProps.data.meta.company.id);
                            if (index >= 0) {
                                form.company = nextProps.companies[index];
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
            <Dialog fullWidth maxWidth="sm" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave} className="modal-content">
                    <DialogTitle className="py-2 px-3">
                        <button type="button" className="close float-right" onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <FontAwesomeIcon icon={faTimes}/>
                        </button>
                        <span className="modal-title text-sm">
                            {this.state.form.id === null ?
                                Lang.get('messages.privileges.create.form')
                                :
                                Lang.get('messages.privileges.update.form')
                            }
                        </span>
                    </DialogTitle>
                    <DialogContent dividers>
                        {typeof this.props.user === 'undefined' ?
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label" htmlFor="inputCheck">{Lang.get('messages.privileges.labels.client')}</label>
                                <div className="col-sm-9">
                                    <div className="custom-control custom-checkbox">
                                        <input checked={this.state.form.client} disabled={this.state.loading} onChange={this.handleCheck} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox" id="for_client"/>
                                        <label htmlFor="for_client" className="custom-control-label"/>
                                    </div>
                                </div>
                            </div>
                            :
                            this.props.user === null ?
                                <div className="form-group row">
                                    <label className="col-sm-3 col-form-label" htmlFor="inputCheck">{Lang.get('messages.privileges.labels.client')}</label>
                                    <div className="col-sm-9">
                                        <div className="custom-control custom-checkbox">
                                            <input checked={this.state.form.client} disabled={this.state.loading} onChange={this.handleCheck} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox" id="for_client"/>
                                            <label htmlFor="for_client" className="custom-control-label"/>
                                        </div>
                                    </div>
                                </div>
                                : this.props.user.meta.company === null &&
                                    <div className="form-group row">
                                        <label className="col-sm-3 col-form-label" htmlFor="inputCheck">{Lang.get('messages.privileges.labels.client')}</label>
                                        <div className="col-sm-9">
                                            <div className="custom-control custom-checkbox">
                                                <input checked={this.state.form.client} disabled={this.state.loading} onChange={this.handleCheck} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox" id="for_client"/>
                                                <label htmlFor="for_client" className="custom-control-label"/>
                                            </div>
                                        </div>
                                    </div>
                        }

                        {!this.state.form.client ? null :
                            typeof this.props.user === 'undefined' ?
                                <div className="form-group row">
                                    <label className="col-sm-3 col-form-label">{Lang.get('messages.company.labels.name')}</label>
                                    <div className="col-sm-9">
                                        <Select onChange={this.handleSelect} placeholder={<small>{Lang.get('messages.company.select.option')}</small>} options={this.props.companies} isLoading={this.props.loadings.companies} isDisabled={this.props.loadings.companies || this.state.loading} value={this.state.form.company}/>
                                    </div>
                                </div>
                                :
                                this.props.user === null ?
                                    <div className="form-group row">
                                        <label className="col-sm-3 col-form-label">{Lang.get('messages.company.labels.name')}</label>
                                        <div className="col-sm-9">
                                            <Select onChange={this.handleSelect} placeholder={<small>{Lang.get('messages.company.select.option')}</small>} options={this.props.companies} isLoading={this.props.loadings.companies} isDisabled={this.props.loadings.companies || this.state.loading} value={this.state.form.company}/>
                                        </div>
                                    </div>
                                    :
                                    this.props.user.meta.company === null &&
                                    <div className="form-group row">
                                        <label className="col-sm-3 col-form-label">{Lang.get('messages.company.labels.name')}</label>
                                        <div className="col-sm-9">
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

                    </DialogContent>
                    <DialogActions className="justify-content-between">
                        <button type="submit" className="btn btn-success" disabled={this.state.loading}>
                            <FontAwesomeIcon icon={this.state.loading ? faCircleNotch : faSave} spin={this.state.loading} className="mr-1"/>
                            {this.state.form.id === null ? Lang.get('messages.privileges.create.button') : Lang.get('messages.privileges.update.button',null, 'id')}
                        </button>
                        <button type="button" className="btn btn-default" disabled={this.state.loading} onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <FontAwesomeIcon icon={faTimes} className="mr-1"/>
                            {Lang.get('messages.close')}
                        </button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}
export default FormPrivilege;
