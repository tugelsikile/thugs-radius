import React from "react";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLink, faPencilAlt, faPlus} from "@fortawesome/free-solid-svg-icons";
import FormNas from "../Nas/Tools/FormNas";
import Select from "react-select";
import {FormControlSMReactSelect, responseMessage, ucWord} from "../../../Components/mixedConsts";
import FormCustomer from "../Customer/Tools/FormCustomer";
import {crudOltCustomer} from "../../../Services/OltService";
import {showError, showSuccess} from "../../../Components/Toaster";

class FormLinkCustomer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, customer : null,
            },
            modals : {
                customer : { open : false, data : null },
                nas : { open : false, data : null },
                profile : { open : false, data : null },
                pool : { open : false, data : null },
                bandwidth : { open : false, data : null },
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.toggleNas = this.toggleNas.bind(this);
        this.toggleProfile = this.toggleProfile.bind(this);
        this.togglePool = this.togglePool.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.toggleCustomer = this.toggleCustomer.bind(this);
    }
    toggleCustomer(data = null) {
        let modals = this.state.modals;
        modals.customer.open = ! this.state.modals.customer.open;
        modals.customer.data = data;
        this.setState({modals});
    }
    toggleNas( data= null) {
        let modals = this.state.modals;
        modals.nas.open = ! this.state.modals.nas.open;
        modals.nas.data = data;
        this.setState({modals});
    }
    toggleProfile(data = null) {
        let modals = this.state.modals;
        modals.profile.open = ! this.state.modals.profile.open;
        modals.profile.data = data;
        this.setState({modals});
    }
    togglePool(data = null) {
        let modals = this.state.modals;
        modals.pool.open = ! this.state.modals.pool.open;
        modals.pool.data = data;
        this.setState({modals});
    }
    toggleBandwidth(data = null) {
        let modals = this.state.modals;
        modals.bandwidth.open = ! this.state.modals.bandwidth.open;
        modals.bandwidth.data = data;
        this.setState({modals});
    }
    handleSelect(value, name) {
        let form = this.state.form;
        form[name] = value;
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        form[event.target.name] = event.target.value;
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
            formData.append(Lang.get('olt.form_input.onu'), this.props.data.onu);
            formData.append(Lang.get('olt.form_input.id'), this.props.olt.value);
            if (this.state.form.customer !== null) {
                formData.append(Lang.get('customers.form_input.id'), this.state.form.customer.value);
            }
            if (this.state.form.id !== null) formData.append(Lang.get('olt.form_input.customer'), this.state.form.id);
            let response = await crudOltCustomer(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                showSuccess(response.data.message);
                this.props.handleClose();
                this.props.handleUpdate(response.data.params, this.props.data.onu);
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormCustomer privilege={this.props.privilege} loadings={this.props.loadings} type="pppoe" nas={this.props.nas} companies={this.props.companies} open={this.state.modals.customer.open} data={this.state.modals.customer.data} user={JSON.parse(localStorage.getItem('user'))} handleClose={this.toggleCustomer} handleUpdate={this.props.onCustomer} profiles={this.props.profiles} onUpdateProfiles={this.props.onProfile} bandwidths={this.props.bandwidths} onUpdateBandwidth={this.props.onBandwidth} pools={this.props.pools} onUpdatePool={this.props.onPool} taxes={this.props.taxes} onUpdateTaxes={this.props.onTax} discounts={this.props.discounts} onUpdateDiscounts={this.props.onDiscount}/>

                <Dialog fullWidth maxWidth="md" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                    <form onSubmit={this.handleSave}>
                        <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('olt.labels.customers.link')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('olt.labels.customers.link')})}}/>
                        <DialogContent dividers>
                            <div className="form-group row">
                                <label className="col-md-3 col-form-label text-xs">{Lang.get('customers.labels.name')}</label>
                                <div className="col-md-5">
                                    <Select value={this.state.form.customer}
                                            isClearable={this.state.form.id !== null}
                                            options={this.props.customers.filter((f)=> f.meta.auth.type === 'pppoe')}
                                            onChange={(e)=>this.handleSelect(e,'customer')}
                                            styles={FormControlSMReactSelect}
                                            placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('customers.labels.menu')})}
                                            isDisabled={this.state.loading} isLoading={this.props.loadings.customers}/>
                                </div>
                                <div className="col-md-1">
                                    {this.props.privilege !== null &&
                                        typeof this.props.privilege.customers !== 'undefined' &&
                                            this.props.privilege.customers.create &&
                                                this.state.form.customer === null &&
                                                    <button className="btn btn-outline-primary btn-sm" type="button" disabled={this.state.loading} onClick={()=>this.toggleCustomer()}><FontAwesomeIcon icon={faPlus} size="xs"/></button>
                                    }
                                    {this.props.privilege !== null &&
                                        typeof this.props.privilege.customers !== 'undefined' &&
                                            this.props.privilege.customers.update &&
                                                this.state.form.customer !== null &&
                                                    <button className="btn btn-outline-primary btn-sm" type="button" disabled={this.state.loading} onClick={()=>this.toggleCustomer(this.state.form.customer)}><FontAwesomeIcon icon={faPencilAlt} size="xs"/></button>
                                    }
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-md-3 col-form-label text-xs">{Lang.get('customers.labels.address.street')}</label>
                                <div className="col-md-9">
                                    <div className="form-control form-control-sm text-xs" style={{height:70}}>
                                        &nbsp;
                                        {this.state.form.customer === null ? null : this.state.form.customer.meta.address.street}
                                        {this.state.form.customer === null ? null : this.state.form.customer.meta.address.village === null ? null : `, ${ucWord(this.state.form.customer.meta.address.village.name)}` }
                                        {this.state.form.customer === null ? null : this.state.form.customer.meta.address.district === null ? null : `, ${ucWord(this.state.form.customer.meta.address.district.name)}` }
                                        {this.state.form.customer === null ? null : this.state.form.customer.meta.address.city === null ? null : `, ${ucWord(this.state.form.customer.meta.address.city.name)}` }
                                        {this.state.form.customer === null ? null : this.state.form.customer.meta.address.province === null ? null : `, ${ucWord(this.state.form.customer.meta.address.province.name)}` }
                                    </div>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-3 text-xs">{Lang.get('nas.labels.name')}</label>
                                <div className="col-md-5">
                                    <div className="form-control-sm form-control text-xs">
                                        &nbsp;
                                        {this.state.form.customer !== null && this.state.form.customer.meta.nas.shortname}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-form-label col-md-3 text-xs">{Lang.get('profiles.labels.name')}</label>
                                <div className="col-md-5">
                                    <div className="form-control-sm form-control text-xs">
                                        &nbsp;
                                        {this.state.form.customer !== null && this.state.form.customer.meta.profile.name}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                        <ModalFooter
                            form={this.state.form} handleClose={()=>this.props.handleClose()}
                            loading={this.state.loading}
                            pendings={{create:Lang.get('labels.create.pending',{Attribute:Lang.get('olt.labels.customers.link')}),update:Lang.get('labels.update.pending',{Attribute:Lang.get('olt.labels.customers.link')})}}
                            langs={{create:Lang.get('labels.create.submit',{Attribute:Lang.get('olt.labels.customers.link')}),update:Lang.get('labels.update.submit',{Attribute:Lang.get('olt.labels.customers.link')})}}/>
                    </form>
                </Dialog>
            </React.StrictMode>
        )
    }
}
export default FormLinkCustomer;
