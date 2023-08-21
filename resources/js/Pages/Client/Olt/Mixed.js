import React from "react";
import BtnSort from "../../Auth/User/Tools/BtnSort";
import {Dialog, DialogContent, DialogTitle, Skeleton} from "@mui/material";
import {
    CardPreloader, customPreventDefault, formatLocaleDate,
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
import {
    faBolt,
    faChargingStation,
    faCircleNotch,
    faCog,
    faCogs, faExclamationTriangle, faInfoCircle,
    faLink,
    faLinkSlash, faListUl,
    faPersonBooth, faPlug, faPlus,
    faRefresh, faUnlink
} from "@fortawesome/free-solid-svg-icons";
import {faCircle, faTrashAlt, faUserCircle} from "@fortawesome/free-regular-svg-icons";
import Select from "react-select";
import Pagination from "@atlaskit/pagination";
import {DataNotFound, TableRowPreloader} from "../../../Components/TableComponent";

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
            <th width={50} className="align-middle">
                <BtnSort sort="loss"
                         name={Lang.get('olt.labels.loss')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th width={50} className="align-middle text-center pr-2 text-xs">{Lang.get('messages.action')}</th>
        </tr>
    )
}
const GponStatus = (props) => {
    let response = "";
    switch (props.item.phase_state) {
        default:
            response = <span data-label="phase_state" data-onu={props.item.onu} onMouseOver={props.onPopover} onMouseOut={props.onPopover} className="badge badge-secondary d-block py-2">{props.item.phase_state.toUpperCase()}</span>;
            break;
        case 'working':
            response = (
                <span data-label="phase_state" data-onu={props.item.onu} onMouseOver={props.onPopover} onMouseOut={props.onPopover} className="badge badge-success d-block py-2">
                    {props.item.details === null ? null
                        : props.item.details.state_causes.length > 3 && <FontAwesomeIcon icon={faExclamationTriangle} size="xs" className="mr-1"/>
                    }
                    ONLINE
                </span>
            );
        break;
        case 'offline':
            response = <span data-label="phase_state" data-onu={props.item.onu} onMouseOver={props.onPopover} onMouseOut={props.onPopover} className="badge badge-secondary d-block py-2">OFFLINE</span>;
        break;
        case 'los':
            response = <span data-label="phase_state" data-onu={props.item.onu} onMouseOver={props.onPopover} onMouseOut={props.onPopover} className="badge badge-danger d-block py-2">LOS</span>;
        break;
        case 'dyinggasp':
            response = <span data-label="phase_state" data-onu={props.item.onu} onMouseOver={props.onPopover} onMouseOut={props.onPopover} className="badge badge-warning d-block py-2">DYING GASP</span>;
        break;
        case 'reboot':
            response = <span data-label="phase_state" data-onu={props.item.onu} onMouseOver={props.onPopover} onMouseOut={props.onPopover} className="badge badge-primary d-block py-2">REBOOT</span>;
            break;
        case 'unconfig':
            response = <span data-label="phase_state" data-onu={props.item.onu} onMouseOver={props.onPopover} onMouseOut={props.onPopover} className="badge badge-warning d-block py-2">UNCONFIG</span>;
            break;
    }
    return response;
}
export const TableContentGponState = (props)=> {
    return (
        <tr key={`x_${props.index}`}>
            <td className="align-middle text-xs pl-2">{props.item.onu}</td>
            <td className="align-middle text-xs">
                {props.item.loading ?
                    props.item.details === null && <Skeleton variant="text" animation="wave"/>
                :
                    <FontAwesomeIcon size="lg" onMouseOver={props.onPopover} onMouseOut={props.onPopover} data-label="detail" data-onu={props.item.onu} icon={faInfoCircle} className="mr-1 text-muted"/>
                }
                {props.item.details !== null && props.item.details.name}
            </td>
            <td className="align-middle text-xs">
                {props.item.loading && props.item.details === null && <Skeleton variant="text" animation="wave"/>}
                {props.item.details === null ? null : props.item.details.customer === null ? null : props.item.details.customer.label}
            </td>
            <td className="align-middle text-xs">
                {props.item.serial_number !== null ?
                    props.item.serial_number
                    :
                    props.item.loading ?
                        <Skeleton variant="text" animation="wave"/>
                        :
                        props.item.details === null ?
                            null
                            :
                            props.item.details.serial_number
                }
            </td>
            <td className="align-middle text-xs">
                {props.item.loading && props.item.details === null && <Skeleton variant="text" animation="wave"/>}
                {props.item.details !== null && onuDistance(props.item.details.onu_distance)}
            </td>
            <td className="align-middle text-xs text-center">
                <GponStatus {...props}/>
            </td>
            <td className="align-middle text-xs text-center pr-2">
                <button type="button" className="btn btn-xs btn-default" data-toggle="dropdown">
                    <FontAwesomeIcon icon={props.item.loading ? faCircleNotch : faCog} spin={props.item.loading} size="xs"/>
                </button>
                <div className="dropdown-menu" role="menu">
                    {props.privilege !== null &&
                        <React.Fragment>
                            {props.item.loading ?
                                <a onClick={customPreventDefault} className="dropdown-item text-xs text-muted" href="#">
                                    <FontAwesomeIcon icon={faCircleNotch} spin={true} size="xs" className="mr-1"/>
                                    Loading ...
                                </a>
                                :
                                <React.Fragment>
                                    <a onClick={props.onReload} data-onu={props.item.onu} className="dropdown-item text-xs" href="#">
                                        <FontAwesomeIcon icon={faRefresh} size="xs" className="mr-1"/>
                                        {Lang.get('labels.refresh',{Attribute:''})}
                                    </a>
                                    {props.item.details !== null &&
                                        props.item.phase_state !== 'unconfig' &&
                                        props.item.details.customer === null &&
                                        typeof props.privilege.connect !== 'undefined' &&
                                        props.privilege.connect &&
                                        <a onClick={props.onCustomer} data-onu={props.item.onu} className="dropdown-item text-xs text-primary" href="#">
                                            <FontAwesomeIcon icon={faLink} size="xs" className="mr-1"/>
                                            {Lang.get('olt.labels.customers.link')}
                                        </a>
                                    }
                                    {props.item.phase_state === 'unconfig' &&
                                        <a onClick={props.onConfig} href="#" data-onu={props.item.onu} className="dropdown-item text-xs text-primary">
                                            <FontAwesomeIcon icon={faLink} size="xs" className="mr-1"/>
                                            {Lang.get('olt.configure.button')}
                                        </a>
                                    }
                                    {props.item.details !== null &&
                                        props.item.phase_state !== 'unconfig' &&
                                        props.item.details.customer !== null &&
                                        typeof props.privilege.connect !== 'undefined' &&
                                        props.privilege.connect &&
                                        <a onClick={props.onUnlink} data-onu={props.item.onu} className="dropdown-item text-xs text-warning" href="#">
                                            <FontAwesomeIcon icon={faLinkSlash} size="xs" className="mr-1"/>
                                            {Lang.get('olt.labels.customers.unlink')}
                                        </a>
                                    }
                                    {props.item.phase_state !== 'unconfig' &&
                                        typeof props.privilege.un_configure !== 'undefined' &&
                                        props.privilege.un_configure &&
                                        <a onClick={props.onUnconfigure} data-onu={props.item.onu} className="dropdown-item text-danger text-xs" href="#">
                                            <FontAwesomeIcon icon={faCogs} size="xs" className="mr-1"/>
                                            {Lang.get('olt.un_configure.button')}
                                        </a>
                                    }
                                </React.Fragment>
                            }
                        </React.Fragment>
                    }
                </div>
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
                                {item.value === null && props.gpon_states.unfiltered.length > 0 &&
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
export const CustomerTableHeader = () => {
    return (
        <tr>
            <th className="align-middle text-xs pl-2" width={70}>{Lang.get('olt.labels.onu.index')}</th>
            <th className="align-middle text-xs">{Lang.get('olt.labels.onu.name')}</th>
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
                                                onChange={props.handelSelectDataPerPage} options={listDataPerpageOlt}/>
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
export const PhaseStatePopover = (props) => {
    return (
        <div className="card card-outline card-primary mb-0" style={{minWidth:300}}>
            <div className="card-header p-2">
                <strong className="card-title text-xs text-bold">History</strong>
            </div>
            <div className="card-body p-0 mb-0">
                <table className="table table-sm table-striped">
                    <thead>
                    <tr className="thead-primary">
                        <th className="align-middle text-xs pl-2">Online Time</th>
                        <th className="align-middle text-xs">Offline Time</th>
                        <th className="align-middle text-xs pr-2">State</th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.data.loading ?
                        <TableRowPreloader colSpan={3}/>
                        :
                        props.data.details === null ?
                            <DataNotFound colSpan={3} message="Not Found"/>
                            :
                            typeof props.data.details.state_causes === 'undefined' ?
                                <DataNotFound colSpan={3} message="Not Found"/>
                                :
                                props.data.details.state_causes.length === 0 ?
                                    <DataNotFound colSpan={3} message="Not Found"/>
                                    :
                                    props.data.details.state_causes.map((item,index)=>
                                        <tr key={`sconu_${index}`}>
                                            <td className="align-middle text-xs pl-2">{formatLocaleDate(item.online_time)}</td>
                                            <td className="align-middle text-xs">{formatLocaleDate(item.offline_time)}</td>
                                            <td className="align-middle text-xs pr-2">{item.phase_state}</td>
                                        </tr>
                                    )
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export const DetailOnuPopover = (props) => {
    return (
        <div className="card card-outline card-info mb-0" style={{minWidth:300,maxWidth:700}}>
            <div className="card-header p-2">
                <strong className="card-title text-xs text-bold">Detail</strong>
            </div>
            <div className="card-body p-0">
                <table className="table table-striped table-sm">
                    <tbody>
                    <tr>
                        <td width={100} className="align-middle text-xs pl-2">{Lang.get('olt.labels.onu.index')}</td>
                        <td className="align-middle text-xs" width={5}>:</td>
                        <td className="align-middle text-xs pr-2 text-bold">{props.data.onu}</td>
                    </tr>
                    <tr>
                        <td className="align-middle text-xs pl-2">Admin State</td>
                        <td className="align-middle text-xs">:</td>
                        <td className="align-middle text-xs pr-2 text-bold">{props.data.admin_state}</td>
                    </tr>
                    <tr>
                        <td className="align-middle text-xs pl-2">Omcc State</td>
                        <td className="align-middle text-xs">:</td>
                        <td className="align-middle text-xs pr-2 text-bold">{props.data.omcc_state}</td>
                    </tr>
                    {props.data.details !== null &&
                        <React.Fragment>
                            <tr>
                                <td className="align-middle text-xs pl-2">{Lang.get('olt.labels.onu.name')}</td>
                                <td className="align-middle text-xs">:</td>
                                <td className="align-middle text-xs pr-2 text-bold">{props.data.details.name}</td>
                            </tr>
                            <tr>
                                <td className="align-middle text-xs pl-2">{Lang.get('olt.labels.onu.description')}</td>
                                <td className="align-middle text-xs">:</td>
                                <td className="align-middle text-xs pr-2 text-bold">{props.data.details.description}</td>
                            </tr>
                            <tr>
                                <td className="align-middle text-xs pl-2">{Lang.get('olt.labels.onu.sn')}</td>
                                <td className="align-middle text-xs">:</td>
                                <td className="align-middle text-xs pr-2 text-bold">{props.data.details.serial_number}</td>
                            </tr>
                            <tr>
                                <td className="align-middle text-xs pl-2">{Lang.get('olt.labels.onu.duration')}</td>
                                <td className="align-middle text-xs">:</td>
                                <td className="align-middle text-xs pr-2 text-bold">{props.data.details.online_duration}</td>
                            </tr>
                            <tr>
                                <td className="align-middle text-xs pl-2">{Lang.get('olt.labels.onu.distance')}</td>
                                <td className="align-middle text-xs">:</td>
                                <td className="align-middle text-xs pr-2 text-bold">{props.data.details.onu_distance}</td>
                            </tr>
                        </React.Fragment>
                    }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export const TrafficProfileTable = (props) => {
    return (
        <div className="card card-info card-outline">
            {props.profiles.traffics.loading && <CardPreloader/>}
            <div className="card-header pt-3 pl-2 pb-3">
                <h4 className="card-title text-xs text-bold">Profile Traffics</h4>
                <div className="card-tools">
                    <button type="button" className="btn btn-tool btn-xs" data-card-widget="collapse">
                        <i className="fas fa-minus fa-xs"/>
                    </button>
                    <button disabled={props.profiles.traffics.loading} className="btn btn-tool btn-xs" onClick={()=>props.onReload()}>
                        <FontAwesomeIcon size="xs" icon={faRefresh} spin={props.profiles.traffics.loading}/>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <ul className="nav nav-pills flex-column">
                    {props.profiles.traffics.lists.length === 0 &&
                        <li className="nav-item text-xs">
                            <a onClick={customPreventDefault} href="#" className="nav-link px-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 text-warning"/>
                                {Lang.get('labels.not_found',{Attribute:''})}
                            </a>
                        </li>
                    }
                    {props.profiles.traffics.lists.map((item,index)=>
                        <li key={`${item.value}_${index}`} className="nav-item text-xs">
                            <a onClick={customPreventDefault} href="#" style={{borderRadius:0}} className="nav-link px-2">
                                <FontAwesomeIcon style={{width:30}} icon={faCircle} size="xs" className={`mr-1`}/>
                                {item.label}
                            </a>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
export const VlanProfileTable = (props) => {
    return (
        <div className="card card-info card-outline">
            {props.profiles.vlans.loading && <CardPreloader/>}
            <div className="card-header pt-3 pl-2 pb-3">
                <h4 className="card-title text-xs text-bold">Profile Vlan</h4>
                <div className="card-tools">
                    <button type="button" className="btn btn-tool btn-xs" data-card-widget="collapse">
                        <i className="fas fa-minus fa-xs"/>
                    </button>
                    <button disabled={props.profiles.vlans.loading} className="btn btn-tool btn-xs" onClick={()=>props.onReload()}>
                        <FontAwesomeIcon size="xs" icon={faRefresh} spin={props.profiles.vlans.loading}/>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <ul className="nav nav-pills flex-column">
                    {props.profiles.vlans.lists.length === 0 &&
                        <li className="nav-item text-xs">
                            <a onClick={customPreventDefault} href="#" className="nav-link px-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 text-warning"/>
                                {Lang.get('labels.not_found',{Attribute:''})}
                            </a>
                        </li>
                    }
                    {props.profiles.vlans.lists.map((item,index)=>
                        <li key={`${item.value}_${index}`} className="nav-item text-xs">
                            <a onClick={customPreventDefault} href="#" style={{borderRadius:0}} className="nav-link px-2">
                                <FontAwesomeIcon style={{width:30}} icon={faCircle} size="xs" className={`mr-1`}/>
                                {item.label}
                            </a>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
export const TcontProfileTable = (props) => {
    return (
        <div className="card card-info card-outline">
            {props.profiles.tconts.loading && <CardPreloader/>}
            <div className="card-header pt-3 pl-2 pb-3">
                <h4 className="card-title text-xs text-bold">Profile Tcont</h4>
                <div className="card-tools">
                    <button type="button" className="btn btn-tool btn-xs" data-card-widget="collapse">
                        <i className="fas fa-minus fa-xs"/>
                    </button>
                    <button disabled={props.profiles.tconts.loading} className="btn btn-tool btn-xs" onClick={()=>props.onReload()}>
                        <FontAwesomeIcon size="xs" icon={faRefresh} spin={props.profiles.tconts.loading}/>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <ul className="nav nav-pills flex-column">
                    {props.profiles.tconts.lists.length === 0 &&
                        <li className="nav-item text-xs">
                            <a onClick={customPreventDefault} href="#" className="nav-link px-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 text-warning"/>
                                {Lang.get('labels.not_found',{Attribute:''})}
                            </a>
                        </li>
                    }
                    {props.profiles.tconts.lists.map((item,index)=>
                        <li key={`${item.value}_${index}`} className="nav-item text-xs">
                            <a onClick={customPreventDefault} href="#" style={{borderRadius:0}} className="nav-link px-2">
                                <FontAwesomeIcon style={{width:30}} icon={faCircle} size="xs" className={`mr-1`}/>
                                {item.label}
                            </a>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
export const TablePopoverLos = (props) => {
    return (
        <div className="mb-0 card card-outline card-primary" style={{minWidth:200,maxWidth:500}}>
            <div className="card-header">
                <strong className="card-title text-xs">LOSS</strong>
            </div>
            <div className="card-body p-0">
                <table className="table table-sm table-striped">
                    <thead>
                    <tr>
                        <th className="pl-2 align-middle text-xs">{Lang.get('olt.labels.onu.index')}</th>
                        <th className="align-middle text-xs">{Lang.get('olt.labels.onu.name')}</th>
                        <th className="pr-2 align-middle text-xs">{Lang.get('olt.labels.onu.description')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.data.meta.loss.data.length === 0 ?
                        <DataNotFound colSpan={3} message="Not Found"/>
                        :
                        props.data.meta.loss.data.map((item,index)=>
                            <tr key={`ias_${index}`}>
                                <td className="align-middle text-xs pl-2">{item.onu}</td>
                                <td className="align-middle text-xs">{item.name}</td>
                                <td className="align-middle text-xs pr-2">{item.description}</td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export const oltZteLists = [
    { value : 'zte_320', label : 'ZTE C320' }
];
export const oltBrandLists = [
    { value : 'zte', label : 'ZTE', models : oltZteLists },
]

export const listDataPerpageOlt = [
    { value : 20, label : '20' },
    { value : 50, label : '50' },
    { value : 125, label : '125' },
    { value : 300, label : '300' },
];
export const CardDetailOlt = (props) => {
    return (
        <div className="row">
            <div className="col-md-3 col-sm-6 col-12">
                <div className="info-box">
                    <span className="info-box-icon bg-info">
                        {props.gpon_states.loading ?
                            <Skeleton variant="circular" width={65} height={65}/>
                            :
                            <FontAwesomeIcon icon={props.gpon_states.loading ? faCircleNotch : faPlug} spin={props.gpon_states.loading}/>
                        }
                    </span>
                    <div className="info-box-content">
                        <span className="info-box-text">
                            {props.gpon_states.loading ?
                                <Skeleton variant="text"/>
                                :
                                Lang.get('olt.cards.ports.count')
                            }
                        </span>
                        <span className="info-box-number">
                            {props.gpon_states.loading ?
                                <Skeleton variant="text"/>
                                :
                                formatLocaleString(props.gpon_states.unfiltered.length + props.port_lists.available.length)
                            }
                        </span>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6 col-12">
                <div className="info-box">
                    <span className="info-box-icon bg-success">
                        {props.gpon_states.loading ?
                            <Skeleton variant="circular" width={65} height={65}/>
                            :
                            <FontAwesomeIcon icon={props.gpon_states.loading ? faCircleNotch : faChargingStation} spin={props.gpon_states.loading}/>
                        }
                    </span>
                    <div className="info-box-content">
                        <span className="info-box-text">
                            {props.gpon_states.loading ?
                                <Skeleton variant="text"/>
                                :
                                Lang.get('olt.cards.ports.used')
                            }
                        </span>
                        <span className="info-box-number">
                            {props.gpon_states.loading ?
                                <Skeleton variant="text"/>
                                :
                                formatLocaleString(props.gpon_states.unfiltered.length)
                            }
                        </span>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6 col-12" data-label="available-port" onMouseOver={props.gpon_states.loading ? null : props.onPopover} onMouseOut={props.gpon_states.loading ? null : props.onPopover}>
                <div className="info-box">
                    <span className="info-box-icon bg-warning">
                        {props.gpon_states.loading ?
                            <Skeleton variant="circular" width={65} height={65}/>
                            :
                            <FontAwesomeIcon icon={props.gpon_states.loading ? faCircleNotch : faBolt} spin={props.gpon_states.loading}/>
                        }
                    </span>
                    <div className="info-box-content">
                        <span className="info-box-text">
                            {props.gpon_states.loading ?
                                <Skeleton variant="text"/>
                                :
                                Lang.get('olt.cards.ports.available')
                            }
                        </span>
                        <span className="info-box-number">
                            {props.gpon_states.loading ?
                                <Skeleton variant="text"/>
                                :
                                formatLocaleString(props.port_lists.available.length)
                            }
                        </span>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6 col-12">
                <div className="info-box">
                    <span className="info-box-icon bg-danger">
                        {props.gpon_states.loading ?
                            <Skeleton variant="circular" width={65} height={65}/>
                            :
                            <FontAwesomeIcon icon={props.gpon_states.loading ? faCircleNotch : faUnlink} spin={props.gpon_states.loading}/>
                        }
                    </span>
                    <div className="info-box-content">
                        <span className="info-box-text">
                            {props.gpon_states.loading ?
                                <Skeleton variant="text"/>
                                :
                                Lang.get('olt.labels.loss')
                            }
                        </span>
                        <span className="info-box-number">
                            {props.gpon_states.loading ?
                                <Skeleton variant="text"/>
                                :
                                formatLocaleString(props.gpon_states.unfiltered.filter((f)=> f.phase_state === 'los').length)
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
export const PopoverAvailablePort = (props) => {
    const maxSize = 20;
    const availablePorts = Array.from({length : Math.ceil(props.ports.length / maxSize)}, (v,i)=> props.ports.slice(i * maxSize, i * maxSize + maxSize));
    return (
        <div className="card card-outline card-info mb-0" style={{minWidth:200}}>
            <div className="card-header p-2">
                <strong className="text-xs card-title">20 {Lang.get('olt.cards.ports.available')}</strong>
            </div>
            <div className="card-body">
                <ul className="list-unstyled mb-0">
                    {availablePorts.length > 0 &&
                        availablePorts[0].map((item)=>
                            <li className="text-xs" key={item.value}>{item.label}</li>
                        )
                    }
                </ul>
            </div>
        </div>
    )
}
export const FormConfigureTableTCont = (props) => {
    return (
        <div className="card card-outline card-primary">
            <div className="card-header">
                <strong className="card-title text-sm">TCONT</strong>
                <div className="card-tools">
                    <button onClick={props.onAdd} type="button" disabled={props.loading || props.olt_profiles.tconts.loading} className="btn btn-outline-primary btn-sm text-xs">
                        <FontAwesomeIcon icon={faPlus} size="xs" className="mr-1"/>
                        <small className="text-xs">{Lang.get('labels.add.label',{Attribute:"TCont"})}</small>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <table className="table table-sm table-striped table-hover">
                    <thead>
                    <tr>
                        <th className="align-middle text-center pl-2" width={30}><FontAwesomeIcon icon={faTrashAlt} size="xs"/></th>
                        <th className="align-middle text-xs" width={100}>ID</th>
                        <th className="align-middle text-xs pr-2">Profile</th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.form.t_controllers.length === 0 ?
                        <DataNotFound colSpan={3} message={Lang.get('labels.not_found',{Attribute:"TCont"})}/>
                        :
                        props.form.t_controllers.map((item,index)=>
                            <tr key={`tcs_${index}`}>
                                <td className="align-middle text-center pl-2">
                                    <button type="button" data-index={index} className="btn btn-sm btn-outline-warning btn-block text-xs" disabled={props.loading} onClick={props.onDelete}>
                                        <FontAwesomeIcon icon={faTrashAlt} size="xs"/>
                                    </button>
                                </td>
                                <td className="align-middle text-xs">
                                    <input className="form-control form-control-sm text-xs" value={item.id} disabled={props.loading} onChange={props.onChangeId} data-index={index} placeholder="Tcont ID"/>
                                </td>
                                <td className="align-middle text-xs pr-2">
                                    <div className="row">
                                        <div className="col-sm-11">
                                            <Select options={props.olt_profiles.tconts.lists}
                                                    value={item.profile}
                                                    isDisabled={props.loading || props.olt_profiles.tconts.loading}
                                                    isLoading={props.olt_profiles.tconts.loading}
                                                    onChange={(e)=> props.onSelect(e,index)}
                                                    styles={FormControlSMReactSelect} menuPlacement="top"
                                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:"Profile"})}
                                                    placeholder={Lang.get('labels.select.option',{Attribute:"Profile"})}/>
                                        </div>
                                        <div className="col-sm-1">
                                            <button title={Lang.get('labels.refresh',{Attribute:"Profile"})} type="button" disabled={props.loading || props.olt_profiles.tconts.loading} className="btn btn-xs btn-outline-primary text-xs btn-block" onClick={()=>props.onReloadProfile()}>
                                                <FontAwesomeIcon icon={faRefresh} spin={props.olt_profiles.tconts.loading} size="xs"/>
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export const FormConfigureTableGemPort = (props) => {
    return (
        <div className="card card-outline card-primary">
            <div className="card-header">
                <strong className="card-title text-sm">GEMPORT</strong>
                <div className="card-tools">
                    {props.form.t_controllers.filter((f)=> f.id.length > 0 && f.profile !== null).length > 0 &&
                        <button onClick={props.onAdd} type="button" disabled={props.loading} className="btn btn-outline-primary btn-sm text-xs">
                            <FontAwesomeIcon icon={faPlus} size="xs" className="mr-1"/>
                            <small className="text-xs">{Lang.get('labels.add.label',{Attribute:"GemPort"})}</small>
                        </button>
                    }
                </div>
            </div>
            <div className="card-body p-0">
                <table className="table table-sm table-striped table-hover">
                    <thead>
                    <tr>
                        <th className="align-middle text-center pl-2" width={30}><FontAwesomeIcon icon={faTrashAlt} size="xs"/></th>
                        <th className="align-middle text-xs" width={50}>ID</th>
                        <th className="align-middle text-xs">Upstream</th>
                        <th className="align-middle text-xs">Downstream</th>
                        <th className="align-middle text-xs pr-2">TCont</th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.form.gem_ports.length === 0 ?
                        <DataNotFound colSpan={5} message={Lang.get('labels.not_found',{Attribute:"GemPort"})}/>
                        :
                        props.form.gem_ports.map((item,index)=>
                            <tr key={`tgp_${index}`}>
                                <td className="align-middle text-center pl-2">
                                    <button type="button" data-index={index} className="btn btn-sm btn-outline-warning btn-block text-xs" disabled={props.loading} onClick={props.onDelete}>
                                        <FontAwesomeIcon icon={faTrashAlt} size="xs"/>
                                    </button>
                                </td>
                                <td className="align-middle text-xs">
                                    <input className="form-control form-control-sm text-xs" value={item.id} disabled={props.loading} onChange={props.onChangeId} data-index={index} placeholder="GemPort ID"/>
                                </td>
                                <td className="align-middle text-xs">
                                    <div className="row">
                                        <div className="col-sm-9">
                                            <Select options={props.olt_profiles.tconts.lists}
                                                    value={item.upstream}
                                                    onChange={(e)=>props.onSelectUpstream(e,index)}
                                                    isDisabled={props.loading || props.olt_profiles.tconts.loading}
                                                    isLoading={props.olt_profiles.tconts.loading}
                                                    styles={FormControlSMReactSelect} menuPlacement="top"
                                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:"Upstream"})}
                                                    placeholder={Lang.get('labels.select.option',{Attribute:"Upstream"})}/>
                                        </div>
                                        <div className="col-sm-3">
                                            <button title={Lang.get('labels.refresh',{Attribute:"Profile"})} type="button" className="btn btn-outline-primary btn-xs text-xs btn-block" disabled={props.loading || props.olt_profiles.tconts.loading} onClick={()=>props.onReloadProfile()}>
                                                <FontAwesomeIcon icon={faRefresh} spin={props.olt_profiles.tconts.loading} size="xs"/>
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="align-middle text-xs">
                                    <div className="row">
                                        <div className="col-sm-9">
                                            <Select options={props.olt_profiles.tconts.lists}
                                                    value={item.downstream}
                                                    onChange={(e)=>props.onSelectDownstream(e,index)}
                                                    isDisabled={props.loading || props.olt_profiles.tconts.loading}
                                                    isLoading={props.olt_profiles.tconts.loading}
                                                    styles={FormControlSMReactSelect} menuPlacement="top"
                                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:"Downstream"})}
                                                    placeholder={Lang.get('labels.select.option',{Attribute:"Downstream"})}/>
                                        </div>
                                        <div className="col-sm-3">
                                            <button title={Lang.get('labels.refresh',{Attribute:"Profile"})} type="button" className="btn btn-outline-primary btn-xs text-xs btn-block" disabled={props.loading || props.olt_profiles.tconts.loading} onClick={()=>props.onReloadProfile()}>
                                                <FontAwesomeIcon icon={faRefresh} spin={props.olt_profiles.tconts.loading} size="xs"/>
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="align-middle text-xs">
                                    <Select options={props.form.t_controllers.filter((f)=> f.profile !== null && f.id.length > 0).map((tcont)=> { return { value : tcont.id, label : tcont.profile.value} })}
                                            value={item.tcont} isDisabled={props.loading}
                                            onChange={(e)=>props.onSelectTCont(e,index)}
                                            styles={FormControlSMReactSelect} menuPlacement="top"
                                            placeholder={Lang.get('labels.select.option',{Attribute:"TCont"})}/>
                                </td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export const FormConfigureTableVLan = (props) => {
    return (
        <div className="card card-outline card-primary">
            <div className="card-header">
                <strong className="card-title text-sm">Virtual Lan</strong>
                <div className="card-tools">
                    <button onClick={props.onAdd} type="button" disabled={props.loading || props.olt_profiles.vlans.loading} className="btn btn-outline-primary btn-sm text-xs">
                        <FontAwesomeIcon icon={faPlus} size="xs" className="mr-1"/>
                        <small className="text-xs">{Lang.get('labels.add.label',{Attribute:"Virtual Lan"})}</small>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <table className="table table-sm table-striped table-hover">
                    <thead>
                    <tr>
                        <th className="align-middle text-center pl-2" width={30}><FontAwesomeIcon icon={faTrashAlt} size="xs"/></th>
                        <th className="align-middle text-xs" width={50}>Port</th>
                        <th className="align-middle text-xs" width={50}>V Port</th>
                        <th className="align-middle text-xs">User VLan</th>
                        <th className="align-middle text-xs pr-2">Service VLan</th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.form.virtual_lanes.length === 0 ?
                        <DataNotFound colSpan={5} message={Lang.get('labels.not_found',{Attribute:"VLan"})}/>
                        :
                        props.form.virtual_lanes.map((item,index)=>
                            <tr key={`tvl_${index}`}>
                                <td className="align-middle text-center pl-2">
                                    <button type="button" data-index={index} className="btn btn-sm btn-outline-warning btn-block text-xs" disabled={props.loading} onClick={props.onDelete}>
                                        <FontAwesomeIcon icon={faTrashAlt} size="xs"/>
                                    </button>
                                </td>
                                <td className="align-middle text-xs">
                                    <input className="form-control form-control-sm text-xs" value={item.port} disabled={props.loading} onChange={props.onChangePort} data-index={index} placeholder="VLan Port ID"/>
                                </td>
                                <td className="align-middle text-xs">
                                    <input className="form-control form-control-sm text-xs" value={item.vport} disabled={props.loading} onChange={props.onChangeVPort} data-index={index} placeholder="VLan V Port ID"/>
                                </td>
                                <td className="align-middle text-xs">
                                    <div className="row">
                                        <div className="col-sm-10">
                                            <Select options={props.olt_profiles.vlans.lists} value={item.user}
                                                    onChange={(e)=>props.onSelectUser(e,index)}
                                                    isDisabled={props.loading || props.olt_profiles.vlans.loading}
                                                    isLoading={props.olt_profiles.vlans.loading}
                                                    styles={FormControlSMReactSelect} menuPlacement="top"
                                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:"User VLan"})}
                                                    placeholder={Lang.get('labels.select.option',{Attribute:"User VLan"})}/>
                                        </div>
                                        <div className="col-sm-2">
                                            <button onClick={()=>props.onReloadProfile()} type="button" title={Lang.get('labels.refresh',{Attribute:"VLan"})} disabled={props.loading || props.olt_profiles.vlans.loading} className="btn btn-xs btn-block btn-outline-primary text-xs">
                                                <FontAwesomeIcon icon={faRefresh} spin={props.olt_profiles.vlans.loading} size="xs"/>
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="align-middle text-xs pr-2">
                                    <div className="row">
                                        <div className="col-sm-10">
                                            <Select options={props.olt_profiles.vlans.lists} value={item.service}
                                                    onChange={(e)=>props.onSelectService(e,index)}
                                                    isDisabled={props.loading || props.olt_profiles.vlans.loading}
                                                    isLoading={props.olt_profiles.vlans.loading}
                                                    styles={FormControlSMReactSelect} menuPlacement="top"
                                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:"Service VLan"})}
                                                    placeholder={Lang.get('labels.select.option',{Attribute:"Service VLan"})}/>
                                        </div>
                                        <div className="col-sm-2">
                                            <button onClick={()=>props.onReloadProfile()} type="button" title={Lang.get('labels.refresh',{Attribute:"VLan"})} disabled={props.loading || props.olt_profiles.vlans.loading} className="btn btn-xs btn-block btn-outline-primary text-xs">
                                                <FontAwesomeIcon icon={faRefresh} spin={props.olt_profiles.vlans.loading} size="xs"/>
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export const FormConfigureTablePonManagement = (props) => {
    return (
        <div className="card card-outline card-primary">
            <div className="card-header">
                <strong className="card-title text-sm">PON Management</strong>
                <div className="card-tools">
                    {props.form.virtual_lanes.filter((f)=> f.port.length > 0 && f.user !== null).length > 0 &&
                        props.form.gem_ports.filter((f)=> f.id.length > 0 && f.downstream !== null).length > 0 &&
                            <button onClick={props.onAdd} type="button" disabled={props.loading} className="btn btn-outline-primary btn-sm text-xs">
                                <FontAwesomeIcon icon={faPlus} size="xs" className="mr-1"/>
                                <small className="text-xs">{Lang.get('labels.add.label',{Attribute:"PON Management"})}</small>
                            </button>
                    }
                </div>
            </div>
            <div className="card-body p-0">
                <table className="table table-sm table-striped table-hover">
                    <thead>
                    <tr>
                        <th className="align-middle text-center pl-2" width={30}><FontAwesomeIcon icon={faTrashAlt} size="xs"/></th>
                        <th className="align-middle text-xs" width={150}>Name</th>
                        <th className="align-middle text-xs">GemPort</th>
                        <th className="align-middle text-xs pr-2">VLan</th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.form.pon_managements.length === 0 ?
                        <DataNotFound colSpan={4} message={Lang.get('labels.not_found',{Attribute:"PON Management"})}/>
                        :
                        props.form.pon_managements.map((item,index)=>
                            <tr key={`tpm_${index}`}>
                                <td className="align-middle text-center pl-2">
                                    <button type="button" data-index={index} className="btn btn-sm btn-outline-warning btn-block text-xs" disabled={props.loading} onClick={props.onDelete}>
                                        <FontAwesomeIcon icon={faTrashAlt} size="xs"/>
                                    </button>
                                </td>
                                <td className="align-middle text-xs">
                                    <input className="form-control form-control-sm text-xs" value={item.name} disabled={props.loading} onChange={props.onChangeName} data-index={index} placeholder="Name"/>
                                </td>
                                <td className="align-middle text-xs">
                                    <Select options={props.form.gem_ports.filter((f)=> f.id.length > 0 && f.downstream !== null).map((gemport)=> { return { value : gemport.id, label : gemport.downstream.value} })}
                                            value={item.gemport} isDisabled={props.loading}
                                            onChange={(e)=>props.onSelectGemPort(e,index)}
                                            styles={FormControlSMReactSelect} menuPlacement="top"
                                            placeholder={Lang.get('labels.select.option',{Attribute:"Gem Port"})}/>
                                </td>
                                <td className="align-middle text-xs pr-2">
                                    <Select options={props.form.virtual_lanes.filter((f)=> f.user !== null).map((vlan)=> { return { value : vlan.user.value, label : vlan.user.label} })}
                                            value={item.vlan} isDisabled={props.loading}
                                            onChange={(e)=>props.onSelectVLan(e,index)}
                                            styles={FormControlSMReactSelect} menuPlacement="top"
                                            placeholder={Lang.get('labels.select.option',{Attribute:"VLan"})}/>
                                </td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export const FormConfigureCommandPreview = (props) => {
    return (
        <div className="card card-outline card-info">
            <div className="card-header">
                <h3 className="card-title">{Lang.get('olt.labels.preview')}</h3>
                <div className="card-tools">
                    <button type="button" className="btn btn-tool" data-card-widget="collapse">
                        <i className="fas fa-minus"/>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <div className="p-3" style={{background:'black'}}>
                    <code className="text-white">
                        config <span className="text-primary">terminal</span><br/>
                        {props.form.port.olt !== null &&
                            <><span className="ml-3">interface</span> <span className="text-danger">gpon-olt_{props.form.port.olt.value}</span><br/></>
                        }
                        {props.form.port.onu_index !== null && props.form.sn !== null && props.form.onu_type !== null &&
                            <>
                                <span className="ml-3">onu</span> <span className="text-danger">{props.form.port.onu_index.value}</span> <span className="text-primary">type</span> <span className="text-danger">{props.form.onu_type.value}</span> <span className="text-primary">sn</span> <span className="text-danger">{props.form.sn}</span><br/>
                                exit<br/>
                                config <span className="text-primary">terminal</span><br/>
                            </>
                        }
                        {props.form.port.olt !== null && props.form.port.onu_index !== null &&
                            <>
                                <span className="ml-3">interface</span> <span className="text-danger">gpon-onu_{props.form.port.olt.value}:{props.form.port.onu_index.value}</span><br/>
                            </>
                        }
                        {props.form.name.length > 0 &&
                            <><span className="ml-3">name</span> <span className="text-danger">{props.form.name}</span><br/></>
                        }
                        {props.form.description.length > 0 &&
                            <><span className="ml-3">description</span> <span className="text-danger">{props.form.description}</span><br/></>
                        }
                        {props.form.t_controllers.map((item,index)=>
                            item.profile !== null && item.id.length > 0 &&
                            <React.Fragment key={`pt_${index}`}>
                                <span className="ml-3">tcont</span> <span className="text-danger">{item.id}</span> <span className="text-primary">profile</span> <span className="text-danger">{item.profile.value}</span><br/>
                            </React.Fragment>
                        )}
                        {props.form.gem_ports.map((item,index)=>
                            item.id.length > 0 && item.downstream !== null && item.upstream !== null && item.tcont !== null &&
                                <React.Fragment key={`pg_${index}`}>
                                    <span className="ml-3">gemport</span> <span className="text-danger">{item.id}</span> <span className="text-primary">tcont</span> <span className="text-danger">{item.tcont.value}</span><br/>
                                    <span className="ml-3">gemport</span> <span className="text-danger">{item.id}</span> <span className="text-primary">traffic-limit upstream</span> <span className="text-danger">{item.upstream.value}</span> <span className="text-primary">downstream</span> <span className="text-danger">{item.downstream.value}</span><br/>
                                </React.Fragment>
                        )}
                        {props.form.virtual_lanes.map((item,index)=>
                            item.port.length > 0 && item.vport.length > 0 && item.user !== null && item.service !== null &&
                            <React.Fragment key={`pvl_${index}`}>
                                <span className="ml-3">service-port</span> <span className="text-danger">{item.port}</span> <span className="text-primary">vport</span> <span className="text-danger">{item.vport}</span> <span className="text-primary">user-vlan</span> <span className="text-danger">{item.user.value}</span> <span className="text-primary">vlan</span> <span className="text-danger">{item.service.value}</span><br/>
                            </React.Fragment>
                        )}
                        exit<br/>
                        config <span className="text-primary">terminal</span><br/>
                        {props.form.port.olt !== null && props.form.port.onu_index !== null &&
                            <>
                                <span className="ml-3">pon-onu-mng</span> <span className="text-danger">gpon-onu_{props.form.port.olt.value}:{props.form.port.onu_index.value}</span><br/>
                            </>
                        }
                        {props.form.pon_managements.map((item,index)=>
                            item.name.length > 0 && item.gemport !== null && item.vlan !== null &&
                                <React.Fragment key={`pp_${index}`}>
                                    <span className="ml-3">service</span> <span className="text-danger">{item.name}</span> <span className="text-primary">gemport</span> <span className="text-danger">{item.gemport.value}</span> <span className="text-primary">vlan</span> <span className="text-danger">{item.vlan.value}</span><br/>
                                </React.Fragment>
                        )}
                        <PonManagementScripts form={props.form}/>
                        exit<br/>
                        write<br/>
                    </code>
                </div>
            </div>
        </div>
    )
}
const PonManagementScripts = (props) => {
    let response = null;
    if (props.form.modem_brand !== null) {
        switch (props.form.modem_brand.value){
            case 'huawei':
                break;
            case 'zte':
                response = <ZTEPonManagementScript form={props.form}/>;
                break;
            case 'fiberhome':
                response = <FiberHomeManagementScript form={props.form}/>;
                break;
        }
    }
    return response;
}
const ZTEPonManagementScript = (props) => {
    if (props.form.customer !== null) {
        if (props.form.pon_management_vlan !== null) {
            return (
                <React.Fragment>
                    <span className="ml-3">wan-ip</span> <span className="text-danger">1</span> <span className="text-primary">mode</span> <span className="text-danger">pppoe</span> <span className="text-primary">username</span> <span className="text-danger">{props.form.customer.meta.auth.user}</span> <span className="text-primary">password</span> <span className="text-danger">{props.form.customer.meta.auth.pass}</span> <span className="text-primary">vlan-profile</span> <span className="text-danger">{props.form.pon_management_vlan.value}</span> <span className="text-primary">host</span> <span className="text-danger">1</span><br/>
                    <span className="ml-3">wan-ip</span> <span className="text-danger">1</span> <span className="text-primary">ping-response</span> <span className="text-danger">enable</span> <span className="text-primary">traceroute-response</span> <span className="text-danger">enable</span><br/>
                    <span className="ml-3">security-mgmt</span> <span className="text-danger">500</span> <span className="text-primary">state</span> <span className="text-danger">enable</span> <span className="text-primary">mode</span> <span className="text-danger">forward</span> <span className="text-primary">protocol</span> <span className="text-danger">web</span><br/>
                </React.Fragment>
            )
        }
    }
}
const FiberHomeManagementScript = (props) => {
    return (
        <React.Fragment>
            <span className="ml-3">vlan</span> <span className="text-primary">port</span> <span className="text-danger">veip_1</span> <span className="text-primary">mode</span> <span className="text-danger">hybrid</span><br/>
            <ZTEPonManagementScript form={props.form}/>
        </React.Fragment>
    )
}
export const ModemONTLists = [
    { value : 'zte', label : 'ZTE' },
    { value : 'huawei', label : 'Huawei' },
    { value : 'fiberhome', label : 'Fiberhome' },
    { value : 'other', label : 'Other' },
];
