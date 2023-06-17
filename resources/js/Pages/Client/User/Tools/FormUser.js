import React from "react";
import {
    dateFormatSelect,
    FormControlSMReactSelect,
    langSelect,
    responseMessage
} from "../../../../Components/mixedConsts";
import {crudUsers} from "../../../../Services/UserService";
import {showError, showSuccess} from "../../../../Components/Toaster";
import {ModalFooter, ModalHeader} from "../../../../Components/ModalComponent";
import {Dialog, DialogContent, Popover} from "@mui/material";
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-regular-svg-icons";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import moment from "moment/moment";

// noinspection CommaExpressionJS,DuplicatedCode
class FormUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false, popover : { open : false, anchorEl : null },
            form : {
                id : null, company : null, level : null,
                name : '', email : '', lang : langSelect[0], date_format : dateFormatSelect[4],
                passwords : {
                    current : { value : '', type : 'password' },
                    confirm : { value : '', type : 'password' },
                }
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleInputType = this.handleInputType.bind(this);
        this.handlePopOver = this.handlePopOver.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        let index;
        if (!nextProps.open) {
            form.id = null, form.company = null, form.level = null,
                form.lang = langSelect[0], form.date_format = dateFormatSelect[4],
                form.name = '', form.email = '',
                form.passwords.current.value = '', form.passwords.current.type = 'password',
                form.passwords.confirm.value = '', form.passwords.confirm.type = 'password';
        } else {
            if (nextProps.companies !== null) {
                if (nextProps.companies.length > 0) {
                    if (nextProps.user !== null) {
                        if (nextProps.user.meta.company !== null) {
                            index = nextProps.companies.findIndex((f) => f.value === nextProps.user.meta.company.id);
                            if (index >= 0) {
                                form.company = nextProps.companies[index];
                            }
                        }
                    }
                }
            }
            if (nextProps.data !== null) {
                form.id = nextProps.data.value, form.name = nextProps.data.label,
                    form.email = nextProps.data.meta.email;
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
                if (nextProps.levels !== null) {
                    if (nextProps.levels.length > 0) {
                        if (nextProps.data.meta.level !== null) {
                            index = nextProps.levels.findIndex((f) => f.value === nextProps.data.meta.level.value);
                            if (index >= 0) {
                                form.level = nextProps.levels[index];
                            }
                        }
                    }
                }
                if (nextProps.data.meta.locale.lang !== null) {
                    index = langSelect.findIndex((f) => f.value === nextProps.data.meta.locale.lang);
                    if (index >= 0) {
                        form.lang = langSelect[index];
                    }
                }
                if (nextProps.data.meta.locale.date_format !== null) {
                    let index = dateFormatSelect.findIndex((f) => f.value === nextProps.data.meta.locale.date_format);
                    if (index >= 0) {
                        form.date_format = dateFormatSelect[index];
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
        let form = this.state.form;
        let type = event.currentTarget.getAttribute('data-type');
        if (type !== null) {
            form.passwords[type].type = form.passwords[type].type === 'password' ? 'text' : 'password';
            this.setState({form});
        }
    }
    handleSelect(event, name) {
        let form = this.state.form;
        form[name] = event;
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        let parent = event.currentTarget.getAttribute('data-parent');
        let name = event.currentTarget.name;
        if (parent === null) {
            form[name] = event.target.value;
        } else {
            form.passwords[parent][name] = event.target.value;
        }
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            if (this.state.form.id !== null) formData.append(Lang.get('users.form_input.id'), this.state.form.id);
            if (this.state.form.company !== null) formData.append(Lang.get('companies.form_input.name'), this.state.form.company.value);
            if (this.state.form.level !== null) formData.append(Lang.get('users.privileges.form_input.name'), this.state.form.level.value);
            formData.append(Lang.get('users.form_input.name'), this.state.form.name);
            formData.append(Lang.get('users.form_input.email'), this.state.form.email);
            if (this.state.form.passwords.current.value.length > 0) formData.append(Lang.get('users.form_input.password.current'), this.state.form.passwords.current.value);
            if (this.state.form.passwords.confirm.value.length > 0) formData.append(Lang.get('users.form_input.password.confirm'), this.state.form.passwords.confirm.value);
            if (this.state.form.lang !== null) formData.append(Lang.get('users.form_input.lang'), this.state.form.lang.value);
            if (this.state.form.date_format !== null) formData.append(Lang.get('users.form_input.date_format'), this.state.form.date_format.value);
            let response = await crudUsers(formData);
            if (response.data.params === null) {
                showError(response.data.message);
                this.setState({loading:false});
            } else {
                showSuccess(response.data.message);
                this.setState({loading:false});
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
            <Dialog fullWidth maxWidth="md" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('users.create.form'),update:Lang.get('users.update.form')}}/>
                    <DialogContent dividers>
                        {this.props.user !== null &&
                            this.props.user.meta.company === null &&
                                <div className="form-group row">
                                    <label className="col-md-2 col-form-label text-xs">{Lang.get('companies.labels.name')}</label>
                                    <div className="col-md-4">
                                        <Select options={this.props.companies} value={this.state.form.company} onChange={(e)=>this.handleSelect(e,'company')}
                                                noOptionsMessage={()=>Lang.get('companies.labels.not_found')} isClearable
                                                className="text-xs" styles={FormControlSMReactSelect}
                                                isLoading={this.props.loadings.companies} isDisabled={this.state.loading || this.props.loadings.companies} placeholder={<small>{Lang.get('companies.labels.name')}</small>}/>
                                    </div>
                                </div>
                        }
                        <div className="form-group row">
                            <label className="col-md-2 col-form-label text-xs">{Lang.get('users.privileges.labels.menu')}</label>
                            <div className="col-md-4">
                                <Select options={this.props.levels} value={this.state.form.level}
                                        onChange={(e)=>this.handleSelect(e,'level')}
                                        noOptionsMessage={()=>Lang.get('users.privileges.labels.select.not_found')}
                                        placeholder={<small>{Lang.get('users.privileges.labels.select.label')}</small>}
                                        className="text-xs" styles={FormControlSMReactSelect}
                                        isLoading={this.props.loadings.levels} isDisabled={this.state.loading || this.props.loadings.levels}/>
                            </div>
                            {this.state.form.level !== null &&
                                <div className="col-md-6 text-xs">
                                    <button onMouseEnter={this.handlePopOver} onMouseLeave={this.handlePopOver} type="button" disabled={this.state.loading} className="btn text-xs"><FontAwesomeIcon icon={faInfoCircle} size="sm" className="mr-1"/>{Lang.get('messages.privileges.labels.info')}</button>
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
                                                            {Lang.get(menu.meta.langs.menu)}
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
                                                                            {Lang.get(child.meta.langs.menu)}
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
                            <label htmlFor="input-name" className="col-md-2 col-form-label text-xs">{Lang.get('users.labels.name')}</label>
                            <div className="col-md-10">
                                <input value={this.state.form.name} onChange={this.handleChange} name="name" placeholder={Lang.get('users.labels.name')} className="form-control form-control-sm text-xs" disabled={this.state.loading} id="input-name"/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="input-email" className="col-md-2 col-form-label text-xs">{Lang.get('users.labels.email')}</label>
                            <div className="col-md-4">
                                <input type="email" value={this.state.form.email} onChange={this.handleChange} name="email" placeholder={Lang.get('users.labels.email')} className="form-control form-control-sm text-xs" disabled={this.state.loading} id="input-email"/>
                            </div>
                        </div>
                        {this.state.form.id === null &&
                            <React.Fragment>
                                <div className="form-group row">
                                    <label htmlFor="input-password" className="col-md-2 col-form-label text-xs">{Lang.get('users.labels.password.current')}</label>
                                    <div className="col-md-4">
                                        <div className="input-group input-group-sm">
                                            <input type={this.state.form.passwords.current.type} value={this.state.form.passwords.current.value} onChange={this.handleChange} name="value" data-parent="current" placeholder={Lang.get('users.labels.password.current')} className="form-control form-control-sm text-xs" disabled={this.state.loading} id="input-password"/>
                                            <span className="input-group-append">
                                                <button style={{zIndex:0}} data-type="current" onClick={this.handleInputType} type="button" className="btn btn-default btn-flat"><FontAwesomeIcon icon={this.state.form.passwords.current.type === 'password' ? faEye : faEyeSlash }/></button>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="input-confirm" className="col-md-2 col-form-label text-xs">{Lang.get('users.labels.password.confirm')}</label>
                                    <div className="col-md-4">
                                        <div className="input-group input-group-sm">
                                            <input type={this.state.form.passwords.confirm.type} value={this.state.form.passwords.confirm.value} onChange={this.handleChange} name="value" data-parent="confirm" placeholder={Lang.get('users.labels.password.confirm')} className="form-control form-control-sm text-xs" disabled={this.state.loading} id="input-confirm"/>
                                            <span className="input-group-append">
                                                <button style={{zIndex:0}} data-type="confirm" onClick={this.handleInputType} type="button" className="btn btn-default btn-flat"><FontAwesomeIcon icon={this.state.form.passwords.confirm.type === 'password' ? faEye : faEyeSlash }/></button>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                        <div className="form-group row">
                            <label className="col-md-2 text-xs col-form-label">{Lang.get('messages.users.labels.lang.label')}</label>
                            <div className="col-md-3">
                                <Select maxMenuHeight={100} menuPlacement="top" styles={FormControlSMReactSelect} onChange={(e)=>this.handleSelect(e,'lang')} options={langSelect} value={this.state.form.lang} isDisabled={this.state.loading} placeholder={<small>{Lang.get('messages.users.lang.select')}</small>}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-md-2 text-xs col-form-label">{Lang.get('messages.users.labels.date_format.label')}</label>
                            <div className="col-md-3">
                                <Select maxMenuHeight={200} menuPlacement="top" styles={FormControlSMReactSelect} onChange={(e)=>this.handleSelect(e,'date_format')} options={dateFormatSelect} value={this.state.form.date_format} isDisabled={this.state.loading} placeholder={<small>{Lang.get('messages.users.labels.date_format.select')}</small>}/>
                            </div>
                            {this.state.form.date_format !== null &&
                                <>
                                    <label className="col-md-2 col-form-label">{Lang.get('messages.users.labels.date_format.preview')}</label>
                                    <div className="col-md-3">
                                        <div className="form-control form-control-sm text-xs">
                                            {moment().locale(this.state.form.lang.value === 'id' ? 'id_ID' : 'en_EN').format(this.state.form.date_format.value)}
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        loading={this.state.loading}
                        langs={{create:Lang.get('users.create.submit'),update:Lang.get('users.update.submit')}}/>
                </form>
            </Dialog>
        )
    }
}
export default FormUser;
