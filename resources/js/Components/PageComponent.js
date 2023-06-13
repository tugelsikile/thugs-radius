import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus,faTrashAlt} from "@fortawesome/free-solid-svg-icons";

export const PageCardSearch = (props) => {
    return (
        <div className="card-tools">
            <div className="input-group input-group-sm" style={{width:150}}>
                <input onChange={props.handleSearch} value={props.filter.keywords} type="text" name="table_search" className="form-control float-right" placeholder={props.label}/>
                <div className="input-group-append"><button type="submit" className="btn btn-default"><i className="fas fa-search"/></button></div>
            </div>
        </div>
    );
}
export const PageCardTitle = (props) => {
    return (
        <div className="card-title">
            {props.privilege !== null &&
                <React.Fragment>
                    {props.privilege.create &&
                        <button type="button" onClick={()=>props.handleModal()} disabled={props.loading} className="btn btn-tool">
                            <FontAwesomeIcon icon={faPlus} className="mr-1"/>
                            {props.langs.create}
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
                                            className="btn btn-tool">
                                        {typeof item.icon === 'undefined' ? null : <FontAwesomeIcon icon={item.icon} className="mr-1"/>}
                                        {item.lang}
                                    </button>
                                )
                    }
                    {props.privilege.delete &&
                        props.selected.length > 0 &&
                        <button type="button" onClick={()=>props.confirmDelete()} disabled={props.loading} className="btn btn-tool">
                            <FontAwesomeIcon icon={faTrashAlt} className="mr-1"/>
                            {props.langs.delete}
                        </button>
                    }
                </React.Fragment>
            }
        </div>
    );
}
