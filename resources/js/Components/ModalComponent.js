// noinspection DuplicatedCode

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {DialogActions, DialogTitle} from "@mui/material";
import React from "react";

export const ModalHeader = (props) => {
    return (
        <DialogTitle>
            <button type="button" className="close float-right" onClick={()=>props.loading ? null : props.handleClose()}><span aria-hidden="true">×</span></button>
            <span className="modal-title text-sm">
                {props.form.id === null ? props.langs.create : props.langs.update }
            </span>
        </DialogTitle>
    );
}
export const ModalFooter = (props) => {
    return (
        <DialogActions className="justify-content-between">
            <button type="submit" className="btn btn-success" disabled={props.loading}>
                <FontAwesomeIcon spin={props.loading} className="mr-1"
                                 icon={props.loading ? 'circle-notch' : 'save'}/>
                {props.form.id === null ? props.langs.create : props.langs.update}
            </button>
            {typeof props.buttons === 'undefined' ? null :
                props.buttons === null ? null :
                    props.buttons.length === 0 ? null :
                        props.buttons.map((item,index)=>
                            <React.Fragment key={index}>{item}</React.Fragment>
                        )
            }
            <button type="button" className="btn btn-default" disabled={props.loading} onClick={()=>props.loading ? null : props.handleClose()}>
                <i className="fas fa-times mr-1"/> {Lang.get('messages.close')}
            </button>
        </DialogActions>
    )
}
