// noinspection DuplicatedCode

import React from "react";
import {NumericFormat} from "react-number-format";
import MaskedInput from 'react-text-mask';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAsterisk} from "@fortawesome/free-solid-svg-icons";
import ReactHtmlParser from "react-html-parser";
import {formatBytes} from "./mixedConsts";
import autosize from "autosize/dist/autosize";

export const LabelRequired = () => {
    return <sup title={Lang.get('messages.required')} className="float-left mr-1"><FontAwesomeIcon icon={faAsterisk} className="text-danger fa-xs"/></sup>
}
export const InputText = (props) => {
    return (
        <div className="form-group row">
            <label className={`col-form-label text-xs ${props.labels.cols.label}`} htmlFor={props.input.id}>
                {props.required ? <LabelRequired/> : null }
                {props.labels.name}
            </label>
            <div className={props.labels.cols.input}>
                {['text','textarea','numeric','ip','password'].indexOf(props.type) === -1 ?
                    props
                    :
                    <InputResponse type={props.type}
                                   loading={props.loading}
                                   handleChange={props.handleChange}
                                   handleInputType={props.handleInputType} inputProps={props.inputProps}
                                   thousandSeparator={props.thousandSeparator}
                                   decimalSeparator={props.decimalSeparator}
                                   inputAppends={props.inputAppends}
                                   invalid={props.invalid}
                                   inv_message={props.inv_message}
                                   labels={props.labels} input={props.input}/>
                }
                {props.info === null ? null :
                    <span className="small text-xs text-info">{ReactHtmlParser(props.info)}</span>
                }
            </div>
            {typeof props.isByte === 'undefined' ? null :
                ! props.isByte ? null :
                    <div className="col-sm-2">
                        <div className="form-control form-control-sm text-xs">{formatBytes(props.input.value,2)}</div>
                    </div>
            }
            {typeof props.appends === 'undefined' ? null :
                props.appends === null ? null :
                    props.appends.map((item, index) =>
                        <React.Fragment key={index}>
                            <label className={`col-form-label ${item.props.labels.cols.label}`} htmlFor={item.props.input.id}>
                                {item.props.required ? <LabelRequired/> : null }
                                {item.props.labels.name}
                            </label>
                            <div className={item.props.labels.cols.input}>
                                {['text','textarea','numeric','ip','password'].indexOf(item.props.type) !== -1 ?
                                    <InputResponse type={item.props.type}
                                                   inputGroups={item.props.inputGroups}
                                                   loading={item.props.loading}
                                                   handleChange={item.props.handleChange}
                                                   thousandSeparator={props.thousandSeparator}
                                                   decimalSeparator={props.decimalSeparator}
                                                   handleInputType={item.props.handleInputType}
                                                   inputAppends={item.props.inputAppends}
                                                   invalid={item.props.invalid}
                                                   inv_message={item.props.inv_message}
                                                   labels={item.props.labels} input={item.props.input}/>
                                    :
                                    item
                                }
                                {item.props.info === null ? null :
                                    <span className="small text-info">{ReactHtmlParser(item.props.info)}</span>
                                }
                            </div>
                            {typeof item.props.isByte === 'undefined' ? null :
                                ! item.props.isByte ? null :
                                    <div className="col-sm-2">
                                        <div className="form-control form-control-sm text-xs">{formatBytes(item.props.input.value,2)}</div>
                                    </div>
                            }
                        </React.Fragment>
                    )
            }
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
                    data-parent={typeof props.input.parent === 'undefined' ? null : props.input.parent}
                    className="form-control form-control-sm text-xs" disabled={props.loading}/>
            );
            break;
        case 'textarea' :
            response = (
                <textarea
                    onChange={props.handleChange} name={props.input.name}
                    value={props.input.value} id={props.input.id}
                    placeholder={props.labels.placeholder} style={{resize:'none'}}
                    data-parent={typeof props.input.parent === 'undefined' ? null : props.input.parent}
                    className="form-control form-control-sm text-xs" disabled={props.loading}/>
            );
            break;
        case 'numeric' :
            if (typeof props.inputAppends !== 'undefined') {
                response = (
                    <div className="input-group input-group-sm">
                        <NumericFormat disabled={props.loading} id={props.input.id}
                                       title={props.inv_message}
                                       className={typeof props.invalid === 'undefined' ? "form-control form-control-sm text-xs" : props.invalid ? "form-control form-control-sm text-xs is-invalid" : "form-control form-control-sm text-xs"}
                                       name={props.input.name} onChange={props.handleChange}
                                       allowLeadingZeros={false} placeholder={props.labels.placeholder}
                                       value={props.input.value}
                                       data-parent={typeof props.input.parent === 'undefined' ? null : props.input.parent}
                                       decimalScale={typeof props.input.decimal === 'undefined' ? 0 : props.input.decimal}
                                       decimalSeparator={typeof props.decimalSeparator === 'undefined' ? ',' : props.decimalSeparator}
                                       thousandSeparator={typeof props.thousandSeparator === 'undefined' ? '' : props.thousandSeparator}/>
                        <div className="input-group-append">
                            {props.inputAppends}
                        </div>
                    </div>
                );
            } else {
                response = (
                    <NumericFormat disabled={props.loading} id={props.input.id}
                                   title={props.inv_message}
                                   className={typeof props.invalid === 'undefined' ? "form-control form-control-sm text-xs" : props.invalid ? "form-control form-control-sm text-xs" : "form-control form-control-sm text-xs is-invalid"}
                                   name={props.input.name} onChange={props.handleChange}
                                   allowLeadingZeros={false} placeholder={props.labels.placeholder}
                                   value={props.input.value}
                                   data-parent={typeof props.input.parent === 'undefined' ? null : props.input.parent}
                                   decimalScale={typeof props.input.decimal === 'undefined' ? 0 : props.input.decimal}
                                   decimalSeparator={typeof props.decimalSeparator === 'undefined' ? ',' : props.decimalSeparator}
                                   thousandSeparator={typeof props.thousandSeparator === 'undefined' ? '' : props.thousandSeparator}/>
                );
            }
            break;
        case 'ip' :
            response = (
                <MaskedInput name={props.input.name}
                             id={props.input.id}
                             data-parent={typeof props.input.parent === 'undefined' ? null : props.input.parent}
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
                             value={props.input.value} className="form-control form-control-sm text-xs"/>
            )
            break;
        case 'password' :
            response = (
                <div className="input-group input-group-sm">
                    <input placeholder={props.labels.placeholder} id={props.input.id}
                           value={props.input.value} name={props.input.name}
                           data-parent={typeof props.input.parent === 'undefined' ? null : props.input.parent}
                           onChange={props.handleChange} disabled={props.loading}
                           type={props.input.type} className="form-control form-control-sm text-xs"/>
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
