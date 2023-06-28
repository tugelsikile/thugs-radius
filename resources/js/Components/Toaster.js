// noinspection JSCheckFunctionSignatures,JSIgnoredPromiseFromCall
// noinspection JSIgnoredPromiseFromCall

import Axios from "axios";
import React from "react";
import 'react-toastify/dist/ReactToastify.css';
import {toast} from "react-toastify";
import Swal from "sweetalert2";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDoubleRight} from "@fortawesome/free-solid-svg-icons";

export const sanitizeMessage = (message) => {
    message = message.split("\n");
    return (
        <ul className="list-unstyled mb-0">
            {message.map((item, index) =>
                <li key={index}>{message.length > 1 && <FontAwesomeIcon icon={faAngleDoubleRight} size="xs"/>} {item}</li>
            )}
        </ul>
    );
}
export const showPromise = (message, promise) => {
    toast.promise(promise, message,{autoClose : 2000, bodyClassName : 'text-xs'});
}
export const showError = (message) => {
    toast.error(sanitizeMessage(message), { bodyClassName : 'text-xs'});
}
export const showSuccess = (message) => {
    toast.success(sanitizeMessage(message), { bodyClassName : 'text-xs'});
}
export const confirmDialog = (app, ids, method = 'delete', url = null, title = null, message = null, callBack = null, icon = "question",inputName = 'id',deleteIndex = null,confirmText = null,cancelText = null) => {
    if (message === null) message = Lang.get('labels.confirm.message');
    if (message.length === 0) message = Lang.get('labels.confirm.message');
    if (title === null) title = Lang.get('labels.confirm.title');
    if (title.length === 0) title = Lang.get('labels.confirm.title');
    if (confirmText === null) confirmText = Lang.get('labels.confirm.yes');
    if (confirmText.length === 0) confirmText = Lang.get('labels.confirm.yes');
    if (cancelText === null) cancelText = Lang.get('labels.confirm.cancel');
    if (cancelText.length === 0) cancelText = Lang.get('labels.confirm.cancel');
    const  formData = new FormData();
    formData.append('_method', method);
    if (ids !== null) {
        if (typeof ids === 'object') {
            ids.map((item, index) => {
                formData.append(`${inputName}[${index}]`, item);
            });
        } else {
            formData.append(inputName, ids);
        }
        message = message.replaceAll("\n",'<br>');
        Swal.fire({
            title : title, html : message, icon : icon, showCancelButton : true,
            confirmButtonText : confirmText, cancelButtonText : cancelText, closeOnConfigm : false,
            showLoaderOnConfirm : true, allowOutsideClick : () => !Swal.isLoading(), allowEscapeKey : () => ! Swal.isLoading(),
            preConfirm() {
                let response = Axios({headers : {"Accept" : "application/json", "Authorization" : `Bearer ${localStorage.getItem('token')}`}, method : "post", data : formData, url : url});
                return Promise.resolve(response)
                    .then((response) => {
                        if (response.data.params === null) {
                            Swal.showValidationMessage(response.data.message, true);
                            Swal.hideLoading();
                        } else {
                            Swal.close();
                            showSuccess(response.data.message);
                            if (callBack !== null) {
                                eval(callBack);
                            }
                        }
                    })
                    .catch((error) => {
                        Swal.showValidationMessage(error.response.data.message, true);
                    })
            }
        });
    }
}
