import React from "react";
import BtnSort from "../../Auth/User/Tools/BtnSort";
import {Dialog, DialogContent, DialogTitle} from "@mui/material";
import {parseInputFloat, pipeIp, responseMessage} from "../../../Components/mixedConsts";
import {crudOlt} from "../../../Services/OltService";
import {showError, showSuccess} from "../../../Components/Toaster";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";
import MaskedInput from "react-text-mask";
import {NumericFormat} from "react-number-format";

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

export const TableContentGponState = (props)=> {
    return (
        <tr key={`x_${props.index}`}>
            <td className="align-middle text-center text-xs pl-2">{props.index + 1}</td>
            <td className="align-middle text-xs">{props.item.circuit}</td>
            <td className="align-middle text-xs">{props.item.mac}</td>
            <td className="align-middle text-xs text-center">
                {props.item.status === 'online' ?
                    <span className="badge badge-success">ONLINE</span>
                    :
                    props.item.status === 'offline' ?
                        <span className="badge badge-secondary">OFFLINE</span>
                        :
                        props.item.status === 'lost' ?
                            <span className="badge badge-danger">LOST</span>
                            :
                            <span className="badge badge-warning">DYING GASP</span>
                }
            </td>
            <td className="align-middle text-xs text-center pr-2"></td>
        </tr>
    )
}
