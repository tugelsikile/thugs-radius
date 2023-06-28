import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowCircleRight,
    faCartShopping,
    faCashRegister, faCircleNotch,
    faMoneyBillTransfer, faRefresh, faSyncAlt,
    faUserTie
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import {
    CardPreloader,
    customPreventDefault,
    formatLocaleDate,
    formatLocaleString, ucFirst, ucWord, wordLimit
} from "../../../../Components/mixedConsts";
import {MenuIcon} from "../../User/Privilege/Tools/IconTool";
import {DataNotFound} from "../../../../Components/TableComponent";
import {FormatPrice, sumGrandtotalCustomer} from "../../Customer/Tools/Mixed";
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
export const TableOnlineCustomer = (props) => {
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
                <th className="align-middle text-xs">{Lang.get('labels.date',{Attribute:Lang.get('labels.online',{Attribute:Lang.get('customers.labels.menu')})})}</th>
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
                    <tr key={item.value}>
                        <td className="align-middle text-xs text-center pl-2">{index + 1}</td>
                        <td className="align-middle text-xs">{item.meta.customer === null ? item.label : item.meta.customer.name}</td>
                        <td className="align-middle text-xs">{item.meta.customer === null ? null : item.meta.customer.method_type}</td>
                        <td className="align-middle text-xs">{sumDuration(item.meta.duration)}</td>
                        <td className="align-middle text-xs">{item.meta.ip}</td>
                        <td className="align-middle text-xs">{item.meta.mac}</td>
                        <td colSpan={2} className="align-middle text-xs pr-2">{formatLocaleDate(item.meta.at)}</td>
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
