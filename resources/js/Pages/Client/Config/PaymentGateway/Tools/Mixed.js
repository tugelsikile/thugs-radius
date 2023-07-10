import React from "react";
import BtnSort from "../../../../Auth/User/Tools/BtnSort";
import {showSuccess} from "../../../../../Components/Toaster";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy} from "@fortawesome/free-solid-svg-icons";
import {LabelRequired} from "../../../../../Components/mixedConsts";
import HtmlParser from "react-html-parser";
export const TableHeader = (props) => {
    return (
        <tr>
            {props.gateways.filtered.length > 0 &&
                <th className="align-middle text-center pl-2" width={30}>
                    <div style={{zIndex:0}} className="custom-control custom-checkbox">
                        <input id="checkAll" data-id="" disabled={props.loading.gateways} onChange={props.onCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                        <label htmlFor="checkAll" className="custom-control-label"/>
                    </div>
                </th>
            }
            <th className={props.gateways.filtered.length === 0 ? "align-middle pl-2" : "align-middle"}>
                <BtnSort sort="name"
                         name={Lang.get('gateways.labels.name')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th width={100} className="align-middle">
                <BtnSort sort="module"
                         name={Lang.get('gateways.labels.module')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th width={100} className="align-middle">
                <BtnSort sort="mode"
                         name={Lang.get('gateways.labels.mode.label')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th width={100} className="align-middle">
                <BtnSort sort="status"
                         name={Lang.get('gateways.labels.status')}
                         filter={props.filter} handleSort={props.onSort}/>
            </th>
            <th className="align-middle text-center pr-2" width={50}>{Lang.get('messages.action')}</th>
        </tr>
    )
}
export const listModulePaymentGateway = [
    { value : 'duitku', label : Lang.get('gateways.module.duitku.label'), meta : { merchant_code : '', api_key : '', urls : { sandbox : 'https://sandbox.duitku.com', production : 'https://passport.duitku.com', website : 'https://duitku.com', callback : `${window.origin}/api/payment-gateways/duitku/callback`, return : `${window.origin}/payment-gateway/duitku/status` } } },
    { value : 'midtrans', label : Lang.get('gateways.module.midtrans.label'), meta : { merchant_id : '', server_key : '', client_key : '', urls : { sandbox : 'https://api.sandbox.midtrans.com', production : 'https://api.midtrans.com', website : 'https://midtrans.com', notification : `${window.origin}/api/payment-gateways/midtrans/payment/notification`, recurring : `${window.origin}/api/payment-gateway/midtrans/payment/recurring`, account : `${window.origin}/api/payment-gateway/midtrans/payment/account`, finish : `${window.origin}/payment-gateway/midtrans/finish`, unfinished : `${window.origin}/payment-gateway/midtrans/payment/unfinish`, error : `${window.origin}/payment-gateway/midtrans/payment/error` } } },
    { value : 'briapi', label : Lang.get('gateways.module.briapi.label'), meta : { consumer_key : '', consumer_secret : '', urls : { sandbox : 'https://sandbox.partner.api.bri.co.id', production : 'https://partner.api.bri.co.id', website : 'https://developers.bri.co.id/id', callback : `${window.origin}/api/payment-gateways/briapi/callback`, return : `${window.origin}/payment-gateway/briapi/status`} } },
];
export const FormModule = (props) => {
    let response = null;
    if (props.form.module !== null) {
        switch (props.form.module.value) {
            case 'duitku':
                response = <FormModuleDuitku form={props.form} loading={props.loading} onChange={props.onChange}/>;
            break;
            case 'briapi':
                response = <FormModuleBriAPI form={props.form} loading={props.loading} onChange={props.onChange}/>;
            break;
            case 'midtrans':
                response = <FormModuleMidtrans form={props.form} loading={props.loading} onChange={props.onChange}/>;
                break;
        }
    }
    return response;
}
export const FormModuleMidtrans = (props) => {
    return (
        <React.Fragment>
            <div className="form-group row">
                <label htmlFor="input-merchant-id" className="col-md-4 col-form-label text-xs">{Lang.get('gateways.module.midtrans.merchant_id')}</label>
                <div className="col-md-6">
                    <input id="input-merchant-id" name="merchant_id" data-parent="keys" onChange={props.onChange} value={props.form.keys.merchant_id} placeholder={Lang.get('gateways.module.midtrans.merchant_id')} className="form-control form-control-sm text-xs" disabled={props.loading}/>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="input-server-key" className="col-md-4 col-form-label text-xs">{Lang.get('gateways.module.midtrans.server_key')}</label>
                <div className="col-md-6">
                    <input id="input-server-key" name="server_key" data-parent="keys" onChange={props.onChange} value={props.form.keys.server_key} placeholder={Lang.get('gateways.module.midtrans.server_key')} className="form-control form-control-sm text-xs" disabled={props.loading}/>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="input-client-key" className="col-md-4 col-form-label text-xs">{Lang.get('gateways.module.midtrans.client_key')}</label>
                <div className="col-md-6">
                    <input id="input-client-key" name="client_key" data-parent="keys" onChange={props.onChange} value={props.form.keys.client_key} placeholder={Lang.get('gateways.module.midtrans.client_key')} className="form-control form-control-sm text-xs" disabled={props.loading}/>
                </div>
            </div>
            <div className="form-group row">
                <label className="col-md-8 offset-md-4 text-xs offset-4">
                    {HtmlParser(Lang.get(`gateways.module.${props.form.module.value}.info_callback_url`))}
                </label>
            </div>
            {['notification','recurring','account','finish','unfinished','error'].map((item,index)=>
                <FormUrlMidtrans {...props} data={item} key={index}/>
            )}
        </React.Fragment>
    )
}
const FormUrlMidtrans = (props)=> {
    return (
        <div className="form-group row">
            <label className="col-md-4 col-form-label text-xs">
                {Lang.get(`gateways.module.midtrans.urls.${props.data}.label`)}<br/>
                <small className="text-muted">{Lang.get(`gateways.module.midtrans.urls.${props.data}.info`)}</small>
            </label>
            <div className="col-md-8">
                <div className="input-group input-group-sm">
                    <div className="form-control-sm form-control text-xs">
                        {props.form.module.meta.urls[props.data]}
                    </div>
                    <div className="input-group-append">
                            <span onClick={(e)=>{
                                e.preventDefault();
                                copyToClipboard(props.form.module.meta.urls[props.data])
                                    .then(()=>showSuccess(Lang.get('gateways.module.midtrans.urls.copied',{Attribute:Lang.get(`gateways.module.midtrans.urls.${props.data}.label`)})))
                            }} title={Lang.get('gateways.module.midtrans.urls.copy',{Attribute:Lang.get(`gateways.module.midtrans.urls.${props.data}.label`)})} style={{cursor:'pointer'}} className="input-group-text"><FontAwesomeIcon icon={faCopy} size="sm"/></span>
                    </div>
                </div>
            </div>
        </div>
    )
}
async function copyToClipboard(textToCopy) {
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
    } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;

        // Move textarea out of the viewport so it's not visible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";

        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (error) {
            console.error(error);
        } finally {
            textArea.remove();
        }
    };
}
const FormUrlCallback = (props) => {
    return (
        <div className="form-group row">
            <label className="col-md-4 col-form-label text-xs">{Lang.get('gateways.labels.url.callback.label')}</label>
            <div className="col-md-8">
                <div className="input-group input-group-sm">
                    <div className="form-control-sm form-control text-xs">
                        {props.form.module.meta.urls.callback}
                    </div>
                    <div className="input-group-append">
                            <span onClick={(e)=>{
                                e.preventDefault();
                                navigator.clipboard.writeText(props.form.module.meta.urls.callback)
                                    .then(()=>showSuccess(Lang.get('gateways.labels.url.callback.copied')));
                            }} title={Lang.get('gateways.labels.url.callback.copy')} style={{cursor:'pointer'}} className="input-group-text"><FontAwesomeIcon icon={faCopy} size="sm"/></span>
                    </div>
                </div>
                <small className="text-muted">{HtmlParser(Lang.get(`gateways.module.${props.form.module.value}.info_callback_url`))}</small>
            </div>
        </div>
    )
}
export const FormModuleBriAPI = (props) => {
    return (
        <React.Fragment>
            <div className="form-group row">
                <label htmlFor="input-consumer-key" className="col-md-4 col-form-label text-xs">{Lang.get('gateways.module.briapi.consumer_key')}</label>
                <div className="col-md-8">
                    <input id="input-consumer-key" name="consumer_key" data-parent="keys" onChange={props.onChange} value={props.form.keys.consumer_key} placeholder={Lang.get('gateways.module.briapi.consumer_key')} className="form-control form-control-sm text-xs" disabled={props.loading} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="input-consumer-secret" className="col-md-4 col-form-label text-xs">{Lang.get('gateways.module.briapi.consumer_secret')}</label>
                <div className="col-md-5">
                    <input id="input-consumer-secret" name="consumer_secret" data-parent="keys" onChange={props.onChange} value={props.form.keys.consumer_secret} placeholder={Lang.get('gateways.module.briapi.consumer_secret')} className="form-control form-control-sm text-xs" disabled={props.loading} />
                </div>
            </div>
        </React.Fragment>
    )
}
export const FormModuleDuitku = (props) => {
    return (
        <React.Fragment>
            <div className="form-group row">
                <label htmlFor="input-merchant-code" className="col-md-4 col-form-label text-xs"><LabelRequired/>{Lang.get('gateways.module.duitku.merchant_code')}</label>
                <div className="col-md-4">
                    <input id="input-merchant-code" name="merchant_code" data-parent="keys" onChange={props.onChange} value={props.form.keys.merchant_code} placeholder={Lang.get('gateways.module.duitku.merchant_code')} className="form-control form-control-sm text-xs" disabled={props.loading} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="input-api-key" className="col-md-4 col-form-label text-xs"><LabelRequired/>{Lang.get('gateways.module.duitku.api_key')}</label>
                <div className="col-md-8">
                    <input id="input-api-key" name="api_key" data-parent="keys" onChange={props.onChange} value={props.form.keys.api_key} placeholder={Lang.get('gateways.module.duitku.api_key')} className="form-control form-control-sm text-xs" disabled={props.loading} />
                </div>
            </div>
            {FormUrlCallback(props)}
        </React.Fragment>
    );
}
