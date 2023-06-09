import React from "react";
import Select from "react-select";
import {
    formatLocalePeriode, formatLocaleString,
    FormControlSMReactSelect,
    responseMessage,
    ucWord
} from "../../../../Components/mixedConsts";
import {CustomerReactSelectComponent, formatVA, PaymentChannelReactSelectComponent} from "./Mixed";
import {crudCustomerInvoices, crudCustomers} from "../../../../Services/CustomerService";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCartShopping,
    faCircleNotch,
    faExclamationTriangle, faFileImage,
    faQrcode,
    faRefresh
} from "@fortawesome/free-solid-svg-icons";
import {showError, showSuccess} from "../../../../Components/Toaster";
import moment from "moment";
import {sumGrandTotalInvoice} from "../../Customer/Invoice/Tools/Mixed";
import {
    generateQRTransactionDUITKU, paymentChannelDUITKU,
    statusTransactionBRIAPI,
    statusTransactionDUITKU
} from "../../../../Services/PaymentGatewayService";
import {faCopy} from "@fortawesome/free-regular-svg-icons";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";

// noinspection CommaExpressionJS
class OnlinePayment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadings : { customers : false, form : false, invoice : false, transaction : false },
            form : {
                customer : null, payment_gateway : null,
                invoice : null, transaction : null, channel : null,
            },
            customers : [], channels : [],
        };
        this.timer = null;
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSearchCustomer = this.handleSearchCustomer.bind(this);
        this.loadInvoice = this.loadInvoice.bind(this);
        this.loadTransactionStatus = this.loadTransactionStatus.bind(this);
        this.generateQR = this.generateQR.bind(this);
        this.loadPaymentChannel = this.loadPaymentChannel.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.payment_gateways !== null) {
            if (nextProps.payment_gateways.length > 0) {
                if (nextProps.payment_gateways.filter((f)=> f.meta.timestamps.active.at !== null).length > 0) {
                    if (nextProps.payment_gateways.filter((f)=> f.meta.timestamps.active.at !== null).length === 1) {
                        let form = this.state.form;
                        let index = nextProps.payment_gateways.findIndex((f)=> f.meta.timestamps.active.at !== null);
                        if (index >= 0) {
                            form.payment_gateway = nextProps.payment_gateways[index];
                            this.setState({form},()=>{
                                if (form.payment_gateway !== null) {
                                    if (form.payment_gateway.meta.module === 'duitku') {
                                        this.loadPaymentChannel();
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
    }
    handleSelect(value, name) {
        let form = this.state.form;
        form[name] = value;
        if (name === 'channel') {
            this.setState({form});
        } else if (name === 'payment_gateway') {
            this.setState({form},()=>{
                if (form.payment_gateway !== null) {
                    if (form.payment_gateway.meta.module === 'duitku') {
                        this.loadPaymentChannel();
                    }
                }
            });
        } else if (name === 'customer'){
            form.invoice = null;
            this.setState({form},()=>this.loadInvoice());
        }
    }
    handleSearchCustomer(keywords) {
        clearTimeout(this.timer);
        let loadings = this.state.loadings;
        this.timer = setTimeout(()=> {
            if (keywords !== null) {
                if (keywords.length > 0) {
                    loadings.customers = true;
                    this.setState({loadings},()=>{
                        this.searchCustomer(keywords)
                            .then((response)=>this.setState({customers:response}))
                            .then(()=>{
                                loadings.customers = false;
                                this.setState({loadings});
                            });
                    });
                }
            }
        }, 1000);
    }
    async loadPaymentChannel() {
        if (! this.state.loadings.transaction) {
            if (this.state.form.payment_gateway !== null) {
                if (this.state.form.payment_gateway.meta.module === 'duitku') {
                    let loadings = this.state.loadings;
                    loadings.transaction = true; this.setState({loadings,channels:[]});
                    try {
                        const formData = new FormData();
                        formData.append('order_amount', 0);
                        formData.append('company', this.props.user.meta.company.id);
                        formData.append('gateway', this.state.form.payment_gateway.value);
                        let response = await paymentChannelDUITKU(formData);
                        if (response.data.params === null) {
                            loadings.transaction = false; this.setState({loadings});
                        } else {
                            loadings.transaction = false;
                            this.setState({loadings,channels:response.data.params});
                        }
                    } catch (e) {
                        console.log('channel', e);
                        loadings.transaction = false; this.setState({loadings});
                        responseMessage(e);
                    }
                }
            }
        }
    }
    async generateQR() {
        if (! this.state.loadings.transaction) {
            if (this.state.form.customer !== null && this.state.form.invoice !== null && this.state.form.payment_gateway !== null) {
                if (['duitku'].indexOf(this.state.form.payment_gateway.meta.module) !== -1) {
                    let loadings = this.state.loadings;
                    loadings.transaction = true; this.setState({loadings});
                    try {
                        const formData = new FormData();
                        if (this.state.form.channel !== null) {
                            formData.append('channel', this.state.form.channel.value);
                            formData.append('fee', this.state.form.channel.fee);
                        }
                        formData.append('company', this.props.user.meta.company.id);
                        formData.append('order_id', this.state.form.invoice.meta.order_id);
                        formData.append('order_amount', sumGrandTotalInvoice(this.state.form.invoice));
                        formData.append('gateway', this.state.form.payment_gateway.value);
                        let response = null;
                        switch (this.state.form.payment_gateway.meta.module) {
                            case 'duitku':
                                response = await generateQRTransactionDUITKU(formData);
                                break;
                        }
                        if (response !== null) {
                            if (response.data.params === null) {
                                loadings.transaction = false; this.setState({loadings});
                                showError(response.data.message);
                            } else {
                                loadings.transaction = false;
                                let form = this.state.form;
                                form.transaction = response.data.params;
                                this.setState({loadings,form});
                            }
                        } else {
                            loadings.transaction = false; this.setState({loadings});
                        }
                    } catch (e) {
                        loadings.transaction = false; this.setState({loadings});
                        responseMessage(e);
                    }
                }
            }
        }
    }
    async loadTransactionStatus() {
        if (! this.state.loadings.transaction ) {
            if (this.state.form.customer !== null && this.state.form.invoice !== null && this.state.form.payment_gateway !== null) {
                if (this.state.form.customer.meta.company !== null) {
                    let loadings = this.state.loadings;
                    loadings.transaction = true; this.setState({loadings});
                    try {
                        const formData = new FormData();
                        formData.append('company', this.state.form.customer.meta.company);
                        formData.append('order_id', this.state.form.invoice.meta.order_id);
                        formData.append('order_amount', sumGrandTotalInvoice(this.state.form.invoice));
                        formData.append('gateway', this.state.form.payment_gateway.value);
                        let response = null;
                        switch (this.state.form.payment_gateway.meta.module) {
                            case 'briapi':
                                response = await statusTransactionBRIAPI(formData);
                                break;
                            case 'duitku':
                                response = await statusTransactionDUITKU(formData);
                                break;
                        }
                        if (response !== null) {
                            if (response.data.params === null) {
                                loadings.transaction = false; this.setState({loadings});
                                showError(response.data.message);
                            } else {
                                let form = this.state.form;
                                form.transaction = response.data.params;
                                loadings.transaction = false;
                                this.setState({loadings,form});
                            }
                        }
                    } catch (e) {
                        loadings.transaction = false; this.setState({loadings});
                        console.log(e);
                        //responseMessage(e);
                    }
                }
            }
        }
    }
    async loadInvoice(e = null) {
        if (e !== null) {
            if (typeof e.preventDefault() !== 'undefined') {
                e.preventDefault();
            }
        }
        if (! this.state.loadings.invoice ) {
            let form = this.state.form;
            form.invoice = null, form.transaction = null;
            let loadings = this.state.loadings;
            loadings.invoice = true; this.setState({loadings,form});
            try {
                const formData = new FormData();
                formData.append(Lang.get('invoices.form_input.bill_period'), moment().format('yyyy-MM-DD'));
                formData.append('regenerate',true);
                if (this.state.form.customer !== null) formData.append(Lang.get('customers.form_input.id'), this.state.form.customer.value);
                let response = await crudCustomerInvoices(formData,true);
                if (response.data.params === null) {
                    loadings.invoice = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.invoice = false;
                    if (response.data.params.length > 0) {
                        form.invoice = response.data.params[0];
                    }
                    this.setState({loadings,form},()=>{
                        if (form.invoice !== null) {
                            if (form.payment_gateway.module === 'duitku') {
                                this.loadPaymentChannel();
                            }
                            this.loadTransactionStatus();
                        }
                    });
                }
            } catch (e) {
                loadings.invoice = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async searchCustomer(keyword) {
        try {
            const formData = new FormData();
            formData.append(Lang.get('labels.form_input.keywords'), keyword);
            let response = await crudCustomers(formData);
            if (response.data.params === null) {
                console.log(response.data.message);
                return [];
            } else {
                return response.data.params;
            }
        } catch (e) {
            console.log(e);
            return [];
        }
    }
    render() {
        return (
            <div className="p-3">
                <div className="form-group row">
                    <label className="col-md-3 col-form-label text-xs">{Lang.get('gateways.labels.name')}</label>
                    <div className="col-md-8">
                        <Select className="text-xs" value={this.state.form.payment_gateway}
                                onChange={(e)=>this.handleSelect(e,'payment_gateway')}
                                styles={FormControlSMReactSelect}
                                isLoading={this.props.loadings.payment_gateways}
                                isDisabled={this.state.loadings.form}
                                placeholder={<small>{Lang.get('labels.select.option',{Attribute:Lang.get('gateways.labels.menu')})}</small>}
                                noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('gateways.labels.menu')})}
                                options={this.props.payment_gateways.filter((f)=> f.meta.timestamps.active.at !== null)}/>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-md-3 col-form-label text-xs">{Lang.get('customers.labels.name')}</label>
                    <div className="col-md-8">
                        <Select className="text-xs" value={this.state.form.customer}
                                onChange={(e)=>this.handleSelect(e,'customer')}
                                styles={FormControlSMReactSelect}
                                components={{Option:CustomerReactSelectComponent}}
                                onInputChange={(value)=>this.handleSearchCustomer(value)}
                                onMenuClose={()=>{let loadings = this.state.loadings; loadings.customers = false; this.setState({loadings});}}
                                isLoading={this.state.loadings.customers}
                                isDisabled={this.state.loadings.form}
                                placeholder={<small>{Lang.get('labels.search',{Attribute:Lang.get('customers.labels.menu')})}</small>}
                                noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('customers.labels.menu')})}
                                options={this.state.customers}/>
                    </div>
                </div>
                {this.state.form.customer === null ?
                    <div className="alert alert-warning"><FontAwesomeIcon icon={faExclamationTriangle} size="sm" className="mr-2"/>{Lang.get('labels.not_found',{Attribute:Lang.get('customers.labels.menu')})}</div>
                    :
                    <React.Fragment>
                        <div className="form-group row">
                            <label className="col-md-3 col-form-label text-xs">{Lang.get('customers.labels.address.tab')}</label>
                            <div className="col-md-9">
                                <div style={{height:50}} className="form-control-sm form-control text-xs">
                                    {this.state.form.customer.meta.address.street}
                                    {this.state.form.customer.meta.address.village !== null && `, ${ucWord(this.state.form.customer.meta.address.village.name)}`}
                                    {this.state.form.customer.meta.address.district !== null && `, ${ucWord(this.state.form.customer.meta.address.district.name)}`}
                                    {this.state.form.customer.meta.address.city !== null && `, ${ucWord(this.state.form.customer.meta.address.city.name)}`}
                                    {this.state.form.customer.meta.address.province !== null && `, ${ucWord(this.state.form.customer.meta.address.province.name)}`}
                                    {` ${this.state.form.customer.meta.address.postal}`}
                                </div>
                            </div>
                        </div>
                        {this.state.form.invoice === null ?
                            <div className="alert alert-warning"><FontAwesomeIcon icon={faExclamationTriangle} size="sm" className="mr-2"/>{Lang.get('labels.not_found',{Attribute:Lang.get('customers.invoices.labels.menu')})}</div>
                            :
                            <div className="row">
                                <div className={this.state.form.transaction === null ? "col-md-12" : typeof this.state.form.transaction.invoice.pg_transaction.qrString === 'undefined' ? "col-md-12" : "col-md-8"}>
                                    <div className="card card-outline card-primary">
                                        <div className="card-header px-2">
                                            <h3 className="card-title text-sm">{Lang.get('customers.invoices.labels.menu')}</h3>
                                            <div className="card-tools" style={{marginTop:'-5px'}}>
                                                <button type="button" className="btn btn-xs btn-tool" disabled={this.state.loadings.invoice} onClick={this.loadInvoice}><FontAwesomeIcon spin={this.state.loadings.invoice} size="xs" icon={this.state.loadings.invoice ? faCircleNotch : faRefresh}/></button>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="form-group row">
                                                <label className="col-md-5 col-form-label text-xs">{Lang.get('invoices.labels.bill_period.label')}</label>
                                                <div className="col-md-7">
                                                    <div className="form-control form-control-sm text-xs">{formatLocalePeriode(this.state.form.invoice.meta.period,'MMMM yyyy')}</div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-md-5 col-form-label text-xs">{Lang.get('invoices.labels.code')}</label>
                                                <div className="col-md-7">
                                                    <div className="form-control-sm form-control text-xs">{this.state.form.invoice.label}</div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-md-5 col-form-label text-xs">{Lang.get('invoices.labels.order_id')}</label>
                                                <div className="col-md-7">
                                                    <div className="form-control-sm form-control text-xs">{this.state.form.invoice.meta.order_id}</div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-md-5 col-form-label text-xs">{Lang.get('invoices.labels.status.label')}</label>
                                                <div className="col-md-7">
                                                    <div className="input-group input-group-sm">
                                                        <div className={this.state.form.invoice.meta.timestamps.paid.at !== null ? "form-control text-xs text-bold text-success" : this.state.form.transaction === null ? "form-control text-xs" : this.state.form.transaction.statusMessage.toLowerCase() === 'success' ? "form-control text-xs text-bold text-success" : "form-control text-xs"}>
                                                            {this.state.form.invoice.meta.timestamps.paid.at !== null ?
                                                                Lang.get('gateways.module.duitku.status.success')
                                                                :
                                                                this.state.form.transaction !== null ?
                                                                    Lang.get(`gateways.module.${this.state.form.payment_gateway.meta.module}.status.${this.state.form.transaction.statusMessage.toLowerCase()}`)
                                                                    :
                                                                    Lang.get('labels.pending',{Attribute:Lang.get('invoices.payments.name')})
                                                                }
                                                        </div>
                                                        <span className="input-group-append">
                                                            <button title={Lang.get('labels.refresh',{Attribute:Lang.get('invoices.labels.status.label')})} disabled={this.state.loadings.transaction} onClick={this.loadTransactionStatus} type="button" className="btn btn-default btn-flat">
                                                                <FontAwesomeIcon size="xs" spin={this.state.loadings.transaction} icon={this.state.loadings.transaction ? faCircleNotch : faRefresh}/>
                                                            </button>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-md-5 col-form-label text-xs">{Lang.get('invoices.labels.cards.total')}</label>
                                                <div className="col-md-5">
                                                    <div className="input-group input-group-sm">
                                                        <div className="input-group-prepend"><span className="input-group-text">IDR</span></div>
                                                        <div className="form-control-sm form-control text-right text-bold text-sm">{formatLocaleString(sumGrandTotalInvoice(this.state.form.invoice),0)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            {this.state.form.transaction === null ?
                                                <React.Fragment>
                                                    {this.state.form.payment_gateway === null ? null :
                                                        this.state.form.payment_gateway.meta.module !== 'duitku' ? null :
                                                            <React.Fragment>
                                                                <div className="form-group row">
                                                                    <label className="col-md-5 col-form-label text-xs">
                                                                        {Lang.get('labels.channel',{Attribute:Lang.get('labels.payment',{Attribute:Lang.get('customers.labels.menu')})})}
                                                                    </label>
                                                                    <div className="col-md-6">
                                                                        <Select onChange={(e)=>this.handleSelect(e,'channel')}
                                                                                styles={FormControlSMReactSelect} menuPlacement="top"
                                                                                components={{Option:PaymentChannelReactSelectComponent}}
                                                                                noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('labels.channel',{Attribute:Lang.get('labels.payment',{Attribute:Lang.get('customers.labels.menu')})})})}
                                                                                placeholder={<small>{Lang.get('labels.select.option',{Attribute:Lang.get('labels.channel',{Attribute:Lang.get('labels.payment',{Attribute:Lang.get('customers.labels.menu')})})})}</small>}
                                                                                options={this.state.channels} value={this.state.form.channel}/>
                                                                    </div>
                                                                    <div className="col-md-1">
                                                                        <button disabled={this.state.loadings.transaction} onClick={this.loadPaymentChannel} className="btn btn-sm btn-outline-primary">
                                                                            <FontAwesomeIcon icon={faRefresh} size="sm"/>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                {this.state.form.channel !== null &&
                                                                    <React.Fragment>
                                                                        <div className="form-group row">
                                                                            <label className="col-md-5 col-form-label text-xs">
                                                                                <img src={this.state.form.channel.logo} alt="logo" className="img-thumbnail" style={{maxHeight:70}}/>
                                                                            </label>
                                                                            <div className="col-md-7">
                                                                                <div className="form-group row">
                                                                                    <label className="col-md-4 col-form-label text-xs">Fee</label>
                                                                                    <div className="col-md-8">
                                                                                        <div className="form-control form-control-sm text-xs">{formatLocaleString(this.state.form.channel.fee)}</div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="form-group row">
                                                                            <div className="col-md-7 offset-5 text-right">
                                                                                <button onClick={this.generateQR} type="button" className="btn btn-outline-primary btn-sm text-xs">
                                                                                    <FontAwesomeIcon icon={faCartShopping} size="sm" className="mr-2"/>
                                                                                    CHECKOUT
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </React.Fragment>
                                                                }
                                                            </React.Fragment>
                                                    }
                                                </React.Fragment>
                                                :
                                                <React.Fragment>
                                                    {typeof this.state.form.transaction.invoice.pg_transaction.fee !== 'undefinded' &&
                                                        parseInt(this.state.form.transaction.invoice.pg_transaction.fee) > 0 &&
                                                            <React.Fragment>
                                                                <div className="form-group row">
                                                                    <label className="col-md-5 col-form-label text-xs">{Lang.get('labels.fee')}</label>
                                                                    <div className="col-md-5">
                                                                        <div className="input-group input-group-sm">
                                                                            <div className="input-group-prepend"><span className="input-group-text">IDR</span></div>
                                                                            <div className="form-control-sm form-control text-right text-sm text-bold">{formatLocaleString(parseInt(this.state.form.transaction.invoice.pg_transaction.fee))}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="form-group row">
                                                                    <label className="col-md-5 col-form-label text-xs">{Lang.get('gateways.labels.grand_total')}</label>
                                                                    <div className="col-md-5">
                                                                        <div className="input-group input-group-sm">
                                                                            <div className="input-group-prepend"><span className="input-group-text">IDR</span></div>
                                                                            <div className="form-control-sm form-control text-right text-sm text-bold text-success">{formatLocaleString( sumGrandTotalInvoice(this.state.form.invoice) +parseInt(this.state.form.transaction.invoice.pg_transaction.fee))}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </React.Fragment>
                                                    }
                                                    <div className="form-group row">
                                                        <label className="col-md-5 col-form-label text-xs">{Lang.get('gateways.labels.reference_code')}</label>
                                                        <div className="col-md-7">
                                                            <div className="form-control form-control-sm text-xs">{this.state.form.transaction.reference}</div>
                                                        </div>
                                                    </div>
                                                    {typeof this.state.form.transaction.invoice.pg_transaction.vaNumber !== 'undefined' &&
                                                        <div className="form-group row">
                                                            {/*{console.log(this.state.form.transaction.invoice.pg_transaction.vaNumber.match(/.{1,4}/g) ?? [])}*/}
                                                            <label className="col-md-5 col-form-label text-xs">
                                                                {Lang.get('gateways.labels.va')}
                                                                {this.state.channels.length === 0 ? null :
                                                                    this.state.channels.findIndex((f)=> f.value === this.state.form.transaction.invoice.pg_transaction.channel) < 0 ? null :
                                                                        <span className="text-primary">{` ${this.state.channels[this.state.channels.findIndex((f)=> f.value === this.state.form.transaction.invoice.pg_transaction.channel)].label}`}</span>
                                                                }
                                                            </label>
                                                            <div className="col-md-7">
                                                                <div className="input-group input-group-sm">
                                                                    <div className="form-control-sm form-control text-bold text-primary text-sm">
                                                                        {formatVA(this.state.form.transaction.invoice.pg_transaction.vaNumber)}
                                                                    </div>
                                                                    <div className="input-group-append">
                                                                        <span onClick={(e)=>{
                                                                            e.preventDefault();
                                                                            navigator.clipboard.writeText(this.state.form.transaction.invoice.pg_transaction.vaNumber);
                                                                            showSuccess(Lang.get('gateways.labels.va_copied'));
                                                                        }} title={Lang.get('gateways.labels.copy_va')} style={{cursor:'pointer'}} className="input-group-text"><FontAwesomeIcon icon={faCopy} size="xs"/></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </React.Fragment>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {this.state.form.transaction === null ? null :
                                    typeof this.state.form.transaction.invoice.pg_transaction.qrString === 'undefined' ? null :
                                        <div className="col-md-4">
                                            <div className="card card-outline card-secondary">
                                                <div className="card-header px-2 text-center">
                                                    <h4 className="text-sm card-title">{Lang.get('labels.qr_code',{Attribute:Lang.get('customers.invoices.labels.menu')})}</h4>
                                                </div>
                                                <div style={{background:'#fff'}} className="card-body text-center">
                                                    <div id="qr-code-wrapper" className="text-center position-relative mb-5">
                                                        <QRCode size={150} level="H" value={this.state.form.transaction.invoice.pg_transaction.qrString}/>
                                                        <img className="img-thumbnail img-circle" style={{width:50,position:'absolute',left:0,right:0,top:0,bottom:0,marginLeft:'auto',marginRight:'auto',marginTop:'auto',marginBottom:'auto'}} alt="logo" src={window.origin+'/images/logo-2.png'}/>
                                                    </div>
                                                    <div className="text-muted text-xs">{Lang.get('labels.qr_info',{Attribute:Lang.get('invoices.payments.name')})}</div>
                                                </div>
                                            </div>
                                        </div>
                                }
                            </div>
                        }
                    </React.Fragment>
                }
            </div>
        )
    }
}
export default OnlinePayment;
