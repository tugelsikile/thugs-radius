import React from "react";
import BtnSort from "../../../../Auth/User/Tools/BtnSort";
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
            <th className="align-middle">
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
    { value : 'duitku', label : Lang.get('gateways.module.duitku.label'), meta : { merchant_code : '', api_key : '', urls : { sandbox : 'https://sandbox.duitku.com/webapi/api', production : 'https://passport.duitku.com/webapi/api', website : 'https://duitku.com' } } },
    { value : 'briapi', label : Lang.get('gateways.module.briapi.label'), meta : { consumer_key : '', consumer_secret : '', urls : { sandbox : 'https://sandbox.partner.api.bri.co.id', production : 'https://partner.api.bri.co.id', website : 'https://developers.bri.co.id/id'} } }
];
export const FormModule = (props) => {
    if (props.form.module !== null) {
        switch (props.form.module.value) {
            case 'duitku':
                return <FormModuleDuitku form={props.form} loading={props.loading} onChange={props.onChange}/>;
            break;
            case 'briapi':
                return <FormModuleBriAPI form={props.form} loading={props.loading} onChange={props.onChange}/>;
            break;
        }
    }
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
                <label htmlFor="input-merchant-code" className="col-md-4 col-form-label text-xs">{Lang.get('gateways.module.duitku.merchant_code')}</label>
                <div className="col-md-4">
                    <input id="input-merchant-code" name="merchant_code" data-parent="keys" onChange={props.onChange} value={props.form.keys.merchant_code} placeholder={Lang.get('gateways.module.duitku.merchant_code')} className="form-control form-control-sm text-xs" disabled={props.loading} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="input-api-key" className="col-md-4 col-form-label text-xs">{Lang.get('gateways.module.duitku.api_key')}</label>
                <div className="col-md-8">
                    <input id="input-api-key" name="api_key" data-parent="keys" onChange={props.onChange} value={props.form.keys.api_key} placeholder={Lang.get('gateways.module.duitku.api_key')} className="form-control form-control-sm text-xs" disabled={props.loading} />
                </div>
            </div>
        </React.Fragment>
    );
}
