import React from "react";
import {
    durationType, durationTypeByte, formatLocaleString, hasWhiteSpace, LabelRequired, responseMessage, serviceType
} from "../../../../Components/mixedConsts";
import {
    FormatPrice,
    sumCustomerDiscountForm, sumCustomerSubtotalForm, sumCustomerTaxForm, sumCustomerTaxLineForm, sumGrandTotalForm
} from "./Mixed";
import {ModalFooter, ModalHeader} from "../../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import Select from "react-select";
import {DetailBandwidth} from "../../Nas/Profile/Tools/DetailCard";
import {showError, showSuccess} from "../../../../Components/Toaster";
import {crudCustomers} from "../../../../Services/CustomerService";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faConciergeBell, faStreetView, faPlus, faTrashAlt} from "@fortawesome/free-solid-svg-icons";

// noinspection JSCheckFunctionSignatures,CommaExpressionJS,DuplicatedCode
class FormCustomer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, profile : null, nas : null, type : serviceType[0],
                name : '', address : '', email : '',
                village : null, district : null, city : null, province : null, postal : '',
                username : '', password : '',
                services : { current : [], delete : [] },
                taxes : { current : [], delete : [] },
                discounts : { current : [], delete : [] }
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleAddAdditional = this.handleAddAdditional.bind(this);
        this.handleRemoveAdditional = this.handleRemoveAdditional.bind(this);
        this.handleAddTax = this.handleAddTax.bind(this);
        this.handleRemoveTax = this.handleRemoveTax.bind(this);
        this.handleAddDiscount = this.handleAddDiscount.bind(this);
        this.handleRemoveDiscount = this.handleRemoveDiscount.bind(this);
    }
    componentWillReceiveProps(props) {
        this.setState({loading:true});
        let index;
        let form = this.state.form;
        if (! props.open) {
            form.id = null, form.profile = null, form.nas = null, form.type = serviceType[0],
                form.name = '', form.address = '', form.email = '',
                form.village = null, form.district = null, form.city = null, form.province = null, form.postal = '',
                form.username = '', form.password = '',
                form.taxes.current = [], form.taxes.delete = [],
                form.discounts.current = [], form.discounts.delete = [],
                form.services.current = [], form.services.delete = [];
        } else {
            if (props.data !== null) {
                form.id = props.data.value, form.name = props.data.label, form.address = props.data.meta.address.street,
                    form.username = props.data.meta.auth.user, form.password = props.data.meta.auth.pass,
                    form.postal = props.data.meta.address.postal;
                if (props.data.meta.user !== null) {
                    form.email = props.data.meta.user.email;
                }
                if (props.data.meta.nas !== null && props.nas !== null) {
                    if (props.nas.length > 0) {
                        index = props.nas.findIndex((f) => f.value === props.data.meta.nas.id);
                        if (index >= 0) {
                            form.nas = props.nas[index];
                        }
                    }
                }
                if (props.data.meta.profile !== null && props.profiles !== null) {
                    if (props.profiles.length > 0) {
                        index = props.profiles.findIndex((f) => f.value === props.data.meta.profile.id);
                        if (index >= 0) {
                            form.profile = props.profiles[index];
                            if (form.profile !== null) {
                                index = serviceType.findIndex((f) => f.value === form.profile.meta.type);
                                if (index >= 0) {
                                    form.type = serviceType[index];
                                }
                            }
                        }
                    }
                }
                if (props.data.meta.address.province !== null && props.provinces !== null) {
                    if (props.provinces.length > 0) {
                        index = props.provinces.findIndex((f) => f.value === props.data.meta.address.province.code);
                        if (index >= 0) {
                            form.province = props.provinces[index];
                            if (form.province !== null && props.data.meta.address.city !== null) {
                                index = form.province.meta.cities.findIndex((f) => f.value === props.data.meta.address.city.code);
                                if (index >= 0) {
                                    form.city = form.province.meta.cities[index];
                                    if (form.city !== null && props.data.meta.address.district !== null) {
                                        index = form.city.meta.districts.findIndex((f) => f.value === props.data.meta.address.district.code);
                                        if (index >= 0) {
                                            form.district = form.city.meta.districts[index];
                                            if (form.district !== null && props.data.meta.address.village !== null) {
                                                index = form.district.meta.villages.findIndex((f) => f.value === props.data.meta.address.village.code);
                                                if (index >= 0) {
                                                    form.village = form.district.meta.villages[index];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (props.data.meta.additional.length > 0) {
                    if (props.profiles !== null) {
                        if (props.profiles.length > 0) {
                            form.services.current = [];
                            props.data.meta.additional.map((item)=>{
                                index = props.profiles.findIndex((f) => f.value === item.meta.service.id);
                                if (index >= 0) {
                                    form.services.current.push({value:item.value,package:props.profiles[index]});
                                }
                            });
                        }
                    }
                }
                if (props.data.meta.taxes.length > 0) {
                    if (props.taxes !== null) {
                        if (props.taxes.length > 0) {
                            form.taxes.current = [];
                            props.data.meta.taxes.map((item)=>{
                                index = props.taxes.findIndex((f) => f.value === item.meta.tax.id);
                                if (index >= 0) {
                                    form.taxes.current.push({value:item.value,tax:props.taxes[index]});
                                }
                            })
                        }
                    }
                }
                if (props.data.meta.discounts.length > 0) {
                    if (props.discounts !== null) {
                        if (props.discounts.length > 0) {
                            form.discounts.current = [];
                            props.data.meta.discounts.map((item)=>{
                                index = props.discounts.findIndex((f) => f.value === item.meta.discount.id);
                                if (index >= 0) {
                                    form.discounts.current.push({value:item.value,discount:props.discounts[index]});
                                }
                            })
                        }
                    }
                }
            }
        }
        this.setState({loading:false,form});
    }
    handleRemoveDiscount(index) {
        let form = this.state.form;
        if (form.discounts.current[index].value !== null) {
            form.discounts.delete.push(form.discounts.current[index].value);
        }
        form.discounts.current.splice(index, 1);
        this.setState({form});
    }
    handleAddDiscount() {
        let form = this.state.form;
        form.discounts.current.push({value:null,discount:null});
        this.setState({form});
    }
    handleAddTax() {
        let form = this.state.form;
        form.taxes.current.push({value:null,tax:null});
        this.setState({form});
    }
    handleRemoveTax(index) {
        let form = this.state.form;
        if (form.taxes.current[index].value !== null) {
            form.taxes.delete.push(form.taxes.current[index].value);
        }
        form.taxes.current.splice(index, 1);
        this.setState({form});
    }
    handleAddAdditional() {
        let form = this.state.form;
        form.services.current.push({value:null,package:null});
        this.setState({form});
    }
    handleRemoveAdditional(index) {
        let form = this.state.form;
        if (form.services.current[index].value !== null) {
            form.services.delete.push(form.services.current[index].value);
        }
        form.services.current.splice(index, 1);
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        form[event.target.name] = event.target.value;
        this.setState({form});
    }
    handleSelect(event, name, index = null) {
        let form = this.state.form;
        if (['province','district','city','village'].indexOf(name) !== -1) {
            form[name] = event;
            switch (name) {
                case 'province' :
                    if (form.province !== null) {
                        form.city = form.province.meta.cities[0];
                        form.district = form.city.meta.districts[0];
                        form.village = form.district.meta.villages[0];
                        form.postal = form.village.meta.postal;
                    } else {
                        form.city = null, form.district = null, form.village = null, form.postal = '';
                    }
                    break;
                case 'city' :
                    if (form.city !== null) {
                        form.district = form.city.meta.districts[0];
                        form.village = form.district.meta.villages[0];
                        form.postal = form.village.meta.postal;
                    } else {
                        form.district = null, form.village = null, form.postal = '';
                    }
                    break;
                case 'district' :
                    if (form.district !== null) {
                        form.village = form.district.meta.villages[0];
                        form.postal = form.village.meta.postal;
                    } else {
                        form.village = null, form.postal = '';
                    }
                    break;
                case 'village' :
                    if (form.village !== null) {
                        form.postal = form.village.meta.postal;
                    } else {
                        form.postal = '';
                    }
                    break;
            }
        } else if (name === 'type' || name === 'nas') {
            form[name] = event;
            form.profile = null;
        } else if (index !== null) {
            if (name === 'package') {
                form.services.current[index].package = event;
            } else if (name === 'taxes') {
                if (form.taxes.current.length === 0) {
                    if (event === null) {
                        if (form.taxes.current[index].value !== null) {
                            form.taxes.delete.push(form.taxes.current[index].value);
                        }
                        form.taxes.current.splice(index, 1);
                    } else {
                        form.taxes.current.push({value:null,tax:event});
                    }
                } else {
                    if (event === null) {
                        if (form.taxes.current[index].value !== null) {
                            form.taxes.delete.push(form.taxes.current[index].value);
                        }
                        form.taxes.current.splice(index,1);
                    } else {
                        form.taxes.current[index].tax = event;
                    }
                }
            } else if (name === 'discount') {
                if (form.discounts.current.length === 0) {
                    if (event === null) {
                        if (form.discounts.current[index].value !== null) {
                            form.discounts.delete.push(form.discounts.current[index].value);
                        }
                        form.discounts.current.splice(index, 1);
                    } else {
                        form.discounts.current.push({value:null,discount:event});
                    }
                } else {
                    if (event === null) {
                        if (form.discounts.current[index].value !== null) {
                            form.discounts.delete.push(form.discounts.current[index].value);
                        }
                        form.discounts.current.splice(index,1);
                    } else {
                        form.discounts.current[index].discount = event;
                    }
                }
            }
        } else {
            form[name] = event;
        }
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        if (hasWhiteSpace(this.state.form.username)) {
            showError(Lang.get('customers.labels.username.errors.whitespace'));
        } else if (hasWhiteSpace(this.state.form.password)) {
            showError(Lang.get('customers.labels.password.errors.whitespace'));
        } else {
            this.setState({loading:true});
            try {
                const formData = new FormData();
                formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
                if (this.state.form.id !== null) formData.append(Lang.get('customers.form_input.id'), this.state.form.id);
                if (this.state.form.profile !== null) formData.append(Lang.get('profiles.form_input.name'), this.state.form.profile.value);
                if (this.state.form.nas !== null) formData.append(Lang.get('nas.form_input.name'), this.state.form.nas.value);
                if (this.state.form.type !== null) formData.append(Lang.get('customers.form_input.type'), this.state.form.type.value);
                if (this.state.form.name.length > 1) formData.append(Lang.get('customers.form_input.name'), this.state.form.name);
                if (this.state.form.address.length > 2) formData.append(Lang.get('customers.form_input.address.street'), this.state.form.address);
                if (this.state.form.email.length > 1) formData.append(Lang.get('customers.form_input.email'), this.state.form.email);
                if (this.state.form.village !== null) formData.append(Lang.get('customers.form_input.address.village'), this.state.form.village.value);
                if (this.state.form.district !== null) formData.append(Lang.get('customers.form_input.address.district'), this.state.form.district.value);
                if (this.state.form.city !== null) formData.append(Lang.get('customers.form_input.address.city'), this.state.form.city.value);
                if (this.state.form.province !== null) formData.append(Lang.get('customers.form_input.address.province'), this.state.form.province.value);
                formData.append(Lang.get('customers.form_input.address.postal'), this.state.form.postal);
                if (this.state.form.username.length > 1) formData.append(Lang.get('customers.form_input.username'), this.state.form.username);
                if (this.state.form.password.length > 1) formData.append(Lang.get('customers.form_input.password'), this.state.form.password);
                this.state.form.services.current.map((item,index)=>{
                    if (item.value !== null) formData.append(`${Lang.get('customers.form_input.service.input')}[${index}][${Lang.get('customers.form_input.service.id')}]`, item.value);
                    if (item.package !== null) formData.append(`${Lang.get('customers.form_input.service.input')}[${index}][${Lang.get('customers.form_input.service.name')}]`, item.package.value);
                });
                this.state.form.services.delete.map((item,index)=>{
                    formData.append(`${Lang.get('customers.form_input.service.delete')}[${index}]`, item);
                });
                this.state.form.taxes.current.map((item,index)=>{
                    if (item.value !== null) formData.append(`${Lang.get('customers.form_input.taxes.input')}[${index}][${Lang.get('customers.form_input.taxes.id')}]`, item.value);
                    if (item.tax !== null) formData.append(`${Lang.get('customers.form_input.taxes.input')}[${index}][${Lang.get('customers.form_input.taxes.name')}]`, item.tax.value);
                });
                this.state.form.taxes.delete.map((item,index)=>{
                    formData.append(`${Lang.get('customers.form_input.taxes.delete')}[${index}]`, item);
                });
                this.state.form.discounts.current.map((item,index)=>{
                    if (item.value !== null) formData.append(`${Lang.get('customers.form_input.discounts.input')}[${index}][${Lang.get('customers.form_input.discounts.id')}]`, item.value);
                    if (item.discount !== null) formData.append(`${Lang.get('customers.form_input.discounts.input')}[${index}][${Lang.get('customers.form_input.discounts.name')}]`, item.discount.value);
                });
                this.state.form.discounts.delete.map((item,index)=>{
                    formData.append(`${Lang.get('customers.form_input.discounts.delete')}[${index}]`, item);
                });

                let response = await crudCustomers(formData);
                if (response.data.params === null) {
                    this.setState({loading:false});
                    showError(response.data.message);
                } else {
                    this.setState({loading:false});
                    showSuccess(response.data.message);
                    this.props.handleUpdate(response.data.params);
                    this.props.handleClose();
                }
            } catch (err) {
                console.log(err);
                this.setState({loading:false});
                responseMessage(err);
            }
        }
    }
    render() {
        return (
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('customers.create.form'),update:Lang.get('customers.update.form')}}/>
                    <DialogContent dividers className="p-1">
                        <div className="card card-primary card-outline card-tabs mb-0">
                            <div className="card-header p-0 pt-1 border-bottom-0">
                                <ul className="nav nav-tabs" id="custom-tabs-three-tab" role="tablist">
                                    <li className="nav-item">
                                        <a className="nav-link active" id="custom-tabs-three-home-tab" data-toggle="pill" href="#custom-tabs-three-home" role="tab" aria-controls="custom-tabs-three-home" aria-selected="true"><FontAwesomeIcon icon={faHome}/></a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="custom-tabs-three-service-tab" data-toggle="pill" href="#custom-tabs-three-service" role="tab" aria-controls="custom-tabs-three-service" aria-selected="false"><FontAwesomeIcon icon={faConciergeBell} className="mr-1"/> {Lang.get('customers.labels.service.tab')}</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="custom-tabs-three-address-tab" data-toggle="pill" href="#custom-tabs-three-address" role="tab" aria-controls="custom-tabs-three-address" aria-selected="false"><FontAwesomeIcon icon={faStreetView} className="mr-1"/> {Lang.get('customers.labels.address.tab')}</a>
                                    </li>
                                </ul>
                            </div>

                            <div className="card-body">
                                <div className="tab-content" id="custom-tabs-three-tabContent">
                                    <div className="tab-pane fade active show" id="custom-tabs-three-home" role="tabpanel" aria-labelledby="custom-tabs-three-home-tab">
                                        <div className="form-group row">
                                            <label className="col-form-label col-sm-2"><LabelRequired/> {Lang.get('nas.labels.name')}</label>
                                            <div className="col-sm-4">
                                                {this.state.form.id === null ?
                                                    <Select onChange={(e)=>this.handleSelect(e,'nas')} isLoading={this.props.loadings.nas} isDisabled={this.state.loading || this.props.loadings.nas} className="text-sm" noOptionsMessage={()=>Lang.get('nas.labels.not_found')} options={this.props.nas} value={this.state.form.nas} placeholder={Lang.get('nas.labels.name')}/>
                                                    :
                                                    <div className="form-control text-sm">{this.state.form.nas.label}</div>
                                                }
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
                                            <label className="col-sm-2 col-form-label"><LabelRequired/>{Lang.get('customers.labels.type')}</label>
                                            <div className="col-sm-4">
                                                {this.state.form.id === null ?
                                                    <Select onChange={(e)=>this.handleSelect(e,'type')} options={serviceType} value={this.state.form.type} placeholder={Lang.get('customers.labels.type')} isDisabled={this.state.loading} noOptionsMessage={()=>Lang.get('customers.labels.no_type')}/>
                                                    :
                                                    <div className="form-control text-sm">{this.state.form.type.label}</div>
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-2 col-form-label"><LabelRequired/>{Lang.get('profiles.labels.name')}</label>
                                            <div className="col-sm-4">
                                                <Select onChange={(e)=>this.handleSelect(e,'profile')} value={this.state.form.profile}
                                                        options={this.state.form.nas === null ? [] : this.state.form.type === null ? [] : this.props.profiles.filter((f) => f.meta.nas !== null && f.meta.nas.id === this.state.form.nas.value && f.meta.type === this.state.form.type.value && ! f.meta.additional)}
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
                                            <label className="col-sm-2 col-form-label" htmlFor="input-name"><LabelRequired/>{Lang.get('customers.labels.name')}</label>
                                            <div className="col-sm-10">
                                                <input id="input-name" className="form-control text-sm" disabled={this.state.loading} value={this.state.form.name} onChange={this.handleChange} name="name" placeholder={Lang.get('customers.labels.name')}/>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label className="col-sm-2 col-form-label" htmlFor="input-email"><LabelRequired/>{Lang.get('customers.labels.address.email')}</label>
                                            <div className="col-sm-4">
                                                <input type="email" id="input-email" className="form-control text-sm" value={this.state.form.email} name="email" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('customers.labels.address.email')}/>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-2 col-form-label" htmlFor="input-username"><LabelRequired/>{Lang.get('customers.labels.username.label')}</label>
                                            <div className="col-sm-4">
                                                <input id="input-username" className="form-control text-sm" value={this.state.form.username} name="username" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('customers.labels.username.label')}/>
                                            </div>
                                            <label className="col-sm-2 col-form-label" htmlFor="input-password"><LabelRequired/>{Lang.get('customers.labels.password.label')}</label>
                                            <div className="col-sm-4">
                                                <input id="input-password" className="form-control text-sm" value={this.state.form.password} name="password" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('customers.labels.password.label')}/>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade p-0" id="custom-tabs-three-service" role="tabpanel" aria-labelledby="custom-tabs-three-service-tab">
                                        <button type="button" disabled={this.state.loading} onClick={this.handleAddAdditional} className="btn btn-outline-primary mb-3"><FontAwesomeIcon icon={faPlus} className="mr-1"/> {Lang.get('customers.labels.service.add_btn')}</button>
                                        <table className="table table-sm table-striped mb-0">
                                            <thead>
                                            <tr>
                                                <th className="align-middle text-center" width={30}><FontAwesomeIcon icon={faTrashAlt}/></th>
                                                <th className="align-middle" width={100}>{Lang.get('customers.labels.service.type')}</th>
                                                <th colSpan={3} className="align-middle">{Lang.get('customers.labels.service.name')}</th>
                                                <th className="align-middle" width={150}>{Lang.get('customers.labels.service.price')}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.form.profile === null ? null :
                                                <tr>
                                                    <td className="align-middle text-center"><FontAwesomeIcon icon={faTrashAlt}/></td>
                                                    <td className="align-middle text-center">{Lang.get('customers.labels.service.main')}</td>
                                                    <td colSpan={3} className="align-middle">{this.state.form.profile.label}</td>
                                                    <td className="align-middle">
                                                        {this.state.form.profile.meta.price === 0 ?
                                                            <span className="badge badge-success">FREE</span>
                                                            :
                                                            <>
                                                                <span className="float-left">Rp.</span>
                                                                <span className="float-right">{formatLocaleString(this.state.form.profile.meta.price)}</span>
                                                            </>
                                                        }
                                                    </td>
                                                </tr>
                                            }
                                            {this.state.form.services.current.length === 0 ?
                                                <tr><td colSpan={6} className="align-middle text-center">{Lang.get('customers.labels.service.not_found')}</td></tr>
                                                :
                                                this.state.form.services.current.map((item,index)=>
                                                    <tr key={`sv_${index}`}>
                                                        <td className="align-middle text-center">
                                                            <button type="button" className="btn btn-outline-warning btn-xs" disabled={this.state.loading} onClick={()=>this.handleRemoveAdditional(index)}><FontAwesomeIcon size="xs" icon={faTrashAlt}/></button>
                                                        </td>
                                                        <td className="align-middle text-center">{Lang.get('customers.labels.service.add')}</td>
                                                        <td colSpan={3} className="align-middle">
                                                            <Select options={this.props.profiles.filter((f) => f.meta.additional)}
                                                                    value={item.package}
                                                                    placeholder={Lang.get('customers.labels.service.select.label')}
                                                                    noOptionsMessage={()=>Lang.get('customers.labels.service.select.not_found')}
                                                                    onChange={(e)=>this.handleSelect(e,'package',index)}
                                                                    isDisabled={this.state.loading || this.props.loadings.profiles} isLoading={this.props.loadings.profiles}/>
                                                        </td>
                                                        <td className="align-middle text-right">
                                                            {item.package === null ? null :
                                                                item.package.meta.price === 0 ?
                                                                    <span className="badge badge-success">FREE</span>
                                                                    :
                                                                    <>
                                                                        <span className="float-left">Rp.</span>
                                                                        <span className="float-right">{formatLocaleString(item.package.meta.price)}</span>
                                                                    </>
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                            </tbody>
                                            <tfoot>
                                            <tr>
                                                <th className="align-middle text-right" colSpan={5}>{Lang.get('customers.labels.service.subtotal.label')}</th>
                                                <th className="align-middle">
                                                    <span className="float-left align-middle">Rp.</span>
                                                    <span className="float-right align-middle">{formatLocaleString(sumCustomerSubtotalForm(this.state.form))}</span>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="align-middle text-right" colSpan={3}>
                                                    {Lang.get('customers.labels.service.taxes.label')}
                                                    <button title={Lang.get('customers.labels.service.taxes.add')} type="button" className="btn btn-tool" disabled={this.state.loading} onClick={this.handleAddTax}><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                </th>
                                                <th width={150} className="align-middle">
                                                    <Select onChange={(e)=>this.handleSelect(e,'taxes',0)}
                                                            isClearable value={this.state.form.taxes.current.length === 0 ? null : this.state.form.taxes.current[0].tax} isDisabled={this.state.loading || this.props.loadings.taxes} isLoading={this.props.loadings.taxes} options={this.props.taxes} placeholder={Lang.get('customers.labels.service.taxes.select.label')} noOptionsMessage={()=>Lang.get('customers.labels.service.taxes.select.not_found')}/>
                                                </th>
                                                <th width={150} className="align-middle text-right">
                                                    {this.state.form.taxes.current.length === 0 ? '-' :
                                                        this.state.form.taxes.current[0].tax === null ?
                                                            '-'
                                                            :
                                                            `${this.state.form.taxes.current[0].tax.meta.percent}%`
                                                    }
                                                </th>
                                                <th className="align-middle text-right">
                                                    {this.state.form.taxes.current.length === 0 ? '-' :
                                                        this.state.form.taxes.current[0].tax === null ? '-' :
                                                            sumCustomerTaxLineForm(this.state.form, 0) === 0 ?
                                                                '-'
                                                                :
                                                                <>
                                                                    <span className="float-left">Rp.</span>
                                                                    <span className="float-right">{formatLocaleString(sumCustomerTaxLineForm(this.state.form, 0),2)}</span>
                                                                </>
                                                    }
                                                </th>
                                            </tr>
                                            {this.state.form.taxes.current.length > 1 &&
                                                <>
                                                    {this.state.form.taxes.current.map((item,index)=>
                                                        index === 0 ? null :
                                                            <tr key={`tax_${index}`}>
                                                                <th className="align-middle text-right" colSpan={3}>
                                                                    {Lang.get('customers.labels.service.taxes.label')} #{index+1}
                                                                    <button title={Lang.get('customers.labels.service.taxes.add')} type="button" className="btn btn-tool" disabled={this.state.loading} onClick={this.handleAddTax}><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                                </th>
                                                                <th width={150} className="align-middle">
                                                                    <Select onChange={(e)=>this.handleSelect(e,'taxes',index)}
                                                                            isClearable
                                                                            value={item.tax}
                                                                            isDisabled={this.state.loading || this.props.loadings.taxes} isLoading={this.props.loadings.taxes} options={this.props.taxes} placeholder={Lang.get('customers.labels.service.taxes.select.label')} noOptionsMessage={()=>Lang.get('customers.labels.service.taxes.select.not_found')}/>
                                                                </th>
                                                                <th width={100} className="align-middle text-right">
                                                                    {item.tax === null ? '-' : `${item.tax.meta.percent}%` }
                                                                </th>
                                                                <th className="align-middle text-right">
                                                                    {item.tax === null ? '-' :
                                                                        sumCustomerTaxLineForm(this.state.form, index) === 0 ?
                                                                            '-' :
                                                                            <>
                                                                                <span className="float-left">Rp.</span>
                                                                                <span className="float-right">{formatLocaleString(sumCustomerTaxLineForm(this.state.form, index),2)}</span>
                                                                            </>
                                                                    }
                                                                </th>
                                                            </tr>
                                                    )}
                                                    <tr>
                                                        <th className="align-middle text-right" colSpan={5}>{Lang.get('customers.labels.service.taxes.subtotal')}</th>
                                                        <th className="align-middle text-right">
                                                            {sumCustomerTaxForm(this.state.form) === 0 ? '-' :
                                                                <>
                                                                    <span className="float-left">Rp.</span>
                                                                    <span className="float-right">{formatLocaleString(sumCustomerTaxForm(this.state.form),2)}</span>
                                                                </>
                                                            }
                                                        </th>
                                                    </tr>
                                                </>
                                            }
                                            <tr>
                                                <th className="align-middle text-right" colSpan={4}>
                                                    {Lang.get('customers.labels.service.discount.label')}
                                                    <button type="button" title={Lang.get('customers.labels.service.discount.add')} className="btn btn-tool" onClick={this.handleAddDiscount}><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                </th>
                                                <th className="align-middle">
                                                    <Select onChange={(e)=>this.handleSelect(e,'discount',0)} value={this.state.form.discounts.current.length === 0 ? null : this.state.form.discounts.current[0].discount} options={this.props.discounts} isLoading={this.props.loadings.discounts} isDisabled={this.state.loading} placeholder={Lang.get('customers.labels.service.discount.select.label')} noOptionsMessage={()=>Lang.get('customers.labels.service.discount.select.not_found')} isClearable/>
                                                </th>
                                                <th className="align-middle text-right">
                                                    {this.state.form.discounts.current.length === 0 ? '-' :
                                                        this.state.form.discounts.current[0].discount === null ? '-' :
                                                            this.state.form.discounts.current[0].discount.meta.amount === 0 ? '-' :
                                                                <>
                                                                    <span className="float-left">Rp.</span>
                                                                    <span className="float-right">{formatLocaleString(this.state.form.discounts.current[0].discount.meta.amount)}</span>
                                                                </>
                                                    }
                                                </th>
                                            </tr>
                                            {this.state.form.discounts.current.length < 2 ? null :
                                                <>
                                                    {this.state.form.discounts.current.map((item,index)=>
                                                        index === 0 ? null :
                                                            <tr key={`disc_${index}`}>
                                                                <th colSpan={4} className="align-middle text-right">
                                                                    {Lang.get('customers.labels.service.discount.label')}
                                                                    <button type="button" title={Lang.get('customers.labels.service.discount.add')} className="btn btn-tool" onClick={this.handleAddDiscount}><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                                </th>
                                                                <th className="align-middle">
                                                                    <Select onChange={(e)=>this.handleSelect(e,'discount', index)} value={item.discount} options={this.props.discounts} isLoading={this.props.loadings.discounts} isDisabled={this.state.loading} placeholder={Lang.get('customers.labels.service.discount.select.label')} noOptionsMessage={()=>Lang.get('customers.labels.service.discount.select.not_found')} isClearable/>
                                                                </th>
                                                                <th className="align-middle text-right">
                                                                    {item.discount === null ? '-' :
                                                                        item.discount.meta.amount === 0 ? '-' :
                                                                            <>
                                                                                <span className="float-left">Rp.</span>
                                                                                <span className="float-right">{formatLocaleString(item.discount.meta.amount)}</span>
                                                                            </>
                                                                    }
                                                                </th>
                                                            </tr>
                                                    )}
                                                    <tr>
                                                        <th colSpan={5} className="align-middle text-right">
                                                            {Lang.get('customers.labels.service.discount.subtotal')}
                                                        </th>
                                                        <th className="align-middle text-right">
                                                            {sumCustomerDiscountForm(this.state.form) === 0 ? '-' :
                                                                <>
                                                                    <span className="float-left">Rp.</span>
                                                                    <span className="float-right">
                                                                        {formatLocaleString(sumCustomerDiscountForm(this.state.form),2)}
                                                                    </span>
                                                                </>
                                                            }
                                                        </th>
                                                    </tr>
                                                </>
                                            }
                                            <tr>
                                                <th className="align-middle text-right text-md text-success" colSpan={5}>{Lang.get('customers.labels.service.grand_total.label')}</th>
                                                <th className="align-middle text-right text-md text-success">{sumGrandTotalForm(this.state.form)}</th>
                                            </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    <div className="tab-pane fade" id="custom-tabs-three-address" role="tabpanel" aria-labelledby="custom-tabs-three-address-tab">
                                        <div className="form-group row">
                                            <label className="col-sm-2 col-form-label" htmlFor="input-address">{Lang.get('customers.labels.address.street')}</label>
                                            <div className="col-sm-10">
                                                <textarea id="input-address" style={{resize:'none'}} className="form-control text-sm" disabled={this.state.loading} value={this.state.form.address} onChange={this.handleChange} name="address" placeholder={Lang.get('customers.labels.address.street')}/>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-2 col-form-label">{Lang.get('regions.village.label')}</label>
                                            <div className="col-sm-4">
                                                <Select value={this.state.form.village}
                                                        className="text-sm"
                                                        onChange={(e)=>this.handleSelect(e,'village')}
                                                        placeholder={Lang.get('regions.village.select')}
                                                        noOptionsMessage={()=>Lang.get('regions.village.no_data')}
                                                        options={this.state.form.district === null ? [] : this.state.form.district.meta.villages}
                                                        isLoading={this.props.loadings.provinces} isDisabled={this.state.loading || this.props.loadings.provinces}/>
                                            </div>
                                            <label className="col-sm-2 col-form-label">{Lang.get('regions.village.label')}</label>
                                            <div className="col-sm-4">
                                                <Select value={this.state.form.district}
                                                        className="text-sm"
                                                        onChange={(e)=>this.handleSelect(e,'district')}
                                                        placeholder={Lang.get('regions.district.select')}
                                                        noOptionsMessage={()=>Lang.get('regions.district.no_data')}
                                                        options={this.state.form.city === null ? [] : this.state.form.city.meta.districts}
                                                        isLoading={this.props.loadings.provinces} isDisabled={this.state.loading || this.props.loadings.provinces}/>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-2 col-form-label">{Lang.get('regions.city.label')}</label>
                                            <div className="col-sm-4">
                                                <Select value={this.state.form.city}
                                                        className="text-sm"
                                                        onChange={(e)=>this.handleSelect(e,'city')}
                                                        placeholder={Lang.get('regions.city.select')}
                                                        noOptionsMessage={()=>Lang.get('regions.city.no_data')}
                                                        options={this.state.form.province === null ? [] : this.state.form.province.meta.cities}
                                                        isLoading={this.props.loadings.provinces} isDisabled={this.state.loading || this.props.loadings.provinces}/>
                                            </div>
                                            <label className="col-sm-2 col-form-label">{Lang.get('regions.village.label')}</label>
                                            <div className="col-sm-4">
                                                <Select value={this.state.form.province}
                                                        className="text-sm"
                                                        onChange={(e)=>this.handleSelect(e,'province')}
                                                        placeholder={Lang.get('regions.province.select')}
                                                        noOptionsMessage={()=>Lang.get('regions.province.no_data')}
                                                        options={this.props.provinces}
                                                        isLoading={this.props.loadings.provinces} isDisabled={this.state.loading || this.props.loadings.provinces}/>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-2 col-form-label" htmlFor="input-postal">{Lang.get('customers.labels.address.postal')}</label>
                                            <div className="col-sm-2">
                                                <input className="form-control text-sm" value={this.state.form.postal} name="postal" id="input-postal" disabled={this.state.loading} placeholder={Lang.get('customers.labels.address.postal')} onChange={this.handleChange}/>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>

                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        loading={this.state.loading}
                        langs={{create:Lang.get('customers.create.button'),update:Lang.get('customers.update.button')}}/>
                </form>
            </Dialog>
        )
    }
}

export default FormCustomer;
