import React from "react";
import ReactDOM from "react-dom/client";
import {ToastContainer} from "react-toastify";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope} from "@fortawesome/free-regular-svg-icons";
import {faCircleNotch, faPaperPlane} from "@fortawesome/free-solid-svg-icons";
import {responseMessage} from "../../../../Components/mixedConsts";
import {forgotPasswordSubmit} from "../../../../Services/AuthService";
import {showError, showSuccess} from "../../../../Components/Toaster";

class ForgotPasswordPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : { email : '', }
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(event) {
        let form = this.state.form;
        form.email = event.target.value;
        this.setState({form});
    }
    async handleSubmit(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append(Lang.get('auth.form_input.email'), this.state.form.email);
            let response = await forgotPasswordSubmit(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
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
                <div className="login-box">
                    <div className="card card-outline card-primary">
                        <div className="card-body">
                            <p className="login-box-msg">{Lang.get('auth.forgot_password.message')}</p>
                            <form onSubmit={this.handleSubmit} className="mb-5">
                                <div className="input-group mb-3">
                                    <input id="email" onChange={this.handleChange} name="email" value={this.state.form.email} disabled={this.state.loading} type="email" className="form-control text-sm" placeholder={Lang.get('messages.users.labels.email')}/>
                                    <div className="input-group-append"><div className="input-group-text"><FontAwesomeIcon style={{width:24}} icon={faEnvelope}/></div></div>
                                </div>
                                <div className="row">
                                    <div className="col-12 text-right">
                                        <button disabled={this.state.loading} type="submit" className="btn btn-primary">
                                            <FontAwesomeIcon icon={this.state.loading ? faCircleNotch : faPaperPlane} spin={this.state.loading} className="mr-2"/>
                                            {Lang.get('auth.forgot_password.submit')}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <p className="mb-1 pt-5">
                                <a href={`${window.origin}/login`}>{Lang.get('auth.has_account')}</a>
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
export default ForgotPasswordPage;
const root = ReactDOM.createRoot(document.getElementById('login-box'));
root.render(<React.StrictMode><ForgotPasswordPage/></React.StrictMode>)
