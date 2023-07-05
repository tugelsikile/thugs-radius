import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faChevronCircleLeft,
    faChevronCircleRight,
    faCircleNotch,
    faInfo,
    faLink, faRefresh
} from "@fortawesome/free-solid-svg-icons";
import {DialogActions} from "@mui/material";
import HtmlParser from "react-html-parser";

export const WizardStepWrapper = (props) => {
    return (
        <div className="card card-outline card-primary">
            <div className="card-header">
                <h4 className="card-title">{Lang.get('wizard.labels.menu')}</h4>
            </div>
            <div className="card-body">
                {props.steps.body}
            </div>
            <DialogActions className="justify-content-between">
                <button disabled={props.steps.current === 0} data-step={(props.steps.current - 1)} onClick={props.onStep} type="button" className="btn btn-outline-secondary">
                    <FontAwesomeIcon icon={faChevronCircleLeft} className="mr-2"/>
                    {Lang.get('pagination.previous')}
                </button>
                {props.steps.allowSkip &&
                    <button onClick={props.onStep} data-step={(props.steps.current + 1)} className="btn btn-outline-warning">{Lang.get('wizard.steps.skip')}</button>
                }
                <button disabled={! props.steps.allowNext} data-step={(props.steps.current + 1)} onClick={props.onStep} type="submit" className="btn btn-outline-success">
                    {Lang.get('pagination.next')}
                    <FontAwesomeIcon icon={faChevronCircleRight} className="ml-2"/>
                </button>
            </DialogActions>
        </div>
    )
}
export const WizardStep0 = (props) => {
    function setLanguage(event) {
        event.preventDefault();
        if (event.currentTarget.getAttribute('data-value') !== null) {
            if (event.currentTarget.getAttribute('data-value').length === 2) {
                if (['id','en'].indexOf(event.currentTarget.getAttribute('data-value')) !== -1) {
                    let lang = event.currentTarget.getAttribute('data-value');
                    if (localStorage.getItem('locale_lang') !== lang) {
                        localStorage.setItem('locale_lang', lang);
                        window.location.reload();
                    }
                    props.onStep(event);
                }
            }
        }
    }
    return (
        <React.Fragment>
            <div className="text-center">
                <h4>{Lang.get('wizard.labels.title',{Attribute:props.site === null ? '' : props.site.name})}</h4>
                <p>{HtmlParser(Lang.get('wizard.steps.0.message'))}</p>
                <div className="my-5">
                    <a data-value="id" data-step={1} onClick={setLanguage} href="#" className="img-thumbnail p-2 m-2" style={{display:'inline-block'}}>
                        <i style={{height:100,width:100}} className="fi fi-id flag-icon-squared"/>
                        <br/><span className="text-decoration-none text-dark">Bahasa Indonesia</span>
                    </a>
                    <a data-value="en" data-step={1} onClick={setLanguage} href="#" className="img-thumbnail p-2 m-2" style={{display:'inline-block'}}>
                        <i style={{height:100,width:100}} className="fi fi-us flag-icon-squared"/>
                        <br/><span className="text-decoration-none text-dark">English US</span>
                    </a>
                </div>
            </div>
        </React.Fragment>
    )
}

