import React from "react";
import {responseMessage} from "../../../../Components/mixedConsts";
import {updateAccount} from "../../../../Services/AuthService";
import {showError, showSuccess} from "../../../../Components/Toaster";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import {faSave} from "@fortawesome/free-regular-svg-icons";

// noinspection CommaExpressionJS
class AccountForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                email : '',
                name : '',
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.user !== null) {
            let form = this.state.form;
            form.email = nextProps.user.meta.email,
                form.name = nextProps.user.label;
            this.setState({form});
        }
    }
    handleChange(e) {
        let form = this.state.form;
        form[e.target.name] = e.target.value;
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method','patch');
            formData.append(Lang.get('users.form_input.id'), this.props.user.value);
            formData.append(Lang.get('users.form_input.name'), this.state.form.name);
            formData.append(Lang.get('users.form_input.email'), this.state.form.email);
            let response = await updateAccount(formData);
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
                        <label htmlFor="inputName" className="col-sm-3 text-xs col-form-label">{Lang.get('users.labels.name')}</label>
                        <div className="col-sm-9">
                            <input onChange={this.handleChange} name="name" value={this.state.form.name} disabled={this.state.loading} type="text" className="form-control form-control-sm text-xs" id="inputName" placeholder={Lang.get('users.labels.name')}/>
                        </div>
                    </div>
                    <div className="form-group form-group-sm row">
                        <label htmlFor="inputEmail" className="col-sm-3 text-xs col-form-label">{Lang.get('users.labels.email')}</label>
                        <div className="col-sm-9">
                            <input onChange={this.handleChange} name="email" value={this.state.form.email} disabled={this.state.loading} type="email" className="form-control form-control-sm text-xs" id="inputEmail" placeholder={Lang.get('users.labels.email')}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="offset-sm-3 col-sm-9">
                            <button type="submit" className="btn btn-primary text-xs">
                                <FontAwesomeIcon icon={this.state.loading ? faCircleNotch : faSave} spin={this.state.loading} className="mr-1"/>
                                {this.state.loading ? Lang.get('labels.update.pending',{Attribute:Lang.get('users.labels.account.label')}) : Lang.get('labels.update.submit',{Attribute:Lang.get('users.labels.account.label')})}
                            </button>
                        </div>
                    </div>
                </form>
            </React.StrictMode>
        )
    }
}
export default AccountForm;
