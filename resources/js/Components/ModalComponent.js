// noinspection DuplicatedCode

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {DialogActions, DialogTitle} from "@mui/material";
import React from "react";
import {faSave,faClose,faCircleNotch} from "@fortawesome/free-solid-svg-icons";

export const ModalHeader = (props) => {
    return (
        <DialogTitle>
            <button type="button" className="close float-right" onClick={()=>props.loading ? null : props.handleClose()}><span aria-hidden="true">×</span></button>
            <span className="modal-title text-sm">
                {typeof props.form === 'undefined' ?
                    typeof props.title !== 'undefined' ?
                        props.title
                        :
                        "FORM"
                    :
                    typeof props.form.id !== 'undefined' ?
                        props.form.id === null ? props.langs.create : props.langs.update
                        :
                        typeof props.title !== 'undefined' ?
                            props.title
                            :
                            "FORM"
                }
            </span>
        </DialogTitle>
    );
}
export const ButtonSubmit = (props) => {
    return (
        <button type="submit" className="btn  btn-outline-success text-xs" disabled={props.loading}>
            <FontAwesomeIcon spin={props.loading} className="mr-2"
                             icon={props.loading ? faCircleNotch : faSave}/>
            {typeof props.form === 'undefined' ?
                typeof props.pending === 'undefined' && typeof props.submit === 'undefined' ?
                    "Submit"
                    :
                    props.loading ?
                        props.pending
                        :
                        props.submit
                :
                props.form.id === null ?
                    <React.Fragment>
                        {
                            ! props.loading ? props.langs.create
                                :
                                typeof props.pendings === 'undefined' ? props.langs.create
                                    :
                                    typeof props.pendings.create === 'undefined' ? props.langs.create
                                        :
                                        props.pendings.create === null ? props.langs.create
                                            :
                                            props.pendings.create
                        }
                    </React.Fragment>
                    :
                    <React.Fragment>
                        {
                            ! props.loading ? props.langs.update
                                :
                                typeof props.pendings === 'undefined' ? props.langs.update
                                    :
                                    typeof props.pendings.update === 'undefined' ? props.langs.update
                                        :
                                        props.pendings.update === null ? props.langs.update
                                            :
                                            props.pendings.update
                        }
                    </React.Fragment>
            }
        </button>
    );
}
export const ModalFooter = (props) => {
    return (
        <DialogActions className="justify-content-between">
            {typeof props.hideSubmit === 'undefined' ?
                ButtonSubmit(props)
                :
                props.hideSubmit === null ?
                    ButtonSubmit(props)
                    :
                    props.hideSubmit ? null :
                        ButtonSubmit(props)
            }

            {typeof props.buttons === 'undefined' ? null :
                props.buttons === null ? null :
                    props.buttons.length === 0 ? null :
                        props.buttons.map((item,index)=>
                            <React.Fragment key={index}>{item}</React.Fragment>
                        )
            }
            <button type="button" className="btn  text-xs btn-outline-secondary" disabled={props.loading} onClick={()=>props.loading ? null : props.handleClose()}>
                <FontAwesomeIcon icon={faClose} className="mr-2"/>
                {Lang.get('messages.close')}
            </button>
        </DialogActions>
    )
}
