import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus,faTrashAlt} from "@fortawesome/free-solid-svg-icons";

export const PageCardSearch = (props) => {
    return (
        <div className="card-tools">
            <div className="input-group input-group-sm" style={{width:150}}>
                <input onChange={props.handleSearch} value={props.filter.keywords} type="text" name="table_search" className="form-control text-xs float-right" placeholder={props.label}/>
                <div style={{zIndex:0}} className="input-group-append"><button type="submit" className="btn btn-default"><i className="fas fa-search"/></button></div>
            </div>
        </div>
    );
}
export const PageCardTitle = (props) => {
    return (
        <div className="card-title">
            {props.privilege !== null &&
                <React.Fragment>
                    {typeof props.filter !== 'undefined' &&
                        props.filter !== null &&
                            props.filter
                    }
                    {props.privilege.create &&
                        <button type="button" onClick={()=>props.handleModal()} disabled={props.loading} className="mr-1 btn btn-outline-primary btn-sm text-xs">
                            <FontAwesomeIcon icon={faPlus} size="xs" className="mr-1"/>
                            <span className="text-xs">{props.langs.create}</span>
                        </button>
                    }
                    {typeof props.others === 'undefined' ? null :
                        props.others === null ? null :
                            props.others.length === 0 ? null :
                                props.others.map((item,index)=>
                                    <button key={`keyBtnAction_${index}`}
                                            type="button"
                                            onClick={item.handle}
                                            disabled={props.loading || typeof item.disabled === 'undefined' ? false : item.disabled }
                                            className="btn btn-outline-secondary btn-sm mr-1">
                                        {typeof item.icon === 'undefined' ? null : <FontAwesomeIcon icon={item.icon} className="mr-1" size="xs"/>}
                                        <span className="text-xs">{item.lang}</span>
                                    </button>
                                )
                    }
                    {props.privilege.delete &&
                        props.selected.length > 0 &&
                        <button type="button" onClick={()=>props.confirmDelete()} disabled={props.loading} className="btn btn-outline-danger btn-sm">
                            <FontAwesomeIcon size="xs" icon={faTrashAlt} className="mr-1"/>
                            <span className="text-xs">{props.langs.delete}</span>
                        </button>
                    }
                </React.Fragment>
            }
        </div>
    );
}
