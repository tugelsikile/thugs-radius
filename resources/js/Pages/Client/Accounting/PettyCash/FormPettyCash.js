import React from "react";
import {PettyCashTypeList} from "./Mixed";
import moment from "moment";
import {ModalFooter, ModalHeader} from "../../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import id from "date-fns/locale/id";
import en from "date-fns/locale/en-US";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import {FormControlSMReactSelect, parseInputFloat, responseMessage} from "../../../../Components/mixedConsts";
import {NumericFormat} from "react-number-format";
import {crudPettyCash} from "../../../../Services/AccountingService";
import {showError, showSuccess} from "../../../../Components/Toaster";
registerLocale("id", id);
registerLocale("en", en);

// noinspection CommaExpressionJS,DuplicatedCode
class FormPettyCash extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, name : '', description : '', amount : 0, period : null,
                type : PettyCashTypeList[0], need_approve : true,
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChangePeriod = this.handleChangePeriod.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelectType = this.handleSelectType.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        let index;
        if (nextProps.open) {
            if (nextProps.period !== null) {
                form.period = moment(nextProps.period).toDate();
            }
            if (nextProps.data !== null) {
                if (form.id === null || form.period === null || form.name.length === 0 || form.description.length === 0) {
                    form.id = nextProps.data.value,
                        form.period = moment(nextProps.data.period).toDate(),
                        form.name = nextProps.data.label,
                        form.description = nextProps.data.meta.description,
                        form.amount = nextProps.data.meta.amount,
                        form.need_approve = nextProps.data.meta.timestamps.approve.has;
                    index = PettyCashTypeList.findIndex((f)=> f.value === nextProps.data.meta.type);
                    if (index >= 0) {
                        form.type = PettyCashTypeList[index];
                        if (form.type.value === "output") {
                            form.amount = form.amount - form.amount - form.amount;
                        }
                    }
                }
            }
        } else {
            form.id = null, form.name = '', form.description = '', form.amount = 0, form.period = null,
                form.type = PettyCashTypeList[0], form.need_approve = true;
        }
        this.setState({form});
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
    handleSelectType(value) {
        let form = this.state.form;
        form.type = value;
        this.setState({form});
    }
    handleChangePeriod(value) {
        let form = this.state.form;
        form.period = value;
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            if (this.state.form.id !== null) formData.append(Lang.get('petty_cash.form_input.id'), this.state.form.id);
            formData.append(Lang.get('petty_cash.form_input.name'), this.state.form.name);
            formData.append(Lang.get('petty_cash.form_input.description'), this.state.form.description);
            formData.append(Lang.get('petty_cash.form_input.amount'), this.state.form.amount);
            if (this.state.form.type !== null) formData.append(Lang.get('petty_cash.form_input.type'), this.state.form.type.value);
            if (this.state.form.period !== null) formData.append(Lang.get('petty_cash.form_input.period'), moment(this.state.form.period).format('yyyy-MM-DD'));
            formData.append(Lang.get('petty_cash.form_input.approve'), this.state.form.need_approve ? "1" : "0");

            let response = await crudPettyCash(formData);
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
                <Dialog fullWidth maxWidth="sm" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                    <form onSubmit={this.handleSave}>
                        <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('petty_cash.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('petty_cash.labels.menu')})}}/>
                        <DialogContent dividers={true}>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('petty_cash.labels.period')}</label>
                                <div className="col-md-5">
                                    {this.state.form.id === null ?
                                        <DatePicker showFullMonthYearPicker
                                                    selected={this.state.form.period}
                                                    maxDate={new Date()} minDate={moment(this.state.form.period).startOf('month').toDate()}
                                                    className="form-control form-control-sm text-sm"
                                                    title={Lang.get('petty_cash.labels.period')}
                                                    disabled={this.state.loading}
                                                    locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                                                    onChange={this.handleChangePeriod} dateFormat="dd MMMM yyyy"/>
                                        :
                                        <div className="form-control-sm form-control text-xs">{moment(this.state.form.period).format('DD MMMM yyyy')}</div>
                                    }
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('petty_cash.labels.type')}</label>
                                <div className="col-md-5">
                                    {this.state.form.id === null ?
                                        <Select options={PettyCashTypeList} value={this.state.form.type}
                                                onChange={this.handleSelectType}
                                                styles={FormControlSMReactSelect} className="text-xs"
                                                noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('petty_cash.labels.type')})}
                                                placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('petty_cash.labels.type')})}
                                                isDisabled={this.state.loading}/>
                                        :
                                        <div className="form-control form-control-sm text-xs">{this.state.form.type.label}</div>
                                    }
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('petty_cash.labels.name')}</label>
                                <div className="col-md-8">
                                    <input className="form-control form-control-sm text-xs" value={this.state.form.name} name="name" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('petty_cash.labels.name')}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('petty_cash.labels.description')}</label>
                                <div className="col-md-8">
                                    <textarea className="form-control form-control-sm text-xs" value={this.state.form.description} name="description" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('petty_cash.labels.description')} style={{resize:'none'}}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 text-xs">{Lang.get('petty_cash.labels.amount')}</label>
                                <div className="col-md-5">
                                    <div className="input-group input-group-sm">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">IDR</span>
                                        </div>
                                        <NumericFormat disabled={this.state.loading}
                                                       className="form-control form-control-sm text-xs text-right"
                                                       name="amount" onChange={this.handleChange}
                                                       allowLeadingZeros={false}
                                                       placeholder={Lang.get('petty_cash.labels.amount')}
                                                       value={this.state.form.amount}
                                                       decimalScale={2}
                                                       decimalSeparator=","
                                                       thousandSeparator="."/>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                        <ModalFooter
                            form={this.state.form} handleClose={()=>this.props.handleClose()}
                            loading={this.state.loading}
                            pendings={{create:Lang.get('labels.create.pending',{Attribute:Lang.get('petty_cash.labels.menu')}),update:Lang.get('labels.update.pending',{Attribute:Lang.get('petty_cash.labels.menu')})}}
                            langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('petty_cash.labels.menu')}),update:Lang.get('labels.update.label',{Attribute:Lang.get('petty_cash.labels.menu')})}}/>
                    </form>
                </Dialog>
            </React.Fragment>
        )
    }
}
export default FormPettyCash;
