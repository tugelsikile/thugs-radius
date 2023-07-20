import BtnSort from "../../../Auth/User/Tools/BtnSort";
import React from "react";

export const TableHeader = (props) => {
    return (
        <tr>
            {props.customers.filtered.length > 0 &&
                <th className="align-middle text-center pl-2" width={30}>
                    <div style={{zIndex:0}} className="custom-control custom-checkbox">
                        <input id={props.type} data-id="" disabled={props.loadings.customers} onChange={props.onCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                        <label htmlFor={props.type} className="custom-control-label"/>
                    </div>
                </th>
            }
            <th className={props.customers.filtered.length === 0 ? "align-middle pl-2" : "align-middle"} width={80}>
                <BtnSort sort="code"
                         name={Lang.get('customers.labels.code')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="name"
                         name={Lang.get('customers.labels.name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="nas"
                         name={Lang.get('nas.labels.short_name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="profile"
                         name={Lang.get('profiles.labels.short_name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={110}>
                <BtnSort sort="price"
                         name={Lang.get('profiles.labels.price')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={100}>
                <BtnSort sort="status" center={true}
                         name={Lang.get('customers.labels.status.label')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={150}>
                <BtnSort sort="due"
                         name={Lang.get('customers.labels.due.at')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle text-center text-xs pr-2" width={50}>{Lang.get('messages.action')}</th>
        </tr>
    )
}
