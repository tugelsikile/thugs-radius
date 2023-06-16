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
export const confirmDialog = (app, ids, method = 'delete', url = null, title = null, message = null, callBack = null, icon = "question",inputName = 'id') => {
    if (message === null) message = "Anda yakin akan melakukan aksi ini ?";
    if (title === null) title = "Konfirmasi";
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
            confirmButtonText : Lang.get('messages.confirm'), cancelButtonText : Lang.get('messages.cancel'), closeOnConfigm : false,
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
                        console.log(error);
                        Swal.showValidationMessage(error.response.data.message, true);
                    })
            }
        });
    }
}
