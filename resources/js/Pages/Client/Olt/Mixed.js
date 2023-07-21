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
    faCircleNotch,
    faCog,
    faCogs, faExclamationTriangle, faInfoCircle,
    faLink,
    faLinkSlash, faListUl,
    faPersonBooth,
    faRefresh
} from "@fortawesome/free-solid-svg-icons";
import {faCircle, faUserCircle} from "@fortawesome/free-regular-svg-icons";
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
                {props.item.loading && props.item.details === null && <Skeleton variant="text" animation="wave"/>}
                {props.item.details !== null && props.item.details.serial_number}
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
                                        typeof props.privilege.customers !== 'undefined' &&
                                        typeof props.privilege.customers.create !== 'undefined' &&
                                        props.privilege.customers.create &&
                                        <a onClick={props.onCustomer} data-onu={props.item.onu} className="dropdown-item text-xs text-primary" href="#">
                                            <FontAwesomeIcon icon={faLink} size="xs" className="mr-1"/>
                                            {Lang.get('olt.labels.customers.link')}
                                        </a>
                                    }
                                    {props.item.details !== null &&
                                        props.item.phase_state !== 'unconfig' &&
                                        props.item.details.customer !== null &&
                                        <a onClick={props.onUnlink} data-onu={props.item.onu} className="dropdown-item text-xs text-warning" href="#">
                                            <FontAwesomeIcon icon={faLinkSlash} size="xs" className="mr-1"/>
                                            {Lang.get('olt.labels.customers.unlink')}
                                        </a>
                                    }
                                    {props.item.phase_state !== 'unconfig' &&
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

