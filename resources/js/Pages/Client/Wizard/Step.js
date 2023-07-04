import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faChevronCircleLeft,
    faChevronCircleRight,
    faCircleNotch,
    faInfo,
    faLink
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
import {faSave} from "@fortawesome/free-regular-svg-icons";
import {LabelRequired, pipeIp, responseMessage} from "../../../Components/mixedConsts";
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
import {crudNas, decryptEncryptPass, testNasConnection} from "../../../Services/NasService";
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
            </div>
        </form>
    )
}

export const WizardStep4 = (props) => {
    const [firstTime,setFirstTime] = React.useState(false);
    const [loading,setLoading] = React.useState(false);
    const [nas,setNas] = React.useState(null);
    const [id,setId] = React.useState(null);
    const [name,setName] = React.useState('');
    const [code,setCode] = React.useState('');
    const [firstIP,setFirstIP] = React.useState('');
    const [lastIP,setLastIP] = React.useState('');

   if (! firstTime) {
       if (props.pools !== null) {
           if (props.pools.length > 0) {
               setFirstTime(true);
               const pool = props.pools;
               setId(pool.value);
               setName(pool.label);
               setCode(pool.meta.address.code);
               setFirstIP(pool.meta.address.first);
               setLastIP(pool.meta.address.last);
           }
       }
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="text-center">
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
                    </React.Fragment>
                }
            </div>
        </form>
    )
}
