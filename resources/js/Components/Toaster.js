// noinspection JSCheckFunctionSignatures
import Axios from "axios";
import React from "react";
import 'react-toastify/dist/ReactToastify.css';
import {toast} from "react-toastify";
import Swal from "sweetalert2";

export const sanitizeMessage = (message) => {
    message = message.split("\n");
    return (
        <ul className="list-unstyled">
            {message.map((item, index) =>
                <li className="small" key={index}>{message.length > 1 && <i className="fas fa-minus"/>} {item}</li>
            )}
        </ul>
    );
}
export const showError = (message) => {
    toast.error(sanitizeMessage(message));
}
export const showSuccess = (message) => {
    toast.success(sanitizeMessage(message));
}
export const confirmDialog = (app, ids, method = 'delete', url = null, title = null, message = null, callBack = null) => {
    if (message === null) message = "Anda yakin akan melakukan aksi ini ?";
    if (title === null) title = "Konfirmasi";
    const  formData = new FormData();
    formData.append('_method', method);
    if (ids !== null) {
        if (typeof ids === 'object') {
            ids.map((item, index) => {
                formData.append('id[]', item);
            });
        } else {
            formData.append('id', ids);
        }
        Swal.fire({
            title : title, html : message, icon : "question", showCancelButton : true,
            confirmButtonText : "Konfirmasi", cancelButtonText : "Batal", closeOnConfigm : false,
            showLoaderOnConfirm : true, allowOutsideClick : () => !Swal.isLoading(), allowEscapeKey : () => ! Swal.isLoading(),
            preConfirm(inputValue) {
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
