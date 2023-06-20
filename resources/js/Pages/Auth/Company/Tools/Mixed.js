import React from "react";

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
const getIndex = (props) => {
    let index = props.split('-');
    index = index[index.length - 1];
    return parseInt(index) + 1;
}
const onMouseOver = (event) => {
    let element = event.currentTarget;
    element.style.backgroundColor = '#70a7ff';
    element.style.borderBottom = 'solid 1px #70a7ff';
}
const onMouseOut = (event) => {
    let element = event.currentTarget;
    element.style.backgroundColor = '#fff';
    element.style.borderBottom = 'solid 1px #ccc';
}
