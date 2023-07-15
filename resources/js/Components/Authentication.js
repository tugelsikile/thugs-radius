// noinspection BadExpressionStatementJS,JSUnresolvedVariable

import Axios from "axios";
import {logoutSubmit, myPrivileges} from "../Services/AuthService";

export const getRootUrl = () => {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user === null) {
        logout();
    } else {
        if(user.meta.level.name === 'Customer') {
            return `${window.origin}/customer`;
        } else if (user.meta.level.for_client) {
            return `${window.origin}/clients`;
        } else {
            return `${window.origin}/auth`;
        }
    }
}
export const clearLoginStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = window.origin + '/login';
}
export const logout = async () => {
    try {
        let response = await logoutSubmit();
        if (response.data.params === null) {
            clearLoginStorage();
        } else {
            clearLoginStorage();
        }
    } catch (e) {
        clearLoginStorage();
    }
}
export const getPrivileges = async (routes = null) => {
    let routers = [];
    try {
        const formData = new FormData();
        let user = JSON.parse(localStorage.getItem('user'));
        if (user === null) {
            await logout();
        } else {
            let isCustomer = false;
            isCustomer = user.meta.level.name.toLowerCase() === 'customer';
            if (isCustomer && routes !== null) {
                window.location.href = getRootUrl();
            }
            if (routes !== null) {
                if (Array.isArray(routes)) {
                    routes.map((item,index)=>{
                        formData.append(`route[${index}]`, item.route);
                        routers.push({[item.can] : false});
                    });
                } else {
                    formData.append('route[0]', routes);
                    routers.push({read:false,create:false,update:false,delete:false});
                }
            }
            let response = await myPrivileges(formData);
            if (response.data.params === null) {
                return null;
            } else {
                if (response.data.params.privileges !== null) {
                    if (Array.isArray(response.data.params.privileges)) {
                        if (response.data.params.privileges.length > 1) {
                            let privilege = {
                                read : response.data.params.privileges[0].read,
                                create : response.data.params.privileges[0].create,
                                update : response.data.params.privileges[0].update,
                                delete : response.data.params.privileges[0].delete,
                            };
                            response.data.params.privileges.map((item,index)=>{
                                if (index > 0) {
                                    let privString = item.value;
                                    privString = privString.split('.');
                                    privString = privString[privString.length - 1];
                                    privString = privString.replaceAll('-','_');
                                    if (item.func) {
                                        privilege[privString] = item.read;
                                    } else {
                                        if (typeof privilege[privString] === 'undefined') {
                                            privilege[privString] = {};
                                        }
                                        privilege[privString].read = item.read;
                                        privilege[privString].create = item.create;
                                        privilege[privString].update = item.update;
                                        privilege[privString].delete = item.delete;
                                    }
                                }
                            });
                            response.data.params.privileges = privilege;
                        }
                        console.log(response.data.params);
                        return response.data.params;
                    } else {
                        if (! response.data.params.privileges.read) {
                            window.location.href = getRootUrl();
                        }
                    }
                }
                return response.data.params;
                //console.log(response.data.params);
                /*if (response.data.params.privileges !== null) {
                    if (! response.data.params.privileges.read) {
                        window.location.href = getRootUrl();
                    }
                }
                return response.data.params;*/
            }
        }
    } catch (e) {
        console.log(e);
        if (e.response.status === 401) logout();
        return null;
    }
}
