import BtnSort from "../../../../../Auth/User/Tools/BtnSort";
import React from "react";

export const poolModuleList = [
    { value : 'mikrotik', label : 'Mikrotik IP Pool' },
    { value : 'radius', label : 'Radius IP Pool' }
];
export const TableHeader = (props) => {
    return (
        <tr>
            {props.pools.filtered.length > 0 &&
                <th rowSpan={2} className="align-middle text-center pl-2" width={30}>
                    <div className="custom-control custom-checkbox">
                        <input id={`cbxAll_${props.type}`} data-id="" disabled={props.loadings.pools} onChange={props.onCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                        <label htmlFor={`cbxAll_${props.type}`} className="custom-control-label"/>
                    </div>
                </th>
            }
            <th className={props.pools.filtered.length === 0 ? "align-middle pl-2" : "align-middle"}>
                <BtnSort sort="name"
                         name={Lang.get('nas.pools.labels.name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="nas"
                         name={Lang.get('nas.labels.name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="module"
                         name={Lang.get('nas.pools.labels.module')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={150}>
                <BtnSort sort="first"
                         name={Lang.get('nas.pools.labels.address.first')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={150}>
                <BtnSort sort="last"
                         name={Lang.get('nas.pools.labels.address.last')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle text-center pr-2" width={30}>{Lang.get('messages.action')}</th>
        </tr>
    );
}