const searchVillage = async (formData) => {
    try {
        let response = await searchRegions(formData);
        if (response.data.params === null) {
            return [];
        } else {
            return response.data.params;
        }
    } catch (e) {
        return [];
    }
}
import ThankYouImage from "../../../../../public/images/thank.png";
import Select from "react-select";
import {searchRegions} from "../../../Services/RegionService";
import {VillageComponent} from "../../Auth/Company/Tools/Mixed";
import {faCheckCircle, faSave, faTimesCircle} from "@fortawesome/free-regular-svg-icons";
import {
    formatBytes,
    getIpRangeFromAddressAndNetmask,
    LabelRequired, parseInputFloat,
    pipeIp,
    responseMessage
} from "../../../Components/mixedConsts";
import {crudCompanyConfig} from "../../../Services/ConfigService";
import {showError, showSuccess} from "../../../Components/Toaster";
export const WizardStep1 = (props) => {
    const [firstTime,setFirstTime] = React.useState(true);
    const [name,setName] = React.useState(props.user.meta.company.name);
    const [email,setEmail] = React.useState(props.user.meta.company.email);
    const [street,setStreet] = React.useState(props.user.meta.company.address);
    const [phone,setPhone] = React.useState(props.user.meta.company.phone);
    const [village,setVillage] = React.useState(null);
    const [postal,setPostal] = React.useState(props.user.meta.company.postal);
    const [loadingVillage,setLoadingVillage] = React.useState(false);
    const [villageOptions,setVillageOptions] = React.useState([]);
    const [loadingForm,setLoadingForm] = React.useState(false);
    let timer = null;

    if (props.user.meta.company.village_obj !== null) {
        if (firstTime) {
            setFirstTime(false);
            handleSearchVillage(props.user.meta.company.village_obj.name);
        }
    }
    function handleChange(event) {
        let name = event.target.name;
        if (name === 'name') setName(event.target.value);
        if (name === 'phone') setPhone(event.target.value);
        if (name === 'email') setEmail(event.target.value);
        if (name === 'street') setStreet(event.target.value);
        if (name === 'postal') setPostal(event.target.value);
    }
    function handleSelect(event) {
        setVillage(event);
    }
    function handleSearchVillage(keyword) {
        if (keyword.length > 0) {
            setLoadingVillage(true);
            clearTimeout(timer);
            timer = setTimeout(()=>{
                const formData = new FormData();
                formData.append(Lang.get('labels.form_input.keywords'), keyword);
                formData.append(Lang.get('labels.form_input.search_type'), 'village');
                searchVillage(formData)
                    .then((response)=>{
                        setVillageOptions(response);
                        if (props.user.meta.company.village_obj !== null) {
                            let index = response.findIndex((f)=> f.value === props.user.meta.company.village_obj.code);
                            if (index >= 0) {
                                setVillage(response[index]);
                            }
                        }
                    })
                    .then(()=>setLoadingVillage(false));
            },1000);
        }
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setLoadingForm(true);
        try {
            const formData = new FormData();
            formData.append('type','address');
            formData.append('_method','patch');
            if (props.user.meta.company !== null) {
                formData.append(Lang.get('configs.address.form_input.id'), props.user.meta.company.id);
            }
            formData.append(Lang.get('configs.address.form_input.name'), name);
            formData.append(Lang.get('configs.address.form_input.phone'), phone);
            formData.append(Lang.get('configs.address.form_input.email'), email);
            formData.append(Lang.get('configs.address.form_input.street'), street);
            if (village !== null) formData.append(Lang.get('configs.address.form_input.village'), village.value);
            if (village !== null && village.meta.district !== null) formData.append(Lang.get('configs.address.form_input.district'), village.meta.district.value);
            if (village !== null && village.meta.district !== null && village.meta.district.meta.city !== null) formData.append(Lang.get('configs.address.form_input.city'), village.meta.district.meta.city.value);
            if (village !== null && village.meta.district !== null && village.meta.district.meta.city !== null && village.meta.district.meta.city.meta.province !== null) formData.append(Lang.get('configs.address.form_input.province'), village.meta.district.meta.city.meta.province.value);
            formData.append(Lang.get('configs.address.form_input.postal'), postal);
            let response = await crudCompanyConfig(formData);
            if (response.data.params === null) {
                setLoadingForm(false);
                showError(response.data.message);
            } else {
                setLoadingForm(false);
                showSuccess(response.data.message);
                props.onUpdate();
            }
        } catch (e) {
            setLoadingForm(false);
            responseMessage(e);
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="text-center">
                <img className="mb-5" src={ThankYouImage} style={{height:150}} alt="Thank You"/><br/>
                <p>{HtmlParser(Lang.get('wizard.steps.1.message'))}</p>
            </div>
            <div className="my-5">
                <div className="form-group row">
                    <label htmlFor="inputName" className="col-md-3 col-form-label text-sm">{Lang.get('companies.labels.name')}</label>
                    <div className="col-md-9">
                        <input id="inputName" disabled={loadingForm} value={name} name="name" onChange={handleChange} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputEmail" className="col-md-3 col-form-label text-sm">{Lang.get('companies.labels.email')}</label>
                    <div className="col-md-9">
                        <input id="inputEmail" disabled={loadingForm} type="email" value={email} name="email" onChange={handleChange} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputPhone" className="col-md-3 col-form-label text-sm">{Lang.get('companies.labels.phone')}</label>
                    <div className="col-md-9">
                        <input id="inputPhone" disabled={loadingForm} value={phone} name="phone" onChange={handleChange} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputStreet" className="col-md-3 col-form-label text-sm">{Lang.get('companies.labels.address')}</label>
                    <div className="col-md-9">
                        <textarea id="inputStreet" disabled={loadingForm} style={{resize:'none'}} value={street} name="street" onChange={handleChange} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-md-3 col-form-label text-sm">{Lang.get('regions.village.label')}</label>
                    <div className="col-md-3">
                        <Select onChange={handleSelect} name="village" options={villageOptions} value={village}
                                menuPlacement="top" maxMenuHeight={200} isDisabled={loadingForm}
                                onInputChange={handleSearchVillage} isLoading={loadingVillage}
                                onMenuClose={()=>setLoadingVillage(false)}
                                components={{Option:VillageComponent}}
                                loadingMessage={()=>Lang.get('labels.select.loading',{Attribute:Lang.get('regions.village.label')})}
                                noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('regions.village.label')})}
                                placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('regions.village.label')})}/>
                    </div>
                    <label className="col-md-3 col-form-label text-sm">{Lang.get('regions.district.label')}</label>
                    <div className="col-md-3">
                        <div className="form-control text-sm">
                            {village !== null && village.meta.district !== null && village.meta.district.label}
                            &nbsp;
                        </div>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-md-3 col-form-label text-sm">{Lang.get('regions.city.label')}</label>
                    <div className="col-md-3">
                        <div className="form-control text-sm">
                            {village !== null && village.meta.district !== null && village.meta.district.meta.city !== null && village.meta.district.meta.city.label}
                            &nbsp;
                        </div>
                    </div>
                    <label className="col-md-3 col-form-label text-sm">{Lang.get('regions.province.label')}</label>
                    <div className="col-md-3">
                        <div className="form-control text-sm">
                            {village !== null && village.meta.district !== null && village.meta.district.meta.city !== null && village.meta.district.meta.city.meta.province !== null && village.meta.district.meta.city.meta.province.label}
                            &nbsp;
                        </div>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputPostal" className="col-md-3 col-form-label text-sm">{Lang.get('companies.labels.postal')}</label>
                    <div className="col-md-2">
                        <input id="inputPostal" disabled={loadingForm} value={postal} name="postal" onChange={setPostal} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <div className="col-md-9 offset-md-3">
                        <button disabled={loadingForm} type="submit" className="btn btn-outline-primary">
                            <FontAwesomeIcon icon={loadingForm ? faCircleNotch : faSave} spin={loadingForm} className="mr-2"/>
                            {loadingForm ? Lang.get('labels.update.pending',{Attribute:''}) : Lang.get('labels.update.submit',{Attribute:''})}
                        </button>
                    </div>
                </div>
            </div>
            <a className="text-xs float-right" href="https://www.flaticon.com/free-icons/thank-you" title="thank you icons">Thank you icons created by Eucalyp - Flaticon</a>
        </form>
    )
}

import WizardIpServicePrint from "../../../../../public/images/ip_service_print.png";
import {NumericFormat} from "react-number-format";
import MaskedInput from "react-text-mask";
import {
    crudNas, crudProfile, crudProfileBandwidth,
    crudProfilePools,
    decryptEncryptPass,
    loadNasIPAddress,
    testNasConnection, wizardTestCustomerConnection
} from "../../../Services/NasService";
export const WizardStep2 = () => {
    return (
        <React.Fragment>
            <div className="text-center">
                <img className="mb-5" src={ThankYouImage} style={{height:150}} alt="Thank You"/><br/>
                <p>{HtmlParser(Lang.get('wizard.steps.2.message'))}</p>
            </div>
            <ol>
                <li>{HtmlParser(Lang.get('wizard.steps.2.configs.1'))}</li>
                <li>
                    {HtmlParser(Lang.get('wizard.steps.2.configs.2'))}
                    <img alt="ip service print" style={{maxWidth:'100%'}} className="m-2 img-thumbnail" src={WizardIpServicePrint}/>
                </li>
                <li>{HtmlParser(Lang.get('wizard.steps.2.configs.3'))}</li>
                <li>{HtmlParser(Lang.get('wizard.steps.2.configs.4',{Address:process.env.MIX_RADIUS_SSH_HOST}))}</li>
            </ol>
            <p>{Lang.get('wizard.steps.2.configs.finish')}</p>
            <a className="text-xs float-right" href="https://www.flaticon.com/free-icons/thank-you" title="thank you icons">Thank you icons created by Eucalyp - Flaticon</a>
        </React.Fragment>
    )
}

