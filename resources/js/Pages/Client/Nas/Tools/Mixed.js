import React from "react";
import BtnSort from "../../../Auth/User/Tools/BtnSort";

export const TableHeader = (props) => {
    return (
        <React.Fragment>
            <tr>
                {props.nas.filtered.length > 0 &&
                    <th rowSpan={2} className="align-middle text-center pl-2" width={30}>
                        <div className="custom-control custom-checkbox">
                            <input data-id="" disabled={props.loading} onChange={props.onCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id="checkAll"/>
                            <label htmlFor="checkAll" className="custom-control-label"/>
                        </div>
                    </th>
                }
                <th rowSpan={2} className="align-middle">
                    <BtnSort sort="name"
                             name={Lang.get('nas.labels.name')}
                             filter={props.filter}
                             handleSort={props.onSort}/>
                </th>
                <th colSpan={5} className="align-middle text-xs">{Lang.get('nas.labels.method.label')}</th>
                <th rowSpan={2} className="align-middle">
                    <BtnSort sort="status"
                             name={Lang.get('nas.labels.status.short')}
                             filter={props.filter}
                             handleSort={props.onSort}/>
                </th>
                <th rowSpan={2} className="align-middle text-center text-xs pr-2" width={30}>{Lang.get('messages.action')}</th>
            </tr>
            <tr>
                <th className="align-middle">
                    <BtnSort sort="method"
                             name={Lang.get('nas.labels.method.short')}
                             filter={props.filter}
                             handleSort={props.onSort}/>
                </th>
                <th className="align-middle">
                    <BtnSort sort="host"
                             name={Lang.get('nas.labels.ip.short')}
                             filter={props.filter}
                             handleSort={props.onSort}/>
                </th>
                <th className="align-middle">
                    <BtnSort sort="port"
                             name={Lang.get('nas.labels.port.short')}
                             filter={props.filter}
                             handleSort={props.onSort}/>
                </th>
                <th className="align-middle">
                    <BtnSort sort="user"
                             name={Lang.get('nas.labels.user.short')}
                             filter={props.filter}
                             handleSort={props.onSort}/>
                </th>
                <th className="align-middle">
                    <BtnSort sort="pass"
                             name={Lang.get('nas.labels.pass.short')}
                             filter={props.filter}
                             handleSort={props.onSort}/>
                </th>
            </tr>
        </React.Fragment>
    )
}
