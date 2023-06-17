import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faUserLock, faUserSecret, faUserShield} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";

export const UserLevelList = (props) => {
    return (
        <a onClick={(e)=>{e.preventDefault();props.onSelect(props.item)}} href="#" className={props.filter.level === null ? "nav-link text-sm" : props.filter.level.value === props.item.value ? "nav-link text-sm active" : "nav-link text-sm" }>
            <FontAwesomeIcon icon={props.item.meta.default ? faUserLock : props.item.meta.super ? faUserSecret : faUserShield}
                             size="xs"
                             className={`mr-1 ${props.item.meta.default ? 'text-warning' : props.item.meta.super ? 'text-danger' : 'text-dark'}`}/>
            {props.item.label}
            <span className="float-right">
                {props.privilege !== null && (props.privilege.update || props.privilege.delete) && ! props.item.meta.default &&
                    <div className="btn-group">
                        <button type="button" className="btn btn-tool btn-xs dropdown-toggle dropdown-icon" data-toggle="dropdown">
                            <span className="sr-only">Toggle Dropdown</span>
                        </button>
                        <div className="dropdown-menu" role="menu">
                            {props.privilege.update &&
                                <button onClick={()=>props.clickUpdate(props.item)} disabled={props.loading} className="dropdown-item">
                                    <FontAwesomeIcon icon={faPencilAlt} size="sm" className="mr-1"/>
                                    {Lang.get('users.privileges.update.button')}
                                </button>
                            }
                            {props.privilege.update &&
                                <button onClick={()=>props.clickDelete(props.item)} disabled={props.loading} className="dropdown-item">
                                    <FontAwesomeIcon icon={faTrashAlt} size="sm" className="mr-1"/>
                                    {Lang.get('users.privileges.delete.button')}
                                </button>
                            }
                        </div>
                    </div>
                }
            </span>
        </a>
    );
}
export const InputCheckBox = (props) => {
    return (
        <div className={props.disabled ? "custom-control custom-switch" : "custom-control custom-switch custom-switch-off-danger custom-switch-on-success"}>
            <input id={`menu_${props.type}_${props.menu.value}`}
                   checked={props.checked}
                   data-index-level={props.levels.unfiltered.findIndex((f) => f.value === props.filter.level.value)}
                   data-index-parent={typeof props.indexParent === 'undefined' ? null : props.indexParent}
                   data-index={props.index}
                   data-child={props.child}
                   data-type={props.type}
                   data-id={props.menu.value}
                   disabled={props.disabled} onChange={props.onCheck}
                   type="checkbox" className="custom-control-input"/>
            <label className="custom-control-label" htmlFor={`menu_${props.type}_${props.menu.value}`}></label>
        </div>
    );
}
