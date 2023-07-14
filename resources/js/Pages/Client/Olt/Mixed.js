import React from "react";
import BtnSort from "../../Auth/User/Tools/BtnSort";
import {Dialog, DialogContent, DialogTitle, Skeleton} from "@mui/material";
import {
    CardPreloader,
    formatLocaleString, FormControlSMReactSelect, listDataPerPage,
    parseInputFloat,
    pipeIp,
    responseMessage
} from "../../../Components/mixedConsts";
import {crudOlt} from "../../../Services/OltService";
import {showError, showSuccess} from "../../../Components/Toaster";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";
import MaskedInput from "react-text-mask";
import {NumericFormat} from "react-number-format";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faCog, faLink, faPersonBooth, faRefresh} from "@fortawesome/free-solid-svg-icons";
import {faUserCircle} from "@fortawesome/free-regular-svg-icons";
import Select from "react-select";
import Pagination from "@atlaskit/pagination";

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
        case 'reboot':
            response = <span className="badge badge-primary">REBOOT</span>;
            break;
        case 'unconfig':
            response = <span className="badge badge-warning">UNCONFIG</span>;
            break;
    }
    return response;
}
export const TableContentGponState = (props)=> {
    return (
        <tr key={`x_${props.index}`}>
            <td className="align-middle text-xs pl-2">{props.item.onu}</td>
            <td className="align-middle text-xs">
                {props.item.loading && props.item.details === null && <Skeleton variant="text" animation="wave"/>}
                {props.item.details !== null && props.item.details.name}
            </td>
            <td className="align-middle text-xs">
                {props.item.loading && props.item.details === null && <Skeleton variant="text" animation="wave"/>}
                {props.item.details !== null && props.item.details.description}
            </td>
            <td className="align-middle text-xs">
                {props.item.loading && props.item.details === null && <Skeleton variant="text" animation="wave"/>}
                {props.item.details === null ? null : props.item.details.customer === null ? null : props.item.details.customer.name}
            </td>
            <td className="align-middle text-xs">
                {props.item.loading && props.item.details === null && <Skeleton variant="text" animation="wave"/>}
                {props.item.details !== null && props.item.details.serial_number}
            </td>
            <td className="align-middle text-xs">
                {props.item.loading && props.item.details === null && <Skeleton variant="text" animation="wave"/>}
                {props.item.details !== null && onuDistance(props.item.details.onu_distance)}
            </td>
            <td className="align-middle text-xs text-center">
                {statusGpon(props.item.phase_state)}
            </td>
            <td className="align-middle text-xs text-center pr-2">
                <button type="button" className="btn btn-xs btn-default" data-toggle="dropdown">
                    <FontAwesomeIcon icon={props.item.loading ? faCircleNotch : faCog} spin={props.item.loading} size="xs"/>
                </button>
                {props.privilege !== null &&
                    <div className="dropdown-menu" role="menu">
                        {props.item.details !== null &&
                            props.item.details.customer === null &&
                            typeof props.privilege.customers !== 'undefined' &&
                            typeof props.privilege.customers.create !== 'undefined' &&
                            props.privilege.customers.create &&
                            <a onClick={props.onCustomer} data-onu={props.item.onu} className="dropdown-item" href="#">
                                <FontAwesomeIcon icon={faLink} size="xs" className="mr-1"/>
                                {Lang.get('olt.labels.customers.link')}
                            </a>
                        }
                        <a className="dropdown-item" href="#">Another action</a>
                        <a className="dropdown-item" href="#">Something else here</a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#">Separated link</a>
                    </div>
                }
            </td>
        </tr>
    )
}
const onuDistance = (distance) => {
    let response = `N/A`;
    let integer = parseInt(distance);
    if (Number.isInteger(integer)) {
        if (integer >= 1000) {
            response = `${formatLocaleString(integer / 1000,2)} km`;
        } else {
            response = `${integer} m`;
        }
    }
    return response;
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
                    <button disabled={props.gpon_states.loading || props.gpon_states.filtered.filter((f)=> f.loading).length > 0} className="btn btn-tool" onClick={props.handleReload}>
                        <FontAwesomeIcon icon={faRefresh} spin={props.gpon_states.loading}/>
                    </button>
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
                                {props.gpon_states.unfiltered.length > 0 &&
                                    props.gpon_states.unfiltered.filter((f)=> f.phase_state === item.value).length > 0 &&
                                    <span className={`${item.badge} float-right`}>{props.gpon_states.unfiltered.filter((f)=> f.phase_state === item.value).length}</span>
                                }
                                {item.value === null &&
                                    <span className={`${item.badge} float-right`}>{props.gpon_states.unfiltered.length}</span>
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
            <th className="align-middle  pl-2" width={100}>{Lang.get('olt.labels.onu.index')}</th>
            <th className="align-middle text-xs">{Lang.get('olt.labels.onu.name')}</th>
            <th className="align-middle text-xs">{Lang.get('olt.labels.onu.description')}</th>
            <th className="align-middle text-xs">{Lang.get('customers.labels.name')}</th>
            <th className="align-middle text-xs" width={100}>{Lang.get('olt.labels.onu.sn')}</th>
            <th className="align-middle text-xs" width={70}>{Lang.get('olt.labels.onu.distance')}</th>
            <th className="align-middle text-center text-xs" width={100}>Status</th>
            <th className="align-middle text-center text-xs pr-2" width={50}>{Lang.get('messages.action')}</th>
        </tr>
    )
}
export const TablePaging = (props) => {
    return (
        <div className="card-footer clearfix row">
            <div className="col-md-6">
                <div className="row">
                    {typeof props.showDataPerPage === 'undefined' ? null :
                        props.showDataPerPage === null ? null :
                            typeof props.handelSelectDataPerPage === 'undefined' ? null :
                                props.handelSelectDataPerPage === null ? null :
                                    <div className="col-md-3">
                                        <Select value={props.data.data_length === null ? null : { value : props.data.data_length, label : formatLocaleString(props.data.data_length)}}
                                                styles={FormControlSMReactSelect}
                                                isDisabled={props.data.loading || props.data.filtered.filter((f)=> f.loading).length > 0}
                                                isLoading={props.data.loading}
                                                onChange={props.handelSelectDataPerPage} options={listDataPerPage}/>
                                    </div>
                    }
                    <label className="col-md-9 col-form-label text-muted text-xs">
                        {props.data.unfiltered.length === 0 ? null :
                            Lang.get('pagination.labels.showing',{
                                dataFirst : ( ( parseInt(props.data.page.value)  - 1 ) * parseInt(props.data.data_length) ) + 1,
                                dataLast : parseInt(props.data.page.value) * parseInt(props.data.data_length),
                                max : props.data.unfiltered.length
                            })
                        }
                    </label>
                </div>
            </div>
            <div className="col-md-6">
                <div className="float-right">
                    {props.data.filtered.length > 0 &&
                        props.handleChangePage !== null &&
                        props.data.paging.length > 0 &&
                        <Pagination onChange={(event, page)=>props.handleChangePage(page)}
                                    max={7} selectedIndex={(props.data.page.value - 1)}
                                    pages={props.data.paging}/>
                    }
                </div>
            </div>
        </div>
    )
}