import RouterImage from "../../../../../public/images/hub.png";
export const WizardStep3 = (props) => {
    const [firstTime,setFirstTime] = React.useState(false);
    const [loading,setLoading] = React.useState(false);
    const [connected,setConnected] = React.useState(false);
    const [name,setName] = React.useState('');
    const [ip,setIP] = React.useState('');
    const [port,setPort] = React.useState(8728);
    const [secret,setSecret] = React.useState('');
    const [user,setUser] = React.useState('');
    const [password,setPassword] = React.useState('');
    const [id,setId] = React.useState(null);

    if (props.nas !== null) {
        if (props.nas.length > 0) {
            if (!firstTime) {
                setFirstTime(true);
                const nas = props.nas[0];
                setId(nas.value);
                setName(nas.label);
                setIP(nas.meta.auth.ip);
                setPort(nas.meta.auth.port);
                setSecret(nas.meta.auth.secret);
                setLoading(false);
                decrypt('username', nas.meta.auth.user)
                    .then(()=>decrypt('password', nas.meta.auth.pass));
            }
        }
    }
    async function decrypt(name,value) {
        if (! loading) {
            setLoading(true);
            try {
                const formData = new FormData();
                formData.append('action','decrypt');
                formData.append('value', value);
                let response = await decryptEncryptPass(formData);
                if (response.data.params === null) {
                    setLoading(false);
                    showError(response.data.message);
                } else {
                    setLoading(false);
                    if (name === 'password') {
                        setPassword(response.data.params);
                    }
                    if (name === 'username') {
                        setUser(response.data.params);
                    }
                }
            } catch (e) {
                setLoading(false);
                responseMessage(e);
            }
        }
    }
    function handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;
        if (name === 'name') setName(value);
        if (name === 'ip') setIP(value);
        if (name === 'port') setPort(value);
        if (name === 'secret') setSecret(value);
        if (name === 'password') setPassword(value);
        if (name === 'user') setUser(value);
    }
    async function testConnection() {
        if (!loading) {
            setLoading(true);
            try {
                const formData = new FormData();
                formData.append(Lang.get('nas.form_input.method'),'api');
                formData.append(Lang.get('nas.form_input.ip'), ip);
                formData.append(Lang.get('nas.form_input.port'), port.toString());
                formData.append(Lang.get('nas.form_input.user'), user);
                formData.append(Lang.get('nas.form_input.pass'), password);
                formData.append(Lang.get('nas.form_input.pass_confirm'), password);
                let response = await testNasConnection(formData);
                if (response.data.params === null) {
                    setLoading(false);
                    showError(response.data.message);
                } else {
                    setLoading(false);
                    setConnected(true);
                    showSuccess(response.data.message);
                }
            } catch (e) {
                setLoading(false);
                responseMessage(e);
            }
        }
    }
    async function handleSubmit(event) {
        event.preventDefault();
        if (! connected) {
            await testConnection();
        } else {
            setLoading(true);
            try {
                const formData = new FormData();
                formData.append('_method', id === null ? 'put' : 'patch');
                if (id !== null) formData.append(Lang.get('nas.form_input.id'), id);
                if (props.user.meta.company !== null) formData.append(Lang.get('companies.form_input.name'), props.user.meta.company.id);
                formData.append(Lang.get('nas.form_input.name'), name);
                formData.append(Lang.get('nas.form_input.port'), port.toString());
                formData.append(Lang.get('nas.form_input.secret'), secret);
                formData.append(Lang.get('nas.form_input.method'), 'api');
                formData.append(Lang.get('nas.form_input.ip'), ip);

                if (user.length > 0) formData.append(Lang.get('nas.form_input.user'), user);
                if (password.length > 0) {
                    formData.append(Lang.get('nas.form_input.pass'), password);
                    formData.append(Lang.get('nas.form_input.pass_confirm'), password);
                }
                let response = await crudNas(formData);
                if (response.data.params === null) {
                    setLoading(false);
                    showError(response.data.message);
                } else {
                    setLoading(false);
                    showSuccess(response.data.message);
                    props.onNas();
                }
            } catch (e) {
                setLoading(false);
                responseMessage(e);
            }
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="text-center">
                <img className="mb-5" src={RouterImage} style={{height:150}} alt="Router"/><br/>
                <p>{HtmlParser(Lang.get('wizard.steps.3.message'))}</p>
            </div>
            <div className="py-5">
                <div className="form-group row">
                    <label htmlFor="inputName" className="col-md-3 col-form-label text-sm"><LabelRequired/>{Lang.get('nas.labels.name')}</label>
                    <div className="col-md-4">
                        <input id="inputName" placeholder={Lang.get('nas.labels.name')} value={name} name="name" onChange={handleChange} disabled={loading} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputIP" className="col-md-3 col-form-label text-sm"><LabelRequired/>{Lang.get('nas.labels.ip.api')}</label>
                    <div className="col-md-4">
                        <MaskedInput name="ip" id="inputIP" guide={false} placeholderChar={'\u2000'} onChange={handleChange}
                                     mask={value => Array(value.length).fill(/[\d.]/)}
                                     pipe={value => pipeIp(value)} disabled={loading} placeholder={Lang.get('nas.labels.ip.api')}
                                     value={ip} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-md-3 col-form-label text-sm" htmlFor="input-port"><LabelRequired/>{Lang.get('nas.labels.port.api')}</label>
                    <div className="col-md-3">
                        <NumericFormat className="form-control text-sm" decimalScale={0} decimalSeparator="," thousandSeparator="" name="port" value={port} onChange={handleChange} id="input-port" placeholder={Lang.get('nas.labels.port.api')} disabled={loading}/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputSecret" className="col-md-3 col-form-label text-sm"><LabelRequired/>{Lang.get('nas.labels.secret')}</label>
                    <div className="col-md-4">
                        <input id="inputSecret" placeholder={Lang.get('nas.labels.secret')} value={secret} name="secret" onChange={handleChange} disabled={loading} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputUser" className="col-md-3 col-form-label text-sm"><LabelRequired/>{Lang.get('nas.labels.user.api')}</label>
                    <div className="col-md-4">
                        <input id="inputUser" placeholder={Lang.get('nas.labels.user.api')} value={user} name="user" onChange={handleChange} disabled={loading} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputPassword" className="col-md-3 col-form-label text-sm"><LabelRequired/>{Lang.get('nas.labels.pass.api')}</label>
                    <div className="col-md-4">
                        <input id="inputPassword" placeholder={Lang.get('nas.labels.pass.api')} value={password} name="password" onChange={handleChange} disabled={loading} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <div className="col-md-8 offset-md-3">
                        {connected ?
                            <button type="submit" className="btn btn-outline-primary">
                                <FontAwesomeIcon icon={loading ? faCircleNotch : faSave} spin={loading} className="mr-2"/>
                                {loading ? Lang.get('labels.create.pending',{Attribute:''}) : Lang.get('labels.create.submit',{Attribute:''})}
                            </button>
                            :
                            <button type="submit" className="btn btn-outline-primary">
                                <FontAwesomeIcon icon={loading ? faCircleNotch : faLink} spin={loading} className="mr-2"/>
                                {loading ? Lang.get('labels.connection.pending',{Attribute:''}) : Lang.get('labels.connection.submit',{Attribute:''})}
                            </button>
                        }
                    </div>
                </div>
                <a className="float-right text-xs" href="https://www.flaticon.com/free-icons/network-switch" title="network switch icons">Network switch icons created by Chattapat - Flaticon</a>
            </div>
        </form>
    )
}

