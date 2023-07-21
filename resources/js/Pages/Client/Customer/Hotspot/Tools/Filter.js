// noinspection JSValidateTypes

import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faFilter, faRefresh} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import {FormControlSMReactSelect, ucFirst} from "../../../../../Components/mixedConsts";

export const FilterButton = (props) => {
    return (
        <React.Fragment>
            <button type="button" className="btn btn-outline-secondary btn-sm text-xs mr-1" disabled={props.loading} onClick={()=>props.onReload()}><FontAwesomeIcon icon={props.loading ? faCircleNotch : faRefresh} size="xs" spin={props.loading}/></button>
            <button title={Lang.get('labels.filter',{Attribute:Lang.get('customers.hotspot.labels.menu')})} onClick={props.onClick} disabled={props.loading} type="button" className="btn btn-outline-secondary btn-sm mr-1 text-xs"><FontAwesomeIcon size="sm" icon={faFilter}/></button>
        </React.Fragment>
    )
}
export const FilterWrapper = (props) => {
    return (
        <div className="card card-outline card-info" style={{display:props.open ? 'block' : 'none'}}>
            <div className="card-body px-2 py-2">
                <div className="form-group row mb-0">
                    <div className="col-sm-3">
                        <Select isLoading={props.loading} isDisabled={props.loading}
                                options={props.batches}
                                placeholder={<small>{Lang.get('labels.select.option',{Attribute:Lang.get('customers.hotspot.vouchers.batch')})}</small>}
                                noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('customers.hotspot.vouchers.batch')})}
                                className="text-xs"
                                styles={FormControlSMReactSelect}
                                isClearable
                                value={props.filter.batch}
                                onChange={props.handleBatch}/>
                    </div>
                    <div className="col-sm-3">
                        <Select isLoading={props.loading} isDisabled={props.loading}
                                placeholder={<small>{Lang.get('customers.labels.status.select.label')}</small>}
                                isClearable className="text-xs"
                                styles={FormControlSMReactSelect}
                                options={statusSelection}
                                value={props.filter.status}
                                onChange={props.handleStatus}
                                noOptionsMessage={()=>Lang.get('customers.labels.status.select.not_found')}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
export const statusSelection = [
    { value : 'register', label : ucFirst(Lang.get('customers.labels.status.register')) },
    { value : 'active', label : ucFirst(Lang.get('customers.labels.status.active')) },
    { value : 'inactive', label : ucFirst(Lang.get('customers.labels.status.inactive')) },
    { value : 'expired', label : ucFirst(Lang.get('customers.labels.status.expired')) },
    { value : 'generated', label : ucFirst(Lang.get('customers.labels.status.generated')) },
    { value : 'used', label : ucFirst(Lang.get('customers.labels.status.used')) },
];
