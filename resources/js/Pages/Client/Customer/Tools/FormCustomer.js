import React from "react";
import {
    durationType,
    durationTypeByte,
    formatLocaleString,
    FormControlSMReactSelect,
    hasWhiteSpace,
    LabelRequired,
    responseMessage,
    serviceType
} from "../../../../Components/mixedConsts";
import {
    FormatPrice,
    sumCustomerDiscountForm, sumCustomerSubtotalForm, sumCustomerTaxForm, sumCustomerTaxLineForm, sumGrandTotalForm
} from "./Mixed";
import {ModalFooter, ModalHeader} from "../../../../Components/ModalComponent";
import {Dialog, DialogContent, Tooltip} from "@mui/material";
import Select from "react-select";
import {DetailBandwidth} from "../../Nas/Profile/Tools/DetailCard";
import {showError, showSuccess} from "../../../../Components/Toaster";
import {crudCustomers} from "../../../../Services/CustomerService";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faConciergeBell,
    faStreetView,
    faPlus,
    faTrashAlt,
    faUserTie,
    faPencilAlt
} from "@fortawesome/free-solid-svg-icons";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/bootstrap.css'
import id from "react-phone-input-2/lang/id.json";
import {VillageComponent} from "../../../Auth/Company/Tools/Mixed";
import {searchRegions} from "../../../../Services/RegionService";
import FormDiscount from "../../../Auth/Configs/Discount/Tools/FormDiscount";
import FormTax from "../../../Auth/Configs/Tax/Tools/FormTax";
import FormProfile from "../../Nas/Profile/Tools/FormProfile";
import FormNas from "../../Nas/Tools/FormNas";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons/faPlusCircle";

