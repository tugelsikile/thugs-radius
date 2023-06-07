import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export const TableAction = (props) => {
    return (
        <td className="align-middle text-center">
            {props.privilege !== null &&
                <>
                    <button type="button" className="btn btn-tool dropdown-toggle dropdown-icon" data-toggle="dropdown"><span className="sr-only">Toggle Dropdown</span></button>
                    <div className="dropdown-menu" role="menu">
                        {props.privilege.update &&
                            <button type="button" onClick={()=>props.toggleModal(props.item)} className="dropdown-item text-primary"><i className="fa fa-pencil-alt mr-1"/> {props.langs.update}</button>
                        }
                        {props.privilege.delete &&
                            <button type="button" onClick={()=>props.confirmDelete(props.item)} className="dropdown-item text-danger"><i className="fa fa-trash-alt mr-1"/> {props.langs.delete}</button>
                        }
                    </div>
                </>
            }
        </td>
    );
}
export const DataNotFound = (props) => {
    return (
        <tr>
            <td colSpan={props.colSpan} className="align-middle text-center">
                <FontAwesomeIcon icon="exclamation-triangle" className="mr-2 text-warning"/>
                <strong>{props.message}</strong>
            </td>
        </tr>
    );
}
export const TableCheckBox = (props) => {
    return (
        <td className="align-middle text-center">
            <div className="custom-control custom-checkbox">
                <input id={`cbx_${props.item.value}`}
                       data-id={props.item.value}
                       checked={props.checked}
                       disabled={props.loading}
                       onChange={props.handleCheck}
                       className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                <label htmlFor={`cbx_${props.item.value}`} className="custom-control-label"/>
            </div>
        </td>
    );
}
