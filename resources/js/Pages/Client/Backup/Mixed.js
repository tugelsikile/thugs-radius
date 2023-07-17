import React from "react";
import {Dialog, DialogContent} from "@mui/material";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";

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
