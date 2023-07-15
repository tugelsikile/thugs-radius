import React from "react";

export const statusRequirements = (props) => {
    let response = null;
    switch (props.value) {
        case 'pppoe-server':
            response = statusPPPoEServer(props);
            break;
        case 'radius':
            response = statusRadius(props);
            break;
        case 'radius-aaa' :
            response = statusRadiusAAA(props);
            break;
        case 'radius-incoming':
            response = statusRadiusIncoming(props);
            break;
    }
    return response;
}
export const statusPPPoEServer = (props) => {
    return props.status !== null;
}
export const statusRadius = (props) => {
    return props.status !== null;
}
export const statusRadiusAAA = (props)=>{
    return props.status !== null;
}
export const statusRadiusIncoming = (props) => {
    return props.status !== null;
}
