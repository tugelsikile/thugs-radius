// noinspection DuplicatedCode

import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle, faPencilAlt, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import {formatLocaleString, FormControlSMReactSelect, listDataPerPage} from "./mixedConsts";
import Pagination from '@atlaskit/pagination';

export const TableAction = (props) => {
    return (
        <td className="align-middle text-center">
            {props.privilege !== null &&
                <>
                    <button type="button" className="btn btn-tool dropdown-toggle dropdown-icon" data-toggle="dropdown"><span className="sr-only">Toggle Dropdown</span></button>
                    <div className="dropdown-menu" role="menu">
                        {typeof props.others === 'undefined' ? null :
                            props.others === null ? null :
                                props.others.map((item,index)=>
                                    item === null ? null :
                                        <button key={`otherPriv_${index}`} type="button" onClick={item.handle} className={`dropdown-item ${typeof item.color === null ? '' : item.color}`}>
                                            {typeof item.icon === 'undefined' ? null : <FontAwesomeIcon icon={item.icon} className="mr-1"/> }
                                            {item.lang}
                                        </button>
                                )
                        }
                        {props.privilege.update &&
                            <button type="button" onClick={()=>props.toggleModal(props.item)} className="dropdown-item text-primary"><FontAwesomeIcon icon={faPencilAlt} className="mr-1"/>{props.langs.update}</button>
                        }
                        {props.privilege.delete &&
                            <button type="button" onClick={()=>props.confirmDelete(props.item)} className="dropdown-item text-danger"><FontAwesomeIcon icon={faTrashAlt} className="mr-1"/>{props.langs.delete}</button>
                        }
                    </div>
                </>
            }
        </td>
    );
}
export const DataNotFound = (props) => {
    return (
        <tr>
            <td colSpan={props.colSpan} className="align-middle text-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-warning"/>
                <strong>{props.message}</strong>
            </td>
        </tr>
    );
}
export const TableCheckBox = (props) => {
    return (
        <td className="align-middle text-center">
            <div style={{zIndex:0}} className="custom-control custom-checkbox">
                <input id={`cbx_${props.item.value}`}
                       data-id={props.item.value}
                       checked={props.checked}
                       disabled={props.loading}
                       onChange={props.handleCheck}
                       className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                <label htmlFor={`cbx_${props.item.value}`} className="custom-control-label"/>
            </div>
        </td>
    );
}
export const TablePaging = (props) => {
    return (
        <div className="card-footer clearfix row">
            <div className="col-sm-6">
                <div className="row">
                    {typeof props.showDataPerPage === 'undefined' ? null :
                        props.showDataPerPage === null ? null :
                            typeof props.handelSelectDataPerPage === 'undefined' ? null :
                                props.handelSelectDataPerPage === null ? null :
                                    <div className="col-sm-2">
                                        <Select value={props.filter.data_length === null ? null : { value : props.filter.data_length, label : formatLocaleString(props.filter.data_length)}}
                                                styles={FormControlSMReactSelect}
                                                onChange={props.handelSelectDataPerPage} options={listDataPerPage} isLoading={props.loading}/>
                                    </div>
                    }
                    <label className="col-sm-10 col-form-label text-muted text-xs">
                        {props.customers.unfiltered.length === 0 ? null :
                            Lang.get('pagination.labels.showing',{
                                dataFirst : ( ( parseInt(props.filter.page.value)  - 1 ) * parseInt(props.filter.data_length) ) + 1,
                                dataLast : parseInt(props.filter.page.value) * parseInt(props.filter.data_length),
                                max : props.customers.unfiltered.length
                            })
                        }
                    </label>
                </div>
            </div>
            <div className="col-sm-6">
                <div className="float-right">
                    {props.customers.unfiltered.length > 0 &&
                        <Pagination onChange={(event, page)=>props.handleChangePage(page)}
                                    max={7}
                                    pages={props.filter.paging}/>
                    }
                </div>

                {/*<ul className="pagination pagination-sm m-0 float-right">
                        {props.filter.page.value > 1 &&
                            <li className="page-item">
                                <a onClick={()=>props.handleChangePage(1)} className="page-link" href="#">«</a>
                            </li>
                        }
                        {props.filter.paging.length < 10 &&
                            props.filter.paging.map((item)=>
                                <li key={item} onClick={()=>props.handleChangePage(item)} className={item === props.filter.page.value ? "page-item active" : "page-item"}>
                                    <a className="page-link" href="#">{item}</a>
                                </li>
                            )
                        }
                        {props.filter.paging.length > 10 &&
                            props.filter.paging
                                .splice(props.filter.page.value + 6, props.filter.page.value + 12)
                                .map((item)=>
                                    <li key={item} onClick={()=>props.handleChangePage(item)} className={item === props.filter.page.value ? "page-item active" : "page-item"}>
                                        <a className="page-link" href="#">{item}</a>
                                    </li>
                            )
                        }

                        {props.filter.paging.length > 1 &&
                            <li className="page-item">
                                <a onClick={()=>props.handleChangePage(props.filter.paging[props.filter.paging.length - 1])} className="page-link" href="#">»</a>
                            </li>
                        }
                    </ul>*/}
            </div>
        </div>
    );
}