import PoolImage from "../../../../../public/images/polling.png";
export const WizardStep4 = (props) => {
    const [firstTime,setFirstTime] = React.useState(false);
    const [firstNas,setFirstNas] = React.useState(false);
    const [loading,setLoading] = React.useState(false);
    const [nas,setNas] = React.useState(null);
    const [id,setId] = React.useState(null);
    const [name,setName] = React.useState('');
    const [code,setCode] = React.useState('');
    const [firstIP,setFirstIP] = React.useState('');
    const [lastIP,setLastIP] = React.useState('');
    const [interfaceIpAddress,setIntefaceIpAddress] = React.useState([]);
    const [ipLoading,setIpLoading] = React.useState(false);

    if (! firstTime) {
       if (props.pools !== null) {
           if (props.pools.length > 0) {
               setFirstTime(true);
               const pool = props.pools[0];
               setId(pool.value);
               setName(pool.label);
               setCode(pool.meta.address.code);
               setFirstIP(pool.meta.address.first);
               setLastIP(pool.meta.address.last);
           }
       }
    }
    if (! firstNas) {
        if (props.nas !== null && props.nas.length > 0) {
            setFirstNas(true);
            loadIpAddress();
        }
    }
    function handleSelect(event) {
        if (event !== null) {
            try {
                let ranges = getIpRangeFromAddressAndNetmask(event.meta.address);
                if (ranges !== null && ranges.length === 2) {
                    let ipFirst = ranges[0].split('.');
                    let ipLast = ranges[1].split('.');
                    ipFirst[3] = parseInt(ipFirst[3]) + 1;
                    ipFirst = ipFirst.join('.');
                    ipLast[3] = parseInt(ipLast[3]) - 1;
                    ipLast = ipLast.join('.');
                    setName(`POOL ${event.label}`);
                    setFirstIP(ipFirst);
                    setLastIP(ipLast);
                }
            } catch (e) {}
        }
    }
    function handleChange(e) {
       const name = e.target.name;
       const value = e.target.value;
       if (name === 'name') setName(value);
       if (name === 'code') setCode(value);
       if (name === 'first') setFirstIP(value);
       if (name === 'last') setLastIP(value);
   }
    async function loadIpAddress() {
        if (props.nas !== null && props.nas.length > 0) {
            if (! ipLoading) {
                setIpLoading(true);
                try {
                    const formData = new FormData();
                    formData.append(Lang.get('nas.form_input.method'),'api');
                    formData.append(Lang.get('nas.form_input.ip'), props.nas[0].meta.auth.ip);
                    formData.append(Lang.get('nas.form_input.port'), props.nas[0].meta.auth.port.toString());
                    formData.append(Lang.get('nas.form_input.user'), props.nas[0].meta.auth.user);
                    formData.append(Lang.get('nas.form_input.pass'), props.nas[0].meta.auth.pass);
                    formData.append(Lang.get('nas.form_input.pass_confirm'), props.nas[0].meta.auth.pass);
                    let response = await loadNasIPAddress(formData);
                    if (response.data.params === null) {
                        setIpLoading(false);
                        showError(response.data.message);
                    } else {
                        setIpLoading(false);
                        setIntefaceIpAddress(response.data.params);
                    }
                } catch (e) {
                    setIpLoading(false);
                    responseMessage(e);
                }
            }
        }
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('_method', id === null ? 'put' : 'patch');
            if (id !== null) formData.append(Lang.get('nas.pools.form_input.id'), id);
            if (props.nas !== null && props.nas.length > 0) formData.append(Lang.get('nas.form_input.name'), props.nas[0].value);
            formData.append(Lang.get('nas.pools.form_input.module'), 'mikrotik');
            formData.append(Lang.get('nas.pools.form_input.code'), name);
            formData.append(Lang.get('nas.pools.form_input.name'), name);
            formData.append(Lang.get('nas.pools.form_input.description'), '');
            formData.append(Lang.get('nas.pools.form_input.address.first'), firstIP);
            formData.append(Lang.get('nas.pools.form_input.address.last'), lastIP);
            formData.append(Lang.get('nas.pools.form_input.upload'), '1');
            let response = await crudProfilePools(formData);
            if (response.data.params === null) {
                setLoading(false);
                showError(response.data.message);
            } else {
                setLoading(false);
                showSuccess(response.data.message);
                props.onPool();
            }
        } catch (e) {
            setLoading(false);
            responseMessage(e);
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="text-center">
                <img className="mb-5" src={PoolImage} style={{height:150}} alt="IP Pool"/><br/>
                <p>{HtmlParser(Lang.get('wizard.steps.4.message'))}</p>
            </div>
            <div className="py-5">
                {props.nas !== null && props.nas.length > 0 &&
                    <React.Fragment>
                        <div className="form-group row">
                            <label className="col-md-3 col-form-label text-sm">{Lang.get('nas.labels.name')}</label>
                            <div className="col-md-3">
                                <div className="form-control text-sm">{props.nas[0].label}</div>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-md-3 col-form-label text-sm">{Lang.get('nas.labels.ip.api')}</label>
                            <div className="col-md-3">
                                <div className="form-control text-sm">{`${props.nas[0].meta.auth.ip}:${props.nas[0].meta.auth.port}`}</div>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-md-3 col-form-label text-sm">{Lang.get('nas.labels.ip.interface')}</label>
                            <div className="col-md-4">
                                <Select options={interfaceIpAddress} onChange={handleSelect}
                                        isLoading={ipLoading} isDisabled={loading || ipLoading}
                                        noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('nas.labels.ip.interface')})}
                                        placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('nas.labels.ip.interface')})}/>
                            </div>
                            <div className="col-md-5">
                                <button onClick={loadIpAddress} disabled={loading || ipLoading} type="button" className="btn btn-outline-secondary"><FontAwesomeIcon icon={ipLoading ? faCircleNotch : faRefresh} spin={ipLoading}/></button>
                            </div>
                        </div>
                    </React.Fragment>
                }
                <div className="form-group row">
                    <label htmlFor="inputName" className="col-md-3 col-form-label text-sm">{Lang.get('nas.pools.labels.name')}</label>
                    <div className="col-md-4">
                        <input id="inputName" className="form-control text-sm" disabled={loading} name="name" value={name} onChange={handleChange} placeholder={Lang.get('nas.pools.labels.name')}/>
                    </div>
                </div>
                {name.length > 2 &&
                    <div className="form-group row">
                        <label htmlFor="inputFirst" className="col-md-3 col-form-label text-sm">{Lang.get('nas.pools.labels.address.first')}</label>
                        <div className="col-md-4">
                            <MaskedInput name="first" id="inputFirst" guide={false} placeholderChar={'\u2000'} onChange={handleChange}
                                         mask={value => Array(value.length).fill(/[\d.]/)}
                                         pipe={value => pipeIp(value)} disabled={loading} placeholder={Lang.get('nas.pools.labels.address.first')}
                                         value={firstIP} className="form-control text-sm"/>
                        </div>
                    </div>
                }
                {name.length > 2 && firstIP.length >= 7 && firstIP.split('.').length === 4 &&
                    <div className="form-group row">
                        <label htmlFor="inputLast" className="col-md-3 col-form-label text-sm">{Lang.get('nas.pools.labels.address.last')}</label>
                        <div className="col-md-4">
                            <MaskedInput name="last" id="inputLast" guide={false} placeholderChar={'\u2000'} onChange={handleChange}
                                         mask={value => Array(value.length).fill(/[\d.]/)}
                                         pipe={value => pipeIp(value)} disabled={loading} placeholder={Lang.get('nas.pools.labels.address.last')}
                                         value={lastIP} className="form-control text-sm"/>
                        </div>
                    </div>
                }
                {name.length > 2 && firstIP.length >= 7 && firstIP.split('.').length === 4 && lastIP.length >= 7 && lastIP.split('.').length === 4 &&
                    <div className="form-group row">
                        <div className="col-md-9 offset-md-3">
                            <button type="submit" className="btn btn-outline-primary" disabled={loading}>
                                <FontAwesomeIcon icon={loading ? faCircleNotch : faSave} spin={loading} className="mr-2"/>
                                {id === null ?
                                    loading ? Lang.get('labels.create.pending',{Attribute:Lang.get('nas.pools.labels.menu')}) : Lang.get('labels.create.submit',{Attribute:Lang.get('nas.pools.labels.menu')})
                                    :
                                    loading ? Lang.get('labels.update.pending',{Attribute:Lang.get('nas.pools.labels.menu')}) : Lang.get('labels.update.submit',{Attribute:Lang.get('nas.pools.labels.menu')})
                                }
                            </button>
                        </div>
                    </div>
                }
            </div>
            <a className="float-right text-xs" href="https://www.flaticon.com/free-icons/poll" title="poll icons">Poll icons created by Freepik - Flaticon</a>
        </form>
    )
}

