import React from "react";
import {Dialog, DialogContent} from "@mui/material";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faPlay} from "@fortawesome/free-solid-svg-icons";

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
