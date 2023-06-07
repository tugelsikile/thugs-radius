import React from "react";
import {NumericFormat} from "react-number-format";
import MaskedInput from 'react-text-mask';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ReactHtmlParser from "react-html-parser";

export const LabelRequired = () => {
    return <sup title={Lang.get('messages.required')} className="float-left mr-1"><FontAwesomeIcon icon="asterisk" className="text-danger fa-xs"/></sup>
}
export const InputText = (props) => {
    return (
        <div className="form-group row">
            <label className={`col-form-label ${props.labels.cols.label}`} htmlFor={props.input.id}>
                {props.required ? <LabelRequired/> : null }
                {props.labels.name}
            </label>
            <div className={props.labels.cols.input}>
                <InputResponse type={props.type}
                               loading={props.loading}
                               handleChange={props.handleChange}
                               handleInputType={props.handleInputType} inputProps={props.inputProps}
                               labels={props.labels} input={props.input}/>
                {props.info === null ? null :
                    <span className="small text-info">{ReactHtmlParser(props.info)}</span>
                }
            </div>
        </div>
    );
}
export const InputResponse = (props) => {
    let response = null;
    switch (props.type) {
        default :
        case 'text' :
            response = (
                <input
                    onChange={props.handleChange} name={props.input.name} type="text"
                    value={props.input.value} id={props.input.id}
                    placeholder={props.labels.placeholder}
                    className="form-control text-sm" disabled={props.loading}/>
            );
            break;
        case 'textarea' :
            response = (
                <textarea
                    onChange={props.handleChange} name={props.input.name}
                    value={props.input.value} id={props.input.id}
                    placeholder={props.labels.placeholder}
                    className="form-control text-sm" disabled={props.loading} style={{resize:'none'}}/>
            );
            break;
        case 'numeric' :
            response = (
                <NumericFormat disabled={props.loading} id={props.input.id}
                               className="form-control text-sm"
                               name={props.input.name} onChange={props.handleChange}
                               allowLeadingZeros={false} placeholder={props.labels.placeholder}
                               value={props.input.value}
                               decimalScale={props.input.decimal} decimalSeparator={props.decimalSeparator}
                               thousandSeparator={props.thousandSeparator}/>
            );
            break;
        case 'ip' :
            response = (
                <MaskedInput name={props.input.name}
                             id={props.input.id}
                             guide={false} placeholderChar={'\u2000'}
                             onChange={props.handleChange}
                             pipe={value => {
                                 if (value === '.' || value.endsWith('..')) return false;
                                 const parts = value.split('.');
                                 if (
                                     parts.length > 4 ||
                                     parts.some(part => part === '00' || part < 0 || part > 255)
                                 ) {
                                     return false;
                                 }
                                 return value;
                             }}
                             disabled={props.loading} mask={value => Array(value.length).fill(/[\d.]/)}
                             placeholder={props.labels.placeholder}
                             value={props.input.value} className="form-control text-sm"/>
            )
            break;
        case 'password' :
            response = (
                <div className="input-group">
                    <input placeholder={props.labels.placeholder} id={props.input.id}
                           value={props.input.value} name={props.input.name}
                           onChange={props.handleChange} disabled={props.loading}
                           type={props.input.type} className="form-control text-sm"/>
                  <span className="input-group-append">
                      <button disabled={props.loading} name={props.input.name} onClick={props.handleInputType} type="button" className="btn btn-info">
                          {props.input.type === 'password' ? <FontAwesomeIcon icon="eye"/> : <FontAwesomeIcon icon="eye-slash"/> }
                      </button>
                  </span>
                </div>
            )
            break;
    }
    return response;
}
