import BtnSort from "../../../User/Tools/BtnSort";
import React from "react";

export const TableHeader = (props) => {
    return (
        <tr>
            {props.taxes.filtered.length > 0 &&
                <th className="align-middle text-center pl-2" width={30}>
                    <div className="custom-control custom-checkbox">
                        <input id={props.type} data-id="" disabled={props.loadings.taxes} onChange={props.onCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                        <label htmlFor={props.type} className="custom-control-label"/>
                    </div>
                </th>
            }
            <th className={props.taxes.filtered.length === 0 ? "align-middle pl-2" : "align-middle"} width={120}>
                <BtnSort sort="code"
                         name={Lang.get('taxes.labels.code')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="name"
                         name={Lang.get('taxes.labels.name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={100}>
                <BtnSort sort="percent"
                         name={Lang.get('taxes.labels.percent')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle text-center text-xs pr-2" width={40}>
                {Lang.get('messages.action')}
            </th>
        </tr>
    )
}
