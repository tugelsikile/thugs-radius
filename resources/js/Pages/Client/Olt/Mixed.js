import React from "react";
import BtnSort from "../../Auth/User/Tools/BtnSort";
import {Dialog, DialogContent, DialogTitle} from "@mui/material";
import {CardPreloader, parseInputFloat, pipeIp, responseMessage} from "../../../Components/mixedConsts";
import {crudOlt} from "../../../Services/OltService";
import {showError, showSuccess} from "../../../Components/Toaster";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";
import MaskedInput from "react-text-mask";
import {NumericFormat} from "react-number-format";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faPersonBooth, faRefresh} from "@fortawesome/free-solid-svg-icons";
import {faUserCircle} from "@fortawesome/free-regular-svg-icons";

export const TableHeader = (props) => {
    return (
        <tr>
            {props.olt.filtered.length > 0 &&
                <th className="align-middle text-center pl-2" width={30}>
                    <div style={{zIndex:0}} className="custom-control custom-checkbox">
                        <input id={`cbx_${props.type}`} data-id="" disabled={props.loading} onChange={props.onCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                        <label htmlFor={`cbx_${props.type}`} className="custom-control-label"/>
                    </div>
                </th>
            }
            <th className={props.olt.filtered.length === 0 ? "align-middle pl-2" : "align-middle"}>
                <BtnSort sort="name"
                         name={Lang.get('olt.labels.name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th width={150} className="align-middle">
                <BtnSort sort="host"
                         name={Lang.get('olt.labels.host')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th width={100} className="align-middle">
                <BtnSort sort="port"
                         name={Lang.get('olt.labels.port')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="community"
                         name={Lang.get('olt.labels.community.label')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th width={200} className="align-middle">
                <BtnSort sort="uptime"
                         name={Lang.get('olt.labels.uptime')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th width={50} className="align-middle text-center pr-2 text-xs">{Lang.get('messages.action')}</th>
        </tr>
    )
}
const statusGpon = (status) => {
    let response = "";
    switch (status) {
        case 'working':
            response = <span className="badge badge-success">ONLINE</span>;
        break;
        case 'offline':
            response = <span className="badge badge-secondary">OFFLINE</span>;
        break;
        case 'los':
            response = <span className="badge badge-danger">LOS</span>;
        break;
        case 'dyinggasp':
            response = <span className="badge badge-warning">DYING GASP</span>;
        break;
    }
    return response;
}
export const TableContentGponState = (props)=> {
    return (
        <tr key={`x_${props.index}`}>
            <td className="align-middle text-center text-xs pl-2">{props.index + 1}</td>
            <td className="align-middle text-xs">{props.item.onu}</td>
            <td className="align-middle text-xs">
                {props.item.loading && <FontAwesomeIcon className="text-muted mr-2" icon={faCircleNotch} spin={true} size="xs"/>}
                {props.item.details !== null && props.item.details.username}
            </td>
            <td className="align-middle text-xs">
                {props.item.loading && <FontAwesomeIcon className="text-muted mr-2" icon={faCircleNotch} spin={true} size="xs"/>}
                {props.item.details === null ? '-' : props.item.details.customer === null ? '-' : props.item.details.customer.name}
            </td>
            <td className="align-middle text-xs text-center">
                {statusGpon(props.item.phase_state)}
            </td>
            <td className="align-middle text-xs text-center pr-2"></td>
        </tr>
    )
}
const gponStateLists = [
    { value : null, label : 'All', icon : faUserCircle, color : 'text-success', badge : 'badge badge-success' },
    { value : 'working', label : 'Online', icon : faUserCircle, color : 'text-success', badge : 'badge badge-success' },
    { value : 'los', label : 'Los', icon : faUserCircle, color : 'text-danger', badge : 'badge badge-danger' },
    { value : 'dyinggasp', label : 'Dying Gasp', icon : faUserCircle, color : 'text-warning', badge : 'badge badge-warning' },
    { value : 'offline', label : 'Offline', icon : faUserCircle, color : 'text-muted', badge : 'badge badge-secondary' },
    { value : 'unconfig', label : 'Unconfig', icon : faPersonBooth, color : 'text-warning', badge : 'badge badge-warning' },
];
export const LeftSideBar = (props) => {
    return (
        <div className="card card-info card-outline">
            {props.gpon_states.loading && <CardPreloader/>}
            <div className="card-header px-2">
                <h4 className="card-title">GPON STATE</h4>
                <div className="card-tools">
                    <button className="btn btn-tool" onClick={props.handleReload}><FontAwesomeIcon icon={faRefresh}/></button>
                </div>
            </div>
            <div className="card-body p-0">
                <ul className="nav nav-pills flex-column">
                    {gponStateLists.map((item,index)=>
                        <li key={`${item.value}_${index}`} className="nav-item">
                            <a onClick={props.onClickState}
                               data-target={item.value} href="#" style={{borderRadius:0}}
                               className={props.gpon_states.status === item.value ? "nav-link px-2 active" : "nav-link px-2"}>
                                <FontAwesomeIcon style={{width:30}} icon={item.icon} className={`${item.color} mr-2`}/>
                                {item.label}
                                {props.gpon_states.current.length > 0 &&
                                    props.gpon_states.current.filter((f)=> f.phase_state === item.value).length > 0 &&
                                    <span className={`${item.badge} float-right`}>{props.gpon_states.current.filter((f)=> f.phase_state === item.value).length}</span>
                                }
                                {item.value === null &&
                                    <span className={`${item.badge} float-right`}>{props.gpon_states.current.length}</span>
                                }
                            </a>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
export const CustomerTableHeader = (props) => {
    return (
        <tr>
            <th className="align-middle text-center text-xs pl-2" width={30}>#</th>
            <th className="align-middle text-xs" width={100}>{Lang.get('olt.labels.onu.index')}</th>
            <th className="align-middle text-xs">{Lang.get('olt.labels.onu.description')}</th>
            <th className="align-middle text-xs">{Lang.get('customers.labels.name')}</th>
            <th className="align-middle text-center text-xs" width={100}>Status</th>
            <th className="align-middle text-center text-xs pr-2" width={50}>{Lang.get('messages.action')}</th>
        </tr>
    )
}
