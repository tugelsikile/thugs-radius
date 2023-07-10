import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowCircleRight,
    faCartShopping,
    faCashRegister, faCircleNotch,
    faMoneyBillTransfer, faQrcode, faRefresh, faSyncAlt, faUserSlash,
    faUserTie
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import {
    CardPreloader,
    customPreventDefault,
    formatLocaleDate, formatLocalePeriode,
    formatLocaleString, sumTaxInvoiceSingle, ucWord, wordLimit
} from "../../../../Components/mixedConsts";
import {MenuIcon} from "../../User/Privilege/Tools/IconTool";
import {DataNotFound} from "../../../../Components/TableComponent";
import {FormatPrice, sumCustomerTaxLineForm, sumGrandtotalCustomer} from "../../Customer/Tools/Mixed";
import {sumGrandTotalInvoice, sumSubtotalInvoice, sumTotalPaymentInvoice} from "../../Customer/Invoice/Tools/Mixed";
import {Tooltip} from "@mui/material";
import {getIndex, onMouseOut, onMouseOver} from "../../../Auth/Company/Tools/Mixed";

export const DashboardCardStatus = (props) => {
    let total = 0,paid = 0, taxes = 0;
    props.cards.pendings.map((item)=>{
        total += sumGrandTotalInvoice(item);
    });
    props.cards.pendings.map((item)=>{
        paid += sumTotalPaymentInvoice(item);
    });
    props.cards.pendings.map((item)=>{
        let subtotal = sumSubtotalInvoice(item);
        if (item.meta.taxes.length > 0) {
            item.meta.taxes.map((tax)=>{
                if (tax.meta.tax !== null) {
                    taxes += ( (subtotal * tax.meta.tax.percent ) / 100 );
                }
            })
        }
    });
    let left = total - paid;
    return (
        <div className="row">
            <div className="col-lg-3 col-6">
                <div className="small-box bg-info">
                    {props.loading && <CardPreloader/>}
                    <div className="inner">
                        <h3>{props.cards.customers.length}</h3>
                        <p>{Lang.get('labels.new',{Attribute:Lang.get('customers.labels.menu')})}</p>
                    </div>
                    <div style={{cursor:"pointer"}} onClick={props.onClick} className="icon">
                        <FontAwesomeIcon icon={faUserTie}/>
                    </div>
                    <a href={`${window.origin}/clients/customers`} className="small-box-footer">{Lang.get('labels.more_info')} <FontAwesomeIcon className="ml-2" size="sm" icon={faArrowCircleRight}/></a>
                </div>
            </div>
            <div className="col-lg-3 col-6">
                <div className="small-box bg-success">
                    {props.loading && <CardPreloader/>}
                    <div className="inner">
                        <h3>{formatLocaleString(paid,0)}</h3>
                        <p>{Lang.get('labels.payment',{Attribute:Lang.get('customers.labels.menu')})}</p>
                    </div>
                    <div style={{cursor:"pointer"}} onClick={props.onClick} className="icon">
                        <FontAwesomeIcon icon={faCartShopping}/>
                    </div>
                    <a href={`${window.origin}/clients/customers/invoices?paid_date=${moment().format('yyyy-MM-DD')}`} className="small-box-footer">{Lang.get('labels.more_info')} <FontAwesomeIcon className="ml-2" size="sm" icon={faArrowCircleRight}/></a>
                </div>
            </div>
            <div className="col-lg-3 col-6">
                <div className="small-box bg-warning">
                    {props.loading && <CardPreloader/>}
                    <div className="inner">
                        <h3>{formatLocaleString(props.cards.vouchers.reduce((a,b)=> a + b.price,0),0)}</h3>
                        <p>{Lang.get('labels.sales',{Attribute:Lang.get('customers.hotspot.vouchers.menu')})}</p>
                    </div>
                    <div style={{cursor:"pointer"}} onClick={props.onClick} className="icon">
                        <FontAwesomeIcon icon={faCashRegister}/>
                    </div>
                    <a href={`${window.origin}/clients/customers/hotspot`} className="small-box-footer">{Lang.get('labels.more_info')} <FontAwesomeIcon className="ml-2" size="sm" icon={faArrowCircleRight}/></a>
                </div>
            </div>
            <div className="col-lg-3 col-6">
                <div className="small-box bg-danger">
                    {props.loading && <CardPreloader/>}
                    <div className="inner">
                        <h3>{formatLocaleString(left)}</h3>
                        <p>{Lang.get('labels.pending',{Attribute:Lang.get('customers.invoices.labels.menu')})}</p>
                    </div>
                    <div style={{cursor:"pointer"}} onClick={props.onClick} className="icon">
                        <FontAwesomeIcon icon={faMoneyBillTransfer}/>
                    </div>
                    <a href={`${window.origin}/clients/customers/invoices?status=pending`} className="small-box-footer">{Lang.get('labels.more_info')} <FontAwesomeIcon className="ml-2" size="sm" icon={faArrowCircleRight}/></a>
                </div>
            </div>
        </div>
    )
}
export const DashboardStatusServer = (props) => {
    return (
        <div className="card card-outline card-info">
            {props.loading && <CardPreloader/>}
            <div className="card-header px-3">
                <label className="card-title text-xs h4">{Lang.get('labels.status',{Attribute:'Server'})}</label>
                <div className="card-tools">
                    <button type="button" onClick={()=>props.onRefresh()} className="btn btn-tool btn-xs"><FontAwesomeIcon size="xs" icon={faRefresh}/></button>
                </div>
            </div>
            <div className="card-body p-0">
                <ul className="nav nav-pills flex-column">
                    {props.servers.length === 0 ?
                        <li className="nav-item active"><a href="#" className="nav-link px-2 text-center">{Lang.get('labels.loading',{Attribute:'Servers'})}</a></li>
                        :
                        props.servers.map((item, index)=>
                        <li key={item.id} className="nav-item active">
                            <a href="#" onClick={customPreventDefault} className="nav-link px-2">
                                <Tooltip title={wordLimit(item.message)}>
                                    <FontAwesomeIcon className={item.value ? 'text-success' : 'text-danger'} icon={MenuIcon(item.icon)} size="sm" style={{width:25}}/>
                                </Tooltip>
                                {item.label}
                                <div className="float-right">
                                <span className={`badge ${item.value ? 'badge-success' : 'badge-warning'}`}>
                                    {item.value ? 'ONLINE' : 'OFFLINE'}
                                </span>
                                    {['database','radius'].indexOf(item.type) !== -1 &&
                                        <React.Fragment>
                                            <button type="button" className="btn ml-1 btn-tool btn-xs dropdown-toggle dropdown-icon"
                                                    data-toggle="dropdown">
                                                <span className="sr-only">Toggle Dropdown</span>
                                            </button>
                                            <div className="dropdown-menu" role="menu">
                                                {/*{item.type === 'database' ? null :
                                                    item.value ?
                                                        <button data-index={index} onClick={props.onReload} data-type={item.type} data-value={item.type === 'nas' ? item.id : null} data-action="stop" type="button" className="dropdown-item text-xs"><FontAwesomeIcon icon={faPowerOff} size="sm" className="mr-1"/> Stop</button>
                                                        :
                                                        <button data-index={index} onClick={props.onReload} data-type={item.type} data-value={item.type === 'nas' ? item.id : null} data-action="start" type="button" className="dropdown-item text-xs"><FontAwesomeIcon icon={faPlay} size="sm" className="mr-1"/> Start</button>
                                                }*/}
                                                <button data-index={index} onClick={props.onReload} data-type={item.type} data-value={item.type === 'nas' ? item.id : null} data-action="restart" type="button" className="dropdown-item text-xs"><FontAwesomeIcon icon={faSyncAlt} size="sm" className="mr-1"/> Restart</button>
                                                {/*<button data-index={index} onClick={props.onReload} data-type={item.type} data-value={item.type === 'nas' ? item.id : null} data-action="reboot" type="button" className="dropdown-item text-xs"><FontAwesomeIcon icon={faRefresh} size="sm" className="mr-1"/> Reboot</button>*/}
                                            </div>
                                        </React.Fragment>
                                    }
                                </div>
                            </a>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend,} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {showSuccess} from "../../../../Components/Toaster";
import {faCopy} from "@fortawesome/free-regular-svg-icons";
import QRCode from "react-qr-code";
ChartJS.register( CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);
export const TableOnlineCustomer = (props) => {
    const options = {
        //maintainAspectRatio : false,
        responsive: true,
        //maxBarThickness:5,
        minBarLength:7,
        scales: {
            x: {
                ticks:{
                    stacked: false,
                    display: false
                },
                grid: {
                    stacked: false,
                    display: false,
                }
            },
            y: {
                ticks:{
                    display:false
                },
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                display: false,
                position: 'top', // as const,
            },
            title: {
                display: false,
                text: 'Chart.js Bar Chart',
            },
        },
    };
    const labels = props.chart.labels;

    return (
        <table className="table table-head-fixed table-hover table-striped table-sm">
            <thead>
            <tr>
                <th width={30} className="pl-2 text-xs align-middle">#</th>
                <th className="align-middle text-xs">{Lang.get('customers.labels.name')}</th>
                <th width={100} className="align-middle text-xs">{Lang.get('customers.labels.type')}</th>
                <th className="align-middle text-xs">{Lang.get('labels.duration',{Attribute:''})}</th>
                <th className="align-middle text-xs">{Lang.get('labels.ip',{Attribute:Lang.get('customers.labels.menu')})}</th>
                <th className="align-middle text-xs">{Lang.get('labels.mac',{Attribute:Lang.get('customers.labels.menu')})}</th>
                <th width={150} className="align-middle text-xs">{Lang.get('labels.bytes.all')}</th>
                <th width={50} className="align-middle text-xs pr-2 text-center">
                    <button title="Reload" onClick={props.onClick} className="btn btn-tool" type="button" disabled={props.loading}><FontAwesomeIcon spin={props.loading} icon={props.loading ? faCircleNotch : faRefresh} size="xs"/></button>
                </th>
            </tr>
            </thead>
            <tbody>
            {props.data.length === 0 ?
                <DataNotFound colSpan={8} message={Lang.get('labels.not_found',{Attribute:Lang.get('customers.labels.menu')})}/>
                :
                props.data.map((item,index)=>
                    <tr key={item.meta.username}>
                        <td className="align-middle text-xs text-center pl-2">{index + 1}</td>
                        <td className="align-middle text-xs">{item.label}</td>
                        <td className="align-middle text-xs">{item.meta.type}</td>
                        <td className="align-middle text-xs">{item.meta.duration}</td>
                        <td className="align-middle text-xs">{item.meta.ip}</td>
                        <td className="align-middle text-xs">{item.meta.mac}</td>
                        <td className="align-middle text-xs">
                            <Bar width={70} height={20} options={options} className="mb-1"
                                 data={{labels,datasets:props.chart.customers.findIndex((f)=>f.customer === item.label) < 0 ? [] : props.chart.customers[props.chart.customers.findIndex((f)=>f.customer === item.label)].datasets}} />
                            {/*{formatBytes(item.meta.bytes.split('/')[0],0,true,false)} / {formatBytes(item.meta.bytes.split('/')[1],0,true,false)}*/}
                        </td>
                        <td className="align-middle text-center text-xs pr-2">
                            <button data-value={item.meta.username} disabled={props.loading} onClick={props.onKick} title="Kick User" className="btn btn-outline-danger btn-block btn-xs text-xs">
                                <FontAwesomeIcon icon={faUserSlash} size="xs"/>
                            </button>
                        </td>
                    </tr>
                )
            }
            </tbody>
        </table>
    )
}
export const sumDuration = (minutes) => {
    let response = null;
    if (minutes >= 60) {
        response = formatLocaleString(minutes / 60,0);
    } else {
        response = minutes;
    }
    return `${response} ${Lang.get('labels.times.hours.short')}`;
}
export const TableExpiredCustomer = (props) => {
    return (
        <table className="table table-head-fixed table-hover table-striped table-sm">
            <thead>
            <tr>
                <th width={30} className="pl-2 text-xs align-middle">#</th>
                <th className="align-middle text-xs">{Lang.get('customers.labels.name')}</th>
                <th width={100} className="align-middle text-xs">{Lang.get('customers.labels.type')}</th>
                <th width={120} className="align-middle text-xs">{Lang.get('invoices.labels.amount.label')}</th>
                <th className="align-middle text-xs">{Lang.get('labels.due',{Attribute:Lang.get('customers.invoices.labels.menu')})}</th>
                <th width={50} className="align-middle text-xs pr-2 text-center">
                    <button title="Reload" onClick={props.onClick} className="btn btn-tool" type="button" disabled={props.loading}><FontAwesomeIcon spin={props.loading} icon={props.loading ? faCircleNotch : faRefresh} size="xs"/></button>
                </th>
            </tr>
            </thead>
            <tbody>
            {props.data.length === 0 ?
                <DataNotFound colSpan={7} message={Lang.get('labels.not_found',{Attribute:Lang.get('customers.labels.menu')})}/>
                :
                props.data.map((item,index)=>
                    <tr key={item.value}>
                        <td className="align-middle text-xs text-center pl-2">{index + 1}</td>
                        <td className="align-middle text-xs">{item.label}</td>
                        <td className="align-middle text-xs">{item.meta.auth.type}</td>
                        <td className="align-middle text-xs">{FormatPrice(sumGrandtotalCustomer(item))}</td>
                        <td colSpan={item.meta.invoice === null ? 2 : props.privilege === null ? 2 : typeof props.privilege.payment === 'undefined' ? 2 : props.privilege.payment ? 1 : 2}
                            className={item.meta.invoice === null ? "align-middle text-xs pr-2" : props.privilege === null ? "align-middle text-xs pr-2" : typeof props.privilege.payment === 'undefined' ? "align-middle text-xs pr-2" : props.privilege.payment ? "align-middle text-xs" : "align-middle text-xs pr-2"}>
                            {formatLocaleDate(item.meta.timestamps.due.at)}
                        </td>
                        {item.meta.invoice === null ? null :
                            props.privilege === null ? null :
                                typeof props.privilege.payment === 'undefined' ? null :
                                    ! props.privilege.payment ? null :
                                        <td className="align-middle text-center pr-2">
                                            <button title={Lang.get('labels.payment',{Attribute:Lang.get('customers.invoices.labels.menu')})} className="btn btn-tool btn-sm" disabled={props.loading} onClick={()=>props.onPayment(item.meta.invoice)}><FontAwesomeIcon icon={faCashRegister} size="xs"/></button>
                                        </td>
                        }
                    </tr>
                )
            }
            </tbody>
        </table>
    )
}
export const PaymentChannelReactSelectComponent = ({children, ...props}) => {
    //console.log(children,props, getIndex(props.innerProps.id), props.options.length);
    return (
        <div onMouseOver={onMouseOver} onMouseOut={onMouseOut} id={props.innerProps.id}
             style={{cursor:'pointer',borderBottom : getIndex(props.innerProps.id) === props.options.length ? 'none' : 'solid 1px #ccc'}}
             className="p-2" onClick={()=>props.setValue(props.data)}>
            <div className="text-sm">
                <img alt="logo" style={{height:40,width:40}} src={props.data.logo} className="img-thumbnail float-left mr-1"/>
                <div>
                    <strong>{props.data.label}</strong><br/>
                    Fee : {formatLocaleString(props.data.fee)}
                </div>
            </div>
        </div>
    )
}

export const CustomerReactSelectComponent = ({children, ...props}) => {
    //console.log(children,props, getIndex(props.innerProps.id), props.options.length);
    return (
        <div onMouseOver={onMouseOver} onMouseOut={onMouseOut} id={props.innerProps.id}
             style={{cursor:'pointer',borderBottom : getIndex(props.innerProps.id) === props.options.length ? 'none' : 'solid 1px #ccc'}}
             className="p-2" onClick={()=>props.setValue(props.data)}>
            <div className="text-sm">
                <FontAwesomeIcon icon={faUserTie} size="xs" className="mr-1"/><strong>{props.data.meta.code}</strong> {props.data.label}
                <span className="float-right">
                    {props.data.meta.timestamps.inactive.at !== null ?
                        <span className="badge badge-danger">{Lang.get('customers.labels.status.inactive')}</span>
                        :
                        props.data.meta.timestamps.active.at !== null ?
                            <span className="badge badge-success">{Lang.get('customers.labels.status.active')}</span>
                            :
                            <span className="badge badge-secondary">{Lang.get('customers.labels.status.register')}</span>
                    }
                </span>
            </div>
            <span className="text-muted text-xs">
                {props.data.meta.address.street}
                {props.data.meta.address.village !== null && `, ${ucWord(props.data.meta.address.village.name)}`}
                {props.data.meta.address.district !== null && `, ${ucWord(props.data.meta.address.district.name)}`}
                {props.data.meta.address.city !== null && `, ${ucWord(props.data.meta.address.city.name)}`}
                {props.data.meta.address.province !== null && `, ${ucWord(props.data.meta.address.province.name)}`}
                {` ${props.data.meta.address.postal}`}
            </span>
        </div>
    )
}
export const formatVA = (string) => {
    let response = "";
    let explodes = string.match(/.{1,4}/g) ?? [];
    if (explodes.length > 0) {
        response = explodes.join('-');
    }
    return response;
}
export const TransactionQrCard = (props) => {
    let response = null;
    if (props.form.payment_gateway !== null) {
        switch (props.form.payment_gateway.meta.module){
            case 'duitku':
                response = <TransactionQrDuitku form={props.form} channels={props.channels}/>;
                break;
            case 'midtrans':
                response = <TransactionQrMidtrans form={props.form}/>;
                break;
        }
    }
    return response;
}
export const TransactionMidtrans = (props) => {
    //console.log(props.form.transaction)
    return (
        props.form.transaction === null || ['expire'].indexOf(props.form.transaction.transaction_status) !== -1 ?
            <React.Fragment>
                <div className="form-group row">
                    <div className="col-md-7 offset-5 offset-md-5">
                        <button onClick={props.handleQr} type="button" className="btn btn-outline-primary text-xs">
                            <FontAwesomeIcon icon={faQrcode} className="mr-2"/>
                            GENERATE QR
                        </button>
                    </div>
                </div>
            </React.Fragment>
            :
            null
    )
    /*return (
        props.form.transaction !== null &&
            typeof props.form.transaction.transaction_id !== 'undefined' &&
                <React.Fragment>
                    <div className="form-group row">
                        <label className="col-md-5 col-form-label text-xs">{Lang.get('gateways.labels.reference_code')}</label>
                        <div className="col-md-7">
                            <div className="form-control form-control-sm text-xs">{props.form.transaction.transaction_id}</div>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-md-5 col-form-label text-xs text-danger">{Lang.get('gateways.labels.paid_before')}</label>
                        <div className="col-md-7">
                            <div className="form-control form-control-sm text-xs text-danger">{formatLocaleDate(props.form.transaction.expiry_time)}</div>
                        </div>
                    </div>
                </React.Fragment>
    )*/
}
import AlfamartLogo from "../../../../../../public/images/ALFAMART_LOGO_BARU.png";
import IndomaretLogo from "../../../../../../public/images/Logo_Indomaret.png";
export const StoreLogo = (store)=> {
    if (store === 'alfamart') {
        return <img alt="alfamart" src={AlfamartLogo} height={50}/>;
    } else {
        return <img alt="indomaret" src={IndomaretLogo} height={50}/>;
    }
}
const MidtransCstore = (props) => {
    return (
        <React.Fragment>
            <StoreLogo store={props.form.transaction.store}/>
            <div className="form-group">
                <label className="col-form-label">{Lang.get('gateways.cstore.code')}</label>
                <div className="form-control-sm form-control text-bold">
                    {props.form.transaction.payment_code}
                </div>
            </div>
        </React.Fragment>
    )
}
import logoBri from "../../../../../../public/images/Logo-Bank-BRI-1024x538.png";
import logoMain from "../../../../../../public/images/logo-1.png";
const bankLogo = (bankName)=> {
    let response = logoMain;
    switch (bankName) {
        case 'bri':
            response = logoBri;
            break;
    }
    return response;
}
const MidtransBankTransfer = (props) => {
    return (
        <React.Fragment>
            {props.transaction.va_numbers.map((item)=>
                <div key={item.bank} className="form-group">
                    <label className="col-form-label">
                        <img height={40} src={bankLogo(item.bank)} alt={`${item.bank.toUpperCase()} VA`}/>
                    </label>
                    <div className="form-control-sm form-control text-bold">{formatVA(item.va_number)}</div>
                </div>
            )}
        </React.Fragment>
    )
}
export const TransactionTypeMidtrans = (props) => {
    let response = null;
    if (props.form.transaction !== null) {
        switch (props.form.transaction.payment_type){
            case 'cstore':
                response = <MidtransCstore form={props.form}/>;
                break;
            case 'bank_transfer':
                response = <MidtransBankTransfer transaction={props.form.transaction}/>;
                break;
        }
    }
    return response;
}
export const TransactionQrMidtrans = (props) => {
    return (
        <React.Fragment>
            <div className="col-md-4">
                <div className="card card-outline card-secondary">
                    <div className="card-header px-2 text-center">
                        <h4 className="text-sm card-title">{Lang.get('labels.qr_code',{Attribute:Lang.get('customers.invoices.labels.menu')})}</h4>
                    </div>
                    <div style={{background:'#fff'}} className="card-body text-center">
                        <TransactionTypeMidtrans form={props.form}/>

                        {props.form.transaction !== null &&
                            <React.Fragment>
                                {typeof props.form.transaction.qr_image !== 'undefined' &&
                                        <div style={{background:'#fff'}} className="card-body text-center">
                                            <div id="qr-code-wrapper" className="text-center position-relative mb-5">
                                                {/*<QRCode size={150} level="H" value={props.form.transaction.qr_image}/>*/}
                                                <img src={props.form.transaction.qr_image} style={{width:150,height:150}}/>
                                                {/*<img className="img-thumbnail img-circle" style={{width:50,position:'absolute',left:0,right:0,top:0,bottom:0,marginLeft:'auto',marginRight:'auto',marginTop:'auto',marginBottom:'auto'}} alt="logo" src={window.origin+'/images/logo-2.png'}/>*/}
                                            </div>
                                            <div className="text-muted text-xs">{Lang.get('labels.qr_info',{Attribute:Lang.get('invoices.payments.name')})}</div>
                                        </div>
                                }
                                <div className="form-group">
                                    <label className="col-form-label">{Lang.get('gateways.labels.paid_before')}</label>
                                    <div style={{height:50}} className="form-control form-control-sm text-bold text-danger">{formatLocalePeriode(props.form.transaction.expiry_time,'dddd, DD MMMM yyyy, HH:mm:ss')}</div>
                                </div>
                            </React.Fragment>
                        }
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}
export const TransactionQrDuitku = (props) => {
    return (
        <React.Fragment>
            {props.form.transaction === null ? null :
                typeof props.form.transaction.invoice.pg_transaction.qrString === 'undefined' ? null :
                    <div className="col-md-4">
                        <div className="card card-outline card-secondary">
                            <div className="card-header px-2 text-center">
                                <h4 className="text-sm card-title">{Lang.get('labels.qr_code',{Attribute:Lang.get('customers.invoices.labels.menu')})}</h4>
                            </div>
                            <div style={{background:'#fff'}} className="card-body text-center">
                                <div id="qr-code-wrapper" className="text-center position-relative mb-5">
                                    <QRCode size={150} level="H" value={props.form.transaction.invoice.pg_transaction.qrString}/>
                                    <img className="img-thumbnail img-circle" style={{width:50,position:'absolute',left:0,right:0,top:0,bottom:0,marginLeft:'auto',marginRight:'auto',marginTop:'auto',marginBottom:'auto'}} alt="logo" src={window.origin+'/images/logo-2.png'}/>
                                </div>
                                <div className="text-muted text-xs">{Lang.get('labels.qr_info',{Attribute:Lang.get('invoices.payments.name')})}</div>
                            </div>
                        </div>
                    </div>
            }
        </React.Fragment>
    )
}
export const midtransTransactionItemDetails = (form) => {
    const itemDetails = [];
    form.invoice.meta.services.map((item)=>{
        if (item.meta.service !== null) {
            itemDetails.push({id : item.meta.service.code, price : item.meta.price, quantity : 1, name : item.note});
        }
    });
    form.invoice.meta.taxes.map((item)=>{
        if (item.meta.tax !== null) {
            itemDetails.push({id : item.meta.tax.code, price : parseInt((sumSubtotalInvoice(form.invoice) * item.meta.tax.percent) / 100), quantity : 1, name : item.meta.tax.name });
        }
    });
    form.invoice.meta.discounts.map((item)=>{
        if (item.meta.discount !== null) {
            itemDetails.push({id : item.meta.discount.code, price : 0 - item.meta.discount.amount, quantity : 1, name : item.meta.discount.name})
        }
    });
    return itemDetails;
}
export const midtransTransactionCustomerDetails = (form) => {
    const customerDetails = {
        first_name : form.customer.label,
        billing_address: {},
        shipping_address: {}
    };
    if (form.customer.meta.address.street !== null && form.customer.meta.address.street.length > 0) {
        customerDetails.billing_address.address = form.customer.meta.address.street;
        if (form.customer.meta.address.village !== null) {
            customerDetails.billing_address.address += `, ${ucWord(form.customer.meta.address.village.name)}`;
            if (form.customer.meta.address.district !== null) {
                customerDetails.billing_address.address += `, ${ucWord(form.customer.meta.address.district.name)}`;
            }
        }
    }
    if (form.customer.meta.user !== null) {
        customerDetails.email = form.customer.meta.user.email;
        customerDetails.billing_address.email = customerDetails.email;
    }
    if (form.customer.meta.address.phone !== null && form.customer.meta.address.phone.length > 0) {
        customerDetails.phone = form.customer.meta.address.phone;
        customerDetails.billing_address.phone = customerDetails.phone;
    }
    if (form.customer.meta.address.city !== null) {
        customerDetails.billing_address.city = ucWord(form.customer.meta.address.city.name);
    }
    if (form.customer.meta.address.postal !== null && form.customer.meta.address.postal.length > 0) {
        customerDetails.billing_address.postal_code = form.customer.meta.address.postal;
    }
    customerDetails.billing_address.country_code = 'IDN';
    const user = JSON.parse(localStorage.getItem('user'));
    customerDetails.shipping_address.first_name = user.label;
    customerDetails.shipping_address.email = user.meta.email;
    if (user.meta.company.address !== null && user.meta.company.address.length > 0) {
        customerDetails.shipping_address.address = user.meta.company.address;
        if (user.meta.company.village_obj !== null) {
            customerDetails.shipping_address.address += `, ${ucWord(user.meta.company.village_obj.name)}`;
            if (user.meta.company.district_obj !== null) {
                customerDetails.shipping_address.address += `, ${ucWord(user.meta.company.district_obj.name)}`;
            }
        }
    }
    if (user.meta.company.city_obj !== null) {
        customerDetails.shipping_address.city = ucWord(user.meta.company.city_obj.name);
    }
    if (user.meta.company.postal !== null && user.meta.company.postal.length > 0) {
        customerDetails.shipping_address.postal_code = user.meta.company.postal;
    }
    customerDetails.shipping_address.country_code = 'IDN';
    return customerDetails;
}
export const midtransTransactionDetails = (form = null) => {
    if (form !== null) {
        const parameters = {
            transaction_details : {
                order_id : form.invoice.meta.order_id,
                gross_amount : sumGrandTotalInvoice(form.invoice),
            },
            customer_details : midtransTransactionCustomerDetails(form),
            custom_field1 : form.payment_gateway.meta.company.id,
            custom_field2 : form.payment_gateway.value,
        };

        parameters.transaction_details.item_details = midtransTransactionItemDetails(form);
        return parameters;
    } else {
        return null;
    }
}
export const TransactionCards = (props) => {
    let response = null;
    if (props.form.payment_gateway !== null) {
        switch (props.form.payment_gateway.meta.module){
            case 'duitku':
                response = <TransactionDuitku form={props.form} channels={props.channels}/>;
                break;
            case 'midtrans':
                response = <TransactionMidtrans handleQr={props.handleMidtransQR} form={props.form}/>;
                break;
        }
    }
    return response;
}
export const TransactionDuitku = (props) => {
    return (
        <React.Fragment>
            {typeof props.form.transaction.invoice.pg_transaction.fee !== 'undefinded' &&
                parseInt(props.form.transaction.invoice.pg_transaction.fee) > 0 &&
                <React.Fragment>
                    <div className="form-group row">
                        <label className="col-md-5 col-form-label text-xs">{Lang.get('labels.fee')}</label>
                        <div className="col-md-5">
                            <div className="input-group input-group-sm">
                                <div className="input-group-prepend"><span className="input-group-text">IDR</span></div>
                                <div className="form-control-sm form-control text-right text-sm text-bold">
                                    {formatLocaleString(parseInt(props.form.transaction.invoice.pg_transaction.fee))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-md-5 col-form-label text-xs">{Lang.get('gateways.labels.grand_total')}</label>
                        <div className="col-md-5">
                            <div className="input-group input-group-sm">
                                <div className="input-group-prepend"><span className="input-group-text">IDR</span></div>
                                <div className="form-control-sm form-control text-right text-sm text-bold text-success">
                                    {formatLocaleString( sumGrandTotalInvoice(props.form.invoice) +parseInt(props.form.transaction.invoice.pg_transaction.fee))}
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            }
            <div className="form-group row">
                <label className="col-md-5 col-form-label text-xs">{Lang.get('gateways.labels.reference_code')}</label>
                <div className="col-md-7">
                    <div className="form-control form-control-sm text-xs">{props.form.transaction.reference}</div>
                </div>
            </div>
            {typeof props.form.transaction.invoice.pg_transaction.vaNumber !== 'undefined' &&
                <div className="form-group row">
                    <label className="col-md-5 col-form-label text-xs">
                        {Lang.get('gateways.labels.va')}
                        {props.channels.length === 0 ? null :
                            props.channels.findIndex((f)=> f.value === props.form.transaction.invoice.pg_transaction.channel) < 0 ? null :
                                <span className="text-primary">{` ${props.channels[props.channels.findIndex((f)=> f.value === props.form.transaction.invoice.pg_transaction.channel)].label}`}</span>
                        }
                    </label>
                    <div className="col-md-7">
                        <div className="input-group input-group-sm">
                            <div className="form-control-sm form-control text-bold text-primary text-sm">
                                {formatVA(props.form.transaction.invoice.pg_transaction.vaNumber)}
                            </div>
                            <div className="input-group-append">
                                <span onClick={(e)=>{
                                    e.preventDefault();
                                    navigator.clipboard.writeText(props.form.transaction.invoice.pg_transaction.vaNumber);
                                    showSuccess(Lang.get('gateways.labels.va_copied'));
                                }} title={Lang.get('gateways.labels.copy_va')} style={{cursor:'pointer'}} className="input-group-text"><FontAwesomeIcon icon={faCopy} size="xs"/></span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </React.Fragment>
    )
}
