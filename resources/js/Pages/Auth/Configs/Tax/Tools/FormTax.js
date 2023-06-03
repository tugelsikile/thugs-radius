import React from "react";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {logout} from "../../../../../Components/Authentication";
import {crudTaxes} from "../../../../../Services/ConfigService";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {parseInputFloat} from "../../../../../Components/mixedConsts";
import Select from "react-select";
import {NumericFormat} from "react-number-format";

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
            if (props.data !== null) {
                form.id = props.data.value,
                    form.name = props.data.label, form.description = props.data.meta.description,
                    form.company = props.data.meta.company, form.percent = props.data.meta.percent,
                    form.code = props.data.meta.code;
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
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <DialogTitle>
                        <button type="button" className="close float-right" onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <span className="modal-title text-sm">
                            {this.state.form.id === null ? Lang.get('taxes.create.form') : Lang.get('taxes.update.form') }
                        </span>
                    </DialogTitle>
                    <DialogContent dividers>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('companies.labels.name')}</label>
                            <div className="col-sm-4">
                                <Select noOptionsMessage={()=>Lang.get('companies.labels.no_select')} value={this.state.form.company} onChange={this.handleSelect} options={this.props.companies} isLoading={this.props.loadings.companies} isDisabled={this.state.loading || this.props.loadings.companies} isClearable placeholder={<small>{Lang.get('companies.labels.name')}</small>}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="inputCode" className="col-sm-2 col-form-label">{Lang.get('taxes.labels.code')}</label>
                            <div className="col-sm-4">
                                <input id="inputCode" placeholder={Lang.get('taxes.labels.code')} className="form-control text-sm" disabled={this.state.loading || this.props.loadings.companies} value={this.state.form.code} name="code" onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="inputName" className="col-sm-2 col-form-label">{Lang.get('taxes.labels.name')}</label>
                            <div className="col-sm-10">
                                <input id="inputName" placeholder={Lang.get('taxes.labels.name')} className="form-control text-sm" disabled={this.state.loading || this.props.loadings.companies} value={this.state.form.name} name="name" onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="inputDescription" className="col-sm-2 col-form-label">{Lang.get('taxes.labels.description')}</label>
                            <div className="col-sm-10">
                                <textarea style={{resize:'none'}} id="inputDescription" placeholder={Lang.get('taxes.labels.description')} className="form-control text-sm" disabled={this.state.loading || this.props.loadings.companies} value={this.state.form.description} name="description" onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputPercent">{Lang.get('taxes.labels.percent')}</label>
                            <div className="col-sm-2">
                                <NumericFormat disabled={this.state.loading || this.props.loadings.companies} id="inputPercent" className="form-control text-sm text-right"
                                               isAllowed={(values) => {
                                                   const { floatValue } = values;
                                                   const MAX_VALUE = 100;
                                                   return floatValue <= MAX_VALUE;
                                               }} placeholder={Lang.get('taxes.labels.percent')}
                                               name="percent" onChange={this.handleChange} allowLeadingZeros={false} value={this.state.form.percent} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions className="justify-content-between">
                        <button type="submit" className="btn btn-success" disabled={this.state.loading || this.props.loadings.companies}>
                            {this.state.loading ? <i className="fas fa-spin fa-circle-notch mr-1"/> : <i className="fas fa-save mr-1"/> }
                            {this.state.form.id === null ? Lang.get('taxes.create.button') : Lang.get('taxes.update.button',null, 'id')}
                        </button>
                        <button type="button" className="btn btn-default" disabled={this.state.loading} onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <i className="fas fa-times mr-1"/> {Lang.get('messages.close')}
                        </button>
                    </DialogActions>
                </form>
            </Dialog>
        )
    }
}

export default FormTax;
