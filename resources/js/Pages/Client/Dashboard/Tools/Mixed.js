import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCartShopping,
    faCashRegister,
    faMoneyBillTransfer, faPlay, faPowerOff, faRedoAlt, faRefresh, faSyncAlt, faTachographDigital,
    faUserTie
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import {CardPreloader, customPreventDefault} from "../../../../Components/mixedConsts";
import {MenuIcon} from "../../User/Privilege/Tools/IconTool";

export const DashboardCardStatus = (props) => {
    return (
        <div className="row">
            <div className="col-lg-3 col-6">
                <div className="small-box bg-info">
                    <div className="inner">
                        <h3>150</h3>
                        <p>{Lang.get('labels.new',{Attribute:Lang.get('customers.labels.menu')})}</p>
                    </div>
                    <div className="icon">
                        <FontAwesomeIcon icon={faUserTie}/>
                    </div>
                    <a href={`${window.origin}/clients/customers`} className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
                </div>
            </div>
            <div className="col-lg-3 col-6">
                <div className="small-box bg-success">
                    <div className="inner">
                        <h3>53<sup style={{fontSize:'20px'}}>%</sup></h3>
                        <p>{Lang.get('labels.payment',{Attribute:Lang.get('customers.labels.menu')})}</p>
                    </div>
                    <div className="icon">
                        <FontAwesomeIcon icon={faCartShopping}/>
                    </div>
                    <a href={`${window.origin}/clients/customers/invoices?paid_date=${moment().format('yyyy-MM-DD')}`} className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
                </div>
            </div>
            <div className="col-lg-3 col-6">
                <div className="small-box bg-warning">
                    <div className="inner">
                        <h3>44</h3>
                        <p>{Lang.get('labels.sales',{Attribute:Lang.get('customers.hotspot.vouchers.menu')})}</p>
                    </div>
                    <div className="icon">
                        <FontAwesomeIcon icon={faCashRegister}/>
                    </div>
                    <a href={`${window.origin}/clients/customers/hotspot`} className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
                </div>
            </div>
            <div className="col-lg-3 col-6">
                <div className="small-box bg-danger">
                    <div className="inner">
                        <h3>65</h3>
                        <p>{Lang.get('labels.pending',{Attribute:Lang.get('customers.invoices.labels.menu')})}</p>
                    </div>
                    <div className="icon">
                        <FontAwesomeIcon icon={faMoneyBillTransfer}/>
                    </div>
                    <a href={`${window.origin}/clients/customers/invoices?status=pending`} className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
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
                                <FontAwesomeIcon className={item.value ? 'text-success' : 'text-danger'} icon={MenuIcon(item.icon)} size="sm" style={{width:25}}/>
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
