import React from "react";
import BtnSort from "../../../Auth/User/Tools/BtnSort";
import {DataNotFound, TableCheckBox} from "../../../../Components/TableComponent";
import {FormatPrice} from "../../Customer/Tools/Mixed";
import {formatLocalePeriode, FormControlSMReactSelect} from "../../../../Components/mixedConsts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faEllipsisV,
    faFilter,
    faGear,
    faPencilAlt,
    faPlus,
    faRefresh,
    faTimes
} from "@fortawesome/free-solid-svg-icons";
import id from "date-fns/locale/id";
import en from "date-fns/locale/en-US";
import DatePicker from "react-datepicker";
import Select from "react-select";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";

export const CashFlowType = [
    { value : 'credit', label : Lang.get('cash_flow.labels.credit') },
    { value : 'debit', label : Lang.get('cash_flow.labels.debit') },
];
export const TableHeader = (props) => {
    return (
        <tr>
            {props.cash_flows.filtered.length > 0 &&
                <th className="align-middle text-center pl-2" width={30}>
                    <div style={{zIndex:0}} className="custom-control custom-checkbox">
                        <input id={props.type} data-id="" disabled={props.loadings.cash_flows} onChange={props.onCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                        <label htmlFor={props.type} className="custom-control-label"/>
                    </div>
                </th>
            }
            <th className="align-middle" width={130}>
                <BtnSort sort="code"
                         name={Lang.get('cash_flow.labels.code')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="account"
                         name={Lang.get('cash_flow.labels.account.label')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="category"
                         name={Lang.get('cash_flow.labels.category.label')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={130}>
                <BtnSort sort="period"
                         name={Lang.get('cash_flow.labels.period')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="description"
                         name={Lang.get('cash_flow.labels.description')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={120}>
                <BtnSort sort="debit"
                         name={Lang.get('cash_flow.labels.debit')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={120}>
                <BtnSort sort="credit"
                         name={Lang.get('cash_flow.labels.credit')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle text-xs pr-2" width={30}>{Lang.get('messages.action')}</th>
        </tr>
    )
}
export const TableBody = (props) => {
    return (
        props.cash_flows.filtered.length === 0 ?
            <DataNotFound colSpan={9} message={Lang.get('labels.not_found',{Attribute:Lang.get('cash_flow.labels.menu')})}/>
            :
            props.cash_flows.filtered.map((item)=>
                <TableBodyRow key={item.value} {...props} item={item} onCheck={props.onCheck} onEdit={props.onEdit} onDelete={props.onDelete}/>
            )
    );
}
export const TableBodyRow = (props) => {
    function handleUpdate(e) {
        e.preventDefault();
        props.onEdit(props.item);
    }
    function handleDelete(e){
        e.preventDefault();
        props.onDelete(props.item);
    }
    return (
        <tr key={props.item.value}>
            <TableCheckBox item={props.item} className="pl-2"
                           checked={props.cash_flows.selected.findIndex((f) => f === props.item.value) >= 0}
                           loading={props.loadings.cash_flows} handleCheck={props.onCheck}/>
            <td className="align-middle text-xs">{props.item.meta.code}</td>
            <td className="align-middle text-xs">{props.item.meta.account.label}</td>
            <td className="align-middle text-xs">{props.item.meta.category.label}</td>
            <td className="align-middle text-xs">{formatLocalePeriode(props.item.meta.period, 'DD MMMM yyyy')}</td>
            <td className="align-middle text-xs">{props.item.label}</td>
            <td className="align-middle text-xs">{FormatPrice(props.item.meta.amount.debit) }</td>
            <td className="align-middle text-xs">{FormatPrice(props.item.meta.amount.credit) }</td>
            <td className="align-middle text-xs pr-2">
                {props.privilege !== null &&
                    <React.Fragment>
                        <button type="button" className="btn btn-tool" data-toggle="dropdown">
                            <FontAwesomeIcon icon={faEllipsisV} size="xs"/>
                        </button>
                        <div className="dropdown-menu" role="menu">
                            {props.privilege.update &&
                                <a onClick={handleUpdate} className="dropdown-item text-primary text-xs" href="#">
                                    <FontAwesomeIcon icon={faPencilAlt} size="xs" className="mr-1"/>
                                    {Lang.get('labels.update.label', {Attribute:Lang.get('cash_flow.labels.menu')})}
                                </a>
                            }
                            {props.privilege.delete &&
                                <a onClick={handleDelete} className="dropdown-item text-danger text-xs" href="#">
                                    <FontAwesomeIcon icon={faTrashAlt} size="xs" className="mr-1"/>
                                    {Lang.get('labels.delete.label', {Attribute:Lang.get('cash_flow.labels.menu')})}
                                </a>
                            }
                        </div>
                    </React.Fragment>
                }
            </td>
        </tr>
    );
}
export const PageFilterStatus = (props) => {
    function clearAccount(e) {
        e.preventDefault();
        props.onSelect(null,'account');
    }
    function clearCategory(e){
        e.preventDefault();
        props.onSelect(null,'category');
    }
    return (
        <div className="row items-align-center my-4  d-none d-lg-flex">
            <div className="col-md">
                <ul className="nav nav-pills justify-content-start">
                </ul>
            </div>
            <div className="col-md-auto ml-auto text-right">
                {props.filter.account !== null &&
                    <span className="small bg-white border py-1 px-2 rounded mr-2">
                        <a onClick={clearAccount} href="#" className="text-muted"><FontAwesomeIcon icon={faTimes} size="xs" className="mx-1"/></a>
                        <span className="text-muted">{Lang.get('cash_flow.labels.account.label')} : <strong>{props.filter.account.label}</strong></span>
                    </span>
                }
                {props.filter.category !== null &&
                    <span className="small bg-white border py-1 px-2 rounded mr-2">
                        <a onClick={clearCategory} href="#" className="text-muted"><FontAwesomeIcon icon={faTimes} size="xs" className="mx-1"/></a>
                        <span className="text-muted">{Lang.get('cash_flow.labels.category.label')} : <strong>{props.filter.category.label}</strong></span>
                    </span>
                }
                <span className="small bg-white border py-1 px-2 rounded">
                    <span className="text-muted">{formatLocalePeriode(props.filter.periods.start,'DD MMMM yyyy')} - {formatLocalePeriode(props.filter.periods.end, 'DD MMMM yyyy')}</span>
                </span>
            </div>
        </div>
    )
}
export const FilterPage = (props) => {
    const [periods,setPeriods] = React.useState(false);
    function handlePeriod(e) {
        e.preventDefault();
        setPeriods(! periods);
    }
    function submit(e){
        e.preventDefault();
        setPeriods(false);
        props.onSubmit();
    }
    function handleSelectPeriod(e,name) {
        setPeriods(false);
        props.onPeriod(e,name);
    }
    function handleSelect(value, name) {
        setPeriods(false);
        props.onSelect(value, name);
    }
    return (
        <React.Fragment>
            {periods ?
                <React.Fragment>
                    <button className="btn btn-outline-secondary btn-sm float-left mr-1" disabled={props.loadings.cash_flows} onClick={handlePeriod}>
                        <FontAwesomeIcon icon={faTimes}/>
                    </button>
                    <div className="float-left mr-1">
                        <DatePicker
                            selected={props.filter.periods.start}
                            onChange={(e)=>handleSelectPeriod(e, 'start')}
                            title={Lang.get('cash_flow.labels.period')}
                            className="form-control text-xs form-control-sm"
                            disabled={props.loadings.cash_flows}
                            locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                            dateFormat="dd MMMM yyyy"/>
                    </div>
                    <div className="float-left mr-1">
                        <DatePicker
                            selected={props.filter.periods.end}
                            onChange={(e)=>handleSelectPeriod(e, 'end')}
                            title={Lang.get('cash_flow.labels.period')}
                            className="form-control text-xs form-control-sm"
                            disabled={props.loadings.cash_flows}
                            locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                            dateFormat="dd MMMM yyyy"/>
                    </div>
                    <div className="float-left mr-1" style={{minWidth:200}}>
                        <Select options={props.accounts}
                                value={props.filter.account}
                                onChange={(e)=>handleSelect(e,'account')}
                                isClearable
                                placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('cash_flow.labels.account.label')})}
                                noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('cash_flow.labels.account.label')})}
                                styles={FormControlSMReactSelect}/>
                    </div>
                    <div className="float-left mr-1" style={{minWidth:200}}>
                        <Select options={props.categories}
                                value={props.filter.category}
                                onChange={(e)=>handleSelect(e,'category')}
                                isClearable
                                placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('cash_flow.labels.category.label')})}
                                noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('cash_flow.labels.category.label')})}
                                styles={FormControlSMReactSelect}/>
                    </div>
                    <button onClick={submit} type="button" className="btn btn-outline-primary btn-sm float-left" disabled={props.loadings.cash_flows}>
                        <FontAwesomeIcon icon={faFilter} size="xs" className="mr-1"/>
                        {Lang.get('labels.filter',{Attribute:Lang.get('cash_flow.labels.menu')})}
                    </button>
                </React.Fragment>
                :
                <React.Fragment>
                    <button className="btn btn-outline-secondary btn-sm mr-1" type="button" disabled={props.loadings.cash_flows} onClick={()=>props.onReload()}><FontAwesomeIcon icon={faRefresh} size="xs"/></button>
                    <button onClick={handlePeriod} className="btn btn-outline-secondary btn-sm mr-1" type="button" disabled={props.loadings.cash_flows}><FontAwesomeIcon icon={faFilter} size="xs"/></button>
                    {props.privilege !== null && props.privilege.create &&
                        <button type="button" className="btn btn-outline-primary btn-sm mr-1" disabled={props.loadings.cash_flows} onClick={() => props.onModal()}>
                            <FontAwesomeIcon icon={faPlus} size="xs" className="mr-1"/>
                            {Lang.get('labels.create.label', {Attribute: Lang.get('cash_flow.labels.menu')})}
                        </button>
                    }
                    {props.privilege !== null && props.privilege.delete && props.cash_flows.selected.length > 0 &&
                        <button type="button" className="btn btn-outline-danger btn-sm mr-1" disabled={props.loadings.cash_flows} onClick={() => props.onDelete()}>
                            <FontAwesomeIcon icon={faTrashAlt} size="xs" className="mr-1"/>
                            {Lang.get('labels.delete.select', {Attribute: Lang.get('cash_flow.labels.menu')})}
                        </button>
                    }
                </React.Fragment>
            }
        </React.Fragment>
    )
}
