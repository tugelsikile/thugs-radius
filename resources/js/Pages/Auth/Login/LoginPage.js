import React from "react";
import ReactDOM from "react-dom/client";
import {ToastContainer} from "react-toastify";
import {LoadCanvasTemplate, loadCaptchaEnginge, validateCaptcha} from "react-simple-captcha";
import {showError, showSuccess} from "../../../Components/Toaster";
import {loginSubmit, loginSubmitGoogle, registerGoogleSubmit} from "../../../Services/AuthService";
import {responseMessage, siteData} from "../../../Components/mixedConsts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBarcode, faLock} from "@fortawesome/free-solid-svg-icons";
import {faEnvelope} from "@fortawesome/free-regular-svg-icons";
import FadeInOut from "../../../Components/FadeInOut";
import HtmlParser from "react-html-parser";
import {faGooglePlus} from "@fortawesome/free-brands-svg-icons";
import {getRootUrl} from "../../../Components/Authentication";
import {GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {auth} from "../../../Components/Google/Firebase";

// noinspection JSUnresolvedVariable,DuplicatedCode,CommaExpressionJS
class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false, site : null,
            form : {
                email : '', kode_keamanan : '', social : false, avatar : null, name : '',
                password : {
                    current : { value : '', type : 'password' }
                },
                captcha_valid : true,
            }
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleChangePasswordType = this.handleChangePasswordType.bind(this);
        this.validateCaptcha = this.validateCaptcha.bind(this);
        this.handleGoogle = this.handleGoogle.bind(this);
        this.submitGoogle = this.submitGoogle.bind(this);
        this.chaptchaEngine = this.chaptchaEngine.bind(this);
    }
    componentDidMount() {
        siteData().then((response)=>this.setState({site:response}));
        if (localStorage.getItem('token') !== null) {
            if (localStorage.getItem('token').length > 0) {
                if (JSON.parse(localStorage.getItem('user')) !== null) {
                    let user = JSON.parse(localStorage.getItem('user'));
                    if (user.meta.level.for_client) {
                        window.location.href = window.origin + '/clients';
                    } else {
                        window.location.href = window.origin + '/auth';
                    }
                }
            }
        }
        this.chaptchaEngine();
    }
    chaptchaEngine(){
        loadCaptchaEnginge(6,'black','white','numbers');
    }
    handleChangePasswordType(event) {
        event.preventDefault();
        let form = this.state.form;
        if (form.password.current.type === 'password') {
            form.password.current.type = 'text';
        } else {
            form.password.current.type = 'password';
        }
        this.setState({form});
    }
    validateCaptcha(event) {
        event.preventDefault();
        let form = this.state.form;
        if (validateCaptcha(form.kode_keamanan,true)) {
            form.captcha_valid = true;
        } else {
            form.captcha_valid = false;
        }
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        if (event.target.getAttribute('name') === 'password') {
            form.password.current.value = event.target.value;
        } else {
            form[event.target.name] = event.target.value;
        }
        this.setState({form});
    }
    async submitGoogle() {
        let form = this.state.form;
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append(Lang.get('auth.form_input.email'), this.state.form.email);
            formData.append(Lang.get('auth.form_input.avatar'), this.state.form.avatar);
            let response = await loginSubmitGoogle(formData);
            if (response.data.params === null) {
                form.social = false,form.email = '',form.name = '';
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
            form.social = false,form.email = '',form.name = '';
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
    async handleSave(e) {
        e.preventDefault();
        if (this.state.form.kode_keamanan.length === 0) {
            validateCaptcha('asd',true);
            showError(Lang.get('validation.required',{Attribute:Lang.get('auth.labels.captcha')}));
        } else if (!validateCaptcha(this.state.form.kode_keamanan,true)) {
            showError(Lang.get('validation.exists',{Attribute:Lang.get('auth.labels.captcha')}))
        } else {
            this.setState({loading:true});
            try {
                const formData = new FormData();
                formData.append(Lang.get('auth.form_input.email'), this.state.form.email);
                formData.append(Lang.get('auth.form_input.password'), this.state.form.password.current.value);
                let response = await loginSubmit(formData);
                if (response.data.params === null) {
                    this.setState({loading:false});
                    validateCaptcha('asd',true);
                    showError(response.data.message);
                } else {
                    this.setState({loading:false});
                    showSuccess(response.data.message);
                    localStorage.setItem('token', response.data.params.token);
                    localStorage.setItem('user', JSON.stringify(response.data.params.user));
                    localStorage.setItem('locale_lang', response.data.params.user.meta.locale.lang);
                    Lang.setLocale(response.data.params.user.meta.locale.lang);
                    localStorage.setItem('locale_date_format', response.data.params.user.meta.locale.date_format);
                    localStorage.setItem('locale_time_zone', response.data.params.user.meta.locale.time_zone);
                    if (response.data.params.user.meta.level.for_client) {
                        window.location.href = window.origin + '/clients';
                    } else {
                        window.location.href = window.origin + '/auth';
                    }
                }
            } catch (e) {
                this.setState({loading:false});
                validateCaptcha('asd',true);
                showError(e.response.data.message);
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <ToastContainer theme="light" pauseOnFocusLoss autoClose={2000} position="top-center" closeOnClick/>
                <div className="login-box">
                    <div className="card card-outline card-primary">
                        <div className="card-header text-center">
                            <a href={window.origin} className="h1">
                                <img src={`${window.origin}/images/logo-2.png`} style={{width:100}} alt="logo"/>
                            </a>
                        </div>
                        <div className="card-body">
                            <p className="login-box-msg">{Lang.get('messages.users.labels.signin_text')}</p>
                            <form onSubmit={this.handleSave} className="mb-5">
                                <div className="input-group mb-3">
                                    <input tabIndex={0} id="email" onChange={this.handleChange} name="email" value={this.state.form.email} disabled={this.state.loading} type="email" className="form-control" placeholder={Lang.get('messages.users.labels.email')}/>
                                    <div className="input-group-append"><div className="input-group-text"><FontAwesomeIcon style={{width:24}} icon={faEnvelope}/></div></div>
                                </div>
                                <div className="input-group mb-3">
                                    <input tabIndex={1} id="password" onChange={this.handleChange} value={this.state.form.password.current.value} name="password" disabled={this.state.loading} type={this.state.form.password.current.type} className="form-control" placeholder={Lang.get('messages.users.labels.password')}/>
                                    <div className="input-group-append"><div style={{cursor:'pointer'}} onClick={this.handleChangePasswordType} className="input-group-text"><FontAwesomeIcon style={{width:24}} icon={faLock}/></div></div>
                                </div>
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <LoadCanvasTemplate/>
                                    </div>
                                </div>
                                <div className="input-group mb-3">
                                    <input tabIndex={2} onChange={this.handleChange} onBlur={this.validateCaptcha} value={this.state.form.kode_keamanan} name="kode_keamanan" disabled={this.state.loading} type="text" className="form-control" placeholder={Lang.get('messages.users.labels.captcha')}/>
                                    <div className="input-group-append"><div className="input-group-text"><FontAwesomeIcon icon={faBarcode}/></div></div>
                                </div>
                                <div className="row">
                                    <div className="col-8"></div>
                                    <div className="col-4">
                                        <button tabIndex={3} disabled={this.state.loading} type="submit" className="btn btn-primary btn-block">{Lang.get('messages.users.labels.signin_button')}</button>
                                    </div>
                                </div>
                            </form>

                            <FadeInOut show={this.state.form.social} duration={500}>
                                <div className="text-center my-5">
                                    <p className="login-box-msg">{HtmlParser(Lang.get('auth.social.try',{SignType:Lang.get('auth.social.sign_in.doing'),Social:Lang.get('auth.social.google.label')}))}</p>
                                    <img style={{width:100,height:100}} className="profile-user-img img-fluid img-circle" src={this.state.form.avatar} alt="User profile picture"/>
                                    <h3 className="profile-username mt-3 mb-5 text-center">{this.state.form.name}</h3>
                                </div>
                            </FadeInOut>

                            <div className="social-auth-links text-center">
                                <p>- {Lang.get('labels.or').toUpperCase()} -</p>
                                <a onClick={this.handleGoogle} href="#" className="btn btn-block btn-danger">
                                    <FontAwesomeIcon icon={faGooglePlus} className="mr-2"/>
                                    {Lang.get('auth.social.sign_in.button',{Social:Lang.get('auth.social.google.label')})}
                                </a>
                            </div>

                            <p className="mb-1 mt-5">
                                <a href={`${window.origin}/forgot-password`}>{Lang.get('auth.forgot_password.label')}</a>
                            </p>
                            <p className="mb-0">
                                <a href={`${window.origin}/register`} className="text-center">{Lang.get('auth.register_new_member.label')}</a>
                            </p>
                        </div>
                    </div>
                </div>
            </React.StrictMode>
        )
    }
}
export default LoginPage;

const root = ReactDOM.createRoot(document.getElementById('login-box'));
root.render(<React.StrictMode><LoginPage/></React.StrictMode>)
