import React from "react";

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
                        <button type="button" onClick={()=>props.handleModal()} disabled={props.loading} className="btn btn-tool"><i className="fas fa-plus"/> {props.langs.create}</button>
                    }
                    {props.privilege.delete &&
                        props.selected.length > 0 &&
                        <button type="button" onClick={()=>props.confirmDelete()} disabled={props.loading} className="btn btn-tool"><i className="fas fa-trash-alt"/> {props.langs.delete}</button>
                    }
                </React.Fragment>
            }
        </div>
    );
}
