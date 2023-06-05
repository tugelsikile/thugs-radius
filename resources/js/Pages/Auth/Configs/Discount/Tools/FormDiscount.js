import React from "react";
import Select from "react-select";
import {NumericFormat} from "react-number-format";
import {parseInputFloat} from "../../../../../Components/mixedConsts";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {logout} from "../../../../../Components/Authentication";
import {crudDiscounts} from "../../../../../Services/ConfigService";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";

// noinspection JSCheckFunctionSignatures,CommaExpressionJS,DuplicatedCode
class FormDiscount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, name : '', company : null, amount : 0, code : '',
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        if (! props.open) {
            form.id = null, form.name = '', form.company = null, form.amount = 0, form.code = '';
        } else {
            if (props.user !== null) {
                if (props.companies !== null) {
                    if (props.companies.length > 0) {
                        let index = props.companies.findIndex((f) => f.value === props.user.meta.company.id);
                        if (index >= 0) {
                            form.company = props.companies[index];
                        }
                    }
                }
            }
            if (props.data != null) {
                form.id = props.data.value, form.name = props.data.label,
                    form.code = props.data.meta.code, form.company = null,
                    form.amount = props.data.meta.amount;
                if (props.companies !== null) {
                    if (props.companies.length > 0) {
                        let index = props.companies.findIndex((f) => f.value === props.data.meta.company.id);
                        if (index >= 0) {
                            form.company = props.companies[index];
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
        if (event.target.name === 'amount') {
            form.amount = parseInputFloat(event);
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
            if (this.state.form.id !== null) formData.append(Lang.get('discounts.form_input.id'), this.state.form.id);
            if (this.state.form.company !== null) formData.append(Lang.get('companies.form_input.name'), this.state.form.company.value);
            formData.append(Lang.get('discounts.form_input.code'), this.state.form.code);
            formData.append(Lang.get('discounts.form_input.name'), this.state.form.name);
            formData.append(Lang.get('discounts.form_input.amount'), this.state.form.amount);

            let response = await crudDiscounts(formData);
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
                            {this.state.form.id === null ? Lang.get('discounts.create.form') : Lang.get('discounts.update.form') }
                        </span>
                    </DialogTitle>
                    <DialogContent dividers>
                        {this.props.user !== null &&
                            this.props.user.meta.company === null &&
                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">{Lang.get('companies.labels.name')}</label>
                                    <div className="col-sm-4">
                                        <Select noOptionsMessage={()=>Lang.get('companies.labels.no_select')} value={this.state.form.company} onChange={this.handleSelect} options={this.props.companies} isLoading={this.props.loadings.companies} isDisabled={this.state.loading || this.props.loadings.companies} isClearable placeholder={<small>{Lang.get('companies.labels.name')}</small>}/>
                                    </div>
                                </div>
                        }
                        <div className="form-group row">
                            <label htmlFor="inputCode" className="col-sm-2 col-form-label">{Lang.get('discounts.labels.code')}</label>
                            <div className="col-sm-4">
                                <input id="inputCode" placeholder={Lang.get('discounts.labels.code')} className="form-control text-sm" disabled={this.state.loading || this.props.loadings.companies} value={this.state.form.code} name="code" onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="inputName" className="col-sm-2 col-form-label">{Lang.get('discounts.labels.name')}</label>
                            <div className="col-sm-10">
                                <input id="inputName" placeholder={Lang.get('discounts.labels.name')} className="form-control text-sm" disabled={this.state.loading || this.props.loadings.companies} value={this.state.form.name} name="name" onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputPercent">{Lang.get('discounts.labels.amount')}</label>
                            <div className="col-sm-2">
                                <NumericFormat disabled={this.state.loading || this.props.loadings.companies} id="inputPercent" className="form-control text-sm text-right"
                                               placeholder={Lang.get('discounts.labels.percent')} value={this.state.form.amount}
                                               name="amount" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions className="justify-content-between">
                        <button type="submit" className="btn btn-success" disabled={this.state.loading || this.props.loadings.companies}>
                            {this.state.loading ? <i className="fas fa-spin fa-circle-notch mr-1"/> : <i className="fas fa-save mr-1"/> }
                            {this.state.form.id === null ? Lang.get('discounts.create.button') : Lang.get('discounts.update.button')}
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
export default FormDiscount;