import BandwidthImage from "../../../../../public/images/bandwidth.png";
export const WizardStep5 = (props) => {
    const [firstNas,setFirstNas] = React.useState(false);
    const [nas,setNas] = React.useState(null);
    const [firstPool,setFirstPool] = React.useState(false);
    const [pool,setPool] = React.useState(null);
    const [loading,setLoading] = React.useState(false);
    const [firstTime,setFirstTime] = React.useState(false);
    const [id,setId] = React.useState(null);
    const [name,setName] = React.useState('Bandwidth 1 MB');
    const [upload,setUpload] = React.useState(1000);
    const [download,setDownload] = React.useState(1000);

    if (props.bandwidths !== null && props.bandwidths.length > 0) {
        if (! firstTime) {
            setFirstTime(true);
            const bandwidths = props.bandwidths[0];
            setId(bandwidths.value);
            setName(bandwidths.label);
            setUpload(bandwidths.meta.max_limit.up);
            setDownload(bandwidths.meta.max_limit.down);
        }
    }
    if (props.nas !== null && props.nas.length > 0) {
        if (!firstNas) {
            setFirstNas(true);
            setNas(props.nas[0]);
        }
    }
    if (props.pools !== null && props.pools.length > 0) {
        if (!firstPool) {
            setFirstPool(true);
            setPool(props.pools[0]);
        }
    }

    function handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;
        if (name === 'name') setName(value);
        if (name === 'upload') setUpload(parseInputFloat(event));
        if (name === 'download') setDownload(parseInputFloat(event));
    }
    async function handleSubmit(e) {
        e.preventDefault();
        if (! loading) {
            setLoading(true);
            try {
                const formData = new FormData();
                formData.append('_method', id === null ? 'put' : 'patch');
                if (id !== null) formData.append(Lang.get('bandwidths.form_input.id'), id);
                formData.append(Lang.get('bandwidths.form_input.name'), name);
                formData.append(Lang.get('bandwidths.form_input.description'), '');
                formData.append(Lang.get('bandwidths.form_input.max_limit.up'), upload.toString());
                formData.append(Lang.get('bandwidths.form_input.max_limit.down'), download.toString());
                formData.append(Lang.get('bandwidths.form_input.burst.up'), '0');
                formData.append(Lang.get('bandwidths.form_input.burst.down'), '0');
                formData.append(Lang.get('bandwidths.form_input.threshold.up'), '0');
                formData.append(Lang.get('bandwidths.form_input.threshold.down'), '0');
                formData.append(Lang.get('bandwidths.form_input.time.up'), '0');
                formData.append(Lang.get('bandwidths.form_input.time.down'), '0');
                formData.append(Lang.get('bandwidths.form_input.limit_at.up'), '0');
                formData.append(Lang.get('bandwidths.form_input.limit_at.down'), '0');
                formData.append(Lang.get('bandwidths.form_input.priority'), '8');

                let response = await crudProfileBandwidth(formData);
                if (response.data.params === null) {
                    setLoading(false);
                    showError(response.data.message);
                } else {
                    setLoading(false);
                    showSuccess(response.data.message);
                    props.onBandwidth();
                }
            } catch (e) {
                setLoading(false);
                responseMessage(e);
            }
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="text-center">
                <img className="mb-5" src={BandwidthImage} style={{height:150}} alt="Bandwidth"/><br/>
                <p>{HtmlParser(Lang.get('wizard.steps.5.message'))}</p>
            </div>
            <div className="py-5">
                <div className="form-group row">
                    <label htmlFor="inputName" className="col-md-3 col-form-label text-sm">{Lang.get('bandwidths.labels.name')}</label>
                    <div className="col-md-4">
                        <input placeholder={Lang.get('bandwidths.labels.name')} value={name} name="name" onChange={handleChange} id="inputName" disabled={loading} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputUpload" className="col-md-3 col-form-label text-sm">{Lang.get('bandwidths.labels.max_limit.up_long')}</label>
                    <div className="col-md-3">
                        <div className="input-group">
                            <NumericFormat disabled={loading} id="inputUpload"
                                           className="form-control text-sm"
                                           name="upload" onChange={handleChange}
                                           allowLeadingZeros={false}
                                           placeholder={Lang.get('bandwidths.labels.max_limit.up_long')}
                                           value={upload}
                                           decimalScale={0} decimalSeparator={','} thousandSeparator={'.'}/>
                            <div className="input-group-append"><span className="input-group-text">Kb</span></div>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <div className="form-control text-sm">{formatBytes(upload)}</div>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputDownload" className="col-md-3 col-form-label text-sm">{Lang.get('bandwidths.labels.max_limit.down_long')}</label>
                    <div className="col-md-3">
                        <div className="input-group">
                            <NumericFormat disabled={loading} id="inputDownload"
                                           className="form-control text-sm"
                                           name="download" onChange={handleChange}
                                           allowLeadingZeros={false}
                                           placeholder={Lang.get('bandwidths.labels.max_limit.down_long')}
                                           value={download}
                                           decimalScale={0} decimalSeparator={','} thousandSeparator={'.'}/>
                            <div className="input-group-append"><span className="input-group-text">Kb</span></div>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <div className="form-control text-sm">{formatBytes(download)}</div>
                    </div>
                </div>
                <div className="form-group row">
                    <div className="col-md-9 offset-md-3">
                        <button type="submit" className="btn btn-outline-primary" disabled={loading}>
                            <FontAwesomeIcon icon={loading ? faCircleNotch : faSave} spin={loading} className="mr-2"/>
                            {id === null ?
                                loading ? Lang.get('labels.create.pending',{Attribute:Lang.get('bandwidths.labels.menu')}) : Lang.get('labels.create.submit',{Attribute:Lang.get('bandwidths.labels.menu')})
                                :
                                loading ? Lang.get('labels.update.pending',{Attribute:Lang.get('bandwidths.labels.menu')}) : Lang.get('labels.update.submit',{Attribute:Lang.get('bandwidths.labels.menu')})
                            }
                        </button>
                    </div>
                </div>
            </div>
            <a className="float-right text-xs" href="https://www.flaticon.com/free-icons/bandwidth" title="bandwidth icons">Bandwidth icons created by xnimrodx - Flaticon</a>
        </form>
    )
}

