import React from "react";
import {responseMessage} from "../../../../Components/mixedConsts";
import {updatePassword} from "../../../../Services/AuthService";
import {showError, showSuccess} from "../../../../Components/Toaster";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import {faEye, faEyeSlash, faSave} from "@fortawesome/free-regular-svg-icons";

class PasswordForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                passwords : {
                    old : { value : '', type : 'password' },
                    current : { value : '', type : 'password' },
                    confirm : { value : '', type : 'password' },
                }
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleInputType = this.handleInputType.bind(this);
    }
    handleInputType(e) {
        let form = this.state.form;
        form.passwords[e.currentTarget.name].type = form.passwords[e.currentTarget.name].type === 'password' ? 'text' : 'password';
        this.setState({form});
    }
    handleChange(e) {
        let form = this.state.form;
        form.passwords[e.target.name].value = e.target.value;
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', 'patch');
            formData.append(Lang.get('users.form_input.password.old'), this.state.form.passwords.old.value);
            formData.append(Lang.get('users.form_input.password.current'), this.state.form.passwords.current.value);
            formData.append(Lang.get('users.form_input.password.confirm'), this.state.form.passwords.confirm.value);
            let response = await updatePassword(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
                this.props.onUpdate(response.data.params);
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    render() {
        return (
            <React.StrictMode>
                <form onSubmit={this.handleSave} className="form-horizontal">
                    <div className="form-group form-group-sm row">
                        <label htmlFor="inputOld" className="col-sm-3 text-xs col-form-label">{Lang.get('users.labels.password.old')}</label>
                        <div className="col-sm-6">
                            <div className="input-group input-group-sm">
                                <input onChange={this.handleChange} name="old" value={this.state.form.passwords.old.value} disabled={this.state.loading} type={this.state.form.passwords.old.type} className="form-control form-control-sm text-xs" id="inputOld" placeholder={Lang.get('users.labels.password.old')}/>
                                <div className="input-group-append">
                                    <button disabled={this.state.loading} type="button" name="old" onClick={this.handleInputType} className="input-group-text"><FontAwesomeIcon icon={this.state.form.passwords.old.type === 'password' ? faEye : faEyeSlash} style={{width:20}}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group form-group-sm row">
                        <label htmlFor="inputCurrent" className="col-sm-3 text-xs col-form-label">{Lang.get('users.labels.password.current')}</label>
                        <div className="col-sm-6">
                            <div className="input-group input-group-sm">
                                <input onChange={this.handleChange} name="current" value={this.state.form.passwords.current.value} disabled={this.state.loading} type={this.state.form.passwords.current.type} className="form-control form-control-sm text-xs" id="inputCurrent" placeholder={Lang.get('users.labels.password.current')}/>
                                <div className="input-group-append">
                                    <button disabled={this.state.loading} type="button" name="current" onClick={this.handleInputType} className="input-group-text"><FontAwesomeIcon icon={this.state.form.passwords.current.type === 'password' ? faEye : faEyeSlash} style={{width:20}}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group form-group-sm row">
                        <label htmlFor="inputConfirm" className="col-sm-3 text-xs col-form-label">{Lang.get('users.labels.password.confirm')}</label>
                        <div className="col-sm-6">
                            <div className="input-group input-group-sm">
                                <input onChange={this.handleChange} name="confirm" value={this.state.form.passwords.confirm.value} disabled={this.state.loading} type={this.state.form.passwords.confirm.type} className="form-control form-control-sm text-xs" id="inputConfirm" placeholder={Lang.get('users.labels.password.confirm')}/>
                                <div className="input-group-append">
                                    <button disabled={this.state.loading} type="button" name="confirm" onClick={this.handleInputType} className="input-group-text"><FontAwesomeIcon icon={this.state.form.passwords.confirm.type === 'password' ? faEye : faEyeSlash} style={{width:20}}/></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group row">
                        <div className="offset-sm-2 col-sm-10">
                            <button type="submit" className="btn btn-primary text-xs">
                                <FontAwesomeIcon icon={this.state.loading ? faCircleNotch : faSave} spin={this.state.loading} className="mr-1"/>
                                {this.state.loading ? Lang.get('labels.update.pending',{Attribute:Lang.get('users.labels.password.current')}) : Lang.get('labels.update.submit',{Attribute:Lang.get('users.labels.password.current')})}
                            </button>
                        </div>
                    </div>
                </form>
            </React.StrictMode>
        )
    }

}
export default PasswordForm;
