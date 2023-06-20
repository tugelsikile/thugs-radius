import React from "react";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {logout} from "../../../../../Components/Authentication";
import {crudTaxes} from "../../../../../Services/ConfigService";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {FormControlSMReactSelect, parseInputFloat} from "../../../../../Components/mixedConsts";
import Select from "react-select";
import {NumericFormat} from "react-number-format";
import {ModalFooter, ModalHeader} from "../../../../../Components/ModalComponent";

// noinspection DuplicatedCode,JSCheckFunctionSignatures
class FormTax extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                name : '', code : '', description : '', company : null, percent : 0, id : null,
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        if (! props.open) {
            form.id = null, form.name = '', form.description = '', form.company = null,
                form.percent = 0, form.code = '';
        } else {
            let index;
            if (props.data === null) {
                if (props.user !== null) {
                    if (props.user.meta.company !== null) {
                        if (props.companies !== null) {
                            if (props.companies.length > 0) {
                                index = props.companies.findIndex((f) => f.value === props.user.meta.company.id);
                                if (index >= 0) {
                                    form.company = props.companies[index];
                                }
                            }
                        }
                    }
                }
            } else {
                form.id = props.data.value,
                    form.name = props.data.label, form.description = props.data.meta.description,
                    form.percent = props.data.meta.percent, form.company = null,
                    form.code = props.data.meta.code;
                if (props.companies !== null) {
                    if (props.data.meta.company !== null) {
                        if (props.companies.length > 0) {
                            index = props.companies.findIndex((f) => f.value === props.data.meta.company.id);
                            if (index >= 0) {
                                form.company = props.companies[index];
                            }
                        }
                    }
                }
            }
        }
        this.setState({form});
    }
    handleSelect(event) {
        let form = this.state.form;
        form.company = event; this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        if (event.target.name === 'percent') {
            form.percent = parseInputFloat(event);
        } else {
            form[event.target.name] = event.target.value;
        }
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            if (this.state.form.id !== null) formData.append(Lang.get('taxes.form_input.id'), this.state.form.id);
            if (this.state.form.company !== null) formData.append(Lang.get('companies.form_input.name'), this.state.form.company.value);
            formData.append(Lang.get('taxes.form_input.name'), this.state.form.name);
            formData.append(Lang.get('taxes.form_input.description'), this.state.form.description);
            formData.append(Lang.get('taxes.form_input.percent'), this.state.form.percent);
            formData.append(Lang.get('taxes.form_input.code'), this.state.form.code);
            let response = await crudTaxes(formData);
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
                <form onSubmit={this.handleSave}>
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('taxes.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('taxes.labels.menu')})}}/>
                    <DialogContent dividers>
                        {this.props.user === null ? null :
                            this.props.user.meta.company !== null ? null :
                                <div className="form-group row">
                                    <label className="col-md-3 text-xs col-form-label">{Lang.get('companies.labels.name')}</label>
                                    <div className="col-md-6">
                                        <Select styles={FormControlSMReactSelect} noOptionsMessage={()=>Lang.get('companies.labels.no_select')} value={this.state.form.company} onChange={this.handleSelect} options={this.props.companies} isLoading={this.props.loadings.companies} isDisabled={this.state.loading || this.props.loadings.companies} isClearable placeholder={<small>{Lang.get('companies.labels.name')}</small>}/>
                                    </div>
                                </div>
                        }
                        <div className="form-group row">
                            <label htmlFor="inputCode" className="col-md-3 text-xs col-form-label">{Lang.get('taxes.labels.code')}</label>
                            <div className="col-md-4">
                                <input id="inputCode" placeholder={Lang.get('taxes.labels.code')} className="form-control form-control-sm text-xs" disabled={this.state.loading || this.props.loadings.companies} value={this.state.form.code} name="code" onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="inputName" className="col-md-3 col-form-label text-xs">{Lang.get('taxes.labels.name')}</label>
                            <div className="col-md-9">
                                <input id="inputName" placeholder={Lang.get('taxes.labels.name')} className="form-control form-control-sm text-xs" disabled={this.state.loading || this.props.loadings.companies} value={this.state.form.name} name="name" onChange={this.handleChange}/>
                            </div>
                        </div>
                        {/*<div className="form-group row">
                            <label htmlFor="inputDescription" className="col-md-2 col-form-label">{Lang.get('taxes.labels.description')}</label>
                            <div className="col-md-10">
                                <textarea style={{resize:'none'}} id="inputDescription" placeholder={Lang.get('taxes.labels.description')} className="form-control text-sm" disabled={this.state.loading || this.props.loadings.companies} value={this.state.form.description} name="description" onChange={this.handleChange}/>
                            </div>
                        </div>*/}
                        <div className="form-group row">
                            <label className="col-md-3 col-form-label text-xs" htmlFor="inputPercent">{Lang.get('taxes.labels.percent')}</label>
                            <div className="col-md-4">
                                <div className="input-group input-group-sm">
                                    <NumericFormat disabled={this.state.loading || this.props.loadings.companies} id="inputPercent" className="form-control text-xs form-control-sm text-right"
                                                   isAllowed={(values) => {
                                                       const { floatValue } = values;
                                                       const MAX_VALUE = 100;
                                                       return floatValue <= MAX_VALUE;
                                                   }} placeholder={Lang.get('taxes.labels.percent')}
                                                   name="percent" onChange={this.handleChange} allowLeadingZeros={false} value={this.state.form.percent} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                                    <div className="input-group-append"><span className="input-group-text">%</span></div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        loading={this.state.loading}
                        langs={{create:Lang.get('labels.create.submit',{Attribute:Lang.get('taxes.labels.menu')}),update:Lang.get('labels.update.submit',{Attribute:Lang.get('taxes.labels.menu')})}}/>
                </form>
            </Dialog>
        )
    }
}

export default FormTax;
