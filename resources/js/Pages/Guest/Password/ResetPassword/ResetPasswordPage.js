import React from "react";
import ReactDOM from "react-dom/client";
import {listSupportedLanguage, responseMessage, ucFirst} from "../../../../Components/mixedConsts";
import {resetPasswordSubmit} from "../../../../Services/AuthService";
import {showError, showSuccess} from "../../../../Components/Toaster";
import {ToastContainer} from "react-toastify";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faEye, faEyeSlash, faPaperPlane} from "@fortawesome/free-regular-svg-icons";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import {getRootUrl} from "../../../../Components/Authentication";

// noinspection DuplicatedCode
class ResetPasswordPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                token : null, email : '',
                passwords : {
                    current : { value : '', type : 'password' },
                    confirm : { value : '', type : 'password' },
                }
            }
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleType = this.handleType.bind(this);
        this.setLocaleLang = this.setLocaleLang.bind(this);
        this.togglePassword = this.togglePassword.bind(this);
    }
    componentDidMount() {
        let scripts = document.getElementsByTagName('script');
        for (let index = 0; index < scripts.length; index++) {
            if (typeof scripts[index].src !== 'undefined') {
                if (scripts[index].src !== null) {
                    if (scripts[index].src.indexOf('reset-password.js') !== -1) {
                        let form = this.state.form;
                        form.token = scripts[index].getAttribute('data-id');
                        this.setState({form});
                    }
                }
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
    handleType(e) {
        let form = this.state.form;
        form.passwords[e.currentTarget.name].type = form.passwords[e.currentTarget.name].type === 'password' ? 'text' : 'password';
        this.setState({form});
    }
    handleChange(e) {
        let form = this.state.form;
        if (e.target.name === 'email') {
            form.email = e.target.value;
        } else {
            form.passwords[e.target.name].value = e.target.value;
        }
        this.setState({form});
    }
    async handleSubmit(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append(Lang.get('auth.form_input.email'), this.state.form.email);
            formData.append(Lang.get('auth.form_input.password'), this.state.form.passwords.current.value);
            formData.append(Lang.get('auth.form_input.confirm'), this.state.form.passwords.confirm.value);
            formData.append('token', this.state.form.token);
            let response = await resetPasswordSubmit(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
                localStorage.setItem('token', response.data.params.token);
                localStorage.setItem('user', JSON.stringify(response.data.params.user));
                window.location.href = getRootUrl();
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
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
                            <p className="login-box-msg">{ucFirst(Lang.get('auth.forgot_password.message'))}</p>
                            <form onSubmit={this.handleSubmit}>
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
                                    <div className="col-12 text-right">
                                        <button disabled={this.state.loading} type="submit" className="btn btn-primary">
                                            <FontAwesomeIcon className="mr-2" icon={this.state.loading ? faCircleNotch : faPaperPlane} spin={this.state.loading}/>
                                            {this.state.loading ? Lang.get('labels.processing',{Attribute:Lang.get('auth.register_new_member.submit')}) : Lang.get('auth.forgot_password.message')}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <p className="mb-1 mt-5">
                                <a href={`${window.origin}/forgot-password`}>{Lang.get('auth.forgot_password.label')}</a>
                            </p>
                            <p className="mb-1">
                                <a href={`${window.origin}/login`}>{Lang.get('auth.has_account')}</a>
                            </p>
                            <p className="mb-1">
                                <a href={window.origin}>{Lang.get('home.back_home')}</a>
                            </p>
                        </div>
                    </div>
                </div>
            </React.StrictMode>
        )
    }
}

export default ResetPasswordPage;
const root = ReactDOM.createRoot(document.getElementById('login-box'));
root.render(<React.StrictMode><ResetPasswordPage/></React.StrictMode>)
