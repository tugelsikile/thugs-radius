import React from "react";
import {formatLocalePeriode, formatLocaleString} from "../../../../Components/mixedConsts";
import {FormatPrice} from "../../Customer/Tools/Mixed";
import {DataNotFound} from "../../../../Components/TableComponent";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCalendar,
    faCheckCircle,
    faEye,
    faEyeSlash,
    faMoneyBillAlt,
    faTrashAlt
} from "@fortawesome/free-regular-svg-icons";
import {
    faCircleNotch,
    faCog,
    faExclamationTriangle, faFilter,
    faMoneyBillWave,
    faPencilAlt, faRefresh,
    faWallet
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment/moment";
import id from "date-fns/locale/id";
import en from "date-fns/locale/en-US";
import DatePicker from "react-datepicker";
import {Skeleton} from "@mui/material";

export const PettyCashTypeList = [
    { value : 'input', label : Lang.get('petty_cash.labels.input') },
    { value : 'output', label : Lang.get('petty_cash.labels.output') },
];
export const PettyCashTableMainRow = (props) => {
    //console.log(props.index % 2);
    const [visibility,setVisibility] = React.useState(false);
    function handleClick(event) {
        event.preventDefault();
        setVisibility(! visibility);
    }
    return (
        <React.Fragment key={`xs_${props.index}`}>
            <tr>
                <td className="align-middle text-xs pl-2">
                    {props.item.data.length > 0 &&
                        <button onClick={handleClick} data-value={props.item.value} type="button" className="btn btn-tool btn-xs text-dark mr-2">
                            <FontAwesomeIcon icon={visibility ? faEyeSlash : faEye} size="2xs"/>
                        </button>
                    }
                    {props.item.data.filter((f)=> f.meta.timestamps.approve.at === null).length > 0 &&
                        <FontAwesomeIcon icon={faExclamationTriangle} size="2xs" className="mr-1 text-warning"/>
                    }
                    {formatLocalePeriode(props.item.value, "DD MMMM yyyy")}
                </td>
                <td className="align-middle text-xs">{FormatPrice(SumRow(props.item.data, "input"),null,false)}</td>
                <td className="align-middle text-xs">{FormatPrice(SumRow(props.item.data, "output"),null,false)}</td>
                <td className="align-middle text-xs">{FormatPrice(SumRow(props.item.data),null,false)}</td>
                <td className="align-middle text-xs pr-2"><PettyCashMainBalance index={props.index} filtered={props.filtered}/></td>
            </tr>
            {visibility && props.item.data.length > 0 &&
                <tr>
                    <td colSpan={5} className="p-1">
                        <table className={`table table-hover table-sm table-striped mb-0 ${props.index % 2 === 0 ? 'table-info' : 'table-primary'}`}>
                            <thead>
                            <tr className={props.index % 2 === 0 ? 'thead-info' : 'thead-primary'}>
                                <th className="align-middle text-xs text-center pl-2" width={30}><input data-value={null} data-period={props.item.value} onChange={props.onCheck} type="checkbox"/></th>
                                <th className="align-middle text-xs">{Lang.get('petty_cash.labels.name')}</th>
                                <th width={100} className="align-middle text-xs">{Lang.get('petty_cash.labels.type')}</th>
                                <th width={150} className="align-middle text-xs">{Lang.get('petty_cash.labels.amount')}</th>
                                <th width={150} className="align-middle text-xs">{Lang.get('petty_cash.labels.balance')}</th>
                                <th width={50} className="align-middle text-xs pr-2">{Lang.get('messages.users.labels.table_action')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {props.item.data.length === 0 ?
                                <DataNotFound colSpan={6} message={Lang.get('labels.not_found',{Attribute:Lang.get('petty_cash.labels.menu')})}/>
                                :
                                props.item.data.map((item,index)=>
                                    <PettyCashTableChildRow onApprove={props.onApprove} onDelete={props.onDelete} privilege={props.privilege} onEdit={props.onEdit} selected={props.selected} onCheck={props.onCheck} key={`aa_${index}`} parent={props.item} item={item} index={index}/>
                                )
                            }
                            </tbody>
                        </table>
                    </td>
                </tr>
            }
        </React.Fragment>
    )
}
const PettyCashTableChildRow = (props) => {
    return (
        <tr key={`xn_${props.index}`} style={{backgroundColor:props.item.meta.timestamps.approve.at === null ? 'antiquewhite' : null}}>
            <td className="align-middle text-center pl-2">
                <input checked={props.selected.findIndex((f)=> f === props.item.value) >= 0} data-value={props.item.value} data-period={props.item.period} type="checkbox" onChange={props.onCheck}/>
            </td>
            <td className="align-middle text-xs">
                {props.item.label}
                {props.item.meta.description.length > 0 &&
                    <React.Fragment><br/><em className="text-muted text-xs">{props.item.meta.description}</em></React.Fragment>
                }
            </td>
            <td className="align-middle text-xs" style={{fontSize:8}}>{Lang.get(`petty_cash.labels.${props.item.meta.type}`)}</td>
            <td className="align-middle text-xs">{FormatPrice(props.item.meta.amount,null,false)}</td>
            <td className="align-middle text-xs"><PettyCashChildBalance index={props.index} parent={props.parent} item={props.item}/></td>
            <td className="align-middle text-xs text-right pr-2">
                {props.item.value !== null &&
                    <React.Fragment>
                        <button type="button" className="btn btn-tool" data-toggle="dropdown">
                            <FontAwesomeIcon icon={faCog} size="2xs"/>
                            <span className="sr-only">Toggle Dropdown</span>
                        </button>
                        <div className="dropdown-menu" role="menu">
                            {props.privilege !== null &&
                                <React.Fragment>
                                    {props.privilege.approve && props.item.meta.timestamps.approve.at === null &&
                                        <button onClick={()=>props.onApprove(props.item)} type="button" className="dropdown-item text-xs text-success">
                                            <FontAwesomeIcon icon={faCheckCircle} size="xs" className="mr-1"/>
                                            {Lang.get('petty_cash.approve.menu')}
                                        </button>
                                    }
                                    {props.privilege.update &&
                                        <button onClick={()=>props.onEdit(props.item)} type="button" className="dropdown-item text-xs text-primary">
                                            <FontAwesomeIcon icon={faPencilAlt} size="xs" className="mr-1"/>
                                            {Lang.get('labels.update.label',{Attribute:Lang.get('petty_cash.labels.menu')})}
                                        </button>
                                    }
                                    {props.privilege.delete &&
                                        <button onClick={()=>props.onDelete(props.item)} type="button" className="dropdown-item text-xs text-danger">
                                            <FontAwesomeIcon icon={faTrashAlt} size="xs" className="mr-1"/>
                                            {Lang.get('labels.delete.label',{Attribute:Lang.get('petty_cash.labels.menu')})}
                                        </button>
                                    }
                                </React.Fragment>
                            }
                        </div>
                    </React.Fragment>
                }
            </td>
        </tr>
    );
}
const PettyCashMainBalance = (props) => {
    let response = 0;
    if (typeof props.filtered !== "undefined") {
        if (typeof props.index !== "undefined") {
            props.filtered.map((filtered,indexFiltered)=>{
                if (indexFiltered <= props.index) {
                    response += SumRow(filtered.data);
                }
            });
        }
    }
    return FormatPrice(response,null,false);
}
const PettyCashChildBalance = (props) => {
    let response = 0;
    if (typeof props.parent !== "undefined") {
        if (props.parent !== null) {
            if (typeof props.item !== "undefined") {
                if (props.item !== null) {
                    if (typeof props.index !== "undefined") {
                        if (props.index !== null) {
                            props.parent.data.map((parent,index)=>{
                                if (index <= props.index) {
                                    if (parent.meta.timestamps.approve.at !== null) {
                                        response += parent.meta.amount;
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
    }
    return FormatPrice(response,null,false);
}
const SumRow = (data, type = null, approvedOnly = true) => {
    let response = 0;
    data.map((item)=>{
        if (type === null) {
            if (approvedOnly) {
                if (item.meta.timestamps.approve.at !== null) {
                    response += item.meta.amount;
                }
            } else {
                response += item.meta.amount;
            }
        } else {
            if (item.meta.type === type) {
                if (approvedOnly) {
                    if (item.meta.timestamps.approve.at !== null) {
                        response += item.meta.amount;
                    }
                } else {
                    response += item.meta.amount;
                }
            }
        }
    });
    /*if (type === "output") {
        response = response - response - response;
    }*/
    return response;
}
export const SumEndBalance = (unfiltered, type = null, parse = true) => {
    let response = 0;
    unfiltered.map((parent)=>{
        parent.data.map((child)=>{
            if (child.meta.timestamps.approve.at !== null) {
                if (type === null) {
                    response += child.meta.amount;
                } else {
                    if (type === child.meta.type) {
                        response += child.meta.amount;
                    }
                }
            }
        });
    });
    if (parse) {
        return FormatPrice(response,null,false);
    } else {
        return response;
    }
}
export const PageCards = (props) => {
    return (
        <div className="row">
            <div className="col-md-3 col-sm-6 col-12">
                <div className="info-box shadow-none">
                    <span className="info-box-icon bg-info">
                        <FontAwesomeIcon icon={faWallet}/>
                    </span>
                    <div className="info-box-content">
                        <span className="info-box-text">{Lang.get('petty_cash.labels.end_balance.last')}</span>
                        <span className="info-box-number">
                            {props.loadings.petty_cashes ?
                                <Skeleton variant="text" animation="wave"/>
                                :
                                formatLocaleString(SumEndBalance(props.petty_cashes.last,null,false))
                            }
                        </span>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6 col-12">
                <div className="info-box shadow-sm">
                    <span className="info-box-icon bg-success">
                        <FontAwesomeIcon icon={faMoneyBillWave}/>
                    </span>
                    <div className="info-box-content">
                        <span className="info-box-text">{Lang.get('petty_cash.labels.input')}</span>
                        <span className="info-box-number">
                            {props.loadings.petty_cashes ?
                                <Skeleton variant="text" animation="wave"/>
                                :
                                formatLocaleString(SumEndBalance(props.petty_cashes.unfiltered,"input",false))
                            }
                        </span>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6 col-12">
                <div className="info-box shadow">
                    <span className="info-box-icon bg-warning">
                        <FontAwesomeIcon icon={faMoneyBillWave}/>
                    </span>
                    <div className="info-box-content">
                        <span className="info-box-text">{Lang.get('petty_cash.labels.output')}</span>
                        <span className="info-box-number">
                            {props.loadings.petty_cashes ?
                                <Skeleton variant="text" animation="wave"/>
                                :
                                formatLocaleString(SumEndBalance(props.petty_cashes.unfiltered,"output",false))
                            }
                        </span>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6 col-12">
                <div className="info-box shadow-lg">
                    <span className="info-box-icon bg-danger">
                        <FontAwesomeIcon icon={faMoneyBillAlt}/>
                    </span>
                    <div className="info-box-content">
                        <span className="info-box-text">{Lang.get('petty_cash.labels.end_balance.label')}</span>
                        <span className="info-box-number">
                            {props.loadings.petty_cashes ?
                                <Skeleton variant="text" animation="wave"/>
                                :
                                formatLocaleString(SumEndBalance(props.petty_cashes.unfiltered,null,false))}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
export const PageFilter = (props) => {
    const [visibility,setVisibility] = React.useState(false);
    function onClick (event) {
        event.preventDefault();
        setVisibility(! visibility);
    }
    function onChange(value) {
        props.onSelect(value);
        setVisibility(false);
    }
    return (
        <React.Fragment>
            <button type="button" className="btn btn-outline-secondary btn-sm mr-1 float-left" disabled={props.loadings.petty_cashes} onClick={()=> props.onReload()}>
                <FontAwesomeIcon icon={props.loadings.petty_cashes ? faCircleNotch : faRefresh} spin={props.loadings.petty_cashes} size="2xs"/>
            </button>
            {visibility ?
                <div className="float-left mr-1">
                    <DatePicker showFullMonthYearPicker showMonthYearPicker autoFocus={true}
                                selected={props.filter.period}
                                maxDate={new Date()}
                                className="form-control form-control-sm text-sm"
                                title={Lang.get('petty_cash.labels.period')}
                                disabled={props.loadings.petty_cashes}
                                locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                                onChange={onChange} dateFormat="MMMM yyyy"/>
                </div>
                :
                <button onClick={onClick} type="button" className="btn btn-outline-secondary btn-sm mr-1 float-left" disabled={props.loadings.petty_cashes}>
                    <FontAwesomeIcon icon={faCalendar} size="2xs"/>
                </button>
            }
        </React.Fragment>
    )
}