// noinspection JSCheckFunctionSignatures,CommaExpressionJS,DuplicatedCode,HtmlUnknownAnchorTarget,JSValidateTypes,JSUnresolvedVariable
class FormCustomer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            regions : {
                provinces : { select : [], loading : false },
                cities : { select : [], loading : false },
                districts : { select : [], loading : false },
                villages : { select : [], loading : false },
            },
            form : {
                id : null, profile : null, nas : null, type : serviceType[0],
                name : '', address : '', email : '', phone : '', is_voucher : false,
                village : null, district : null, city : null, province : null, postal : '',
                username : '', password : '',
                services : { current : [], delete : [] },
                taxes : { current : [], delete : [] },
                discounts : { current : [], delete : [] }
            },
            modals : {
                nas : { open : false, data : null },
                profile : { open : false, data : null, additional : true },
                discount : { open : false, data : null },
                tax : { open : false, data : null },
            }
        };
        this.timer = null;
        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleAddAdditional = this.handleAddAdditional.bind(this);
        this.handleRemoveAdditional = this.handleRemoveAdditional.bind(this);
        this.handleAddTax = this.handleAddTax.bind(this);
        this.handleRemoveTax = this.handleRemoveTax.bind(this);
        this.handleAddDiscount = this.handleAddDiscount.bind(this);
        this.handleRemoveDiscount = this.handleRemoveDiscount.bind(this);
        this.handleSearchRegions = this.handleSearchRegions.bind(this);
        this.loadRegions = this.loadRegions.bind(this);
        this.onSelectClose = this.onSelectClose.bind(this);
        this.toggleNas = this.toggleNas.bind(this);
        this.toggleProfile = this.toggleProfile.bind(this);
        this.toggleDiscount = this.toggleDiscount.bind(this);
        this.toggleTax = this.toggleTax.bind(this);
    }
    componentWillReceiveProps(props) {
        this.setState({loading:true});
        let index;
        let form = this.state.form;
        if (! props.open) {
            form.id = null, form.profile = null, form.nas = null, form.type = serviceType[0],
                form.name = '', form.address = '', form.email = '',
                form.village = null, form.district = null, form.city = null, form.province = null, form.postal = '',
                form.username = '', form.password = '', form.phone,
                form.taxes.current = [], form.taxes.delete = [],
                form.is_voucher = false,
                form.discounts.current = [], form.discounts.delete = [],
                form.services.current = [], form.services.delete = [];
            if (typeof props.type !== 'undefined') {
                if (props.type !== null) {
                    index = serviceType.findIndex((f) => f.value === props.type);
                    if (index >= 0) {
                        form.type = serviceType[index];
                    }
                }
            }
        } else {
            if (props.data !== null) {
                form.id = props.data.value, form.name = props.data.label, form.address = props.data.meta.address.street,
                    form.username = props.data.meta.auth.user, form.password = props.data.meta.auth.pass,
                    form.postal = props.data.meta.address.postal,
                    form.phone = props.data.meta.address.phone,
                    form.is_voucher = props.data.meta.voucher.is;
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
                if (props.data.meta.address.village !== null) {
                    this.handleSearchRegions(props.data.meta.address.village.name,'villages',true,props.data.meta.address.village.code);
                }
                /*if (props.data.meta.address.province !== null && props.provinces !== null) {
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
                }*/
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
    toggleTax(data = null) {
        let modals = this.state.modals;
        modals.tax.open = ! this.state.modals.tax.open;
        modals.tax.data = data;
        this.setState({modals});
    }
    toggleDiscount(data = null) {
        let modals = this.state.modals;
        modals.discount.open = ! this.state.modals.discount.open;
        modals.discount.data = data;
        this.setState({modals});
    }
    toggleNas(data = null) {
        let modals = this.state.modals;
        modals.nas.open = ! this.state.modals.nas.open;
        modals.nas.data = data;
        this.setState({modals});
    }
    toggleProfile(data = null, additional = true) {
        let modals = this.state.modals;
        modals.profile.open = ! this.state.modals.profile.open;
        modals.profile.data = data;
        modals.profile.additional = additional;
        this.setState({modals});
    }
    handleSelectRegion(event, name) {
        let form = this.state.form;
        let index;
        form[name] = event;
        switch (name) {
            case 'village':
                if (form.village === null) {
                    form.district = null, form.city = null, form.province = null, form.postal = '';
                } else {
                    if (['NULL',null].indexOf(form.village.meta.postal) !== 0) {
                        form.postal = form.village.meta.postal;
                    }
                    if (form.village.meta.district !== null) {
                        form.district = form.village.meta.district;
                        if (form.district !== null) {
                            if (form.district.meta.city !== null) {
                                form.city = form.district.meta.city;
                                if (form.city !== null) {
                                    if (form.city.meta.province !== null) {
                                        form.province = form.city.meta.province;
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            case 'district' :
                if (form.district === null) {
                    form.city = null, form.province = null, form.village = null;
                } else {
                    if (form.district.meta.villages.length > 0) {
                        if (form.village !== null) {
                            index = this.state.regions.villages.select.findIndex((f) => f.value === form.village.value);
                            if (index >= 0) {
                                form.village = this.state.regions.villages[index];
                            } else {
                                form.village = this.state.regions.villages[0];
                            }
                        }
                    }
                    if (form.district.meta.city !== null) {
                        form.city = form.district.meta.city;
                        if (form.city !== null) {
                            if (form.city.meta.province !== null) {
                                form.province = form.city.meta.province;
                            }
                        }
                    }
                }
                break;
        }
        this.setState({form});
    }
    handleSearchRegions(keywords, type, forceSelect = false, selectValue = null) {
        let regions = this.state.regions;
        let index;
        regions[type].loading = true; this.setState({regions});
        clearTimeout(this.timer);
        this.timer = setTimeout(()=> {
            if (keywords.length >= 2) {
                const formData = new FormData();
                formData.append(Lang.get('labels.form_input.keywords'), keywords);
                formData.append(Lang.get('labels.form_input.search_type'), type);
                this.loadRegions(formData)
                    .then((response)=>{
                        regions[type].select = response;
                        regions[type].loading = false;
                        this.setState({regions},()=>{
                            if (forceSelect && selectValue !== null) {
                                index = regions.villages.select.findIndex((f) => f.value === selectValue);
                                if (index >= 0) {
                                    this.handleSelectRegion(regions.villages.select[index],'village');
                                }
                            }
                        });
                    });
            }
        }, 1000);
    }
    onSelectClose(type) {
        let regions = this.state.regions;
        regions[type].loading = false;
        this.setState({regions});
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
    async loadRegions(formData) {
        try {
            let response = await searchRegions(formData);
            if (response.data.params === null) {
                return [];
            } else {
                return response.data.params;
            }
        } catch (e) {
            return [];
        }
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
                formData.append(Lang.get('customers.form_input.address.phone'), this.state.form.phone);
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
                this.setState({loading:false});
                responseMessage(err);
            }
        }
    }
    render() {
        return (
            <React.Fragment>
                <FormNas open={this.state.modals.nas.open} data={this.state.modals.nas.data} handleClose={this.toggleNas} handleUpdate={this.props.onUpdateNas} companies={this.props.companies} privilege={this.props.privilege} loadings={this.props.loadings} user={this.props.user}/>
                <FormProfile hideType={this.state.form.type !== null} type={this.state.form.type === null ? null : this.state.form.type.value} hideAdditional={true} additional={this.state.modals.profile.additional} open={this.state.modals.profile.open} data={this.state.modals.profile.data} handleClose={this.toggleProfile} handleUpdate={this.props.onUpdateProfiles} user={this.props.user} companies={this.props.companies} nas={this.props.nas} onUpdateNas={this.props.onUpdateNas} loadings={this.props.loadings} privilege={this.props.privilege} bandwidths={this.props.bandwidths} onUpdateBandwidth={this.props.onUpdateBandwidth} pools={this.props.pools} onUpdatePool={this.props.onUpdatePool}/>
                <FormTax open={this.state.modals.tax.open} data={this.state.modals.tax.data} handleClose={this.toggleTax} handleUpdate={this.props.onUpdateTaxes} user={this.props.user} privilege={this.props.privilege} loadings={this.props.loadings} companies={this.props.companies}/>
                <FormDiscount open={this.state.modals.discount.open} data={this.state.modals.discount.data} handleClose={this.toggleDiscount} handleUpdate={this.props.onUpdateDiscounts} user={this.props.user} companies={this.props.companies} loadings={this.props.loadings}/>
                <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                    <form onSubmit={this.handleSave}>
                        <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('customers.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('customers.labels.menu')})}}/>
                        <DialogContent dividers className="p-1">
                            <div className="card card-primary card-outline card-tabs mb-0">
                                <div className="card-header p-0 pt-1 border-bottom-0">
                                    <ul className="nav nav-tabs" id="custom-tabs-three-tab" role="tablist">
                                        <li className="nav-item">
                                            <a className="nav-link active text-xs" id="custom-tabs-three-home-tab" data-toggle="pill" href="#custom-tabs-three-home" role="tab" aria-controls="custom-tabs-three-home" aria-selected="true"><FontAwesomeIcon icon={faUserTie} size="sm"/></a>
                                        </li>
                                        {! this.state.form.is_voucher &&
                                            <React.Fragment>
                                                <li className="nav-item">
                                                    <a className="nav-link text-xs" id="custom-tabs-three-service-tab" data-toggle="pill" href="#custom-tabs-three-service" role="tab" aria-controls="custom-tabs-three-service" aria-selected="false"><FontAwesomeIcon icon={faConciergeBell} className="mr-1" size="sm"/> {Lang.get('customers.labels.service.tab')}</a>
                                                </li>
                                                <li className="nav-item">
                                                    <a className="nav-link text-xs" id="custom-tabs-three-address-tab" data-toggle="pill" href="#custom-tabs-three-address" role="tab" aria-controls="custom-tabs-three-address" aria-selected="false"><FontAwesomeIcon icon={faStreetView} className="mr-1" size="sm"/> {Lang.get('customers.labels.address.tab')}</a>
                                                </li>
                                            </React.Fragment>
                                        }
                                    </ul>
                                </div>

                                <div className="card-body">
                                    <div className="tab-content" id="custom-tabs-three-tabContent">
                                        <div className="tab-pane fade active show" id="custom-tabs-three-home" role="tabpanel" aria-labelledby="custom-tabs-three-home-tab">
                                            <div className="form-group row">
                                                <label className="col-form-label col-sm-2"><LabelRequired/> {Lang.get('nas.labels.name')}</label>
                                                <div className="col-md-4">
                                                    <div className="row">
                                                        <div className="col-md-10">
                                                            {this.state.form.id === null ?
                                                                <Select styles={FormControlSMReactSelect} onChange={(e)=>this.handleSelect(e,'nas')} isLoading={this.props.loadings.nas} isDisabled={this.state.loading || this.props.loadings.nas} className="text-xs" noOptionsMessage={()=>Lang.get('nas.labels.not_found')} options={this.props.nas} value={this.state.form.nas} placeholder={Lang.get('nas.labels.name')}/>
                                                                :
                                                                this.state.form.nas === null ? null
                                                                    :
                                                                    <div className="form-control form-control-sm text-xs">{this.state.form.nas.label}</div>
                                                            }
                                                        </div>
                                                        <div className="col-md-2">
                                                            {this.state.form.id !== null ? null :
                                                                this.state.form.nas === null ?
                                                                    this.props.privilege !== null && typeof this.props.privilege.nas !== 'undefined' && this.props.privilege.nas.create && ! this.state.loading && ! this.props.loadings.nas &&
                                                                    <Tooltip title={Lang.get('labels.create.label',{Attribute:Lang.get('nas.labels.menu')})}>
                                                                        <button onClick={()=>this.toggleNas()} type="button" className="btn btn-outline-primary btn-sm text-xs"><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                                    </Tooltip>
                                                                    :
                                                                    <Tooltip title={Lang.get('labels.update.label',{Attribute:Lang.get('nas.labels.menu')})}>
                                                                        <button onClick={()=>this.toggleNas(this.state.form.nas)} type="button" className="btn btn-outline-info btn-sm text-xs"><FontAwesomeIcon icon={faPencilAlt} size="sm"/></button>
                                                                    </Tooltip>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.state.form.nas === null ? null :
                                                    <>
                                                        <label className="col-md-2 text-xs col-form-label">{Lang.get('nas.labels.ip.short')}</label>
                                                        <div className="col-md-4">
                                                            <div className="form-control form-control-sm text-xs">{this.state.form.nas.meta.auth.ip}:{this.state.form.nas.meta.auth.port}</div>
                                                        </div>
                                                    </>
                                                }
                                            </div>
                                            {typeof this.props.type === 'undefined' &&
                                                <div className="form-group row">
                                                    <label className="col-md-2 text-xs col-form-label"><LabelRequired/>{Lang.get('customers.labels.type')}</label>
                                                    <div className="col-md-2">
                                                        {this.state.form.id === null ?
                                                            <Select styles={FormControlSMReactSelect} onChange={(e)=>this.handleSelect(e,'type')} options={serviceType} value={this.state.form.type} placeholder={Lang.get('customers.labels.type')} isDisabled={this.state.loading} noOptionsMessage={()=>Lang.get('customers.labels.no_type')}/>
                                                            :
                                                            <div className="form-control form-control-sm text-xs">{this.state.form.type.label}</div>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group row">
                                                        <label className="col-md-4 text-xs col-form-label"><LabelRequired/>{Lang.get('profiles.labels.name')}</label>
                                                        <div className="col-md-8">
                                                            <div className="row">
                                                                <div className="col-md-10">
                                                                    <Select onChange={(e)=>this.handleSelect(e,'profile')} value={this.state.form.profile}
                                                                            options={this.state.form.nas === null ? [] : this.state.form.type === null ? [] : this.props.profiles.filter((f) => f.meta.nas !== null && f.meta.nas.id === this.state.form.nas.value && f.meta.type === this.state.form.type.value && ! f.meta.additional)}
                                                                            isLoading={this.props.loadings.profiles}
                                                                            className="text-xs"
                                                                            styles={FormControlSMReactSelect}
                                                                            isDisabled={this.state.loading || this.props.loadings.profiles || this.state.form.type === null || this.state.form.nas === null}
                                                                            placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('profiles.labels.menu')})}
                                                                            noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('profiles.labels.menu')})}/>
                                                                </div>
                                                                <div className="col-md-2">
                                                                    {this.state.form.nas === null ? null :
                                                                        this.state.form.profile === null ?
                                                                            this.props.privilege !== null && typeof this.props.privilege.profiles !== 'undefined' && this.props.privilege.profiles.create && ! this.state.loading && ! this.props.loadings.profiles &&
                                                                                <Tooltip title={Lang.get('labels.create.label',{Attribute:Lang.get('profiles.labels.menu')})}>
                                                                                    <button onClick={()=>this.toggleProfile(null,false)} type="button" className="btn btn-sm btn-outline-primary text-xs"><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                                                </Tooltip>
                                                                            :
                                                                            this.props.privilege !== null && typeof this.props.privilege.profiles !== 'undefined' && this.props.privilege.profiles.update && ! this.state.loading && ! this.props.loadings.profiles &&
                                                                                <Tooltip title={Lang.get('labels.update.label',{Attribute:Lang.get('profiles.labels.menu')})}>
                                                                                    <button onClick={()=>this.toggleProfile(this.state.form.profile,false)} type="button" className="btn btn-sm btn-outline-info text-xs"><FontAwesomeIcon icon={faPencilAlt} size="sm"/></button>
                                                                                </Tooltip>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {this.state.form.profile === null ? null :
                                                        <React.Fragment>
                                                            <div className="form-group row">
                                                                <label className="col-md-4 text-xs col-form-label">{Lang.get('profiles.labels.price')}</label>
                                                                <div className="col-md-4">
                                                                    <div className="form-control form-control-sm text-xs">
                                                                        {this.state.form.profile.meta.price === 0 ?
                                                                            <span className="badge badge-success">FREE</span>
                                                                            :
                                                                            FormatPrice(this.state.form.profile.meta.price)
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="form-group row">
                                                                <label className="col-md-4 text-xs col-form-label">{Lang.get('profiles.labels.validity.rate')}</label>
                                                                <div className="col-md-4">
                                                                    <div className="form-control form-control-sm text-xs">
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
                                                        </React.Fragment>
                                                    }
                                                </div>
                                                <div className="col-md-6">
                                                    {this.state.form.profile === null ? null :
                                                        <div className="card card-outline card-info">
                                                            <div className="card-body">
                                                                {this.state.form.profile.meta.pool !== null &&
                                                                    <React.Fragment>
                                                                        <div className="form-group row">
                                                                            <label className="col-form-label col-md-3 text-xs">{Lang.get('labels.name',{Attribute:Lang.get('nas.pools.labels.menu')})}</label>
                                                                            <div className="col-md-9">
                                                                                <div className="form-control-sm form-control text-xs">{this.state.form.profile.meta.pool.name}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="form-group row">
                                                                            <label className="col-form-label col-md-3 text-xs">{Lang.get('labels.range',{Attribute:Lang.get('nas.pools.labels.menu')})}</label>
                                                                            <div className="col-md-9">
                                                                                <div className="form-control form-control-sm text-xs">{`${this.state.form.profile.meta.pool.first_address} - ${this.state.form.profile.meta.pool.last_address}`}</div>
                                                                            </div>
                                                                        </div>
                                                                    </React.Fragment>
                                                                }
                                                                <div className="form-group row">
                                                                    <div className="col-md-12">
                                                                        <DetailBandwidth data={this.state.form.profile}/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>

                                            {! this.state.form.is_voucher &&
                                                <React.Fragment>
                                                    <div className="form-group row">
                                                        <label className="col-md-2 text-xs col-form-label" htmlFor="input-name"><LabelRequired/>{Lang.get('customers.labels.name')}</label>
                                                        <div className="col-md-10">
                                                            <input id="input-name" className="form-control form-control-sm text-xs" disabled={this.state.loading} value={this.state.form.name} onChange={this.handleChange} name="name" placeholder={Lang.get('customers.labels.name')}/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-md-2 col-form-label text-xs" htmlFor="input-email">{Lang.get('customers.labels.address.email')}</label>
                                                        <div className="col-md-4">
                                                            <input type="email" id="input-email" className="form-control form-control-sm text-xs" value={this.state.form.email} name="email" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('customers.labels.address.email')}/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-md-2 col-form-label text-xs" htmlFor="input-phone">{Lang.get('customers.labels.address.phone')}</label>
                                                        <div className="col-md-4">
                                                            <PhoneInput placeholder={Lang.get('customers.labels.address.phone')}
                                                                        inputClass="form-control form-control-sm text-xs" country="id"
                                                                        enableSearch={true} disabled={this.state.loading}
                                                                        localization={id}
                                                                        value={this.state.form.phone} onChange={(e)=>{ let form = this.state.form; form.phone = e; this.setState({form});}}/>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            }

                                            <div className="form-group row">
                                                <label className="col-md-2 col-form-label text-xs" htmlFor="input-username"><LabelRequired/>{Lang.get('customers.labels.username.label')}</label>
                                                <div className="col-md-4">
                                                    <input id="input-username" className="form-control form-control-sm text-xs" value={this.state.form.username} name="username" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('customers.labels.username.label')}/>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-md-2 col-form-label text-xs" htmlFor="input-password"><LabelRequired/>{Lang.get('customers.labels.password.label')}</label>
                                                <div className="col-md-4">
                                                    <input id="input-password" className="form-control form-control-sm text-xs" value={this.state.form.password} name="password" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('customers.labels.password.label')}/>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="tab-pane fade p-0" id="custom-tabs-three-service" role="tabpanel" aria-labelledby="custom-tabs-three-service-tab">
                                            <div className="mb-3">
                                                <button type="button" disabled={this.state.loading} onClick={this.handleAddAdditional} className="btn btn-outline-primary btn-sm"><FontAwesomeIcon icon={faPlus} className="mr-1"/> {Lang.get('labels.add.label',{Attribute:Lang.get('labels.additional.true',{Attribute:Lang.get('profiles.labels.menu')})})}</button>
                                                {this.props.privilege === null ? null :
                                                    typeof this.props.privilege.profiles === 'undefined' ? null :
                                                        this.props.privilege.profiles.create &&
                                                            <button disabled={this.state.loading || this.props.loadings.profiles} type="button" className="ml-1 btn btn-outline-info btn-sm text-xs" onClick={()=>this.toggleProfile(null,true)}><FontAwesomeIcon icon={faPlusCircle} size="sm" className="mr-1"/>{Lang.get('labels.create.label',{Attribute:Lang.get('labels.additional.true',{Attribute:Lang.get('profiles.labels.menu')})})}</button>
                                                }
                                            </div>
                                            <table className="table table-sm table-striped mb-0">
                                                <thead>
                                                <tr>
                                                    <th className="align-middle text-center text-xs" width={30}><FontAwesomeIcon icon={faTrashAlt}/></th>
                                                    <th className="align-middle text-xs" width={100}>{Lang.get('customers.labels.service.type')}</th>
                                                    <th colSpan={3} className="align-middle text-xs">{Lang.get('customers.labels.service.name')}</th>
                                                    <th className="align-middle text-xs" width={150}>{Lang.get('customers.labels.service.price')}</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {this.state.form.profile === null ? null :
                                                    <tr>
                                                        <td className="align-middle text-center text-xs"><FontAwesomeIcon icon={faTrashAlt}/></td>
                                                        <td className="align-middle text-center text-xs">{Lang.get('customers.labels.service.main')}</td>
                                                        <td colSpan={3} className="align-middle text-xs">{this.state.form.profile.label}</td>
                                                        <td className="align-middle text-xs">
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
                                                    <tr><td colSpan={6} className="align-middle text-xs text-center">{Lang.get('customers.labels.service.not_found')}</td></tr>
                                                    :
                                                    this.state.form.services.current.map((item,index)=>
                                                        <tr key={`sv_${index}`}>
                                                            <td className="align-middle text-xs text-center">
                                                                <button type="button" className="btn btn-outline-warning btn-xs" disabled={this.state.loading} onClick={()=>this.handleRemoveAdditional(index)}><FontAwesomeIcon size="xs" icon={faTrashAlt}/></button>
                                                            </td>
                                                            <td className="align-middle text-xs text-center">{Lang.get('customers.labels.service.add')}</td>
                                                            <td colSpan={3} className="align-middle">
                                                                <Select options={this.props.profiles.filter((f) => f.meta.additional)}
                                                                        value={item.package}
                                                                        styles={FormControlSMReactSelect}
                                                                        placeholder={Lang.get('customers.labels.service.select.label')}
                                                                        noOptionsMessage={()=>Lang.get('customers.labels.service.select.not_found')}
                                                                        onChange={(e)=>this.handleSelect(e,'package',index)}
                                                                        isDisabled={this.state.loading || this.props.loadings.profiles} isLoading={this.props.loadings.profiles}/>
                                                            </td>
                                                            <td className="align-middle text-xs text-right">
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
                                                    <th className="align-middle text-xs text-right" colSpan={5}>{Lang.get('customers.labels.service.subtotal.label')}</th>
                                                    <th className="align-middle">
                                                        <span className="float-left align-middle">Rp.</span>
                                                        <span className="float-right align-middle">{formatLocaleString(sumCustomerSubtotalForm(this.state.form))}</span>
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th className="align-middle text-xs text-right" colSpan={3}>
                                                        {Lang.get('customers.labels.service.taxes.label')}
                                                        <button title={Lang.get('customers.labels.service.taxes.add')} type="button" className="btn btn-tool" disabled={this.state.loading} onClick={this.handleAddTax}><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                    </th>
                                                    <th width={150} className="text-xs align-middle">
                                                        <Select onChange={(e)=>this.handleSelect(e,'taxes',0)}
                                                                styles={FormControlSMReactSelect}
                                                                isClearable value={this.state.form.taxes.current.length === 0 ? null : this.state.form.taxes.current[0].tax} isDisabled={this.state.loading || this.props.loadings.taxes} isLoading={this.props.loadings.taxes} options={this.props.taxes} placeholder={Lang.get('customers.labels.service.taxes.select.label')} noOptionsMessage={()=>Lang.get('customers.labels.service.taxes.select.not_found')}/>
                                                    </th>
                                                    <th width={150} className="align-middle text-xs text-right">
                                                        {this.state.form.taxes.current.length === 0 ? '-' :
                                                            this.state.form.taxes.current[0].tax === null ?
                                                                '-'
                                                                :
                                                                `${this.state.form.taxes.current[0].tax.meta.percent}%`
                                                        }
                                                    </th>
                                                    <th className="align-middle text-xs text-right">
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
                                                                    <th className="align-middle text-xs text-right" colSpan={3}>
                                                                        {Lang.get('customers.labels.service.taxes.label')} #{index+1}
                                                                        <button title={Lang.get('customers.labels.service.taxes.add')} type="button" className="btn btn-tool" disabled={this.state.loading} onClick={this.handleAddTax}><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                                    </th>
                                                                    <th width={150} className="text-xs align-middle">
                                                                        <Select onChange={(e)=>this.handleSelect(e,'taxes',index)}
                                                                                isClearable
                                                                                value={item.tax}
                                                                                isDisabled={this.state.loading || this.props.loadings.taxes} isLoading={this.props.loadings.taxes} options={this.props.taxes} placeholder={Lang.get('customers.labels.service.taxes.select.label')} noOptionsMessage={()=>Lang.get('customers.labels.service.taxes.select.not_found')}/>
                                                                    </th>
                                                                    <th width={100} className="align-middle text-xs text-right">
                                                                        {item.tax === null ? '-' : `${item.tax.meta.percent}%` }
                                                                    </th>
                                                                    <th className="align-middle text-xs text-right">
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
                                                            <th className="align-middle text-xs text-right" colSpan={5}>{Lang.get('customers.labels.service.taxes.subtotal')}</th>
                                                            <th className="align-middle text-xs text-right">
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
                                                    <th className="align-middle text-xs text-right" colSpan={4}>
                                                        {Lang.get('customers.labels.service.discount.label')}
                                                        <button type="button" title={Lang.get('customers.labels.service.discount.add')} className="btn btn-tool" onClick={this.handleAddDiscount}><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                    </th>
                                                    <th className="align-middle">
                                                        <Select onChange={(e)=>this.handleSelect(e,'discount',0)} value={this.state.form.discounts.current.length === 0 ? null : this.state.form.discounts.current[0].discount} options={this.props.discounts} isLoading={this.props.loadings.discounts} isDisabled={this.state.loading} placeholder={Lang.get('customers.labels.service.discount.select.label')} noOptionsMessage={()=>Lang.get('customers.labels.service.discount.select.not_found')} isClearable/>
                                                    </th>
                                                    <th className="align-middle text-xs text-right">
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
                                                                    <th colSpan={4} className="align-middle text-xs text-right">
                                                                        {Lang.get('customers.labels.service.discount.label')}
                                                                        <button type="button" title={Lang.get('customers.labels.service.discount.add')} className="btn btn-tool" onClick={this.handleAddDiscount}><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                                    </th>
                                                                    <th className="align-middle text-xs">
                                                                        <Select styles={FormControlSMReactSelect} onChange={(e)=>this.handleSelect(e,'discount', index)} value={item.discount} options={this.props.discounts} isLoading={this.props.loadings.discounts} isDisabled={this.state.loading} placeholder={Lang.get('customers.labels.service.discount.select.label')} noOptionsMessage={()=>Lang.get('customers.labels.service.discount.select.not_found')} isClearable/>
                                                                    </th>
                                                                    <th className="align-middle text-xs text-right">
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
                                                            <th colSpan={5} className="align-middle text-xs text-right">
                                                                {Lang.get('customers.labels.service.discount.subtotal')}
                                                            </th>
                                                            <th className="align-middle text-xs text-right">
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
                                                    <th className="align-middle text-right text-xs text-success" colSpan={5}>{Lang.get('customers.labels.service.grand_total.label')}</th>
                                                    <th className="align-middle text-right text-xs text-success">{sumGrandTotalForm(this.state.form)}</th>
                                                </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        <div className="tab-pane fade" id="custom-tabs-three-address" role="tabpanel" aria-labelledby="custom-tabs-three-address-tab">
                                            <div className="form-group row">
                                                <label className="col-md-2 text-xs col-form-label" htmlFor="input-address">{Lang.get('customers.labels.address.street')}</label>
                                                <div className="col-md-10">
                                                    <textarea id="input-address" style={{resize:'none'}} className="form-control text-xs form-control-sm" disabled={this.state.loading} value={this.state.form.address} onChange={this.handleChange} name="address" placeholder={Lang.get('customers.labels.address.street')}/>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-md-2 col-form-label text-xs">{Lang.get('regions.village.label')}</label>
                                                <div className="col-md-4">
                                                    <Select onChange={(e)=>this.handleSelectRegion(e,'village')}
                                                            value={this.state.form.village}
                                                            components={{Option:VillageComponent}}
                                                            menuPlacement="top" maxMenuHeight={150}
                                                            options={this.state.regions.villages.select}
                                                            isLoading={this.state.regions.villages.loading}
                                                            onInputChange={(e)=>this.handleSearchRegions(e,'villages')}
                                                            onMenuClose={()=>this.onSelectClose('villages')}
                                                            isDisabled={this.state.loading}
                                                            placeholder={<small>{Lang.get('labels.select.option',{ Attribute : Lang.get('regions.village.label')})}</small>}
                                                            noOptionsMessage={()=>Lang.get('labels.select.not_found',{ Attribute : Lang.get('regions.village.label')})}
                                                            styles={FormControlSMReactSelect}
                                                            className="text-xs"/>
                                                </div>
                                                <label className="col-md-2 col-form-label text-xs">{Lang.get('regions.district.label')}</label>
                                                <div className="col-md-4">
                                                    <Select onChange={(e)=>this.handleSelectRegion(e,'district')}
                                                            value={this.state.form.district} cacheOptions
                                                            options={this.state.regions.districts.select}
                                                            isLoading={this.state.regions.districts.loading}
                                                            onInputChange={(e)=>this.handleSearchRegions(e,'districts')}
                                                            onMenuClose={()=>this.onSelectClose('districts')}
                                                            isDisabled={true}
                                                            placeholder={<small>{Lang.get('labels.select.option',{Attribute : Lang.get('regions.district.label')})}</small>}
                                                            noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute : Lang.get('regions.district.label')})}
                                                            styles={FormControlSMReactSelect}
                                                            className="text-xs"/>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-md-2 col-form-label text-xs">{Lang.get('regions.city.label')}</label>
                                                <div className="col-md-4">
                                                    <Select onChange={(e)=>this.handleSelectRegion(e,'city')}
                                                            value={this.state.form.city} cacheOptions
                                                            options={this.state.regions.cities.select}
                                                            isLoading={this.state.regions.cities.loading}
                                                            onInputChange={(e)=>this.handleSearchRegions(e,'cities')}
                                                            onMenuClose={()=>this.onSelectClose('cities')}
                                                            isDisabled={true}
                                                            placeholder={<small>{Lang.get('labels.select.option',{Attribute : Lang.get('regions.city.label')})}</small>}
                                                            noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute : Lang.get('regions.city.label')})}
                                                            styles={FormControlSMReactSelect}
                                                            className="text-xs"/>
                                                </div>
                                                <label className="col-md-2 col-form-label">{Lang.get('regions.province.label')}</label>
                                                <div className="col-md-4">
                                                    <Select onChange={(e)=>this.handleSelectRegion(e,'province')}
                                                            value={this.state.form.province} cacheOptions
                                                            options={this.state.regions.provinces.select}
                                                            isLoading={this.state.regions.provinces.loading}
                                                            onInputChange={(e)=>this.handleSearchRegions(e,'provinces')}
                                                            onMenuClose={()=>this.onSelectClose('provinces')}
                                                            isDisabled={true}
                                                            placeholder={<small>{Lang.get('labels.select.option',{Attribute : Lang.get('regions.province.label')})}</small>}
                                                            noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute : Lang.get('regions.province.label')})}
                                                            styles={FormControlSMReactSelect}
                                                            className="text-xs"/>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-md-2 col-form-label text-xs" htmlFor="input-postal">{Lang.get('customers.labels.address.postal')}</label>
                                                <div className="col-md-2">
                                                    <input className="form-control form-control-sm text-xs" value={this.state.form.postal} name="postal" id="input-postal" disabled={this.state.loading} placeholder={Lang.get('customers.labels.address.postal')} onChange={this.handleChange}/>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>

                        </DialogContent>
                        <ModalFooter
                            form={this.state.form} handleClose={()=>this.props.handleClose()}
                            loading={this.state.loading || this.props.loadings.nas || this.props.loadings.provinces || this.props.loadings.profiles}
                            pendings={{create:Lang.get('labels.create.pending',{Attribute:Lang.get('customers.labels.menu')}),update:Lang.get('labels.update.pending',{Attribute:Lang.get('customers.labels.menu')})}}
                            langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('customers.labels.menu')}),update:Lang.get('labels.update.label',{Attribute:Lang.get('customers.labels.menu')})}}/>
                    </form>
                </Dialog>
            </React.Fragment>
        )
    }
}

export default FormCustomer;
