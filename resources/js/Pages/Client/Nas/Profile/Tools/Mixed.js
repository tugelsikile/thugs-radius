import React from "react";
import BtnSort from "../../../../Auth/User/Tools/BtnSort";

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
export const TableHeader = (props) => {
    return (
        <tr>
            {props.profiles.filtered.length > 0 &&
                <th rowSpan={2} className="align-middle text-center pl-2" width={30}>
                    <div className="custom-control custom-checkbox">
                        <input id={props.type} data-id="" disabled={props.loadings.profiles} onChange={props.onCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                        <label htmlFor={props.type} className="custom-control-label"/>
                    </div>
                </th>
            }
            <th className="align-middle">
                <BtnSort sort="name"
                         name={Lang.get('profiles.labels.name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="nas"
                         name={Lang.get('nas.labels.name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="pool"
                         name={Lang.get('nas.pools.labels.name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={150}>
                <BtnSort sort="bandwidth"
                         name={Lang.get('bandwidths.labels.name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={100}>
                <BtnSort sort="validity"
                         name={Lang.get('profiles.labels.validity.rate')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={150}>
                <BtnSort sort="price"
                         name={Lang.get('profiles.labels.price')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={100}>
                <BtnSort sort="customers"
                         name={Lang.get('profiles.labels.customers.length')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle text-center pr-2" width={50}>{Lang.get('messages.action')}</th>
        </tr>
    );
}
