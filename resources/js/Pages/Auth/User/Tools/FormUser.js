import React from "react";
import {Typography,Popover, Dialog, DialogContent} from "@mui/material";
import Select from "react-select";
import {dateFormatSelect, langSelect} from "../../../../Components/mixedConsts";
import moment from "moment";
import PasswordStrengthBar from 'react-password-strength-bar';
import {showError, showSuccess} from "../../../../Components/Toaster";
import {logout} from "../../../../Components/Authentication";
import {crudUsers} from "../../../../Services/UserService";

// noinspection JSCheckFunctionSignatures,CommaExpressionJS
class FormUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false, popover : { open : false, anchorEl : null },
            form : {
                id : null, level : null, company : null,
                name : '', email : '', lang : langSelect[0], date_format : dateFormatSelect[4],
                password : {
                    current : { value : '', type : 'password' },
                    repeat : { value : '', type : 'password' }
                }
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handlePopOver = this.handlePopOver.bind(this);
        this.handleInputType = this.handleInputType.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        form.id = null, form.level = null, form.company = null,
            form.name = '', form.email = '', form.password.current.value = '',
            form.password.current.type = 'password', form.password.repeat.value = '',
            form.password.repeat.type = 'password',
            form.lang = langSelect[0], form.date_format = dateFormatSelect[4];
        if (props.open) {
            if (props.data !== null) {
                form.id = props.data.value,
                    form.name = props.data.label, form.email = props.data.meta.email,
                    form.level = props.data.meta.level,
                    form.company = props.data.meta.company === null ? null : { value : props.data.meta.company.id, label : props.data.meta.company.name },
                    form.lang = langSelect[langSelect.findIndex((f) => f.value === props.data.meta.locale.lang)];
                console.log(props.data.meta.locale.date_format);
                if (props.data.meta.locale.date_format !== null) {
                    let indexFormat = dateFormatSelect.findIndex((f) => f.value === props.data.meta.locale.date_format);
                    if (indexFormat >= 0) {
                        form.date_format = dateFormatSelect[indexFormat];
                    } else {
                        form.date_format = dateFormatSelect[0];
                    }
                }
            }
        }
        this.setState({form});
    }
    handlePopOver(e) {
        let popover = this.state.popover;
        popover.open = ! this.state.popover.open;
        popover.anchorEl = e.currentTarget; this.setState({popover});
    }
    handleInputType(event) {
        event.preventDefault();
        let form = this.state.form;
        form.password[event.currentTarget.getAttribute('data-type')].type = form.password[event.currentTarget.getAttribute('data-type')].type === 'password' ? 'text' : 'password';
        this.setState({form});
    }
    handleSelect(event, name) {
        let form = this.state.form;
        form[name] = event;
        if (name === 'level') {
            if (event.meta.company !== null) {
                if (this.props.companies !== null) {
                    if (this.props.companies.length > 0) {
                        let indexCompany = this.props.companies.findIndex((f) => f.value === event.meta.company.id);
                        if (indexCompany >= 0) {
                            form.company = this.props.companies[indexCompany];
                        }
                    }
                }
            }
        }
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        if (event.target.getAttribute('name') === 'password') {
            form.password[event.target.getAttribute('data-type')].value = event.target.value;
        } else {
            form[event.target.getAttribute('name')] = event.target.value;
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
            if (this.state.form.level !== null) formData.append(Lang.get('messages.users.form_input.level'), this.state.form.level.value);
            if (this.state.form.company !== null) formData.append(Lang.get('messages.users.form_input.company'), this.state.form.company.value);
            formData.append(Lang.get('messages.users.form_input.name'), this.state.form.name);
            formData.append(Lang.get('messages.users.form_input.email'), this.state.form.email);
            if (this.state.form.password.current.value.length > 0) formData.append(Lang.get('messages.users.form_input.password'), this.state.form.password.current.value);
            if (this.state.form.password.repeat.value.length > 0) formData.append(Lang.get('messages.users.form_input.password_confirm'), this.state.form.password.repeat.value);
            if (this.state.form.lang !== null) formData.append(Lang.get('messages.users.form_input.lang'), this.state.form.lang.value);
            if (this.state.form.date_format !== null) formData.append(Lang.get('messages.users.form_input.date_format'), this.state.form.date_format.value);
            let response = await crudUsers(formData);
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
            if (e.response.status === 401) logout();
            showError(e.response.data.message);
        }
    }
    render() {
        return (
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave} className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title text-sm">
                            {this.state.form.id === null ?
                                Lang.get('messages.users.create.form')
                                :
                                Lang.get('messages.users.update.form')
                            }
                        </h5>
                        <button type="button" className="close" onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <DialogContent>
                        <div className="form-group row">
                            <label className="col-sm-3 col-form-label">{Lang.get('messages.privileges.select.label')}</label>
                            <div className="col-sm-3">
                                <Select onChange={(e)=>this.handleSelect(e,'level')} name="level" placeholder={<small>{Lang.get('messages.privileges.select.option')}</small>} value={this.state.form.level}
                                        options={this.props.user === null ? [] : this.props.user.meta.level.super ? this.props.levels : this.props.levels.filter((f) => ! f.meta.super )}
                                        isLoading={this.props.loadings.levels} isDisabled={this.state.loading || this.props.loadings.levels}/>
                            </div>
                            {this.state.form.level !== null &&
                                <div className="col-sm-6">
                                    <button onMouseEnter={this.handlePopOver} onMouseLeave={this.handlePopOver} type="button" disabled={this.state.loading} className="btn small"><i className="fas fa-info-circle mr-1"/> {Lang.get('messages.privileges.labels.info')}</button>
                                    <Popover
                                        sx={{ pointerEvents: 'none', }}
                                        open={this.state.popover.open}
                                        anchorEl={this.state.popover.anchorEl}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'left', }}
                                        onClose={this.handlePopOver}
                                        disableRestoreFocus>
                                        <div className="card mb-0">
                                            <div className="card-body">
                                                <ul className="list-unstyled">
                                                    {this.state.form.level.meta.privileges.filter((f) => f.meta.client === this.state.form.level.meta.client).map((menu)=>
                                                        <li key={menu.value}><i className="fe fe-list mr-1"/>
                                                            {Lang.get(`messages.${menu.meta.lang}`)}
                                                            <span className="float-right">
                                                                {menu.meta.function ?
                                                                    menu.meta.can.read ?
                                                                        <span className="badge badge-success mr-1">R</span>
                                                                        :
                                                                        <span className="badge badge-danger mr-1">R</span>
                                                                    :
                                                                    <>
                                                                        {menu.meta.can.read ?
                                                                            <span className="badge badge-success mr-1">R</span>
                                                                            :
                                                                            <span className="badge badge-danger mr-1">R</span>
                                                                        }
                                                                        {menu.meta.can.create ?
                                                                            <span className="badge badge-success mr-1">C</span>
                                                                            :
                                                                            <span className="badge badge-danger mr-1">C</span>
                                                                        }
                                                                        {menu.meta.can.update ?
                                                                            <span className="badge badge-success mr-1">U</span>
                                                                            :
                                                                            <span className="badge badge-danger mr-1">U</span>
                                                                        }
                                                                        {menu.meta.can.delete ?
                                                                            <span className="badge badge-success mr-1">D</span>
                                                                            :
                                                                            <span className="badge badge-danger mr-1">D</span>
                                                                        }
                                                                    </>
                                                                }
                                                            </span>
                                                            {menu.meta.childrens.length > 0 &&
                                                                <ul className="list-unstyled">
                                                                    {menu.meta.childrens.map((child)=>
                                                                        <li key={child.value}>
                                                                            <i className="fe fe-corner-down-right mr-1 ml-2"/>
                                                                            {Lang.get(`messages.${child.meta.lang}`)}
                                                                            <span className="float-right">
                                                                                {child.meta.function ?
                                                                                    <span
                                                                                        className="badge badge-success mr-1">R</span>
                                                                                    :
                                                                                    <>
                                                                                        {child.meta.can.read ?
                                                                                            <span className="badge badge-success mr-1">R</span>
                                                                                            :
                                                                                            <span className="badge badge-danger mr-1">R</span>
                                                                                        }
                                                                                        {child.meta.can.create ?
                                                                                            <span className="badge badge-success mr-1">C</span>
                                                                                            :
                                                                                            <span className="badge badge-danger mr-1">C</span>
                                                                                        }
                                                                                        {child.meta.can.update ?
                                                                                            <span className="badge badge-success mr-1">U</span>
                                                                                            :
                                                                                            <span className="badge badge-danger mr-1">U</span>
                                                                                        }
                                                                                        {child.meta.can.delete ?
                                                                                            <span className="badge badge-success mr-1">D</span>
                                                                                            :
                                                                                            <span className="badge badge-danger mr-1">D</span>
                                                                                        }
                                                                                    </>
                                                                                }
                                                                            </span>
                                                                        </li>
                                                                    )}
                                                                </ul>
                                                            }
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </Popover>
                                </div>
                            }
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-3 col-form-label">{Lang.get('messages.company.labels.name')}</label>
                            <div className="col-sm-3">
                                <Select onChange={(e)=>this.handleSelect(e,'company')}
                                        placeholder={<small>{Lang.get('messages.company.select.option')}</small>}
                                        options={this.state.form.level !== null && this.state.form.level.meta.company !== null ? [{value:this.state.form.level.meta.company.id,label:this.state.form.level.meta.company.name}] : this.props.companies} value={this.state.form.company} isLoading={this.props.loadings.companies} isDisabled={this.props.loadings.companies || this.state.loading} isClearable/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-3 col-form-label" htmlFor="inputName">{Lang.get('messages.users.labels.name')}</label>
                            <div className="col-sm-9">
                                <input id="inputName" className="form-control text-sm" disabled={this.state.loading} value={this.state.form.name} name="name" onChange={this.handleChange} placeholder={Lang.get('messages.users.labels.name')}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-3 col-form-label" htmlFor="inputEmail">{Lang.get('messages.users.labels.email')}</label>
                            <div className="col-sm-4">
                                <input type="email" id="inputEmail" className="form-control text-sm" disabled={this.state.loading} value={this.state.form.email} name="email" onChange={this.handleChange} placeholder={Lang.get('messages.users.labels.email')}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-3 col-form-label" htmlFor="inputPassword">
                                {Lang.get('messages.users.labels.password')}
                                {this.state.form.id !== null &&
                                    <span className="small text-muted"><br/>{Lang.get('messages.users.update.password_change')}</span>
                                }
                            </label>
                            <div className="col-sm-4">
                                <div className="input-group">
                                    <input id="inputPassword" placeholder={Lang.get('messages.users.labels.password')} data-type="current" type={this.state.form.password.current.type} name="password" className="form-control text-sm" value={this.state.form.password.current.value} onChange={this.handleChange}/>
                                    <div className="input-group-append">
                                        <button type="button" disabled={this.state.loading} onClick={this.handleInputType} data-type="current" className="btn btn-default">
                                            {this.state.form.password.current.type === 'password' ? <i className="fe fe-eye"/> : <i className="fe fe-eye-off"/> }
                                        </button>
                                    </div>
                                </div>
                                <PasswordStrengthBar minLength={6} password={this.state.form.password.current.value} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-3 col-form-label" htmlFor="inputRepeat">
                                {Lang.get('messages.users.labels.password_confirm')}
                                {this.state.form.id !== null &&
                                    <span className="small text-muted"><br/>{Lang.get('messages.users.update.password_change')}</span>
                                }
                            </label>
                            <div className="col-sm-4">
                                <div className="input-group">
                                    <input id="inputRepeat" placeholder={Lang.get('messages.users.labels.password_confirm')} data-type="repeat" type={this.state.form.password.repeat.type} name="password" className="form-control text-sm" value={this.state.form.password.repeat.value} onChange={this.handleChange}/>
                                    <div className="input-group-append">
                                        <button type="button" disabled={this.state.loading} onClick={this.handleInputType} data-type="repeat" className="btn btn-default">
                                            {this.state.form.password.repeat.type === 'password' ? <i className="fe fe-eye"/> : <i className="fe fe-eye-off"/> }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-3 col-form-label">{Lang.get('messages.users.labels.lang.label')}</label>
                            <div className="col-sm-3">
                                <Select onChange={(e)=>this.handleSelect(e,'lang')} options={langSelect} value={this.state.form.lang} isDisabled={this.state.loading} placeholder={<small>{Lang.get('messages.users.lang.select')}</small>}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-3 col-form-label">{Lang.get('messages.users.labels.date_format.label')}</label>
                            <div className="col-sm-3">
                                <Select onChange={(e)=>this.handleSelect(e,'date_format')} options={dateFormatSelect} value={this.state.form.date_format} isDisabled={this.state.loading} placeholder={<small>{Lang.get('messages.users.labels.date_format.select')}</small>}/>
                            </div>
                            {this.state.form.date_format !== null &&
                                <>
                                    <label className="col-sm-2 col-form-label">{Lang.get('messages.users.labels.date_format.preview')}</label>
                                    <div className="col-sm-3">
                                        <div className="form-control text-sm">
                                            {moment().locale(this.state.form.lang.value === 'id' ? 'id_ID' : 'en_EN').format(this.state.form.date_format.value)}
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </DialogContent>

                    <div className="modal-footer justify-content-between">
                        <button type="submit" className="btn btn-success" disabled={this.state.loading}>
                            {this.state.loading ? <i className="fas fa-spin fa-circle-notch mr-1"/> : <i className="fas fa-save mr-1"/> }
                            {this.state.form.id === null ? Lang.get('messages.users.create.button') : Lang.get('messages.users.update.button',null, 'id')}
                        </button>
                        <button type="button" className="btn btn-default" disabled={this.state.loading} onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <i className="fas fa-times mr-1"/> {Lang.get('messages.close')}
                        </button>
                    </div>
                </form>
            </Dialog>
        )
    }
}
export default FormUser;