import logoService from "../../../../../public/images/customer-service.png";
export const WizardStep6 = (props) => {
    const [loading,setLoading] = React.useState(false);
    const [firstNas,setFirstNas] = React.useState(false);
    const [nas,setNas] = React.useState(null);
    const [firstPool,setFirstPool] = React.useState(false);
    const [pool,setPool] = React.useState(null);
    const [firstBandwidth,setFirstBandwidth] = React.useState(false);
    const [bandwidth,setBandwidth] = React.useState(null);
    const [interfaceIpAddress,setIntefaceIpAddress] = React.useState([]);
    const [ipLoading,setIpLoading] = React.useState(false);
    const [parentQueues,setParentQueues] = React.useState([]);
    const [parentQueue,setParentQueue] = React.useState(null);
    const [firstTime,setFirstTime] = React.useState(false);
    const [id,setId] = React.useState(null);
    const [name,setName] = React.useState('Paket 1 Bulan');
    const [price,setPrice] = React.useState(100000);
    const [dns,setDns] = React.useState([]);
    const [code,setCode] = React.useState('PPPoE_1_BULAN');
    const [mikInterface,setMikInterface] = React.useState(null);
    const [localeAddress,setLocaleAddress] = React.useState('');

    if (props.nas !== null && props.nas.length > 0 && ! firstNas) {
        setFirstNas(true);
        setNas(props.nas[0]);
        loadIpAddress();
    }
    if (props.pools !== null && props.pools.length > 0 && ! firstPool) {
        setFirstPool(true);
        setPool(props.pools[0]);
    }
    if (props.bandwidths !== null && props.bandwidths.length > 0 && ! firstBandwidth) {
        setFirstBandwidth(true);
        setBandwidth(props.bandwidths[0]);
    }

    if (props.profiles !== null && props.profiles.length > 0 && ! firstTime) {
        setFirstTime(true);
        const profile = props.profiles[0];
        setId(profile.value);
        setName(profile.label);
        setCode(profile.meta.code);
        setPrice(profile.meta.price);
        setLocaleAddress(profile.meta.local);
    }
    function handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;
        if (name === 'name') setName(value);
        if (name === 'localAddress') setLocaleAddress(value);
        if (name === 'price') setPrice(parseInputFloat(event));
    }
    function handleSelect(event) {
        if (event !== null) {
            let value = event.meta.address.split('/');
            if (value.length === 2) {
                value = value[0];
                setLocaleAddress(value);
                setMikInterface(event);
            }
        }
    }
    async function loadIpAddress() {
        if (props.nas !== null && props.nas.length > 0) {
            if (! ipLoading) {
                setIpLoading(true);
                try {
                    const formData = new FormData();
                    formData.append(Lang.get('nas.form_input.method'),'api');
                    formData.append(Lang.get('nas.form_input.ip'), props.nas[0].meta.auth.ip);
                    formData.append(Lang.get('nas.form_input.port'), props.nas[0].meta.auth.port.toString());
                    formData.append(Lang.get('nas.form_input.user'), props.nas[0].meta.auth.user);
                    formData.append(Lang.get('nas.form_input.pass'), props.nas[0].meta.auth.pass);
                    formData.append(Lang.get('nas.form_input.pass_confirm'), props.nas[0].meta.auth.pass);
                    let response = await loadNasIPAddress(formData);
                    if (response.data.params === null) {
                        setIpLoading(false);
                        showError(response.data.message);
                    } else {
                        setIpLoading(false);
                        setIntefaceIpAddress(response.data.params);
                    }
                } catch (e) {
                    setIpLoading(false);
                    responseMessage(e);
                }
            }
        }
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('_method', id === null ? 'put' : 'patch');
            if (id !== null) formData.append(Lang.get('profiles.form_input.id'), id);
            formData.append(Lang.get('profiles.form_input.is_additional'), '0');
            formData.append(Lang.get('profiles.form_input.address.local'), localeAddress);
            if (props.user.meta.company !== null) formData.append(Lang.get('companies.form_input.name'), props.user.meta.company.id);
            if (nas !== null) formData.append(Lang.get('nas.form_input.name'), nas.value);
            if (pool !== null) formData.append(Lang.get('nas.pools.form_input.name'), pool.value);
            if (bandwidth !== null) formData.append(Lang.get('bandwidths.form_input.name'), bandwidth.value);
            formData.append(Lang.get('profiles.form_input.type'), 'pppoe');

            if (parentQueue !== null) {
                formData.append(Lang.get('profiles.form_input.queue.name'), parentQueue.label);
                formData.append(Lang.get('profiles.form_input.queue.id'), parentQueue.value);
                formData.append(Lang.get('profiles.form_input.queue.target'), parentQueue.meta.data.target);
            }
            formData.append(Lang.get('profiles.form_input.name'), name);
            formData.append(Lang.get('profiles.form_input.description'), '');
            formData.append(Lang.get('profiles.form_input.code'), code);
            formData.append(Lang.get('profiles.form_input.price'), price.toString());
            formData.append(Lang.get('profiles.form_input.limitation.type'), 'time');
            formData.append(Lang.get('profiles.form_input.limitation.rate'), '1');
            formData.append(Lang.get('profiles.form_input.limitation.unit'), 'months');

            dns.map((item,index)=>{
                formData.append(`${Lang.get('profiles.form_input.address.dns')}[${index}]`, item.label);
            });

            let response = await crudProfile(formData);
            if (response.data.params === null) {
                setLoading(false);
                showError(response.data.message);
            } else {
                setLoading(false);
                showSuccess(response.data.message);
                props.onProfile();
            }
        } catch (e) {
            console.log(e);
            setLoading(false);
            responseMessage(e);
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="text-center">
                <img className="mb-5" src={logoService} style={{height:150}} alt="Service"/><br/>
                <p>{HtmlParser(Lang.get('wizard.steps.6.message'))}</p>
            </div>
            <div className="py-5">
                <div className="form-group row">
                    <label htmlFor="inputName" className="col-md-3 col-form-label text-sm">{Lang.get('profiles.labels.name')}</label>
                    <div className="col-md-9">
                        <input id="inputName" className="form-control text-sm" value={name} name="name" onChange={handleChange} disabled={loading} placeholder={Lang.get('profiles.labels.name')}/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputCode" className="col-md-3 col-form-label text-sm">
                        {Lang.get('profiles.labels.code.label',{Attribute:'PPPoE'})}<br/>
                        <small className="text-info">{Lang.get('profiles.labels.code.info',{Attribute:'PPP'})}</small>
                    </label>
                    <div className="col-md-4">
                        <input id="inputCode" className="form-control text-sm" value={code} name="code" onChange={handleChange} disabled={loading} placeholder={Lang.get('profiles.labels.code.label',{Attribute:'PPP'})}/>
                        <small className="text-muted">{HtmlParser(Lang.get('wizard.steps.6.code_info'))}</small>
                    </div>
                </div>
                {nas !== null &&
                    <React.Fragment>
                        <div className="form-group row">
                            <label className="col-md-3 col-form-label text-sm">{Lang.get('nas.labels.ip.interface')}</label>
                            <div className="col-md-4">
                                <Select options={interfaceIpAddress} onChange={handleSelect}
                                        isLoading={ipLoading} isDisabled={loading || ipLoading} value={mikInterface}
                                        noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('nas.labels.ip.interface')})}
                                        placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('nas.labels.ip.interface')})}/>
                            </div>
                            <div className="col-md-5">
                                <button onClick={loadIpAddress} disabled={loading || ipLoading} type="button" className="btn btn-outline-secondary"><FontAwesomeIcon icon={ipLoading ? faCircleNotch : faRefresh} spin={ipLoading}/></button>
                            </div>
                        </div>
                    </React.Fragment>
                }
                <div className="form-group row">
                    <label htmlFor="inputLocalAddress" className="col-md-3 col-form-label text-sm">{Lang.get('profiles.labels.address.local')}</label>
                    <div className="col-md-3">
                        <MaskedInput name="localAddress" id="inputLocalAddress" guide={false} placeholderChar={'\u2000'} onChange={handleChange}
                                     mask={value => Array(value.length).fill(/[\d.]/)}
                                     pipe={value => pipeIp(value)} disabled={loading} placeholder={Lang.get('profiles.labels.address.local')}
                                     value={localeAddress} className="form-control text-sm"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputPrice" className="col-md-3 col-form-label text-sm">{Lang.get('profiles.labels.price')}</label>
                    <div className="col-md-3">
                        <div className="input-group">
                            <div className="input-group-prepend"><span className="input-group-text">IDR</span></div>
                            <NumericFormat className="form-control text-sm text-right"
                                           decimalScale={0}
                                           decimalSeparator="," thousandSeparator="."
                                           name="price" value={price} onChange={handleChange} id="inputPrice"
                                           placeholder={Lang.get('profiles.labels.price')}
                                           disabled={loading}/>
                        </div>
                    </div>
                </div>
                <div className="form-group row">
                    <div className="col-md-9 offset-md-3">
                        <button type="submit" className="btn btn-outline-primary" disabled={loading}>
                            <FontAwesomeIcon icon={loading ? faCircleNotch : faSave} spin={loading} className="mr-2"/>
                            {id === null ?
                                loading ? Lang.get('labels.create.pending',{Attribute:Lang.get('profiles.labels.menu')}) : Lang.get('labels.create.submit',{Attribute:Lang.get('profiles.labels.menu')})
                                :
                                loading ? Lang.get('labels.update.pending',{Attribute:Lang.get('profiles.labels.menu')}) : Lang.get('labels.update.submit',{Attribute:Lang.get('profiles.labels.menu')})
                            }
                        </button>
                    </div>
                </div>
            </div>
            <a className="text-xs float-right" href="https://www.flaticon.com/free-icons/service" title="service icons">Service icons created by srip - Flaticon</a>
        </form>
    )
}

