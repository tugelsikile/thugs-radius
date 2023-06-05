import React from "react";
import ReactDOM from "react-dom/client";
import {ToastContainer} from "react-toastify";
import {LoadCanvasTemplate, loadCaptchaEnginge, validateCaptcha} from "react-simple-captcha";
import {showError, showSuccess} from "../../../Components/Toaster";
import {loginSubmit} from "../../../Services/AuthService";
import {siteData} from "../../../Components/mixedConsts";

// noinspection JSUnresolvedVariable
class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false, site : null,
            form : {
                email : '', kode_keamanan : '',
                password : {
                    current : { value : '', type : 'password' }
                },
                captcha_valid : false,
            }
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleChangePasswordType = this.handleChangePasswordType.bind(this);
        this.validateCaptcha = this.validateCaptcha.bind(this);
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
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('email', this.state.form.email);
            formData.append('password', this.state.form.password.current.value);
            let response = await loginSubmit(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
                localStorage.setItem('token', response.data.params.token);
                localStorage.setItem('user', JSON.stringify(response.data.params.user));
                localStorage.setItem('locale_lang', response.data.params.user.meta.locale.lang);
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
            showError(e.response.data.message);
        }
    }
    render() {
        return (
            <React.StrictMode>
                <ToastContainer theme="light" pauseOnFocusLoss autoClose={2000} position="top-center" closeOnClick/>
                <div className="card card-outline card-primary">
                    <div className="card-header text-center">
                        <a href={window.origin} className="h1"><b>Admin</b>LTE</a>
                    </div>
                    <div className="card-body">
                        <p className="login-box-msg">{Lang.get('messages.users.labels.signin_text',null,'id')}</p>
                        <form onSubmit={this.handleSave} className="mb-5">
                            <div className="input-group mb-3">
                                <input id="email" required onChange={this.handleChange} name="email" value={this.state.form.email} disabled={this.state.loading} type="email" className="form-control" placeholder={Lang.get('messages.users.labels.email')}/>
                                <div className="input-group-append"><div className="input-group-text"><span className="fas fa-envelope"/></div></div>
                            </div>
                            <div className="input-group mb-3">
                                <input id="password" required onChange={this.handleChange} value={this.state.form.password.current.value} name="password" disabled={this.state.loading} type={this.state.form.password.current.type} className="form-control" placeholder={Lang.get('messages.users.labels.password')}/>
                                <div className="input-group-append"><div style={{cursor:'pointer'}} onClick={this.handleChangePasswordType} className="input-group-text"><span className="fas fa-lock"/></div></div>
                            </div>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <LoadCanvasTemplate/>
                                </div>
                            </div>
                            <div className="input-group mb-3">
                                <input onChange={this.handleChange} onBlur={this.validateCaptcha} value={this.state.form.kode_keamanan} name="kode_keamanan" disabled={this.state.loading} type="text" className="form-control" placeholder={Lang.get('messages.users.labels.captcha')}/>
                                <div className="input-group-append"><div className="input-group-text"><span className="fas fa-barcode"/></div></div>
                            </div>
                            <div className="row">
                                <div className="col-8"></div>
                                <div className="col-4">
                                    <button disabled={this.state.loading || ! this.state.form.captcha_valid} type="submit" className="btn btn-primary btn-block">{Lang.get('messages.users.labels.signin_button')}</button>
                                </div>
                            </div>
                        </form>

                        <p className="mb-1">
                            <a href="forgot-password.html">I forgot my password</a>
                        </p>
                        <p className="mb-0">
                            <a href="register.html" className="text-center">Register a new membership</a>
                        </p>
                    </div>
                </div>
            </React.StrictMode>
        )
    }
}
export default LoginPage;

const root = ReactDOM.createRoot(document.getElementById('login-box'));
root.render(<React.StrictMode><LoginPage/></React.StrictMode>)
