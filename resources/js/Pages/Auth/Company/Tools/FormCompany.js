import React from "react";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {showError, showSuccess} from "../../../../Components/Toaster";
import {crudCompany} from "../../../../Services/CompanyService";
import {durationType} from "../../../../Components/mixedConsts";
import Select from "react-select";
import { NumericFormat } from 'react-number-format';

// noinspection DuplicatedCode,JSCheckFunctionSignatures,JSUnresolvedVariable,CommaExpressionJS
class FormCompany extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, packages : [], email : '', name : '', address : '', discount : 0,
                postal : '', village : null, district : null, city : null, province : null,
                phone : '', deleted : [],
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelectRegion = this.handleSelectRegion.bind(this);
        this.handleAddPackage = this.handleAddPackage.bind(this);
        this.handleDeletePackage = this.handleDeletePackage.bind(this);
        this.handleSelectTable = this.handleSelectTable.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        if (! props.open) {
            form.id = null, form.packages = [], form.email = '', form.name = '', form.address = '', form.discount = 0,
                form.postal = '', form.village = null, form.district = null, form.city = null, form.province = null,
                form.phone = '', form.deleted = [];
        } else {
            form.packages = [];
            if (props.data !== null) {
                form.id = props.data.value, form.name = props.data.label, form.address = props.data.meta.address.street,
                    form.phone = props.data.meta.address.phone, form.email = props.data.meta.address.email,
                    form.postal = props.data.meta.address.postal, form.discount = props.data.meta.discount;
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
                        if (item.package !== null) {
                            indexPackage = props.packages.findIndex((f) => f.value === item.package.value);
                            if (indexPackage >= 0) {
                                form.packages.push({
                                    package : props.packages[indexPackage], value : item.value,
                                    otp : item.every.otp,
                                    duration : {
                                        type : durationType[durationType.findIndex((f) => f.value === item.every.type)],
                                        ammount : item.every.ammount
                                    }
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
            package : this.props.packages.length === 0 ? null : this.props.packages[0],
            value : null,
            otp : false,
            duration : {
                type : durationType[4],
                ammount : 1
            }
        });
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        if (event.currentTarget.getAttribute('name') === 'discount') {
            if (event.currentTarget.value.length > 0) {
                let currentValue = event.currentTarget.value;
                let leftValue;
                let rightValue = 0;
                let decimalValue = currentValue.split(',');
                if (decimalValue.length === 2) {
                    leftValue = decimalValue[0];
                    if (decimalValue[1].length > 0) {
                        rightValue = decimalValue[1];
                    }
                } else {
                    leftValue = currentValue;
                }
                leftValue = leftValue.replaceAll('.','');
                leftValue = parseInt(leftValue);
                if (parseFloat(rightValue) > 0) {
                    form.discount = parseFloat(leftValue + '.' + parseFloat(rightValue));
                } else {
                    form.discount = parseFloat(leftValue);
                }
            }
        } else {
            form[event.currentTarget.getAttribute('name')] = event.currentTarget.value;
        }
        this.setState({form});
    }
    handleSelectRegion(event, name) {
        let form = this.state.form;
        form[name] = event;
        if (name === 'province') {
            if (form.province.meta.cities.length > 0) {
                form.city = form.province.meta.cities[0];
                if (form.city.meta.districts.length > 0) {
                    form.district = form.city.meta.districts[0];
                    if (form.district.meta.villages.length > 0) {
                        form.village = form.district.meta.villages[0];
                        if (form.village !== null) {
                            form.postal = form.village.meta.location.pos === 'NULL' ? '' : form.village.meta.location.pos;
                        }
                    }
                }
            }
        } else if (name === 'city') {
            if (form.city.meta.districts.length > 0) {
                form.district = form.city.meta.districts[0];
                if (form.district.meta.villages.length > 0) {
                    form.village = form.district.meta.villages[0];
                }
            }
        } else if (name === 'district') {
            if (form.district.meta.villages.length > 0) {
                form.village = form.district.meta.villages[0];
            }
        } else if (name === 'village') {
            if (form.village !== null) {
                form.postal = form.village.meta.location.pos === 'NULL' ? '' : form.village.meta.location.pos;
            }
        }
        this.setState({form});
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
            formData.append(Lang.get('companies.packages.form_input.discount'), this.state.form.discount);
            formData.append(Lang.get('companies.form_input.postal'), this.state.form.postal);
            this.state.form.packages.map((item, index) => {
                if (index === 0) {
                    if (item.package !== null) formData.append(Lang.get('companies.packages.form_input.main_package'), item.package.value);
                } else {
                    if (item.package !== null) {
                        if (item.value !== null) formData.append(`${Lang.get('companies.packages.form_input.additional')}[${index}][id]`, item.value);
                        formData.append(`${Lang.get('companies.packages.form_input.additional')}[${index}][${Lang.get('companies.packages.form_input.name')}]`, item.package.value);
                        formData.append(`${Lang.get('companies.packages.form_input.additional')}[${index}][${Lang.get('companies.packages.form_input.otp')}]`, item.otp ? 1 : 0);
                    }
                }
            });
            this.state.form.deleted.map((item,index)=>{
                formData.append(`${Lang.get('companies.packages.form_input.additional_deleted')}[${index}]`, item);
            });
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
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <DialogTitle>
                        <button type="button" className="close float-right" onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <span className="modal-title text-sm">
                            {this.state.form.id === null ?
                                Lang.get('companies.create.form')
                                :
                                Lang.get('companies.update.form')
                            }
                        </span>
                    </DialogTitle>
                    <DialogContent dividers>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputName">{Lang.get('companies.labels.name')}</label>
                            <div className="col-sm-10">
                                <input id="inputName" disabled={this.state.loading} onChange={this.handleChange} name="name" value={this.state.form.name} className="form-control text-sm" placeholder={Lang.get('companies.labels.name')}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputEmail">{Lang.get('companies.labels.email')}</label>
                            <div className="col-sm-4">
                                <input className="form-control text-sm" disabled={this.state.loading} value={this.state.form.email} id="inputEmail" name="email" placeholder={Lang.get('companies.labels.email')} onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputAddress">{Lang.get('companies.labels.address')}</label>
                            <div className="col-sm-10">
                                <textarea onChange={this.handleChange} id="inputAddress" className="form-control text-sm" disabled={this.state.loading} value={this.state.form.address} name="address" placeholder={Lang.get('companies.labels.address')} style={{resize:'none'}}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('regions.village.label')}</label>
                            <div className="col-sm-4">
                                <Select onChange={(e)=>this.handleSelectRegion(e,'village')} value={this.state.form.village} options={this.state.form.district === null ? [] : this.state.form.district.meta.villages} isLoading={this.props.loadings.provinces} isDisabled={this.props.loadings.provinces || this.state.loading} placeholder={<small>{Lang.get('regions.village.select')}</small>} className="text-sm"/>
                            </div>
                            <label className="col-sm-2 col-form-label">{Lang.get('regions.district.label')}</label>
                            <div className="col-sm-4">
                                <Select onChange={(e)=>this.handleSelectRegion(e,'district')} value={this.state.form.district} options={this.state.form.city === null ? [] : this.state.form.city.meta.districts} isLoading={this.props.loadings.provinces} isDisabled={this.props.loadings.provinces || this.state.loading} placeholder={<small>{Lang.get('regions.district.select')}</small>} className="text-sm"/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('regions.city.label')}</label>
                            <div className="col-sm-4">
                                <Select onChange={(e)=>this.handleSelectRegion(e,'city')} value={this.state.form.city} options={this.state.form.province === null ? [] : this.state.form.province.meta.cities} isLoading={this.props.loadings.provinces} isDisabled={this.props.loadings.provinces || this.state.loading} placeholder={<small>{Lang.get('regions.city.select')}</small>} className="text-sm"/>
                            </div>
                            <label className="col-sm-2 col-form-label">{Lang.get('regions.province.label')}</label>
                            <div className="col-sm-4">
                                <Select onChange={(e)=>this.handleSelectRegion(e,'province')} value={this.state.form.province} options={this.props.provinces} isLoading={this.props.loadings.provinces} isDisabled={this.props.loadings.provinces || this.state.loading} placeholder={<small>{Lang.get('regions.province.select')}</small>} className="text-sm"/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputPostal">{Lang.get('companies.labels.postal')}</label>
                            <div className="col-sm-2">
                                <input onChange={this.handleChange} className="form-control text-sm" disabled={this.state.loading || this.props.loadings.provinces} value={this.state.form.postal} name="postal" id="inputPostal" placeholder={Lang.get('companies.labels.postal')}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label" htmlFor="inputPhone">{Lang.get('companies.labels.phone')}</label>
                            <div className="col-sm-4">
                                <input className="form-control text-sm" disabled={this.state.loading} name="phone" id="inputPhone" value={this.state.form.phone} placeholder={Lang.get('companies.labels.phone')} onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="card card-outline card-primary mt-4">
                            <div className="card-header">
                                <h3 className="card-title">
                                    {Lang.get('companies.packages.labels.menu')}
                                </h3>
                                <div className="card-tools">
                                    <button onClick={this.handleAddPackage} type="button" className="btn btn-tool" disabled={this.state.loading || this.props.loadings.packages}><i className="fas fa-plus mr-1"/> {Lang.get('companies.packages.labels.add')} </button>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <table className="table table-sm table-striped table-bordered">
                                    <thead>
                                    <tr>
                                        <th className="align-middle text-center" width={50}>
                                            <i className="fas fa-trash-alt"/>
                                        </th>
                                        <th className="align-middle text-center">{Lang.get('companies.packages.labels.menu')}</th>
                                        <th width={50} className="align-middle text-center" title={Lang.get('messages.otp')}>OTP</th>
                                        <th width={100} className="align-middle text-center">{Lang.get('companies.packages.labels.duration')}</th>
                                        <th className="align-middle text-right" width={120}>{Lang.get('companies.packages.labels.price')}</th>
                                        <th className="align-middle text-center" width={50}>{Lang.get('companies.packages.labels.vat')}</th>
                                        <th className="align-middle text-right" width={120}>{Lang.get('companies.packages.labels.vat_price')}</th>
                                        <th className="align-middle text-right" width={150}>{Lang.get('companies.packages.labels.sub_total')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.state.form.packages.map((item, index)=>
                                        <tr key={index}>
                                            <td className="align-middle text-center">
                                                {index === 0 ?
                                                    <i className="fas fa-trash-alt"/>
                                                    :
                                                    <button className="btn btn-outline-warning btn-sm" type="button" onClick={()=>this.handleDeletePackage(index)} disabled={this.state.loading || this.props.loadings.provinces}>
                                                        <i className="fas fa-trash-alt"/>
                                                    </button>
                                                }
                                            </td>
                                            <td>
                                                <Select options={this.props.packages}
                                                        onChange={(e)=>this.handleSelectTable(e,'package',index)}
                                                        value={item.package} className="text-sm"
                                                        isLoading={this.props.loadings.packages} placeholder={<small>{Lang.get('companies.packages.labels.select')}</small>}
                                                        isDisabled={this.props.loadings.packages || this.state.loading}/>
                                            </td>
                                            <td className="align-middle text-center">
                                                {index === 0 ?
                                                    <span className="fas fa-times text-muted"/>
                                                    :
                                                    <div className="custom-control custom-checkbox">
                                                        <input onChange={()=>{
                                                            let form = this.state.form;
                                                            form.packages[index].otp = ! this.state.form.packages[index].otp; this.setState({form});
                                                        }}
                                                               checked={item.otp} id={`otp_${index}`} data-id={item.value} disabled={this.state.loading} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                        <label htmlFor={`otp_${index}`} className="custom-control-label"/>
                                                    </div>
                                                }
                                            </td>
                                            <td className="align-middle text-center">
                                                {item.package !== null &&
                                                    `${item.package.meta.duration.ammount} ${Lang.get(`durations.${durationType[durationType.findIndex((f) => f.value === item.package.meta.duration.string)].value}`)}`
                                                }
                                            </td>
                                            <td className="align-middle text-right">
                                                {item.package !== null &&
                                                    <span>
                                                        <span className="float-left">Rp.</span>
                                                        <span className="float-right">{parseFloat(item.package.meta.prices.base).toLocaleString('id-ID',{maximumFractionDigits:2})}</span>
                                                    </span>
                                                }
                                            </td>
                                            <td className="align-middle text-right">
                                                {item.package !== null &&
                                                    parseFloat(item.package.meta.prices.percent).toLocaleString('id-ID', {maximumFractionDigits:2}) + '%'
                                                }
                                            </td>
                                            <td className="align-middle text-right">
                                                {item.package !== null &&
                                                    <span>
                                                        <span className="float-left">Rp.</span>
                                                        <span className="float-right">{parseFloat(( item.package.meta.prices.percent * item.package.meta.prices.base ) / 100).toLocaleString('id-ID',{maximumFractionDigits:2})}</span>
                                                    </span>
                                                }
                                            </td>
                                            <td className="align-middle text-right">
                                                {item.package !== null &&
                                                    <span>
                                                        <span className="float-left">Rp.</span>
                                                        <span className="float-right">{parseFloat((( item.package.meta.prices.percent * item.package.meta.prices.base ) / 100) + item.package.meta.prices.base).toLocaleString('id-ID',{maximumFractionDigits:2})}</span>
                                                    </span>
                                                }
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={7}>{Lang.get('companies.packages.labels.sub_total_before')}</th>
                                        <th className="align-middle">
                                            <span className="float-left">Rp.</span>
                                            <span className="float-right">
                                                {parseFloat(this.state.form.packages.reduce((a,b) => b.package === null ? 0 : a + b.package.meta.prices.base ,0 )).toLocaleString('id-ID',{maximumFractionDigits:2})}
                                            </span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={7}>{Lang.get('companies.packages.labels.sub_total_vat')}</th>
                                        <th className="align-middle">
                                            <span className="float-left">Rp.</span>
                                            <span className="float-right">
                                                {parseFloat(this.state.form.packages.reduce((a,b) => b.package === null ? 0 : a + ( ( b.package.meta.prices.percent * b.package.meta.prices.base) / 100 ) ,0 )).toLocaleString('id-ID',{maximumFractionDigits:2})}
                                            </span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={7}>{Lang.get('companies.packages.labels.sub_total_after')}</th>
                                        <th className="align-middle">
                                            <span className="float-left">Rp.</span>
                                            <span className="float-right">
                                                {parseFloat(this.state.form.packages.reduce((a,b) => b.package === null ? 0 : a + ( ( b.package.meta.prices.percent * b.package.meta.prices.base ) / 100 ) + b.package.meta.prices.base ,0 )).toLocaleString('id-ID',{maximumFractionDigits:2})}
                                            </span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={7}>{Lang.get('companies.packages.labels.discount')}</th>
                                        <th className="align-middle">
                                            <NumericFormat className={(this.state.form.packages.reduce((a,b) => b.package === null ? 0 : a + ( ( b.package.meta.prices.percent * b.package.meta.prices.base ) / 100 ) + b.package.meta.prices.base ,0 )) - this.state.form.discount < 0 ? "form-control form-control-sm text-sm text-right is-invalid" : "form-control form-control-sm text-sm text-right"}
                                                           name="discount" onChange={this.handleChange} allowLeadingZeros={false} value={this.state.form.discount} decimalScale={2} decimalSeparator="," thousandSeparator="."/>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="align-middle text-right" colSpan={7}>{Lang.get('companies.packages.labels.grand_total')}</th>
                                        <th className="align-middle">
                                            <span className="float-left">Rp.</span>
                                            <span className="float-right">
                                                {parseFloat((this.state.form.packages.reduce((a,b) => b.package === null ? 0 : a + ( ( b.package.meta.prices.percent * b.package.meta.prices.base ) / 100 ) + b.package.meta.prices.base ,0 )) - this.state.form.discount).toLocaleString('id-ID',{maximumFractionDigits:0})}
                                            </span>
                                        </th>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions className="justify-content-between">
                        <button type="submit" className="btn btn-success" disabled={this.state.loading || (this.state.form.packages.reduce((a,b) => b.package === null ? 0 : a + ( ( b.package.meta.prices.percent * b.package.meta.prices.base ) / 100 ) + b.package.meta.prices.base ,0 )) - this.state.form.discount < 0}>
                            {this.state.loading ? <i className="fas fa-spin fa-circle-notch mr-1"/> : <i className="fas fa-save mr-1"/> }
                            {this.state.form.id === null ? Lang.get('companies.create.button') : Lang.get('companies.update.button',null, 'id')}
                        </button>
                        <button type="button" className="btn btn-default" disabled={this.state.loading} onClick={()=>this.state.loading ? null : this.props.handleClose()}>
                            <i className="fas fa-times mr-1"/> {Lang.get('messages.close')}
                        </button>
                    </DialogActions>
                </form>
            </Dialog>
        )
    }
}
export default FormCompany;
