import React from "react";
import {Dialog, DialogContent} from "@mui/material";
import {showError, showSuccess} from "../../../../Components/Toaster";
import {crudCompany} from "../../../../Services/CompanyService";
import {
    durationType,
    formatLocaleString, FormControlSMReactSelect,
    grandTotalCompanyForm,
    parseInputFloat, responseMessage, subtotalAfterTaxFormCompany, subtotalDiscountFormCompany,
    subtotalFormCompany,
    subtotalTaxFormCompany,
    sumTaxCompanyPackageForm
} from "../../../../Components/mixedConsts";
import { NumericFormat } from 'react-number-format';
import {ModalFooter, ModalHeader} from "../../../../Components/ModalComponent";
import AsyncSelect from 'react-select/async';
import {allProvinces, searchRegions} from "../../../../Services/RegionService";
import Select from "react-select";
import {VillageComponent} from "./Mixed";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
import {FormatPrice} from "../../../Client/Customer/Tools/Mixed";
import FormPackage from "../Package/Tools/FormPackage";

// noinspection DuplicatedCode,JSCheckFunctionSignatures,JSUnresolvedVariable,CommaExpressionJS
class FormCompany extends React.Component {
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
                id : null, packages : [], email : '', name : '', address : '', discounts : [],
                postal : '', village : null, district : null, city : null, province : null,
                phone : '', deleted : [], taxes : [],
                delete_taxes : [], delete_discounts : [],
            },
            modal : { open : false, data : null },
        };
        this.timer = null;
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelectRegion = this.handleSelectRegion.bind(this);
        this.handleAddPackage = this.handleAddPackage.bind(this);
        this.handleDeletePackage = this.handleDeletePackage.bind(this);
        this.handleSelectTable = this.handleSelectTable.bind(this);
        this.handleCheckOTP = this.handleCheckOTP.bind(this);
        this.handleAddTax = this.handleAddTax.bind(this);
        this.handleSelectTax = this.handleSelectTax.bind(this);
        this.handleRemoveTax = this.handleRemoveTax.bind(this);
        this.handleAddDiscount = this.handleAddDiscount.bind(this);
        this.handleRemoveDiscount = this.handleRemoveDiscount.bind(this);
        this.handleSelectDiscount = this.handleSelectDiscount.bind(this);
        this.handleSearchRegions = this.handleSearchRegions.bind(this);
        this.loadRegions = this.loadRegions.bind(this);
        this.onSelectClose = this.onSelectClose.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        if (! props.open) {
            form.id = null, form.packages = [], form.email = '', form.name = '', form.address = '', form.discounts = [],
                form.taxes = [], form.delete_taxes = [], form.delete_discounts = [],
                form.postal = '', form.village = null, form.district = null, form.city = null, form.province = null,
                form.phone = '', form.deleted = [];
        } else {
            form.packages = [];
            if (props.data !== null) {
                form.id = props.data.value, form.name = props.data.label, form.address = props.data.meta.address.street,
                    form.phone = props.data.meta.address.phone, form.email = props.data.meta.address.email,
                    form.postal = props.data.meta.address.postal, form.discounts = [], form.taxes = [],
                    form.delete_taxes = [], form.delete_discounts = [];
                if (props.data.meta.discounts.length > 0) {
                    props.data.meta.discounts.map((item)=>{
                        item.meta.discount.meta.label = item.meta.discount.label;
                        item.meta.discount.label = item.meta.discount.meta.code;
                        form.discounts.push({value:item.value,discount:item.meta.discount});
                    });
                }
                if (props.data.meta.taxes.length > 0) {
                    props.data.meta.taxes.map((item)=>{
                        item.meta.tax.meta.label = item.meta.tax.label;
                        item.meta.tax.label = item.meta.tax.meta.code;
                        form.taxes.push({value:item.value,tax:item.meta.tax});
                    })
                }
                if (props.data.meta.address.village !== null) {
                    this.handleSearchRegions(props.data.meta.address.village.name,'villages',true,props.data.meta.address.village.code);
                }
                if (props.provinces.length > 0) {
                    if (props.data.meta.address.province !== null) {
                        let index = props.provinces.findIndex((f) => f.value === props.data.meta.address.province.code);
                        if (index >= 0) {
                            form.province = props.provinces[index];
                            if (props.data.meta.address.city !== null && form.province.meta.cities.length > 0) {
                                index = form.province.meta.cities.findIndex((f) => f.value === props.data.meta.address.city.code);
                                if (index >= 0) {
                                    form.city = form.province.meta.cities[index];
                                    if (props.data.meta.address.district !== null && form.city.meta.districts.length > 0) {
                                        index = form.city.meta.districts.findIndex((f) => f.value === props.data.meta.address.district.code);
                                        if (index >= 0) {
                                            form.district = form.city.meta.districts[index];
                                            if (props.data.meta.address.village !== null && form.district.meta.villages.length > 0) {
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
                if (props.packages.length > 0) {
                    let indexPackage = -1;
                    props.data.meta.packages.map((item)=>{
                        if (item.meta.package !== null) {
                            indexPackage = props.packages.findIndex((f) => f.value === item.meta.package.value);
                            if (indexPackage >= 0) {
                                let durType = null;
                                let durIndex = durationType.findIndex((f) => f.value === item.meta.duration.type);
                                if (durIndex >= 0) {
                                    durType = durationType[durIndex];
                                }
                                form.packages.push({
                                    package : props.packages[indexPackage],
                                    value : item.value,
                                    qty : item.meta.qty,
                                    otp : item.meta.duration.otp,
                                    duration_type : durType,
                                    duration_amount : item.meta.duration.amount,
                                });
                            }
                        }
                    });
                }
            } else {
                this.handleAddPackage();
            }
        }
        this.setState({form});
    }
    toggleModal(data = null) {
        let modal = this.state.modal;
        modal.open = ! this.state.modal.open;
        modal.data = null; this.setState({modal});
    }
    handleAddDiscount() {
        if (this.props.discounts.length === 0) {
            showError(Lang.get('discounts.labels.not_found'));
        } else {
            let form = this.state.form;
            form.discounts.push({value:null,discount:this.props.discounts[0]});
            this.setState({form});
        }
    }
    handleSelectDiscount(event, index) {
        let form = this.state.form;
        form.discounts[index].discount = event; this.setState({form});
    }
    handleRemoveDiscount(index) {
        let form = this.state.form;
        if (form.discounts[index].value !== null) {
            form.delete_discounts.push(form.discounts[index].value);
        }
        form.discounts.splice(index,1);
        this.setState({form});
    }
    handleSelectTax(event, index) {
        let form = this.state.form;
        form.taxes[index].tax = event; this.setState({form});
    }
    handleCheckOTP(event) {
        if (event.currentTarget.getAttribute('data-index') !== null) {
            let index = parseInt(event.currentTarget.getAttribute('data-index'));
            if (index >= 0) {
                let form = this.state.form;
                form.packages[index].otp = ! this.state.form.packages[index].otp;
                this.setState({form});
            }
        }
    }
    handleAddTax(){
        if (this.props.taxes.length === 0) {
            showError(Lang.get('taxes.labels.not_found'));
        } else {
            let form = this.state.form;
            form.taxes.push({value:null,tax:this.props.taxes[0]});
            this.setState({form});
        }
    }
    handleRemoveTax(index) {
        let form = this.state.form;
        if (form.taxes[index].value !== null) {
            form.delete_taxes.push(form.taxes[index].value);
        }
        form.taxes.splice(index,1); this.setState({form});
    }
    handleSelectTable(event, name, index) {
        let form = this.state.form;
        if (name === 'package') {
            form.packages[index].package = event;
        }
        this.setState({form});
    }
    handleDeletePackage(index) {
        let form = this.state.form;
        if (form.packages[index].value !== null) {
            form.deleted.push(form.packages[index].value);
        }
        form.packages.splice(index, 1);
        this.setState({form});
    }
    handleAddPackage() {
        let form = this.state.form;
        form.packages.push({
            package : null,
            value : null,
            qty : 1,
            otp : false,
            duration_type : durationType[4],
            duration_amount : 1,
        });
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        if (event.currentTarget.name === 'qty') {
            let index = parseInt(event.currentTarget.getAttribute('data-index'));
            if (index >= 0) {
                form.packages[index][event.currentTarget.name] = parseInputFloat(event);
            }
        } else {
            form[event.currentTarget.name] = event.currentTarget.value;
        }
        this.setState({form});
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
    onSelectClose(type) {
        let regions = this.state.regions;
        regions[type].loading = false;
        this.setState({regions});
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
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            if (this.state.form.id !== null) formData.append('id', this.state.form.id);
            formData.append(Lang.get('companies.form_input.name'), this.state.form.name);
            formData.append(Lang.get('companies.form_input.address'), this.state.form.address);
            formData.append(Lang.get('companies.form_input.email'), this.state.form.email);
            if (this.state.form.village !== null) formData.append(Lang.get('regions.village.form_input'), this.state.form.village.value);
            if (this.state.form.district !== null) formData.append(Lang.get('regions.district.form_input'), this.state.form.district.value);
            if (this.state.form.city !== null) formData.append(Lang.get('regions.city.form_input'), this.state.form.city.value);
            if (this.state.form.province !== null) formData.append(Lang.get('regions.province.form_input'), this.state.form.province.value);
            formData.append(Lang.get('companies.form_input.phone'), this.state.form.phone);
            formData.append(Lang.get('companies.form_input.postal'), this.state.form.postal);
            this.state.form.packages.map((item, index) => {
                if (index === 0) {
                    if (item.package !== null) formData.append(Lang.get('companies.packages.form_input.main_package'), item.package.value);
                } else {
                    if (item.package !== null) {
                        if (item.value !== null) formData.append(`${Lang.get('companies.packages.form_input.additional')}[${index}][${Lang.get('companies.packages.form_input.id')}]`, item.value);
                        formData.append(`${Lang.get('companies.packages.form_input.additional')}[${index}][${Lang.get('companies.packages.form_input.name')}]`, item.package.value);
                        formData.append(`${Lang.get('companies.packages.form_input.additional')}[${index}][${Lang.get('companies.packages.form_input.otp')}]`, item.otp ? 1 : 0);
                        formData.append(`${Lang.get('companies.packages.form_input.additional')}[${index}][${Lang.get('companies.packages.form_input.qty')}]`, item.qty);
                    }
                }
            });
            this.state.form.deleted.map((item,index)=>{
                formData.append(`${Lang.get('companies.packages.form_input.additional_deleted')}[${index}]`, item);
            });
            this.state.form.taxes.map((item,index)=>{
                if (item.value !== null) formData.append(`${Lang.get('companies.form_input.taxes.array_input')}[${index}][${Lang.get('companies.form_input.taxes.id')}]`, item.value);
                if (item.tax !== null) formData.append(`${Lang.get('companies.form_input.taxes.array_input')}[${index}][${Lang.get('companies.form_input.taxes.name')}]`, item.tax.value);
            });
            this.state.form.delete_taxes.map((item,index)=>{
                formData.append(`${Lang.get('companies.form_input.taxes.array_delete')}[${index}]`, item);
            });
            this.state.form.discounts.map((item,index)=>{
                if (item.value !== null) formData.append(`${Lang.get('companies.form_input.discounts.array_input')}[${index}][${Lang.get('companies.form_input.discounts.id')}]`, item.value);
                if (item.discount !== null) formData.append(`${Lang.get('companies.form_input.discounts.array_input')}[${index}][${Lang.get('companies.form_input.discounts.name')}]`, item.discount.value);
            });
            this.state.form.delete_discounts.map((item,index)=>{
                formData.append(`${Lang.get('companies.form_input.discounts.array_delete')}[${index}]`, item);
            })
            formData.append(Lang.get('companies.form_input.grand_total'), grandTotalCompanyForm(this.state.form));
            let response = await crudCompany(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
                this.props.handleUpdate(response.data.params);
                this.props.handleClose();
            }
        } catch (e) {
            this.setState({loading:false});
            showError(e.response.data.message);
        }
    }
    render() {
        return (
            <React.Fragment>
                <FormPackage open={this.state.modal.open} data={this.state.modal.data} handleClose={this.toggleModal} handleUpdate={this.props.onUpdatePackages}/>
                <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                    <form onSubmit={this.handleSave}>
                        <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('companies.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('companies.labels.menu')})}}/>
                        <DialogContent dividers>
                            <div className="form-group row">
                                <label className="col-md-2 col-form-label text-xs" htmlFor="inputName">{Lang.get('companies.labels.name')}</label>
                                <div className="col-md-10">
                                    <input id="inputName" disabled={this.state.loading} onChange={this.handleChange} name="name" value={this.state.form.name} className="form-control form-control-sm text-xs" placeholder={Lang.get('companies.labels.name')}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-md-2 col-form-label text-xs" htmlFor="inputEmail">{Lang.get('companies.labels.email')}</label>
                                <div className="col-md-4">
                                    <input className="form-control form-control-sm text-xs" disabled={this.state.loading} value={this.state.form.email} id="inputEmail" name="email" placeholder={Lang.get('companies.labels.email')} onChange={this.handleChange}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-md-2 col-form-label text-xs" htmlFor="inputPhone">{Lang.get('companies.labels.phone')}</label>
                                <div className="col-md-4">
                                    <input className="form-control form-control-sm text-xs" disabled={this.state.loading} name="phone" id="inputPhone" value={this.state.form.phone} placeholder={Lang.get('companies.labels.phone')} onChange={this.handleChange}/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-md-2 col-form-label text-xs" htmlFor="inputAddress">{Lang.get('companies.labels.address')}</label>
                                <div className="col-md-10">
                                    <textarea rows={2} onChange={this.handleChange} id="inputAddress" className="form-control form-control-sm text-xs" disabled={this.state.loading} value={this.state.form.address} name="address" placeholder={Lang.get('companies.labels.address')} style={{resize:'none'}}/>
                                </div>
                            </div>

                            <div className="form-group row">
                                <label className="col-md-2 col-form-label text-xs">{Lang.get('regions.village.label')}</label>
                                <div className="col-md-4">
                                    <Select onChange={(e)=>this.handleSelectRegion(e,'village')}
                                            value={this.state.form.village}
                                            components={{Option:VillageComponent}}
                                            maxMenuHeight={200}
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
                                <label className="col-md-2 col-form-label text-xs" htmlFor="inputPostal">{Lang.get('companies.labels.postal')}</label>
                                <div className="col-md-2">
                                    <input onChange={this.handleChange} className="form-control form-control-sm text-xs" disabled={this.state.loading || this.props.loadings.provinces} value={this.state.form.postal} name="postal" id="inputPostal" placeholder={Lang.get('companies.labels.postal')}/>
                                </div>
                            </div>

                            <div className="card card-outline card-primary mt-4">
                                <div className="card-header">
                                    <h3 className="card-title text-xs">
                                        {Lang.get('companies.packages.labels.menu')}
                                    </h3>
                                    <div className="card-tools">
                                        {this.props.privilege !== null &&
                                            this.props.privilege.packages !== null &&
                                                this.props.privilege.packages.create &&
                                                    <button onClick={this.toggleModal} type="button" className="btn btn-outline-info btn-sm text-xs mr-1" disabled={this.state.loading}><FontAwesomeIcon icon={faPlus} className="mr-1" size="sm"/>{Lang.get('labels.create.label',{Attribute:Lang.get('companies.packages.labels.menu')})}</button>
                                        }
                                        <button onClick={this.handleAddPackage} type="button" className="btn btn-outline-primary btn-sm text-xs" disabled={this.state.loading || this.props.loadings.packages || this.props.loadings.provinces}><i className="fas fa-plus mr-1"/> {Lang.get('companies.packages.labels.add')}</button>
                                    </div>
                                </div>
                                <div className="card-body p-0 table-responsive">
                                    <table className="table table-sm table-striped table-bordered">
                                        <thead>
                                        <tr>
                                            <th className="align-middle text-center pl-2" width={50}>
                                                <FontAwesomeIcon icon={faTrashAlt} size="sm"/>
                                            </th>
                                            <th className="align-middle text-center text-xs">{Lang.get('companies.packages.labels.menu')}</th>
                                            <th width={50} className="align-middle text-center text-xs" title={Lang.get('messages.otp')}>OTP</th>
                                            <th width={100} className="align-middle text-center text-xs">{Lang.get('companies.packages.labels.duration')}</th>
                                            <th width={70} className="align-middle text-center text-xs">{Lang.get('companies.packages.labels.qty')}</th>
                                            <th className="align-middle text-center text-xs" width={120}>{Lang.get('companies.packages.labels.price')}</th>
                                            <th className="align-middle text-center pr-2 text-xs" width={150}>{Lang.get('companies.packages.labels.sub_total')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.form.packages.map((item, index)=>
                                            <tr key={index}>
                                                <td className="align-middle text-center text-xs pl-2">
                                                    {index === 0 ? <i className="fas fa-trash-alt"/> :
                                                        <button className="btn btn-outline-warning btn-sm" type="button" onClick={()=>this.handleDeletePackage(index)} disabled={this.state.loading || this.props.loadings.provinces}>
                                                            <FontAwesomeIcon icon={faTrashAlt} size="sm"/>
                                                        </button>
                                                    }
                                                </td>
                                                <td>
                                                    <Select options={index === 0 ? this.props.packages.filter((f) => ! f.meta.additional) : this.props.packages.filter((f) => f.meta.additional)}
                                                            styles={FormControlSMReactSelect}
                                                            onChange={(e)=>this.handleSelectTable(e,'package',index)}
                                                            value={item.package} className="text-sm" noOptionsMessage={()=>Lang.get('companies.packages.labels.no_select')}
                                                            isLoading={this.props.loadings.packages} placeholder={<small>{Lang.get('companies.packages.labels.select')}</small>}
                                                            isDisabled={this.props.loadings.packages || this.state.loading}/>
                                                </td>
                                                <td className="align-middle text-center text-xs">
                                                    {index === 0 ? <FontAwesomeIcon icon={faTimes}/> :
                                                        <div className="custom-control custom-checkbox">
                                                            <input onChange={this.handleCheckOTP}
                                                                   checked={item.otp} id={`otp_${index}`} data-index={index} data-id={item.value} disabled={this.state.loading} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                            <label htmlFor={`otp_${index}`} className="custom-control-label"/>
                                                        </div>
                                                    }
                                                </td>
                                                <td className="align-middle text-center text-xs">
                                                    {item.package !== null &&
                                                        `${item.package.meta.duration.amount} ${Lang.get(`durations.${durationType[durationType.findIndex((f) => f.value === item.package.meta.duration.string)].value}`)}`
                                                    }
                                                </td>
                                                <td className="align-middle text-center text-xs">
                                                    {index === 0 ? 1 :
                                                        <NumericFormat className="form-control form-control-sm text-center text-sm text-right"
                                                                       value={item.qty} data-index={index}
                                                                       name="qty" onChange={this.handleChange} allowLeadingZeros={false} decimalScale={0} decimalSeparator="," thousandSeparator="."/>
                                                    }
                                                </td>
                                                <td className="align-middle text-right text-xs">
                                                    {item.package !== null &&
                                                        FormatPrice(item.package.meta.prices)
                                                    }
                                                </td>
                                                <td className="align-middle pr-2 text-xs">
                                                    {item.package === null ? null : FormatPrice(item.package.meta.prices * item.qty)}
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                        <tfoot>
                                        <tr>
                                            <th className="align-middle text-right text-xs" colSpan={6}>{Lang.get('companies.packages.labels.sub_total')}</th>
                                            <th className="align-middle text-xs pr-2">
                                                {FormatPrice(subtotalFormCompany(this.state.form))}
                                            </th>
                                        </tr>
                                        {this.state.form.taxes.length === 0 ?
                                            <tr>
                                                <th className="align-middle text-right text-xs" colSpan={6}>{Lang.get('companies.packages.labels.vat')}</th>
                                                <th className="align-middle">
                                                    <button onClick={this.handleAddTax} type="button" disabled={this.state.loading || this.props.loadings.taxes} className="btn-block btn btn-tool text-xs btn-sm">
                                                        <FontAwesomeIcon icon={faPlus} size="sm" className="mr-1"/>
                                                        <small>{Lang.get('taxes.create.button')}</small>
                                                    </button>
                                                </th>
                                            </tr>
                                            :
                                            <>
                                                {
                                                    this.state.form.taxes.map((item,index)=>
                                                        <tr key={index.value === null ? index : item.value}>
                                                            <th className="align-middle text-right text-xs" colSpan={3}>
                                                                {Lang.get('companies.packages.labels.vat')}
                                                                <button onClick={this.handleAddTax} type="button" disabled={this.state.loading} className="btn btn-tool ml-3 btn-xs">
                                                                    <FontAwesomeIcon icon={faPlus} size="sm"/>
                                                                </button>
                                                                <button title={Lang.get('taxes.delete.form_company')} onClick={()=>this.handleRemoveTax(index)} type="button" disabled={this.state.loading} className="btn btn-tool ml-1 btn-xs">
                                                                    <FontAwesomeIcon icon={faTrashAlt} size="sm"/>
                                                                </button>
                                                            </th>
                                                            <th colSpan={2} className="align-middle">
                                                                <Select noOptionsMessage={()=>Lang.get('taxes.labels.not_found')}
                                                                        onChange={(e)=>this.handleSelectTax(e,index)}
                                                                        styles={FormControlSMReactSelect}
                                                                        options={this.props.taxes}
                                                                        isLoading={this.props.loadings.taxes} isDisabled={this.state.loading || this.props.loadings.taxes} value={item.tax}/>
                                                            </th>
                                                            <th className="align-middle text-right text-xs">
                                                                {item.tax === null ? '-' :
                                                                    `${formatLocaleString(item.tax.meta.percent,2)}%`
                                                                }
                                                            </th>
                                                            <th className="align-middle text-xs pr-2">
                                                                {item.tax === null ? '-' :
                                                                    FormatPrice(sumTaxCompanyPackageForm(this.state.form, item))
                                                                }
                                                            </th>
                                                        </tr>
                                                    )
                                                }
                                                <tr>
                                                    <th className="align-middle text-right text-xs" colSpan={6}>{Lang.get('companies.packages.labels.sub_total_vat')}</th>
                                                    <th className="align-middle text-xs pr-2">
                                                        {FormatPrice(subtotalTaxFormCompany(this.state.form))}
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th className="align-middle text-right text-xs" colSpan={6}>{Lang.get('companies.packages.labels.sub_total_after')}</th>
                                                    <th className="align-middle text-xs pr-2">
                                                        {FormatPrice(subtotalAfterTaxFormCompany(this.state.form))}
                                                    </th>
                                                </tr>
                                            </>
                                        }

                                        {this.state.form.discounts.length === 0 ?
                                            <tr>
                                                <th className="align-middle text-right text-xs" colSpan={6}>{Lang.get('companies.packages.labels.discount')}</th>
                                                <th className="align-middle text-xs">
                                                    <button onClick={this.handleAddDiscount} type="button" disabled={this.state.loading || this.props.loadings.discounts} className="btn-block btn btn-tool btn-sm text-xs">
                                                        <FontAwesomeIcon icon={faPlus} className="mr-1" size="xs"/>
                                                        <small>{Lang.get('discounts.create.button')}</small>
                                                    </button>
                                                </th>
                                            </tr>
                                            :
                                            <>
                                                {this.state.form.discounts.map((item,index)=>
                                                    <tr key={item.value === null ? index : item.value}>
                                                        <th className="align-middle text-right text-xs" colSpan={4}>
                                                            {Lang.get('companies.packages.labels.discount')}
                                                            <button onClick={this.handleAddDiscount} type="button" disabled={this.state.loading} className="btn btn-tool ml-3 btn-sm">
                                                                <FontAwesomeIcon icon={faPlus} size="sm"/>
                                                            </button>
                                                            <button title={Lang.get('discounts.delete.form_company')} onClick={()=>this.handleRemoveDiscount(index)} type="button" disabled={this.state.loading} className="btn btn-tool ml-1 btn-sm">
                                                                <FontAwesomeIcon icon={faTrashAlt} size="sm"/>
                                                            </button>
                                                        </th>
                                                        <th colSpan={2} className="align-middle">
                                                            <Select noOptionsMessage={()=>Lang.get('discounts.labels.not_found')}
                                                                    styles={FormControlSMReactSelect}
                                                                    onChange={(e)=>this.handleSelectDiscount(e,index)}
                                                                    options={this.props.discounts} aria-label={item.discount !== null ? item.discount.meta.label : ''}
                                                                    isLoading={this.props.loadings.discounts} isDisabled={this.state.loading || this.props.loadings.discounts} value={item.discount}/>
                                                        </th>
                                                        <th className="align-middle pr-2 text-xs">
                                                            {item.discount === null ? '-' :
                                                                FormatPrice(item.discount.meta.amount)
                                                            }
                                                        </th>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <th className="align-middle text-right text-xs" colSpan={6}>{Lang.get('companies.packages.labels.discount_total')}</th>
                                                    <th className="align-middle text-xs pr-2">
                                                        {FormatPrice(subtotalDiscountFormCompany(this.state.form))}
                                                    </th>
                                                </tr>
                                            </>
                                        }
                                        <tr>
                                            <th className="align-middle text-right text-xs" colSpan={6}>{Lang.get('companies.packages.labels.grand_total')}</th>
                                            <th className="align-middle text-xs pr-2">
                                                {FormatPrice(grandTotalCompanyForm(this.state.form))}
                                            </th>
                                        </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                        </DialogContent>
                        <ModalFooter
                            form={this.state.form} handleClose={()=>this.props.handleClose()}
                            loading={this.state.loading}
                            langs={{create:Lang.get('labels.create.submit',{Attribute:Lang.get('companies.labels.menu')}),update:Lang.get('labels.update.submit',{Attribute:Lang.get('companies.labels.menu')})}}/>
                    </form>
                </Dialog>
            </React.Fragment>
        )
    }
}
export default FormCompany;
