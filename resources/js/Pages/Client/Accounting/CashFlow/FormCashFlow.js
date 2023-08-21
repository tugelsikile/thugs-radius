import React from "react";
import moment from "moment";
import {ModalFooter, ModalHeader} from "../../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import Select from "react-select";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import id from "date-fns/locale/id";
import en from "date-fns/locale/en-US";
import {NumericFormat} from "react-number-format";
import {FormControlSMReactSelect, parseInputFloat, responseMessage} from "../../../../Components/mixedConsts";
import {crudCashFlow} from "../../../../Services/AccountingService";
import {showError, showSuccess} from "../../../../Components/Toaster";
import {CashFlowType} from "./Mixed";
import FormCategory from "./FormCategory";
import FormAccount from "./FormAccount";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus} from "@fortawesome/free-solid-svg-icons";
registerLocale("id", id);
registerLocale("en", en);

// noinspection CommaExpressionJS
class FormCashFlow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, code : null, account : null, category : null, period : null,
                description : '', amount : 0, type : null,
            },
            modals : {
                account : { open : false, data : null },
                category : { open : false, data : null },
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.toggleAccount = this.toggleAccount.bind(this);
        this.toggleCategory = this.toggleCategory.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        if (nextProps.open) {
            if (nextProps.data !== null) {
                if (form.id === null || form.code === null) {
                    form.id = nextProps.data.value,
                        form.code = nextProps.data.meta.code,
                        form.account = nextProps.data.meta.account,
                        form.category = nextProps.data.meta.category,
                        form.period = moment(nextProps.data.meta.period).toDate(),
                        form.description = nextProps.data.label,
                        form.amount = nextProps.data.meta.amount.amount;
                    let index = CashFlowType.findIndex((f)=> f.value === nextProps.data.meta.type);
                    if (index >= 0) form.type = CashFlowType[index];
                }
            }
        } else {
            form.id = null, form.code = null, form.account = null, form.category = null,
                form.period = null, form.description = '', form.amount = 0, form.type = null;
        }
        this.setState({form});
    }
    toggleCategory(data = null) {
        let modals = this.state.modals;
        modals.category.open = ! this.state.modals.category.open;
        modals.category.data = data;
        this.setState({modals});
    }
    toggleAccount(data = null) {
        let modals = this.state.modals;
        modals.account.open = ! this.state.modals.account.open;
        modals.account.data = data;
        this.setState({modals});
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
    handleSelect(value, name) {
        let form = this.state.form;
        form[name] = value;
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            if (this.state.form.id !== null) formData.append(Lang.get('cash_flow.form_input.id'), this.state.form.id);
            formData.append(Lang.get('cash_flow.form_input.code'), this.state.form.code);
            formData.append(Lang.get('cash_flow.form_input.description'), this.state.form.description);
            formData.append(Lang.get('cash_flow.form_input.amount'), this.state.form.amount);
            if (this.state.form.type !== null) formData.append(Lang.get('cash_flow.form_input.type'), this.state.form.type.value);
            if (this.state.form.period !== null) formData.append(Lang.get('cash_flow.form_input.periods.label'), moment(this.state.form.period).format('yyyy-MM-DD'));
            if (this.state.form.account !== null) formData.append(Lang.get('cash_flow.form_input.account.label'), this.state.form.account.value);
            if (this.state.form.category !== null) formData.append(Lang.get('cash_flow.form_input.category.label'), this.state.form.category.value);

            let response = await crudCashFlow(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
                this.props.handleClose();
                this.props.handleUpdate(response.data.params);
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    render() {
        return (
            <React.Fragment>
                <FormCategory open={this.state.modals.category.open} data={this.state.modals.category.data} handleClose={this.toggleCategory} handleUpdate={this.props.onUpdateCategory}/>
                <FormAccount open={this.state.modals.account.open} data={this.state.modals.account.data} handleClose={this.toggleAccount} handleUpdate={this.props.onUpdateAccount}/>
                <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                    <form onSubmit={this.handleSave}>
                        <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('cash_flow.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('cash_flow.labels.menu')})}}/>
                        <DialogContent dividers={true}>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('cash_flow.labels.code')}</label>
                                <div className="col-md-4">
                                    <input className="form-control-sm form-control text-xs" value={this.state.form.code === null ? '' : this.state.form.code} name="code" onChange={this.handleChange} disabled={this.state.loading || this.state.form.id !== null}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('cash_flow.labels.type')}</label>
                                <div className="col-md-3">
                                    <Select options={CashFlowType}
                                            value={this.state.form.type}
                                            onChange={(e)=>this.handleSelect(e,'type')}
                                            isDisabled={this.state.loading} styles={FormControlSMReactSelect}
                                            noOptionsMessage={()=>Lang.get('labels.select.not_found', {Attribute : Lang.get('cash_flow.labels.type')})}
                                            placeholder={Lang.get('labels.select.option', {Attribute : Lang.get('cash_flow.labels.type')})}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('cash_flow.labels.account.label')}</label>
                                <div className="col-md-4">
                                    <Select options={this.props.accounts}
                                            value={this.state.form.account}
                                            onChange={(e)=>this.handleSelect(e,'account')}
                                            isDisabled={this.state.loading} isLoading={this.props.loadings.accounts} styles={FormControlSMReactSelect}
                                            noOptionsMessage={()=>Lang.get('labels.select.not_found', {Attribute : Lang.get('cash_flow.labels.account.label')})}
                                            placeholder={Lang.get('labels.select.option', {Attribute : Lang.get('cash_flow.labels.account.label')})}/>
                                </div>
                                <div className="col-md-4">
                                    <button onClick={()=>this.toggleAccount(this.state.form.account)} type="button" disabled={this.state.loading || this.props.loadings.accounts} className="btn btn-outline-primary btn-sm">
                                        <FontAwesomeIcon icon={this.state.form.account === null ? faPlus : faPencilAlt} spin={this.props.loadings.accounts}/>
                                    </button>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('cash_flow.labels.category.label')}</label>
                                <div className="col-md-4">
                                    <Select options={this.props.categories}
                                            value={this.state.form.category}
                                            onChange={(e)=>this.handleSelect(e,'category')}
                                            isDisabled={this.state.loading} isLoading={this.props.loadings.categories} styles={FormControlSMReactSelect}
                                            noOptionsMessage={()=>Lang.get('labels.select.not_found', {Attribute : Lang.get('cash_flow.labels.category.label')})}
                                            placeholder={Lang.get('labels.select.option', {Attribute : Lang.get('cash_flow.labels.category.label')})}/>
                                </div>
                                <div className="col-md-4">
                                    <button onClick={()=>this.toggleCategory(this.state.form.category)} type="button" disabled={this.state.loading || this.props.loadings.categories} className="btn btn-outline-primary btn-sm">
                                        <FontAwesomeIcon icon={this.state.form.category === null ? faPlus : faPencilAlt} spin={this.props.loadings.categories}/>
                                    </button>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('cash_flow.labels.period')}</label>
                                <div className="col-md-4">
                                    <DatePicker
                                        selected={this.state.form.period}
                                        onChange={(e)=>this.handleSelect(e, 'period')}
                                        title={Lang.get('cash_flow.labels.period')}
                                        className="form-control text-xs form-control-sm"
                                        disabled={this.state.loading}
                                        locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                                        dateFormat="dd MMMM yyyy"/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('cash_flow.labels.description')}</label>
                                <div className="col-md-8">
                                    <textarea className="form-control form-control-sm text-xs" value={this.state.form.description} name="description" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('cash_flow.labels.description')} style={{resize:'none'}}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('cash_flow.labels.amount')}</label>
                                <div className="col-md-4">
                                    <NumericFormat disabled={this.state.loading}
                                                   className="form-control form-control-sm text-xs text-right"
                                                   name="amount" onChange={this.handleChange}
                                                   allowLeadingZeros={false}
                                                   placeholder={Lang.get('cash_flow.labels.amount')}
                                                   value={this.state.form.amount}
                                                   decimalScale={2} allowNegative={true}
                                                   decimalSeparator=","
                                                   thousandSeparator="."/>
                                </div>
                            </div>
                        </DialogContent>
                        <ModalFooter
                            form={this.state.form} handleClose={()=>this.props.handleClose()}
                            loading={this.state.loading}
                            pendings={{create:Lang.get('labels.create.pending',{Attribute:Lang.get('cash_flow.labels.menu')}),update:Lang.get('labels.update.pending',{Attribute:Lang.get('cash_flow.labels.menu')})}}
                            langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('cash_flow.labels.menu')}),update:Lang.get('labels.update.label',{Attribute:Lang.get('cash_flow.labels.menu')})}}/>
                    </form>
                </Dialog>
            </React.Fragment>
        )
    }
}

export default FormCashFlow;
