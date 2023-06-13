import React from "react";
import {ModalFooter, ModalHeader} from "../../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import {
    durationType,
    durationTypeByte,
    formatLocaleString,
    LabelRequired,
    parseInputFloat
} from "../../../../Components/mixedConsts";
import {generatePrefix, generateType} from "./Mixed";
import Select from "react-select";
import {DetailBandwidth} from "../../Nas/Profile/Tools/DetailCard";
import {NumericFormat} from "react-number-format";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMinus,faPlus} from "@fortawesome/free-solid-svg-icons";
import {generateHotspot} from "../../../../Services/CustomerService";
import {showError, showSuccess} from "../../../../Components/Toaster";
import moment from "moment";

// noinspection JSCheckFunctionSignatures,CommaExpressionJS,DuplicatedCode
class FormGenerate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false, loop : 0,
            form : {
                counter : 1, id : null, nas : null,
                profile : null,
                usernames : { random : 0, length : 5, value : '', prefix : true, type : generateType[1] },
                passwords : { random : 0, length : 5, value : '', prefix : true, type : generateType[1] },
                customers : { current : [], selected : [] }
            },
            progress : { current : 0, max : 0, percent : 0 },
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleCheckTable = this.handleCheckTable.bind(this);
        this.handleGenerate = this.handleGenerate.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        if (! props.open) {
            form.counter = 1, form.id = null, form.nas = null,
                form.profile = null,
                form.usernames.length = 5, form.usernames.prefix = true, form.usernames.value = '',
                form.usernames.random = 2, form.usernames.type = generateType[1],
                form.passwords.length = 5, form.passwords.prefix = true, form.passwords.value = '',
                form.passwords.random = 2, form.passwords.type = generateType[1];
        }
        this.setState({form},()=>this.handleGenerate());
    }
    handleCheckTable(event) {
        let form = this.state.form;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            form.customers.selected = [];
            if (event.currentTarget.checked) {
                form.customers.current.map((item)=>{
                    if (! item.meta.default) {
                        form.customers.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = form.customers.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                form.customers.selected.splice(indexSelected,1);
            } else {
                let indexTarget = form.customers.current.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    form.customers.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({form});
    }
    handleCheck(event) {
        let form = this.state.form;
        let parent = event.currentTarget.getAttribute('data-parent');
        form[parent].prefix = event.currentTarget.checked;
        this.setState({form},()=>this.handleGenerate());
    }
    handleChange(event) {
        let form = this.state.form;
        let name = event.currentTarget.name;
        if (event.currentTarget.getAttribute('data-parent') !== null) {
            let parent = event.currentTarget.getAttribute('data-parent');
            if (name === 'length' || name === 'random') {
                form[parent][name] = parseInputFloat(event);
                if (name === 'random') {
                    if (form[parent].random + form[parent].length > 50) {
                        form[parent].length = form[parent].length - form[parent].random;
                    }
                }
            } else if (name === 'value') {
                if (event.currentTarget.value.length <= form[parent].length) {
                    form[parent][name] = event.currentTarget.value;
                }
            } else {
                form[parent][name] = event.currentTarget.value;
            }
        } else if (name === 'counter') {
            form[name] = parseInputFloat(event);
        } else {
            form[name] = event.currentTarget.value;
        }
        this.setState({form},()=>this.handleGenerate());
    }
    handleSelect(event, name, parent = null) {
        let form = this.state.form;
        if (parent !== null) {
            form[parent][name] = event;
        } else {
            form[name] = event;
        }
        if (name === 'nas') {
            form.profile = null;
        }
        if (name === 'type') {
            if (form[parent][name].value === 'none') {
                form[parent].random = 0;
            } else {
                if (form[parent].random === 0) {
                    form[parent].random = 0;
                }
            }
        }
        this.setState({form},()=>this.handleGenerate());
    }
    handleGenerate(regen = false) {
        if (this.props.open) {
            let form = this.state.form;
            if (! regen) {
                form.customers.current = [], form.customers.selected = [];
            }
            let username = '',password = '';
            let sisa = form.counter - form.customers.current.length;
            for (let index = 1; index <= sisa; index++) {
                username = form.usernames.value;
                password = form.passwords.value;
                if (form.usernames.random > 0) {
                    if (form.usernames.prefix) {
                        username = generatePrefix(form.usernames.type.value, form.usernames.random) + username;
                    } else if (! form.usernames.prefix) {
                        username = username + generatePrefix(form.usernames.type.value, form.usernames.random);
                    }
                }
                if (form.passwords.random > 0) {
                    if (form.passwords.prefix) {
                        password = generatePrefix(form.passwords.type.value, form.passwords.random) + password;
                    } else if (! form.passwords.prefix) {
                        password = password + generatePrefix(form.passwords.type.value, form.passwords.random);
                    }
                }
                if (username.length === 0 || username.length < ( form.usernames.length + form.usernames.random)) {
                    if (form.usernames.prefix) {
                        username = username + generatePrefix(generateType[1].value, (form.usernames.length + form.usernames.random) - username.length);
                    } else {
                        username = generatePrefix(generateType[1].value, (form.usernames.length + form.usernames.random) - username.length) + username;
                    }
                }
                if (password.length === 0 || password.length < ( form.passwords.length + form.passwords.random)) {
                    if (form.passwords.prefix) {
                        password = password + generatePrefix(generateType[1].value, (form.passwords.length + form.passwords.random) - password.length);
                    } else {
                        password = generatePrefix(generateType[1].value, (form.passwords.length + form.passwords.random) - password.length ) + password;
                    }
                }
                if (form.customers.current.findIndex((f) => f.username === username) < 0) {
                    if (this.props.customers.findIndex((f) => f.meta.auth.user === username) < 0) {
                        form.customers.current.push({username:username,password:password});
                    }
                }
            }
            console.log(form.customers.current);
            this.setState({form,loop:this.state.loop + 1},()=>{
                if (this.state.loop < 3) {
                    if (form.customers.current.length < form.counter) {
                        this.handleGenerate(true);
                    }
                }
            });
        }
    }
    handleSave(e) {
        e.preventDefault();
        if (this.state.form.nas === null) {
            showError(Lang.get('validation.required',{Attribute:Lang.get('nas.labels.name')}))
        } else if (this.state.form.profile === null) {
            showError(Lang.get('validation.required',{Attribute:Lang.get('profiles.labels.name')}))
        } else {
            let progress = this.state.progress;
            progress.current = 0;
            progress.max = this.state.form.customers.current.length;
            progress.percent = 0;
            this.setState({progress,loading:true});
            this.state.form.customers.current.map((item)=>{
                this.submitVoucher(item, moment().format('yyyy-MM-DD HH:mm:ss'))
                    .then(()=>{
                        if (this.state.progress.current >= this.state.progress.max) {
                            progress.current = 0,progress.max = 0,progress.percent = 0;
                            this.setState({loading:false,progress});
                            showSuccess(Lang.get('customers.hotspot.generate.success'));
                            this.props.handleClose();
                            this.props.handleUpdate();
                        }
                    }).catch((e)=>{
                        console.log(e);
                        if (this.state.progress.current >= this.state.progress.max) {
                            let progress = this.state.progress;
                            progress.current = 0,progress.max = 0,progress.percent = 0;
                            this.setState({loading:false,progress});
                            showSuccess(Lang.get('customers.hotspot.generate.success'));
                            this.props.handleClose();
                            this.props.handleUpdate();
                        }
                    });
            });
        }
    }
    async submitVoucher(data, batch) {
        let progress = this.state.progress;
        try {
            const formData = new FormData();
            formData.append('_method','put');
            if (this.state.form.nas !== null) formData.append(Lang.get('nas.form_input.name'), this.state.form.nas.value);
            if (this.state.form.profile !== null) formData.append(Lang.get('profiles.form_input.name'), this.state.form.profile.value);
            formData.append('batch_number', batch);
            formData.append(Lang.get('customers.hotspot.form_input.username'), data.username);
            formData.append(Lang.get('customers.hotspot.form_input.password'), data.password);
            let response = await generateHotspot(formData);
            if (response.data.params === null) {
                progress.current = this.state.progress.current + 1;
                progress.percent = (progress.current / progress.max ) * 100;
                this.setState({progress});
                console.log(response.data.message);
            } else {
                progress.current = this.state.progress.current + 1;
                progress.percent = (progress.current / progress.max ) * 100;
                this.setState({progress});
                console.log(response.data.params);
            }
        } catch (e) {
            progress.current = this.state.progress.current + 1;
            progress.percent = (progress.current / progress.max ) * 100;
            this.setState({progress});
        }
    }
    render() {
        return (
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('customers.hotspot.generate.form'),update:Lang.get('customers.update.form')}}/>
                    <DialogContent dividers>
                        {this.state.progress.max === 0 ?
                            <>
                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">{Lang.get('nas.labels.name')}</label>
                                    <div className="col-sm-4">
                                        <Select onChange={(e)=>this.handleSelect(e,'nas')} isLoading={this.props.loadings.nas} isDisabled={this.state.loading || this.props.loadings.nas} className="text-sm" noOptionsMessage={()=>Lang.get('nas.labels.not_found')} options={this.props.nas} value={this.state.form.nas} placeholder={Lang.get('nas.labels.name')}/>
                                    </div>
                                    {this.state.form.nas === null ? null :
                                        <>
                                            <label className="col-sm-2 col-form-label">{Lang.get('nas.labels.ip.short')}</label>
                                            <div className="col-sm-4">
                                                <div className="form-control text-sm">{this.state.form.nas.meta.auth.ip}:{this.state.form.nas.meta.auth.port}</div>
                                            </div>
                                        </>
                                    }
                                </div>
                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label"><LabelRequired/>{Lang.get('profiles.labels.name')}</label>
                                    <div className="col-sm-4">
                                        <Select onChange={(e)=>this.handleSelect(e,'profile')} value={this.state.form.profile}
                                                options={this.state.form.nas === null ? [] : this.state.form.type === null ? [] : this.props.profiles.filter((f) => f.meta.nas !== null && f.meta.nas.id === this.state.form.nas.value && f.meta.type === 'hotspot' && ! f.meta.additional)}
                                                isLoading={this.props.loadings.profiles}
                                                isDisabled={this.state.loading || this.props.loadings.profiles || this.state.form.type === null || this.state.form.nas === null}
                                                placeholder={Lang.get('profiles.labels.select')} noOptionsMessage={()=>Lang.get('profiles.labels.not_found')}/>
                                    </div>
                                </div>
                                {this.state.form.profile === null ? null :
                                    <React.Fragment>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="form-group row">
                                                    <label className="col-sm-4 col-form-label">{Lang.get('profiles.labels.price')}</label>
                                                    <div className="col-sm-8">
                                                        <div className="form-control text-sm">
                                                            {this.state.form.profile.meta.price === 0 ?
                                                                <span className="badge badge-success">FREE</span>
                                                                :
                                                                <>
                                                                    <span className="float-left">Rp.</span>
                                                                    <span className="float-right">{formatLocaleString(this.state.form.profile.meta.price)}</span>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label className="col-sm-4 col-form-label">{Lang.get('profiles.labels.validity.rate')}</label>
                                                    <div className="col-sm-8">
                                                        <div className="form-control text-sm">
                                                            {this.state.form.profile.meta.limit.rate === 0 ?
                                                                <span className="badge badge-success">UNLIMITED</span>
                                                                :
                                                                this.state.form.profile.meta.limit.type === 'time' ?
                                                                    `${this.state.form.profile.meta.limit.rate} ${durationType[durationType.findIndex((f) => f.value === this.state.form.profile.meta.limit.unit)].label}`
                                                                    :
                                                                    `${this.state.form.profile.meta.limit.rate} ${durationTypeByte[durationTypeByte.findIndex((f) => f.value === this.state.form.profile.meta.limit.unit)].label}`
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group row">
                                                    <div className="col-sm-12">
                                                        <DetailBandwidth data={this.state.form.profile}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </React.Fragment>
                                }
                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label" htmlFor="input-counter">{Lang.get('customers.hotspot.generate.qty')}</label>
                                    <div className="col-sm-2">
                                        <NumericFormat disabled={this.state.loading} id="input-counter"
                                                       className={this.state.form.counter > 5000 ? "form-control text-sm is-invalid" : "form-control text-sm"}
                                                       title={this.state.form.counter > 5000 ? Lang.get('customers.hotspot.generate.max') : ''}
                                                       name="counter" onChange={this.handleChange}
                                                       isAllowed={(values)=>{
                                                           const {floatValue} = values;
                                                           const MAX = 5000;
                                                           return floatValue <= MAX;
                                                       }}
                                                       allowLeadingZeros={false} placeholder={Lang.get('customers.hotspot.generate.qty')}
                                                       value={this.state.form.counter}
                                                       decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className="card card-outline card-primary">
                                            <div className="card-body">
                                                <div className="form-group row">
                                                    <label className="col-sm-4 col-form-label">{Lang.get('customers.hotspot.generate.usernames.type')}</label>
                                                    <div className="col-sm-8">
                                                        <Select options={generateType} value={this.state.form.usernames.type} isDisabled={this.state.loading} onChange={(e)=>this.handleSelect(e,'type','usernames')}/>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label htmlFor="input-username-format" className="col-sm-4 col-form-label">{Lang.get('customers.hotspot.generate.usernames.format')}</label>
                                                    <div className="col-sm-8">
                                                        <div className="input-group">
                                                            {this.state.form.usernames.type === null ? null :
                                                                this.state.form.usernames.random === 0 ? null :
                                                                    this.state.form.usernames.type.value === 'none' ? null :
                                                                        this.state.form.usernames.prefix &&
                                                                        <div className="input-group-prepend">
                                                                            <span className="input-group-text">{generatePrefix(this.state.form.usernames.type.value, this.state.form.usernames.random)}</span>
                                                                        </div>
                                                            }
                                                            <input
                                                                id="input-username-format"
                                                                placeholder={Lang.get('customers.hotspot.generate.usernames.format')}
                                                                className="form-control text-sm"
                                                                value={this.state.form.usernames.value} disabled={this.state.loading}
                                                                name="value" data-parent="usernames" onChange={this.handleChange}/>
                                                            {this.state.form.usernames.type === null ? null :
                                                                this.state.form.usernames.random === 0 ? null :
                                                                    this.state.form.usernames.type.value === 'none' ? null :
                                                                        ! this.state.form.usernames.prefix &&
                                                                        <div className="input-group-append">
                                                                            <div className="input-group-text">{generatePrefix(this.state.form.usernames.type.value, this.state.form.usernames.random)}</div>
                                                                        </div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label htmlFor="input-username-length" className="col-sm-4 col-form-label">{Lang.get('customers.hotspot.generate.usernames.length')}</label>
                                                    <div className="col-sm-3">
                                                        <NumericFormat disabled={this.state.loading} id="input-username-length"
                                                                       className="form-control text-sm"
                                                                       data-parent="usernames"
                                                                       name="length" onChange={this.handleChange}
                                                                       isAllowed={(values)=>{
                                                                           const {floatValue} = values;
                                                                           const MAX = 50 - this.state.form.usernames.random;
                                                                           return floatValue <= MAX;
                                                                       }}
                                                                       allowLeadingZeros={false} placeholder={Lang.get('customers.hotspot.generate.usernames.length')}
                                                                       value={this.state.form.usernames.length}
                                                                       decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                                    </div>
                                                </div>
                                                {this.state.form.usernames.type === null ? null :
                                                    this.state.form.usernames.type.value === 'none' ? null :
                                                        <>
                                                            <div className="form-group row">
                                                                <label htmlFor="input-username-random" className="col-sm-4 col-form-label">{Lang.get('customers.hotspot.generate.usernames.random')}</label>
                                                                <div className="col-sm-3">
                                                                    <NumericFormat disabled={this.state.loading} id="input-username-random"
                                                                                   className={this.state.form.usernames.random > 10 ? "form-control text-sm is-invalid" : "form-control text-sm"}
                                                                                   title={this.state.form.usernames.random > 10 ? Lang.get('customers.hotspot.generate.length_max',{length:10,parent:Lang.get('customers.hotspot.generate.usernames.length')}) : ''}
                                                                                   data-parent="usernames"
                                                                                   isAllowed={(values)=>{
                                                                                       const {floatValue} = values;
                                                                                       const MAX = 10;
                                                                                       return floatValue <= MAX;
                                                                                   }}
                                                                                   name="random" onChange={this.handleChange}
                                                                                   allowLeadingZeros={false} placeholder={Lang.get('customers.hotspot.generate.usernames.length')}
                                                                                   value={this.state.form.usernames.random}
                                                                                   decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                                                </div>
                                                            </div>
                                                            <div className="form-group row">
                                                                <div className="col-sm-8 offset-4">
                                                                    <div style={{zIndex:0}} className="custom-control custom-checkbox">
                                                                        <input disabled={this.state.loading} onChange={this.handleCheck} data-parent="usernames" className="custom-control-input" type="checkbox" id="username-prefix" checked={this.state.form.usernames.prefix}/>
                                                                        <label htmlFor="username-prefix" className="custom-control-label">
                                                                            {this.state.form.usernames.prefix ? Lang.get('customers.hotspot.generate.usernames.prefix.true') : Lang.get('customers.hotspot.generate.usernames.prefix.false') }
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                }

                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-sm-6">
                                        <div className="card card-outline card-warning">
                                            <div className="card-body">
                                                <div className="form-group row">
                                                    <label className="col-sm-4 col-form-label">{Lang.get('customers.hotspot.generate.passwords.type')}</label>
                                                    <div className="col-sm-8">
                                                        <Select options={generateType} value={this.state.form.passwords.type} isDisabled={this.state.loading} onChange={(e)=>this.handleSelect(e,'type','passwords')}/>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label htmlFor="input-password-format" className="col-sm-4 col-form-label">{Lang.get('customers.hotspot.generate.passwords.format')}</label>
                                                    <div className="col-sm-8">
                                                        <div className="input-group">
                                                            {this.state.form.passwords.type === null ? null :
                                                                this.state.form.passwords.random === 0 ? null :
                                                                    this.state.form.passwords.type.value === 'none' ? null :
                                                                        this.state.form.passwords.prefix &&
                                                                        <div className="input-group-prepend">
                                                                            <span className="input-group-text">{generatePrefix(this.state.form.passwords.type.value, this.state.form.passwords.random)}</span>
                                                                        </div>
                                                            }
                                                            <input
                                                                id="input-passwords-format"
                                                                placeholder={Lang.get('customers.hotspot.generate.passwords.format')}
                                                                className="form-control text-sm"
                                                                value={this.state.form.passwords.value} disabled={this.state.loading}
                                                                name="value" data-parent="passwords" onChange={this.handleChange}/>
                                                            {this.state.form.passwords.type === null ? null :
                                                                this.state.form.passwords.random === 0 ? null :
                                                                    this.state.form.passwords.type.value === 'none' ? null :
                                                                        ! this.state.form.passwords.prefix &&
                                                                        <div className="input-group-append">
                                                                            <div className="input-group-text">{generatePrefix(this.state.form.passwords.type.value, this.state.form.passwords.random)}</div>
                                                                        </div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label htmlFor="input-passwords-length" className="col-sm-4 col-form-label">{Lang.get('customers.hotspot.generate.passwords.length')}</label>
                                                    <div className="col-sm-3">
                                                        <NumericFormat disabled={this.state.loading} id="input-passwords-length"
                                                                       className="form-control text-sm"
                                                                       data-parent="passwords"
                                                                       name="length" onChange={this.handleChange}
                                                                       isAllowed={(values)=>{
                                                                           const {floatValue} = values;
                                                                           const MAX = 50 - this.state.form.passwords.random;
                                                                           return floatValue <= MAX;
                                                                       }}
                                                                       allowLeadingZeros={false} placeholder={Lang.get('customers.hotspot.generate.passwords.length')}
                                                                       value={this.state.form.passwords.length}
                                                                       decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                                    </div>
                                                </div>
                                                {this.state.form.passwords.type === null ? null :
                                                    this.state.form.passwords.type.value === 'none' ? null :
                                                        <>
                                                            <div className="form-group row">
                                                                <label htmlFor="input-passwords-random" className="col-sm-4 col-form-label">{Lang.get('customers.hotspot.generate.passwords.random')}</label>
                                                                <div className="col-sm-3">
                                                                    <NumericFormat disabled={this.state.loading} id="input-username-random"
                                                                                   data-parent="passwords"
                                                                                   className="form-control text-sm"
                                                                                   isAllowed={(values)=>{
                                                                                       const {floatValue} = values;
                                                                                       const MAX = 10;
                                                                                       return floatValue <= MAX;
                                                                                   }}
                                                                                   name="random" onChange={this.handleChange}
                                                                                   allowLeadingZeros={false} placeholder={Lang.get('customers.hotspot.generate.passwords.length')}
                                                                                   value={this.state.form.passwords.random}
                                                                                   decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                                                </div>
                                                            </div>
                                                            <div className="form-group row">
                                                                <div className="col-sm-8 offset-4">
                                                                    <div style={{zIndex:0}} className="custom-control custom-checkbox">
                                                                        <input disabled={this.state.loading} onChange={this.handleCheck} data-parent="passwords" className="custom-control-input" type="checkbox" id="passwords-prefix" checked={this.state.form.passwords.prefix}/>
                                                                        <label htmlFor="passwords-prefix" className="custom-control-label">
                                                                            {this.state.form.passwords.prefix ? Lang.get('customers.hotspot.generate.passwords.prefix.true') : Lang.get('customers.hotspot.generate.passwords.prefix.false') }
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                }

                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </>
                            :
                            <div className="p-5 text-center">
                                <div className="mb-5">
                                    <h4>{Lang.get('customers.hotspot.generate.progress.title')}</h4>
                                    <small>{Lang.get('customers.hotspot.generate.progress.warning')}</small>
                                </div>
                                <div className="progress" style={{height:40}}>
                                    <div className={
                                        this.state.progress.percent < 25 ?
                                            "progress-bar active bg-secondary progress-bar-striped progress-bar-animated"
                                            :
                                            this.state.progress.percent < 50 ?
                                                "progress-bar active bg-warning progress-bar-striped progress-bar-animated"
                                                :
                                                this.state.progress.percent < 75 ?
                                                    "progress-bar active bg-primary progress-bar-striped progress-bar-animated"
                                                    :
                                                    "progress-bar active bg-success progress-bar-striped progress-bar-animated"
                                    } role="progressbar" aria-valuenow={Math.round(this.state.progress.percent)} aria-valuemin="0" aria-valuemax="100" style={{width:`${this.state.progress.percent}%`}}>
                                        <span>{Lang.get('customers.hotspot.generate.progress.span',{current:this.state.progress.current,total:this.state.progress.max,percent:`${formatLocaleString(this.state.progress.percent,2)}%`})}</span>
                                    </div>
                                </div>
                            </div>
                        }
                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        loading={this.state.loading}
                        langs={{create:Lang.get('customers.hotspot.generate.submit'),update:Lang.get('customers.update.button')}}/>
                </form>
            </Dialog>
        )
    }
}

export default FormGenerate;