import CustomerImage from "../../../../../public/images/satisfaction.png";
import {crudCustomers} from "../../../Services/CustomerService";
export const WizardStep7 = (props) => {
    const [loading,setLoading] = React.useState(false);
    const [profile,setProfile] = React.useState(null);
    const [firstProfile,setFirstProfile] = React.useState(false);
    const [firstNas,setFirstNas] = React.useState(false);
    const [nas,setNas] = React.useState(null);
    const [firstTime,setFirstTime] = React.useState(false);
    const [id,setId] = React.useState(null);
    const [name,setName] = React.useState(Lang.get('wizard.autofill.customer_name'));
    const [firstCompany,setFirstCompany] = React.useState(false);
    const [address,setAddress] = React.useState('');
    const [village,setVillage] = React.useState(null);
    const [district,setDistrict] = React.useState(null);
    const [city,setCity] = React.useState(null);
    const [province,setProvince] = React.useState(null);
    const [email,setEmail] = React.useState('');
    const [postal,setPostal] = React.useState('');
    const [phone,setPhone] = React.useState('');
    const [username,setUsername] = React.useState(Lang.get('wizard.autofill.username'));
    const [password,setPassword] = React.useState(Lang.get('wizard.autofill.password'));

    if (props.user !== null && ! firstCompany) {
        setFirstCompany(true);
        const company = props.user.meta.company;
        setAddress(company.address);
        if (company.village_obj !== null) setVillage({value:company.village_obj.code,label:company.village_obj.name});
        if (company.district_obj !== null) setDistrict({value:company.district_obj.code,label:company.district_obj.name});
        if (company.city_obj !== null) setCity({value:company.city_obj.code,label:company.city_obj.name});
        if (company.province_obj !== null) setProvince({value:company.province_obj.code,label:company.province_obj.name});
        if (company.postal !== null) setPostal(company.postal);
    }
    if (props.nas !== null && props.nas.length > 0 && ! firstNas) {
        setFirstNas(true);
        setNas(props.nas[0]);
    }
    if (props.profiles !== null && props.profiles.length > 0 && !firstProfile) {
        setFirstProfile(true);
        setProfile(props.profiles[0]);
    }
    if (props.customers !== null && props.customers.length > 0 && ! firstTime) {
        setFirstTime(true);
        const customer = props.customers[0];
        setId(customer.value);
        setName(customer.label);
        //setEmail(customer.meta.address.email);
        setPhone(customer.meta.address.phone);
        setPassword(customer.meta.auth.pass);
        setUsername(customer.meta.auth.user);
    }
    function handleChange(event) {
        const inputName = event.target.name;
        const inputValue = event.target.value;
        if (inputName === 'name') setName(inputName);
        if (inputName === 'email') setEmail(inputValue);
        if (inputName === 'phone') setPhone(inputValue);
        if (inputName === 'username') setUsername(inputValue);
        if (inputName === 'password') setPassword(inputValue);
    }
    async function handleSubmit(e) {
        e.preventDefault();
        if (! loading) {
            setLoading(true);
            try {
                const formData = new FormData();
                formData.append('_method', id === null ? 'put' : 'patch');
                if (id !== null) formData.append(Lang.get('customers.form_input.id'), id);
                if (profile !== null) formData.append(Lang.get('profiles.form_input.name'), profile.value);
                if (nas !== null) formData.append(Lang.get('nas.form_input.name'), nas.value);
                formData.append(Lang.get('customers.form_input.type'), 'pppoe');
                if (name.length > 1) formData.append(Lang.get('customers.form_input.name'), name);
                if (address.length > 2) formData.append(Lang.get('customers.form_input.address.street'), address);
                if (email.length > 1) formData.append(Lang.get('customers.form_input.email'), email);
                if (village !== null) formData.append(Lang.get('customers.form_input.address.village'), village.value);
                if (district !== null) formData.append(Lang.get('customers.form_input.address.district'), district.value);
                if (city !== null) formData.append(Lang.get('customers.form_input.address.city'), city.value);
                if (province !== null) formData.append(Lang.get('customers.form_input.address.province'), province.value);
                formData.append(Lang.get('customers.form_input.address.postal'), postal);
                formData.append(Lang.get('customers.form_input.address.phone'), phone);
                if (username.length > 1) formData.append(Lang.get('customers.form_input.username'), username);
                if (password.length > 1) formData.append(Lang.get('customers.form_input.password'), password);
                if (profile !== null) formData.append(`${Lang.get('customers.form_input.service.input')}[0][${Lang.get('customers.form_input.service.name')}]`, profile.value);

                let response = await crudCustomers(formData);
                if (response.data.params === null) {
                    setLoading(false);
                    showError(response.data.message);
                } else {
                    setLoading(false);
                    showSuccess(response.data.message);
                    props.onCustomer();
                }
            } catch (e) {
                console.log(e);
                setLoading(false);
                responseMessage(e);
            }
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="text-center">
                <img className="mb-5" src={CustomerImage} style={{height:150}} alt="Customer"/><br/>
                <p>{HtmlParser(Lang.get('wizard.steps.7.message'))}</p>
            </div>
            <div className="py-5">
                <div className="form-group row">
                    <label htmlFor="inputName" className="col-form-label text-sm col-md-3">{Lang.get('customers.labels.name')}</label>
                    <div className="col-md-5">
                        <input id="inputName" className="form-control text-sm" value={name} name="name" onChange={handleChange} disabled={loading} placeholder={Lang.get('customers.labels.name')}/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputUser" className="col-form-label text-sm col-md-3">{Lang.get('customers.labels.username.label')}</label>
                    <div className="col-md-5">
                        <input id="inputUser" className="form-control text-sm" value={username} name="username" onChange={handleChange} disabled={loading} placeholder={Lang.get('customers.labels.username.label')}/>
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="inputPassword" className="col-form-label text-sm col-md-3">{Lang.get('customers.labels.password.label')}</label>
                    <div className="col-md-5">
                        <input id="inputPassword" className="form-control text-sm" value={password} name="password" onChange={handleChange} disabled={loading} placeholder={Lang.get('customers.labels.password.label')}/>
                    </div>
                </div>
                <div className="form-group row">
                    <div className="col-md-9 offset-md-3">
                        <button type="submit" className="btn btn-outline-primary" disabled={loading}>
                            <FontAwesomeIcon icon={loading ? faCircleNotch : faSave} spin={loading} className="mr-2"/>
                            {id === null ?
                                loading ? Lang.get('labels.create.pending',{Attribute:Lang.get('customers.labels.menu')}) : Lang.get('labels.create.submit',{Attribute:Lang.get('customers.labels.menu')})
                                :
                                loading ? Lang.get('labels.update.pending',{Attribute:Lang.get('customers.labels.menu')}) : Lang.get('labels.update.submit',{Attribute:Lang.get('customers.labels.menu')})
                            }
                        </button>
                    </div>
                </div>
            </div>
            <a className="text-xs float-right" href="https://www.flaticon.com/free-icons/satisfaction" title="satisfaction icons">Satisfaction icons created by Freepik - Flaticon</a>
        </form>
    )
}

import CustomerCheckImage from "../../../../../public/images/customer-service (1).png";
export const WizardStep8 = (props) => {
    const [loading,setLoading] = React.useState(false);
    const [statusTest,setStatusTest] = React.useState([]);
    const [customerFirst,setCustomerFirst] = React.useState(false);
    const [customer,setCustomer] = React.useState(null);

    if (props.customers !== null && props.customers.length > 0 && ! customerFirst) {
        setCustomerFirst(true);
        setCustomer(props.customers[0]);
    }

    async function checkConnection(e) {
        e.preventDefault();
        if (! loading) {
            setStatusTest([]);
            setLoading(true);
            try {
                const formData = new FormData();
                if (customer !== null) formData.append(Lang.get('customers.form_input.id'), customer.value);
                let response = await wizardTestCustomerConnection(formData);
                if (response.data.params === null) {
                    setLoading(false);
                    showError(response.data.message);
                } else {
                    setLoading(false);
                    setStatusTest(response.data.params);
                }
            } catch (e) {
                setLoading(false);
                responseMessage(e);
            }
        }
    }
    return (
        <div>
            <div className="text-center">
                <img className="mb-5" src={CustomerCheckImage} style={{height:150}} alt="Customer"/><br/>
                <p>{HtmlParser(Lang.get('wizard.steps.8.message'))}</p>
            </div>
            <ol>
                <li>{HtmlParser(Lang.get('wizard.steps.8.tools.1'))}</li>
                <li>{HtmlParser(Lang.get('wizard.steps.8.tools.2'))}</li>
            </ol>
            <p>{HtmlParser(Lang.get('wizard.steps.8.message_2'))}</p>
            {props.customers !== null && props.customers.length > 0 &&
                <p><code>{Lang.get('customers.labels.username.label')} = {props.customers[0].meta.auth.user }<br/>{Lang.get('customers.labels.password.label')} = {props.customers[0].meta.auth.pass}</code></p>
            }
            <button onClick={checkConnection} className="btn btn-outline-primary" disabled={loading}>
                <FontAwesomeIcon icon={loading ? faCircleNotch : faLink} spin={loading} className="mr-2"/>
                {loading ? Lang.get('wizard.steps.8.check.pending') : Lang.get('wizard.steps.8.check.button')}
            </button>
            {statusTest.length > 0 &&
                <React.Fragment>
                    {statusTest[0].status ?
                        <div className="alert alert-success mt-4">
                            <h5><FontAwesomeIcon icon={faCheckCircle} className="mr-2"/> {Lang.get('wizard.steps.8.success.title')}</h5>
                            <p>{Lang.get('wizard.steps.8.success.message')}</p>
                        </div>
                        :
                        <div className="alert alert-warning mt-4">
                            <h5><FontAwesomeIcon icon={faTimesCircle} className="mr-2"/> {Lang.get('wizard.steps.8.error.title')}</h5>
                            <p>{Lang.get('wizard.steps.8.error.message')}</p>
                        </div>
                    }
                </React.Fragment>
            }
            <a className="text-xs float-right" href="https://www.flaticon.com/free-icons/call-center-agent" title="call center agent icons">Call center agent icons created by smashingstocks - Flaticon</a>
        </div>
    )
}

import FinishImage from "../../../../../public/images/finish.png";
import {finishWizard} from "../../../Services/AuthService";
import {getRootUrl} from "../../../Components/Authentication";
export const WizardStep9 = (props) => {
    const [loading,setLoading] = React.useState(false);
    async function setFinish() {
        if (! loading) {
            setLoading(true);
            try {
                let response = await finishWizard();
                if (response.data.params == null) {
                    setLoading(false);
                    showError(response.data.message);
                } else {
                    setLoading(false);
                    showSuccess(response.data.message);
                    localStorage.setItem('user', JSON.stringify(response.data.params));
                    window.location.href = getRootUrl();
                }
            } catch (e) {
                setLoading(false);
                responseMessage(e);
            }
        }
    }
    return (
        <div>
            <div className="text-center">
                <img className="mb-5" src={FinishImage} style={{height:200}} alt="Finish"/><br/>
                <p>{HtmlParser(Lang.get('wizard.steps.9.message'))}</p>
                <button onClick={setFinish} disabled={loading} className="btn btn-lg btn-success btn-block my-4 p-5">
                    <FontAwesomeIcon icon={faCheckCircle} size="2xl" className="mr-3"/>
                    <span className="text-xl text-capitalize">{Lang.get('wizard.finish').toUpperCase()}</span>
                </button>
            </div>
            <a className="text-xs float-right" href="https://www.flaticon.com/free-icons/finish" title="finish icons">Finish icons created by Freepik - Flaticon</a>
        </div>
    )
}
