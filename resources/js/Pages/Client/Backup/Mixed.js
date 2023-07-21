import React from "react";
import {Dialog, DialogContent} from "@mui/material";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faPlay} from "@fortawesome/free-solid-svg-icons";
import BtnSort from "../../Auth/User/Tools/BtnSort";

export const GetLocalCounter = (props) => {
    let response = 0;
    if (props.item !== null) {
        switch (props.item.value) {
            case 'nas':
                response = props.item.data.filter((f)=> f.value === null).length;
                break;
        }
        response = props.item.data.filter((f)=> f.value !== null).length;
    }
    return response;
}
export const ButtonPlay = (props) => {
    return (
        <button disabled={props.item.loading || props.loading || props.lists.labels.filter((f)=> f.loading).length > 0} onClick={props.item.handle} type="button" className="btn btn-block btn-outline-primary btn-xs">
            <FontAwesomeIcon icon={props.item.loading ? faCircleNotch : faPlay} spin={props.item.loading} size="xs"/>
        </button>
    )
}
export const TableHeader = (props) => {
    return (
        <tr>
            {props.backups.filtered.length > 0 &&
                <th className="align-middle text-center pl-2" width={30}>
                    <div style={{zIndex:0}} className="custom-control custom-checkbox">
                        <input id={props.type} data-id="" disabled={props.loadings.backups} onChange={props.onCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                        <label htmlFor={props.type} className="custom-control-label"/>
                    </div>
                </th>
            }
            <th className={props.backups.filtered.length > 0 ? "align-middle" : "align-middle pl-2"}>
                <BtnSort sort="name"
                         name={Lang.get('backup.labels.name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="date"
                         name={Lang.get('backup.labels.date')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={70}>
                <BtnSort sort="size"
                         name={Lang.get('backup.labels.size')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle text-center pr-2 text-xs" width={50}>{Lang.get('messages.action')}</th>
        </tr>
    )
}
