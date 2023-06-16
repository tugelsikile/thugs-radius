import React from "react";

import moment from "moment";
import {responseMessage} from "../../../../../Components/mixedConsts";
import {generateCustomerInvoice} from "../../../../../Services/CustomerService";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {ModalFooter, ModalHeader} from "../../../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import id from "date-fns/locale/id";
import en from "date-fns/locale/en-US";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfo} from "@fortawesome/free-solid-svg-icons";
import HtmlParser from "react-html-parser";
registerLocale("id", id);
registerLocale("en", en);

// noinspection JSCheckFunctionSignatures
class GenerateInvoice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                bill_period : new Date(), id : null,
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    componentWillReceiveProps(props) {
        if (! props.open) {
            if ( typeof props.bill_period !== 'undefined') {
                if (props.bill_period !== null) {
                    let form = this.state.form;
                    form.bill_period = moment(props.bill_period).toDate();
                    this.setState({form});
                }
            }
        }
    }

    handleChange(e) {
        let form = this.state.form;
        form.bill_period = e;
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method','put');
            if (this.state.form.bill_period !== null) formData.append(Lang.get('invoices.form_input.bill_period'), moment(this.state.form.bill_period).format('yyyy-MM-DD'));
            let response = await generateCustomerInvoice(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                this.props.handleClose();
                this.props.handleUpdate();
                showSuccess(response.data.message);
            }
        } catch (err) {
            this.setState({loading:false});
            responseMessage(err);
        }
    }
    render() {
        return (
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('invoices.generate.form'),update:Lang.get('invoices.generate.form')}}/>
                    <DialogContent dividers>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label text-sm">{Lang.get('invoices.labels.bill_period.label')}</label>
                            <div className="col-sm-4">
                                <DatePicker showMonthYearPicker showFullMonthYearPicker
                                            selected={this.state.form.bill_period} maxDate={new Date()} title={Lang.get('invoices.labels.bill_period.select')}
                                            className="form-control text-sm" disabled={this.state.loading}
                                            locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                                            onChange={this.handleChange} dateFormat="MMMM yyyy"/>
                            </div>
                        </div>
                        <div className="alert alert-primary">
                            <h5><FontAwesomeIcon className="mr-2" icon={faInfo}/> {Lang.get('invoices.generate.info.title')}</h5>
                            {HtmlParser(Lang.get('invoices.generate.info.text').replaceAll("\n",'<br/>'))}
                            <ol>
                                <li>{HtmlParser(Lang.get('invoices.generate.info.criteria.1'))}</li>
                                <li>{HtmlParser(Lang.get('invoices.generate.info.criteria.2'))}</li>
                                <li>{HtmlParser(Lang.get('invoices.generate.info.criteria.3'))}</li>
                                <li>{HtmlParser(Lang.get('invoices.generate.info.criteria.4'))}</li>
                                <li>{HtmlParser(Lang.get('invoices.generate.info.criteria.5'))}</li>
                            </ol>
                        </div>
                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        loading={this.state.loading}
                        langs={{create:Lang.get('invoices.generate.submit'),update:Lang.get('invoices.generate.submit')}}/>
                </form>
            </Dialog>
        );
    }
}
export default GenerateInvoice;
