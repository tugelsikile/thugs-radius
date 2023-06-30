import React from "react";
import BtnSort from "../../User/Tools/BtnSort";
import {formatLocaleDate, ucWord} from "../../../../Components/mixedConsts";
import {FormatPrice} from "../../../Client/Customer/Tools/Mixed";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export const VillageComponent = ({children, ...props}) => {
    //console.log(children,props, getIndex(props.innerProps.id), props.options.length);
    return (
        <div onMouseOver={onMouseOver} onMouseOut={onMouseOut} id={props.innerProps.id}
             style={{cursor:'pointer',borderBottom : getIndex(props.innerProps.id) === props.options.length ? 'none' : 'solid 1px #ccc'}}
             className="p-2" onClick={()=>props.setValue(props.data)}>
            <span className="text-sm">{props.data.label}</span><br/>
            <small className="text-muted text-xs">
                {props.data.meta.district.label} {props.data.meta.district.meta.city.label} {props.data.meta.district.meta.city.meta.province.label}
            </small>
        </div>
    )
}
export const getIndex = (props) => {
    let index = props.split('-');
    index = index[index.length - 1];
    return parseInt(index) + 1;
}
export const onMouseOver = (event) => {
    let element = event.currentTarget;
    element.style.backgroundColor = '#70a7ff';
    element.style.borderBottom = 'solid 1px #70a7ff';
}
export const onMouseOut = (event) => {
    let element = event.currentTarget;
    element.style.backgroundColor = '#fff';
    element.style.borderBottom = 'solid 1px #ccc';
}
export const TableHeader = (props) => {
    return (
        <tr>
            {props.companies.filtered.length > 0 &&
                <th className="align-middle text-center pl-2" width={30}>
                    <div className="custom-control custom-checkbox">
                        <input data-id="" disabled={props.loadings.companies} onChange={props.onCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id={`cbx_${props.type}`}/>
                        <label htmlFor={`cbx_${props.type}`} className="custom-control-label"/>
                    </div>
                </th>
            }
            <th className={props.companies.filtered.length === 0 ? "align-middle pl-2" : "align-middle"} width={80}>
                <BtnSort sort="code"
                         name={Lang.get('companies.labels.table_columns.code')}
                         filter={props.filter}
                         handleSort={props.onSort}/>
            </th>
            <th className="align-middle">
                <BtnSort sort="name"
                         name={Lang.get('companies.labels.table_columns.name')}
                         filter={props.filter}
                         handleSort={props.onSort}/>
            </th>
            <th className="align-middle text-xs">
                {Lang.get('companies.packages.labels.table_columns.name')}
            </th>
            <th className="align-middle" width={150}>
                <BtnSort sort="active"
                         name={Lang.get('companies.labels.table_columns.active')}
                         filter={props.filter}
                         handleSort={props.onSort}/>
            </th>
            <th className="align-middle" width={150}>
                <BtnSort sort="expired"
                         name={Lang.get('companies.labels.table_columns.expired.at')}
                         filter={props.filter}
                         handleSort={props.onSort}/>
            </th>
            <th className="align-middle text-center text-xs pr-2" width={50}>{Lang.get('messages.users.labels.table_action')}</th>
        </tr>
    )
}
export const CompanyPopover = (props) => {
    return (
        <div className="card mb-0 card-outline card-info" style={{minWidth:300,maxWidth:500}}>
            <div className="card-header p-2 text-right">
                <label className="card-title text-xs">{props.data.meta.code}</label>
            </div>
            <div className="card-body p-0">
                <table className="table table-borderless table-striped table-sm">
                    <tbody>
                    <tr>
                        <td className="align-middle text-xs pl-2">{Lang.get('companies.labels.name')}</td>
                        <td width={10} className="align-middle text-center text-xs">:</td>
                        <td className="align-middle text-xs pr-2">{props.data.label}</td>
                    </tr>
                    <tr>
                        <td className="align-middle text-xs pl-2">{Lang.get('companies.labels.address')}</td>
                        <td className="align-middle text-center text-xs">:</td>
                        <td className="align-middle text-xs pr-2">
                            {props.data.meta.address.street}
                            {props.data.meta.address.village !== null && `, ${ucWord(props.data.meta.address.village.name)}`}
                            {props.data.meta.address.district !== null && `, ${ucWord(props.data.meta.address.district.name)}`}
                            {props.data.meta.address.city !== null && `, ${ucWord(props.data.meta.address.city.name)}`}
                            {props.data.meta.address.province !== null && `, ${ucWord(props.data.meta.address.province.name)}`}
                            {props.data.meta.address.postal !== null && props.data.meta.address.postal.length === 5 && `, ${props.data.meta.address.postal}`}
                        </td>
                    </tr>
                    <tr>
                        <td className="align-middle text-xs pl-2">{Lang.get('companies.labels.phone')}</td>
                        <td className="align-middle text-center text-xs">:</td>
                        <td className="align-middle text-xs pr-2">{props.data.meta.address.phone}</td>
                    </tr>
                    <tr>
                        <td className="align-middle text-xs pl-2">{Lang.get('companies.labels.email')}</td>
                        <td className="align-middle text-center text-xs">:</td>
                        <td className="align-middle text-xs pr-2">{props.data.meta.address.email}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export const CompanyPackagePopover = (props) => {
    return (
        <div className="mb-0 card card-outline card-info" style={{minWidth:200,maxWidth:500}}>
            <div className="card-header p-2">
                <label className="card-title text-xs">{Lang.get('companies.packages.labels.menu')}</label>
            </div>
            <div className="card-body p-0">
                <table className="table-borderless table-sm table-striped">
                    <thead>
                    <tr>
                        <th width={30} className="align-middle text-xs pl-2">#</th>
                        <th className="align-middle text-xs">{Lang.get('companies.packages.labels.name')}</th>
                        <th width={120} className="align-middle text-xs pr-2">{Lang.get('companies.packages.labels.price')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.data.meta.packages.map((item,index)=>
                        <tr key={item.value}>
                            <td className="align-middle text-xs pl-2">{index + 1}</td>
                            <td className="align-middle text-xs">{item.meta.package.label}</td>
                            <td className="align-middle text-xs pr-2">{FormatPrice(item.meta.package.meta.prices)}</td>
                        </tr>
                    )}
                    {props.data.meta.taxes.map((item,index)=>
                        <tr key={item.value}>
                            <td className="align-middle text-xs pl-2">{1 + index + props.data.meta.packages.length}</td>
                            <td className="align-middle text-xs">{item.meta.tax.label}</td>
                            <td className="align-middle text-xs pr-2">{FormatPrice(sumTaxCompany(props.data, index))}</td>
                        </tr>
                    )}
                    {props.data.meta.discounts.map((item,index)=>
                        <tr key={item.value}>
                            <td className="align-middle text-xs pl-2">{2 + index + props.data.meta.packages.length + props.data.meta.taxes.length}</td>
                            <td className="align-middle text-xs">{item.meta.discount.label}</td>
                            <td className="align-middle text-xs pr-2">{FormatPrice(item.meta.discount.meta.amount)}</td>
                        </tr>
                    )}
                    </tbody>
                    <tfoot>
                    <tr>
                        <th className="align-middle text-right text-xs pl-2" colSpan={2}>{Lang.get('companies.packages.labels.total')}</th>
                        <th className="align-middle text-xs pr-2">{FormatPrice(sumGrandTotalCompany(props.data))}</th>
                    </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
export const sumTaxCompany = (company, index = null) => {
    let taxTotal = 0;
    let subtotal = sumSubtotalCompany(company);
    if (index === null) {
        company.meta.taxes.map((item)=>{
            if (item.meta.tax !== null) {
                taxTotal += ( (subtotal * item.meta.tax.meta.percent) / 100 );
            }
        });
    } else {
        if (company.meta.taxes[index].meta.tax !== null) {
            taxTotal = ( subtotal * company.meta.taxes[index].meta.tax.meta.percent) / 100;
        }
    }
    return taxTotal;
}
export const sumSubtotalCompany = (company) => {
    let response = 0;
    company.meta.packages.map((item)=>{
        if (item.meta.package !== null) {
            response += item.meta.package.meta.prices;
        }
    });
    return response;
}
export const sumDiscountCompany = (company) => {
    let response = 0;
    company.meta.discounts.map((item)=>{
        if (item.meta.discount !== null) {
            response += item.meta.discount.meta.amount;
        }
    })
    return response;
}
export const sumGrandTotalCompany = (company) => {
    return sumSubtotalCompany(company) + sumTaxCompany(company) - sumDiscountCompany(company);
}
export const TdStatusCompany = (props) => {
    let response = '-';
    if (props.data.meta.timestamps.active.at === null) {
        response = <span data-button={Lang.get('labels.active.confirm.confirm',{Attribute:Lang.get('companies.labels.menu')})} data-icon="success" data-message={Lang.get('labels.active.confirm.message',{Attribute:Lang.get('companies.labels.menu')})} data-title={Lang.get('labels.active.confirm.title',{Attribute:Lang.get('companies.labels.menu')})} data-value={props.data.value} onClick={props.onClick} style={{cursor:'pointer'}} className="badge badge-secondary">{Lang.get('labels.inactive.label').toUpperCase()}</span>;
    } else {
        response = (
            <React.Fragment>
                <FontAwesomeIcon data-value={props.data.value} data-type="status" onMouseOut={props.onPopOver} onMouseOver={props.onPopOver} icon={faInfoCircle} className="mr-2 text-info"/>
                <span data-button={Lang.get('labels.inactive.confirm.confirm',{Attribute:Lang.get('companies.labels.menu')})} data-icon="error" data-message={Lang.get('labels.inactive.confirm.message',{Attribute:Lang.get('companies.labels.menu')})} data-title={Lang.get('labels.inactive.confirm.title',{Attribute:Lang.get('companies.labels.menu')})} data-value={props.data.value} onClick={props.onClick} style={{cursor:'pointer'}} className="badge badge-primary">{Lang.get('labels.active.label').toUpperCase()}</span>
            </React.Fragment>
        )
    }
    return response;
}
export const CompanyStatusPopover = (props) => {
    return (
        <div className="card card-outline card-info" style={{minWidth:200,maxWidth:500}}>
            <div className="card-header p-2">
                <label className="text-xs card-title">{Lang.get('companies.labels.status.active')}</label>
            </div>
            <div className="card-body p-0">
                <table className="table table-sm table-borderless table-striped">
                    <tbody>
                    <tr>
                        <td className="align-middle text-xs pl-2">{Lang.get('labels.date',{Attribute:Lang.get('labels.active.label')})}</td>
                        <td className="align-middle text-xs" width={10}>:</td>
                        <td className="align-middle text-xs pr-2">{formatLocaleDate(props.data.meta.timestamps.active.at)}</td>
                    </tr>
                    <tr>
                        <td className="align-middle text-xs pl-2">{Lang.get('labels.by',{Attribute:Lang.get('labels.active.label')})}</td>
                        <td className="align-middle text-xs">:</td>
                        <td className="align-middle text-xs pr-2">{props.data.meta.timestamps.active.by !== null && props.data.meta.timestamps.active.by.name}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
