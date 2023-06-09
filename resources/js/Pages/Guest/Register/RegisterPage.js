// noinspection CommaExpressionJS

import React from "react";
import ReactDOM from "react-dom/client";
import {getRootUrl} from "../../../Components/Authentication";
import {ToastContainer} from "react-toastify";
import {listSupportedLanguage, responseMessage, ucFirst} from "../../../Components/mixedConsts";
import {faEnvelope, faEye, faEyeSlash, faPaperPlane, faUser} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBarcode, faBuildingFlag, faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import {LoadCanvasTemplate, loadCaptchaEnginge, validateCaptcha} from "react-simple-captcha";
import {registerGoogleSubmit, registerSubmit} from "../../../Services/AuthService";
import {showError, showSuccess} from "../../../Components/Toaster";
import {auth} from "../../../Components/Google/Firebase";
import {GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {faGooglePlus} from "@fortawesome/free-brands-svg-icons";
import HtmlParser from "react-html-parser";
import FadeInOut from "../../../Components/FadeInOut";

// noinspection DuplicatedCode
class RegisterPage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                email : '', name : '', company : '', security_code : '', social : false,
                avatar : null,
                passwords : {
                    current : { type : 'password', value : '' },
                    confirm : { type : 'password', value : '' }
                },
            }
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.togglePassword = this.togglePassword.bind(this);
        this.setLocaleLang = this.setLocaleLang.bind(this);
        this.handleGoogle = this.handleGoogle.bind(this);
        this.chaptchaEngine = this.chaptchaEngine.bind(this);
    }
    componentDidMount() {
        if (localStorage.getItem('token') !== null) {
            window.location.href = getRootUrl();
        }
        this.chaptchaEngine();
    }
    chaptchaEngine() {
        loadCaptchaEnginge(6,'black','white','numbers');
    }
    setLocaleLang(event) {
        let langId = event.currentTarget.getAttribute('data-lang');
        if (langId !== null) {
            if (langId.length === 2) {
                localStorage.setItem('locale_lang', langId);
                Lang.setLocale(langId);
                window.location.reload();
            }
        }
    }
    togglePassword(e) {
        let form = this.state.form;
        let type = e.currentTarget.getAttribute('data-name');
        if (type !== null) {
            if (type.length > 2) {
                form.passwords[type].type = this.state.form.passwords[type].type === 'password' ? 'text' : 'password';
                this.setState({form});
            }
        }
    }
    handleChange(e) {
        let form = this.state.form;
        if (['current','confirm'].indexOf(e.target.name) !== -1) {
            form.passwords[e.target.name].value = e.target.value;
        } else {
            form[e.target.name] = e.target.value;
        }
        this.setState({form});
    }
    async submitGoogle() {
        let form = this.state.form;
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append(Lang.get('companies.form_input.other'), this.state.form.company);
            formData.append(Lang.get('messages.users.form_input.name'), this.state.form.name);
            formData.append(Lang.get('auth.form_input.email'), this.state.form.email);
            formData.append(Lang.get('auth.form_input.avatar'), this.state.form.avatar);
            let response = await registerGoogleSubmit(formData);
            if (response.data.params === null) {
                form.social = false,form.company = '',form.email = '',form.name = '';
                this.setState({loading:false,form},()=>this.chaptchaEngine());
                showError(response.data.message);
            } else {
                form.social = false;
                this.setState({loading:false,form});
                showSuccess(response.data.message);
                localStorage.setItem('token', response.data.params.token);
                localStorage.setItem('user', JSON.stringify(response.data.params.user));
                window.location.href = getRootUrl();
            }
        } catch (e) {
            form.social = false,form.company = '',form.email = '',form.name = '';
            this.setState({loading:false,form},()=>this.chaptchaEngine());
            responseMessage(e);
        }
    }
    async handleGoogle(e) {
        e.preventDefault();
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({prompt:'select_account'})
        await signInWithPopup(auth, provider)
            .then((result)=>{
                let form = this.state.form;
                form.email = result.user.email;
                form.name = result.user.displayName;
                form.company = result.user.displayName;
                form.avatar = result.user.photoURL;
                form.social = true;
                this.setState({form},()=>this.submitGoogle());
            })
            .catch((err)=>{
                let form = this.state.form;
                form.social = false;
                this.setState({form});
                showError(err.message);
            })
    }
    async handleSubmit(e) {
        e.preventDefault();
        if (this.state.form.security_code.length === 0) {
            validateCaptcha('asd',true);
            showError(Lang.get('validation.required',{Attribute:Lang.get('auth.labels.captcha')}));
        } else if (!validateCaptcha(this.state.form.security_code,true)) {
            showError(Lang.get('validation.exists',{Attribute:Lang.get('auth.labels.captcha')}))
        } else {
            let form = this.state.form;
            this.setState({loading:true});
            try {
                const formData = new FormData();
                formData.append(Lang.get('companies.form_input.other'), this.state.form.company);
                formData.append(Lang.get('messages.users.form_input.name'), this.state.form.name);
                formData.append(Lang.get('auth.form_input.email'), this.state.form.email);
                formData.append(Lang.get('auth.form_input.password'), this.state.form.passwords.current.value);
                formData.append(Lang.get('auth.form_input.confirm'), this.state.form.passwords.confirm.value);
                let response = await registerSubmit(formData);
                if (response.data.params === null) {
                    form.security_code = '';
                    this.setState({loading:false,form});
                    showError(response.data.message);
                    validateCaptcha('asd',true);
                } else {
                    form.security_code = '';
                    this.setState({loading:false,form});
                    localStorage.setItem('token', response.data.params.token);
                    localStorage.setItem('user', JSON.stringify(response.data.params.user));
                    validateCaptcha('asd',true);
                    showSuccess(response.data.message);
                    window.location.href = window.origin + '/clients';
                }
            } catch (e) {
                form.security_code = '';
                this.setState({loading:false,form});
                responseMessage(e);
                validateCaptcha('asd',true);
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <ToastContainer theme="light" pauseOnFocusLoss autoClose={2000} position="top-center" closeOnClick/>
                <div style={{position:'fixed',top:5,right:5}}>
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item dropdown">
                            <a title={Lang.get('lang.select')} className="nav-link" data-toggle="dropdown" href="#">
                                <i className={`mr-1 ${listSupportedLanguage[listSupportedLanguage.findIndex((f) => f.value === localStorage.getItem('locale_lang'))].flag}`}/>
                            </a>
                            <div className="dropdown-menu dropdown-menu-right p-0">
                                {listSupportedLanguage.map((item,index)=>
                                    <a data-lang={item.value}
                                       onClick={this.setLocaleLang}
                                       key={`flag_${index}`} href="#"
                                       className={localStorage.getItem('locale_lang') === null ? "dropdown-item" : localStorage.getItem('locale_lang') === item.value ? "dropdown-item active" : "dropdown-item"}>
                                        <i className={`mr-2 ${item.flag}`}/> {item.label}
                                    </a>
                                )}
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="login-box my-5">
                    <div className="card card-outline card-primary">
                        <div className="card-body">

                            <p className="login-box-msg">{ucFirst(Lang.get('auth.register_new_member.label'))}</p>
                            <form onSubmit={this.handleSubmit}>
                                <div className="input-group mb-3">
                                    <input id="company" onChange={this.handleChange} name="company" value={this.state.form.company} disabled={this.state.loading} type="text" className="form-control text-sm" placeholder={Lang.get('labels.name',{Attribute:Lang.get('companies.labels.other')})}/>
                                    <div className="input-group-append"><div className="input-group-text"><FontAwesomeIcon title={Lang.get('labels.name',{Attribute:Lang.get('companies.labels.other')})} style={{width:24}} icon={faBuildingFlag}/></div></div>
                                </div>
                                <div className="input-group mb-3">
                                    <input id="name" onChange={this.handleChange} name="name" value={this.state.form.name} disabled={this.state.loading} type="text" className="form-control text-sm" placeholder={Lang.get('messages.users.labels.name')}/>
                                    <div className="input-group-append"><div className="input-group-text"><FontAwesomeIcon title={Lang.get('messages.users.labels.name')} style={{width:24}} icon={faUser}/></div></div>
                                </div>
                                <div className="input-group mb-3">
                                    <input id="email" onChange={this.handleChange} name="email" value={this.state.form.email} disabled={this.state.loading} type="email" className="form-control text-sm" placeholder={Lang.get('messages.users.labels.email')}/>
                                    <div className="input-group-append"><div className="input-group-text"><FontAwesomeIcon title={Lang.get('messages.users.labels.email')} style={{width:24}} icon={faEnvelope}/></div></div>
                                </div>
                                <div className="input-group mb-3">
                                    <input id="current" onChange={this.handleChange} name="current" value={this.state.form.passwords.current.value} disabled={this.state.loading} type={this.state.form.passwords.current.type} className="form-control text-sm" placeholder={Lang.get('auth.labels.password')}/>
                                    <div style={{cursor:'pointer'}} data-name="current" onClick={this.togglePassword} className="input-group-append"><div className="input-group-text"><FontAwesomeIcon title={Lang.get('auth.labels.password')} style={{width:24}} icon={this.state.form.passwords.current.type === 'password' ? faEye : faEyeSlash}/></div></div>
                                </div>
                                <div className="input-group mb-3">
                                    <input id="confirm" onChange={this.handleChange} name="confirm" value={this.state.form.passwords.confirm.value} disabled={this.state.loading} type={this.state.form.passwords.confirm.type} className="form-control text-sm" placeholder={Lang.get('auth.labels.confirm')}/>
                                    <div style={{cursor:'pointer'}} data-name="confirm" onClick={this.togglePassword} className="input-group-append"><div className="input-group-text"><FontAwesomeIcon title={Lang.get('auth.labels.confirm')} style={{width:24}} icon={this.state.form.passwords.confirm.type === 'password' ? faEye : faEyeSlash}/></div></div>
                                </div>
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <LoadCanvasTemplate/>
                                    </div>
                                </div>
                                <div className="input-group mb-3">
                                    <input onChange={this.handleChange} value={this.state.form.security_code} name="security_code" disabled={this.state.loading} type="text" className="form-control text-sm" placeholder={Lang.get('messages.users.labels.captcha')}/>
                                    <div className="input-group-append"><div className="input-group-text"><FontAwesomeIcon icon={faBarcode}/></div></div>
                                </div>
                                <div className="row">
                                    <div className="col-12 text-right">
                                        <button disabled={this.state.loading} type="submit" className="btn btn-primary">
                                            <FontAwesomeIcon className="mr-2" icon={this.state.loading ? faCircleNotch : faPaperPlane} spin={this.state.loading}/>
                                            {this.state.loading ? Lang.get('labels.processing',{Attribute:Lang.get('auth.register_new_member.submit')}) : Lang.get('auth.register_new_member.submit')}
                                        </button>
                                    </div>
                                </div>

                                <FadeInOut show={this.state.form.social} duration={500}>
                                    <div className="text-center my-5">
                                        <p className="login-box-msg">{HtmlParser(Lang.get('auth.social.try',{SignType:Lang.get('auth.social.sign_up.doing'),Social:Lang.get('auth.social.google.label')}))}</p>
                                        <img style={{width:100,height:100}} className="profile-user-img img-fluid img-circle" src={this.state.form.avatar} alt="User profile picture"/>
                                        <h3 className="profile-username mt-3 mb-5 text-center">{this.state.form.name}</h3>
                                    </div>
                                </FadeInOut>

                                <div className="social-auth-links text-center">
                                    <p>- {Lang.get('labels.or').toUpperCase()} -</p>
                                    <a onClick={this.handleGoogle} href="#" className="btn btn-block btn-danger">
                                        <FontAwesomeIcon icon={faGooglePlus} className="mr-2"/>
                                        {Lang.get('auth.social.sign_up.button',{Social:Lang.get('auth.social.google.label')})}
                                    </a>
                                </div>

                                <p className="mb-1 mt-5">
                                    <a href={`${window.origin}/forgot-password`}>{Lang.get('auth.forgot_password.label')}</a>
                                </p>
                                <p className="mb-1">
                                    <a href={`${window.origin}/login`}>{Lang.get('auth.has_account')}</a>
                                </p>
                                <p className="mb-1">
                                    <a href={window.origin}>{Lang.get('home.back_home')}</a>
                                </p>
                            </form>

                        </div>
                    </div>
                </div>
            </React.StrictMode>
        )
    }
}
export default RegisterPage;
const root = ReactDOM.createRoot(document.getElementById('login-box'));
root.render(<React.StrictMode><RegisterPage/></React.StrictMode>);
