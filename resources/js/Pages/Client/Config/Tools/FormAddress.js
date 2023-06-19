import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faFileImport, faMinus} from "@fortawesome/free-solid-svg-icons";
import {faFileImage, faQuestionCircle, faSave, faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {
    CardPreloader,
    formatBytes,
    FormControlSMReactSelect,
    responseMessage
} from "../../../../Components/mixedConsts";
import {showError, showSuccess} from "../../../../Components/Toaster";
import Select from "react-select";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/bootstrap.css'
import id from "react-phone-input-2/lang/id.json";
import {crudCompanyConfig} from "../../../../Services/ConfigService";
import {Tooltip} from "@mui/material";

// noinspection CommaExpressionJS
class FormAddress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                logo : {
                    file : null, content : null, delete : false,
                },
                name : '', email : '',
                street : '', province : null, city : null, district : null, village : null,
                postal : '',
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.handleRemoveLogo = this.handleRemoveLogo.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        let index;
        if (nextProps.data !== null) {
            form.province = null, form.city = null, form.district = null, form.village = null;
            form.name = nextProps.data.label,
                form.email = nextProps.data.meta.address.email,
                form.street = nextProps.data.meta.address.street,
                form.postal = nextProps.data.meta.address.postal,
                form.phone = nextProps.data.meta.address.phone;
            if (nextProps.data.meta.logo !== null) {
                form.logo.content = nextProps.data.meta.logo;
            }
            if (nextProps.provinces !== null) {
                if (nextProps.provinces.length > 0) {
                    if (nextProps.data.meta.address.province !== null) {
                        index = nextProps.provinces.findIndex((f) => f.value === nextProps.data.meta.address.province);
                        if (index >= 0) {
                            form.province = nextProps.provinces[index];
                            if (form.province !== null && nextProps.data.meta.address.city !== null) {
                                if (form.province.meta.cities.length > 0) {
                                    index = form.province.meta.cities.findIndex((f) => f.value === nextProps.data.meta.address.city);
                                    if (index >= 0) {
                                        form.city = form.province.meta.cities[index];
                                        if (form.city !== null && nextProps.data.meta.address.district !== null) {
                                            if (form.city.meta.districts.length > 0) {
                                                index = form.city.meta.districts.findIndex((f) => f.value === nextProps.data.meta.address.district);
                                                if (index >= 0) {
                                                    form.district = form.city.meta.districts[index];
                                                    if (form.district !== null && nextProps.data.meta.address.village !== null) {
                                                        if (form.district.meta.villages.length > 0) {
                                                            index = form.district.meta.villages.findIndex((f) => f.value === nextProps.data.meta.address.village);
                                                            if (index >= 0) {
                                                                form.village = form.district.meta.villages[index];
                                                                if (form.village !== null) {
                                                                    if ([null,'NULL'].indexOf(form.village.meta.location.pos) !== -1) {
                                                                        if (form.village.meta.location.pos.length === 5 ) {
                                                                            form.postal = form.district.meta.location.pos;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        this.setState({form});
    }
    handleSelect(event, name) {
        let form = this.state.form;
        form[name] = event;
        if (['province','city','district','village'].indexOf(name) !== -1) {
            switch (name) {
                case 'province':
                    form.city = form.province.meta.cities[0].length === 0 ? null : form.province.meta.cities[0];
                    form.district = form.city.meta.districts[0].length === 0 ? null : form.city.meta.districts[0];
                    form.village = form.district.meta.villages[0].length === 0 ? null : form.district.meta.villages[0];
                    break;
                case 'city' :
                    form.district = form.city.meta.districts[0].length === 0 ? null : form.city.meta.districts[0];
                    form.village = form.district.meta.villages[0].length === 0 ? null : form.district.meta.villages[0];
                    break;
                case 'district':
                    form.village = form.district.meta.villages[0].length === 0 ? null : form.district.meta.villages[0];
                    if (form.village !== null) {
                        if ([null,'NULL'].indexOf(form.village.meta.location.pos) !== -1) {
                            if (form.village.meta.location.pos.length === 5 ) {
                                form.postal = form.district.meta.location.pos;
                            }
                        }
                    }
                    break;
                case 'village' :
                    console.log([null,'NULL'].indexOf(form.village.meta.location.pos));
                    if (form.village !== null) {
                        if ([null,'NULL'].indexOf(form.village.meta.location.pos) !== -1) {
                            if (form.village.meta.location.pos.length === 5 ) {
                                form.postal = form.district.meta.location.pos;
                            }
                        }
                    }
                    break;
            }
        }
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        form[event.target.name] = event.target.value;
        this.setState({form});
    }
    handleRemoveLogo() {
        let form = this.state.form;
        if (form.logo.content !== null) {
            form.logo.delete = true;
        }
        form.logo.content = null;
        form.logo.file = null;
        this.setState({form});
    }
    handleFile(event) {
        let form = this.state.form;
        if (event.target.files.length > 0) {
            let theFile = event.target.files[0];
            if (theFile.size > 5000000) {
                showError(Lang.get('configs.address.logo.max', {size: formatBytes(theFile.size)}));
            } else if (theFile.size < 10000) {
                showError(Lang.get('configs.address.logo.min', {size: formatBytes(theFile.size)}));
            } else {
                const fileReader = new FileReader();
                const app = this;
                fileReader.readAsDataURL(theFile);
                fileReader.onloadend = () => {
                    const image = new Image();
                    image.src = fileReader.result;
                    image.onload = function () {
                        if (this.width > 700) {
                            showError(Lang.get('configs.address.logo.width.max',{size:this.width}));
                        } else if (this.width < 200) {
                            showError(Lang.get('configs.address.logo.width.min',{size:this.width}));
                        } else if (this.height > 700) {
                            showError(Lang.get('configs.address.logo.height.max',{size:this.height}));
                        } else if (this.height < 200) {
                            showError(Lang.get('configs.address.logo.height.min', {size: this.width}));
                        } else if (this.height !== this.width) {
                            showError(Lang.get('configs.address.logo.dimension', {width: this.width, height : this.height}));
                        } else {
                            form.logo.content = fileReader.result;
                            form.logo.file = theFile;
                            app.setState({form});
                        }
                    }
                }
                fileReader.onerror = (e) => {
                    showError(Lang.get('configs.address.logo.error'));
                }
            }
        }
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('type', 'address');
            formData.append('_method', 'patch');
            if (this.props.data !== null) {
                if (this.props.data.meta.id !== null) formData.append(Lang.get('configs.address.form_input.id'), this.props.data.meta.id);
            }
            if (this.state.form.logo.delete) formData.append(Lang.get('configs.address.form_input.delete_logo'), '1');
            if (this.state.form.logo.file !== null) formData.append(Lang.get('configs.address.form_input.logo'), this.state.form.logo.file, this.state.form.logo.file.name);
            formData.append(Lang.get('configs.address.form_input.name'), this.state.form.name);
            formData.append(Lang.get('configs.address.form_input.phone'), this.state.form.phone);
            formData.append(Lang.get('configs.address.form_input.email'), this.state.form.email);
            formData.append(Lang.get('configs.address.form_input.street'), this.state.form.street);
            if (this.state.form.village !== null) formData.append(Lang.get('configs.address.form_input.village'), this.state.form.village.value);
            if (this.state.form.district !== null) formData.append(Lang.get('configs.address.form_input.district'), this.state.form.district.value);
            if (this.state.form.city !== null) formData.append(Lang.get('configs.address.form_input.city'), this.state.form.city.value);
            if (this.state.form.province !== null) formData.append(Lang.get('configs.address.form_input.province'), this.state.form.province.value);
            formData.append(Lang.get('configs.address.form_input.postal'), this.state.form.postal);
            let response = await crudCompanyConfig(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
                this.props.handleUpdate(response.data.params);
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    render() {
        return (
            <form onSubmit={this.handleSave} className="card shadow card-outline card-primary">
                {this.props.loading || this.props.loadings.provinces && <CardPreloader/>}
                <div className="card-header">
                    <label className="card-title text-bold text-sm">{Lang.get('configs.address.form')}</label>
                    <div className="card-tools">
                        <button title="Minimize" type="button" className="btn btn-tool" data-card-widget="collapse">
                            <i className="fas fa-minus"/>
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group row">
                                <label className="col-md-4 col-form-label text-xs">{Lang.get('configs.address.logo.label')}</label>
                                <input accept="image/*" id="input-logo" onChange={this.handleFile} type="file" style={{display:'none'}}/>
                                <div className="col-md-8">
                                    <div className="input-group input-group-sm">
                                        <label htmlFor="input-logo" className="form-control text-xs text-muted" style={{fontWeight:'normal'}}>
                                            {this.state.form.logo.content !== null ? Lang.get('configs.address.logo.change') : this.state.form.logo.file !== null ? this.state.form.logo.file.name : Lang.get('configs.address.logo.select')} &nbsp;
                                        </label>
                                        <span className="input-group-append">
                                            <Tooltip title={Lang.get('configs.address.logo.select')}>
                                                <label htmlFor="input-logo" className="btn btn-default">
                                                    <FontAwesomeIcon icon={faFileImage} size="xs"/>
                                                </label>
                                            </Tooltip>
                                        </span>
                                    </div>
                                    <small className="text-danger"><FontAwesomeIcon icon={faQuestionCircle} size="sm" className="mr-1"/>{Lang.get('configs.address.logo.limitation')}</small>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="input-name" className="col-md-4 col-form-label text-xs">{Lang.get('configs.address.name')}</label>
                                <div className="col-md-8">
                                    <input id="input-name" name="name" value={this.state.form.name} onChange={this.handleChange} className="form-control form-control-sm text-xs" disabled={this.state.loading}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            {this.state.form.logo.content !== null &&
                                <div>
                                    <button title={Lang.get('configs.address.logo.delete')} onClick={this.handleRemoveLogo} type="button" className="btn text-danger btn-xs btn-tool" disabled={this.state.loading}><FontAwesomeIcon icon={faTrashAlt} size="xs"/></button>
                                    <img alt="logo" src={this.state.form.logo.content} style={{height:150,width:150}} className="img-fluid img-thumbnail"/>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="input-phone" className="col-form-label col-md-2 text-xs">{Lang.get('configs.address.phone')}</label>
                        <div className="col-md-4">
                            <PhoneInput placeholder={Lang.get('configs.address.phone')}
                                        inputClass="form-control form-control-sm text-xs" country="id"
                                        enableSearch={true} disabled={this.state.loading}
                                        localization={id}
                                        value={this.state.form.phone} onChange={(e)=>this.handleSelect(e,'phone')}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-md-2 col-form-label text-xs" htmlFor="input-email">{Lang.get('configs.address.email')}</label>
                        <div className="col-md-4">
                            <input value={this.state.form.email} name="email" onChange={this.handleChange} className="form-control form-control-sm text-xs" disabled={this.state.loading} id="input-email" type="email"/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="input-street" className="col-md-2 col-form-label text-xs">{Lang.get('configs.address.street')}</label>
                        <div className="col-md-10">
                            <textarea id="input-street" rows={2} className="form-control-sm form-control text-xs" disabled={this.state.loading} value={this.state.form.street} name="street" onChange={this.handleChange} style={{resize:'none'}} placeholder={Lang.get('configs.address.street')}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-md-2 col-form-label text-xs">{Lang.get('configs.address.village.label')}</label>
                        <div className="col-md-4">
                            <Select value={this.state.form.village}
                                    onChange={(e)=>this.handleSelect(e,'village')}
                                    isLoading={this.props.loadings.provinces} isDisabled={this.state.loading || this.props.loadings.provinces}
                                    className="text-xs" styles={FormControlSMReactSelect}
                                    placeholder={<small>{Lang.get('configs.address.village.select.label')}</small>}
                                    noOptionsMessage={()=><small>{Lang.get('configs.address.village.select.no_option')}</small>}
                                    options={this.state.form.district === null ? [] : this.state.form.district.meta.villages}/>
                        </div>
                        <label className="col-md-2 col-form-label text-xs">{Lang.get('configs.address.district.label')}</label>
                        <div className="col-md-4">
                            <Select value={this.state.form.district}
                                    onChange={(e)=>this.handleSelect(e,'district')}
                                    isLoading={this.props.loadings.provinces} isDisabled={this.state.loading || this.props.loadings.provinces}
                                    className="text-xs" styles={FormControlSMReactSelect}
                                    placeholder={<small>{Lang.get('configs.address.district.select.label')}</small>}
                                    noOptionsMessage={()=><small>{Lang.get('configs.address.district.select.no_option')}</small>}
                                    options={this.state.form.city === null ? [] : this.state.form.city.meta.districts}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-md-2 col-form-label text-xs">{Lang.get('configs.address.city.label')}</label>
                        <div className="col-md-4">
                            <Select value={this.state.form.city}
                                    onChange={(e)=>this.handleSelect(e,'city')}
                                    isLoading={this.props.loadings.provinces} isDisabled={this.state.loading || this.props.loadings.provinces}
                                    className="text-xs" styles={FormControlSMReactSelect}
                                    placeholder={<small>{Lang.get('configs.address.city.select.label')}</small>}
                                    noOptionsMessage={()=><small>{Lang.get('configs.address.city.select.no_option')}</small>}
                                    options={this.state.form.province === null ? [] : this.state.form.province.meta.cities}/>
                        </div>
                        <label className="col-md-2 col-form-label text-xs">{Lang.get('configs.address.province.label')}</label>
                        <div className="col-md-4">
                            <Select value={this.state.form.province}
                                    onChange={(e)=>this.handleSelect(e,'province')}
                                    isLoading={this.props.loadings.provinces} isDisabled={this.state.loading || this.props.loadings.provinces}
                                    className="text-xs" styles={FormControlSMReactSelect}
                                    placeholder={<small>{Lang.get('configs.address.province.select.label')}</small>}
                                    noOptionsMessage={()=><small>{Lang.get('configs.address.province.select.no_option')}</small>}
                                    options={this.props.provinces}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-md-2 col-form-label text-xs" htmlFor="input-postal">{Lang.get('configs.address.postal')}</label>
                        <div className="col-md-2">
                            <input value={this.state.form.postal} name="postal" onChange={this.handleChange} className="form-control form-control-sm text-xs" disabled={this.state.loading || this.props.loadings.provinces} id="input-postal"/>
                        </div>
                    </div>

                </div>
                {this.props.privilege === null ? null :
                    this.props.privilege.update &&
                        <div className="card-footer">
                            <button type="submit" className="btn btn-outline-success text-xs" disabled={this.state.loading || this.props.loadings.provinces}>
                                <FontAwesomeIcon icon={this.state.loading ? faCircleNotch : faSave} spin={this.state.loading} className="mr-1"/>
                                {Lang.get('configs.address.submit')}
                            </button>
                        </div>
                }
            </form>
        )
    }
}
export default FormAddress;
