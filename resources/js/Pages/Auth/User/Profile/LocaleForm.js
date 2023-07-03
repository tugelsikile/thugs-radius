import React from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import {
    dateFormatSelect,
    FormControlSMReactSelect,
    langSelect,
    responseMessage
} from "../../../../Components/mixedConsts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import {faSave} from "@fortawesome/free-regular-svg-icons";
import {updateLocale} from "../../../../Services/AuthService";
import {showError, showSuccess} from "../../../../Components/Toaster";

const createOption = (label)=> ({
    label, value : label,
});

class LocaleForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false, date_formats : dateFormatSelect,
            form : {
                lang : null, time_zone : null, date_format : null,
            },
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleCreateOption = this.handleCreateOption.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.user !== null) {
            let form = this.state.form;
            let index;
            if (typeof nextProps.user.meta.locale.lang !== 'undefined') {
                index = langSelect.findIndex((f)=> f.value === nextProps.user.meta.locale.lang);
                if (index >= 0) {
                    form.lang = langSelect[index];
                }
            }
            if (typeof nextProps.user.meta.locale.date_format !== 'undefined') {
                form.date_format = createOption(nextProps.user.meta.locale.date_format);
                index = dateFormatSelect.findIndex((f)=> f.value === nextProps.user.meta.locale.date_format);
                if (index >= 0) {
                    form.date_format = dateFormatSelect[index];
                }
            }
            if (typeof nextProps.user.meta.locale.time_zone !== 'undefined') {
                if (nextProps.time_zones !== null) {
                    if (nextProps.time_zones.length > 0) {
                        index = nextProps.time_zones.findIndex((f)=> f.value === nextProps.user.meta.locale.time_zone);
                        if (index >= 0) {
                            form.time_zone = nextProps.time_zones[index];
                        }
                    }
                }
            }
            this.setState({form});
        }
    }
    handleCreateOption(inputValue) {
        let form = this.state.form;
        const newOption = createOption(inputValue);
        let date_formats = this.state.date_formats;
        date_formats.push(newOption);
        form.date_format = newOption;
        this.setState({date_formats,form});
    }
    handleSelect(event, name) {
        let form = this.state.form;
        form[name] = event;
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', 'patch');
            if (this.state.form.lang !== null) formData.append(Lang.get('users.form_input.lang'), this.state.form.lang.value);
            if (this.state.form.date_format !== null) formData.append(Lang.get('users.form_input.date_format'), this.state.form.date_format.value);
            if (this.state.form.time_zone !== null) formData.append(Lang.get('users.form_input.time_zone'), this.state.form.time_zone.value);
            let response = await updateLocale(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
                if (this.state.form.lang !== null) localStorage.setItem('locale_lang', this.state.form.lang.value);
                if (this.state.form.date_format !== null) localStorage.setItem('locale_date_format', this.state.form.date_format.value);
                if (this.state.form.time_zone !== null) localStorage.setItem('locale_time_zone', this.state.form.time_zone.value);
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
                    <div className="form-group row">
                        <label className="col-sm-3 text-xs col-form-label">{Lang.get('users.labels.locale.lang')}</label>
                        <div className="col-sm-6">
                            <Select onChange={(e)=>this.handleSelect(e,'lang')}
                                    value={this.state.form.lang}
                                    options={langSelect}
                                    styles={FormControlSMReactSelect}
                                    isDisabled={this.state.loading}
                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('users.labels.locale.lang')})}
                                    placeholder={<small>{Lang.get('labels.select.option',{Attribute:Lang.get('users.labels.locale.lang')})}</small>}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-3 text-xs col-form-label">{Lang.get('users.labels.locale.date_time')}</label>
                        <div className="col-sm-6">
                            <CreatableSelect  onChange={(e)=>this.handleSelect(e,'date_format')}
                                    value={this.state.form.date_format}
                                    options={this.state.date_formats}
                                    styles={FormControlSMReactSelect} maxMenuHeight={200}
                                    isDisabled={this.state.loading} onCreateOption={this.handleCreateOption}
                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('users.labels.locale.date_time')})}
                                    placeholder={<small>{Lang.get('labels.select.option',{Attribute:Lang.get('users.labels.locale.date_time')})}</small>}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-3 text-xs col-form-label">{Lang.get('users.labels.locale.time_zone')}</label>
                        <div className="col-sm-6">
                            <Select onChange={(e)=>this.handleSelect(e,'time_zone')}
                                    value={this.state.form.time_zone}
                                    options={this.props.time_zones}
                                    styles={FormControlSMReactSelect} maxMenuHeight={200}
                                    isLoading={this.props.loadings.time_zones}
                                    isDisabled={this.state.loading || this.props.loadings.time_zones}
                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('users.labels.locale.time_zone')})}
                                    placeholder={<small>{Lang.get('labels.select.option',{Attribute:Lang.get('users.labels.locale.time_zone')})}</small>}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="offset-sm-3 col-sm-9">
                            <button type="submit" className="btn btn-primary text-xs">
                                <FontAwesomeIcon icon={this.state.loading ? faCircleNotch : faSave} spin={this.state.loading} className="mr-1"/>
                                {this.state.loading ? Lang.get('labels.update.pending',{Attribute:Lang.get('users.labels.locale.label')}) : Lang.get('labels.update.submit',{Attribute:Lang.get('users.labels.locale.label')})}
                            </button>
                        </div>
                    </div>
                </form>
            </React.StrictMode>
        )
    }
}
export default LocaleForm;
