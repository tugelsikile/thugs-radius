import React from "react";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import Select from "react-select";
import {FormControlSMReactSelect, responseMessage, ucWord} from "../../../Components/mixedConsts";
import FormCustomer from "../Customer/Tools/FormCustomer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faPlus, faRefresh} from "@fortawesome/free-solid-svg-icons";
import {
    FormConfigureCommandPreview,
    FormConfigureTableGemPort,
    FormConfigureTablePonManagement,
    FormConfigureTableTCont,
    FormConfigureTableVLan, ModemONTLists
} from "./Mixed";
import {crudGponStates} from "../../../Services/OltService";
import {showError, showSuccess} from "../../../Components/Toaster";

// noinspection CommaExpressionJS,DuplicatedCode
class FormConfigure extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                port : { current : null, olt : null, onu_index : null },
                name : '', description : '',
                sn : null, customer : null,
                t_controllers : [],
                gem_ports : [],
                virtual_lanes : [],
                pon_managements : [],
                onu_type : null,
                pon_management_vlan : null,
                modem_brand : null,
            },
            modals : {
                customer : { open : false, data : null },
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleSelectPort = this.handleSelectPort.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toggleCustomer = this.toggleCustomer.bind(this);
        this.handleSelectCustomer = this.handleSelectCustomer.bind(this);
        this.handleUpdateCustomer = this.handleUpdateCustomer.bind(this);

        this.handleAddTCont = this.handleAddTCont.bind(this);
        this.handleDeleteTCont = this.handleDeleteTCont.bind(this);
        this.handleChangeTContId = this.handleChangeTContId.bind(this);
        this.handleSelectTContProfile = this.handleSelectTContProfile.bind(this);
        this.handleSelectGemPortDownstream = this.handleSelectGemPortDownstream.bind(this);
        this.handleSelectGemPortUpstream = this.handleSelectGemPortUpstream.bind(this);
        this.handleSelectGemPortTCont = this.handleSelectGemPortTCont.bind(this);
        this.handleChangeGemPortId = this.handleChangeGemPortId.bind(this);
        this.handleAddGemPort = this.handleAddGemPort.bind(this);
        this.handleDeleteGemPort = this.handleDeleteGemPort.bind(this);
        this.handleAddVLan = this.handleAddVLan.bind(this);
        this.handleDeleteVLan = this.handleDeleteVLan.bind(this);
        this.handleChangeVLanPort = this.handleChangeVLanPort.bind(this);
        this.handleChangeVLanVPort = this.handleChangeVLanVPort.bind(this);
        this.handleSelectVLanUser = this.handleSelectVLanUser.bind(this);
        this.handleSelectVLanService = this.handleSelectVLanService.bind(this);
        this.handleSelectVLanPonMng = this.handleSelectVLanPonMng.bind(this);
        this.handleSelectGemPortPonMng = this.handleSelectGemPortPonMng.bind(this);
        this.handleChangeNamePonMng = this.handleChangeNamePonMng.bind(this);
        this.handleDeletePonMng = this.handleDeletePonMng.bind(this);
        this.handleAddPonMng = this.handleAddPonMng.bind(this);
        this.handleSelectOnuType = this.handleSelectOnuType.bind(this);
        this.handleSelectPonMngVLan = this.handleSelectPonMngVLan.bind(this);
        this.handleSelectBrand = this.handleSelectBrand.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        let index;
        if (nextProps.open) {
            if (nextProps.data !== null) {
                let onuIndex = nextProps.data.onu;
                form.port.current = nextProps.data.onu;
                if (onuIndex.length > 0) {
                    onuIndex = onuIndex.split(":");
                    if (onuIndex.length === 2) {
                        if (typeof onuIndex[0] !== 'undefined' && typeof onuIndex[1] !== 'undefined') {
                            if (nextProps.port_lists.used.length > 0) {
                                index = nextProps.port_lists.used.findIndex((f)=> f.value === onuIndex[0]);
                                if (index >= 0) {
                                    form.port.olt = nextProps.port_lists.used[index];
                                    if (form.port.olt !== null) {
                                        if (form.port.olt.available.length > 0) {
                                            index = form.port.olt.available.findIndex((f)=> parseInt(f.value) === parseInt(onuIndex[1]));
                                            if (index >= 0) {
                                                form.port.onu_index = form.port.olt.available[index];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                form.sn = nextProps.data.serial_number;
                if (nextProps.olt_profiles.onu_type.lists.length > 0) {
                    form.onu_type = nextProps.olt_profiles.onu_type.lists[0];
                }
                if (nextProps.olt_profiles.mng_vlan.lists.length > 0) {
                    form.pon_management_vlan = nextProps.olt_profiles.mng_vlan.lists[0];
                }
            }
        } else {
            form.port.current = null, form.name = '', form.description = '',
                form.port.onu_index = null, form.customer = null,
                form.port.olt = null,
                form.sn = null, form.t_controllers = [], form.gem_ports = [],
                form.virtual_lanes = [], form.pon_managements = [],
                form.onu_type = null, form.pon_management_vlan = null,
                form.modem_brand = ModemONTLists[0];
        }
        this.setState({form},()=>this.determineBrand());
    }
    determineBrand() {
        if (this.state.form.sn !== null) {
            let brandName = this.state.form.sn;
            if (brandName.length > 3) {
                brandName = brandName.substring(0,3).toLowerCase();
                if (brandName.length > 0) {
                    let index = ModemONTLists.findIndex((f)=> f.value.toLowerCase().indexOf(brandName) !== -1);
                    if (index >= 0) {
                        let form = this.state.form;
                        form.modem_brand = ModemONTLists[index];
                        this.setState({form});
                    }
                }
            }
        }
    }
    handleSelectBrand(value) {
        let form = this.state.form;
        form.modem_brand = value;
        this.setState({form});
    }
    handleSelectPonMngVLan(value) {
        let form = this.state.form;
        form.pon_management_vlan = value;
        this.setState({form});
    }
    handleSelectOnuType(value) {
        let form = this.state.form;
        form.onu_type = value;
        this.setState({form});
    }
    toggleCustomer(data = null) {
        let modals = this.state.modals;
        modals.customer.open = ! this.state.modals.customer.open;
        modals.customer.data = data;
        this.setState({modals});
    }
    handleSelectCustomer(value) {
        let form = this.state.form;
        form.customer = value;
        if (form.customer !== null) {
            form.name = `${form.customer.meta.code}_${form.customer.label}`;
            form.description = `${form.name}| ${form.customer.meta.auth.user} | ${form.customer.meta.address.street.replaceAll("\r","").replaceAll("\n","")}`;
        }
        this.setState({form});
    }
    handleSelectPort(value) {
        let form = this.state.form;
        form.port.onu_index = value;
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        form[event.target.name] = event.target.value;
        this.setState({form});
    }
    handleUpdateCustomer(data = null) {
        if (data !== null) {
            if (typeof data === 'object') {
                let form = this.state.form;
                form.customer = data;
                this.setState({form},()=>this.props.onCustomer(data));
            }
        }
    }
    handleAddTCont(){
        let form = this.state.form;
        form.t_controllers.push({
            id : (form.t_controllers.length + 1).toString(),
            profile : this.props.olt_profiles.tconts.lists.length === 0 ? null : this.props.olt_profiles.tconts.lists[0]
        });
        this.setState({form});
    }
    handleDeleteTCont(event) {
        if (typeof event.currentTarget.getAttribute('data-index') !== 'undefined') {
            if (event.currentTarget.getAttribute('data-index') !== null) {
                let index = parseInt(event.currentTarget.getAttribute('data-index'));
                if (index >= 0) {
                    if (typeof this.state.form.t_controllers[index] !== 'undefined') {
                        let form = this.state.form;
                        form.gem_ports.map((item,idx)=>{
                            if (item.tcont !== null) {
                                if (item.tcont.value === form.t_controllers[index].id) {
                                    form.gem_ports[idx].tcont = null;
                                }
                            }
                        });
                        form.t_controllers.splice(index,1);
                        this.setState({form});
                    }
                }
            }
        }
    }
    handleChangeTContId(event) {
        if (event != null) {
            if (typeof event.target.value !== 'undefined') {
                if (typeof event.currentTarget.getAttribute('data-index') !== 'undefined') {
                    if (event.currentTarget.getAttribute('data-index') !== null) {
                        let index = parseInt(event.currentTarget.getAttribute('data-index'));
                        if (index >= 0) {
                            if (typeof this.state.form.t_controllers[index] !== 'undefined') {
                                let form = this.state.form;
                                let defaultValue = form.t_controllers[index].id;
                                form.t_controllers[index].id = event.target.value;
                                form.gem_ports.map((gemport,idx)=>{
                                    if (gemport.tcont !== null) {
                                        if (gemport.tcont.value === defaultValue) {
                                            form.gem_ports[idx].tcont = { value : form.t_controllers[index].id, label : form.t_controllers[index].profile.value};
                                        }
                                    }
                                });
                                this.setState({form});
                            }
                        }
                    }
                }
            }
        }
    }
    handleSelectTContProfile(value, index) {
        if (typeof this.state.form.t_controllers[index] !== "undefined") {
            let form = this.state.form;
            form.t_controllers[index].profile = value;
            form.gem_ports.map((gemport,idx)=>{
                if (gemport.tcont !== null) {
                    if (gemport.tcont.value === form.t_controllers[index].id) {
                        form.gem_ports[idx].tcont = { value : form.t_controllers[index].id, label : form.t_controllers[index].profile.value};
                    }
                }
            });
            this.setState({form});
        }
    }
    handleSelectGemPortDownstream(value, index) {
        if (typeof this.state.form.gem_ports[index] !== "undefined") {
            let form = this.state.form;
            form.gem_ports[index].downstream = value;
            form.pon_managements.map((item,idx)=>{
                if (item.gemport !== null) {
                    if (item.gemport.value === form.gem_ports[index].id) {
                        form.pon_managements[idx].gemport = { value : form.gem_ports[index].id, label : form.gem_ports[index].downstream.value };
                    }
                }
            });
            this.setState({form});
        }
    }
    handleSelectGemPortUpstream(value, index) {
        if (typeof this.state.form.gem_ports[index] !== "undefined") {
            let form = this.state.form;
            form.gem_ports[index].upstream = value;
            this.setState({form});
        }
    }
    handleSelectGemPortTCont(value, index) {
        if (typeof this.state.form.gem_ports[index] !== "undefined") {
            let form = this.state.form;
            form.gem_ports[index].tcont = value;
            this.setState({form});
        }
    }
    handleChangeGemPortId(event) {
        if (event != null) {
            if (typeof event.target.value !== 'undefined') {
                if (typeof event.currentTarget.getAttribute('data-index') !== 'undefined') {
                    if (event.currentTarget.getAttribute('data-index') !== null) {
                        let index = parseInt(event.currentTarget.getAttribute('data-index'));
                        if (index >= 0) {
                            if (typeof this.state.form.gem_ports[index] !== 'undefined') {
                                let form = this.state.form;
                                let defaultValue = form.gem_ports[index].id;
                                form.gem_ports[index].id = event.target.value;
                                form.pon_managements.map((item,idx)=>{
                                    if (item.gemport !== null) {
                                        if (item.gemport.value === defaultValue) {
                                            form.pon_managements[idx].gemport = { value : event.target.value, label : form.gem_ports[index].downstream.value};
                                        }
                                    }
                                });
                                this.setState({form});
                            }
                        }
                    }
                }
            }
        }
    }
    handleAddGemPort() {
        let form = this.state.form;
        form.gem_ports.push({
            id : (form.gem_ports.length + 1).toString(),
            upstream : this.props.olt_profiles.tconts.lists.length === 0 ? null : this.props.olt_profiles.tconts.lists[0],
            downstream : this.props.olt_profiles.tconts.lists.length === 0 ? null : this.props.olt_profiles.tconts.lists[0],
            tcont : form.t_controllers.filter((f)=> f.profile !== null).length === 0 ? null : { value : form.t_controllers.filter((f)=> f.profile !== null)[0].id, label : form.t_controllers.filter((f)=> f.profile !== null)[0].profile.value }
        });
        this.setState({form});
    }
    handleDeleteGemPort(event) {
        if (typeof event.currentTarget.getAttribute('data-index') !== 'undefined') {
            if (event.currentTarget.getAttribute('data-index') !== null) {
                let index = parseInt(event.currentTarget.getAttribute('data-index'));
                if (index >= 0) {
                    if (typeof this.state.form.gem_ports[index] !== 'undefined') {
                        let form = this.state.form;
                        form.pon_managements.map(((item,idx)=>{
                            if (item.gemport !== null) {
                                if (item.gemport.value === form.gem_ports[index].id) {
                                    form.pon_managements[idx].gemport = null;
                                }
                            }
                        }));
                        form.gem_ports.splice(index,1);
                        this.setState({form});
                    }
                }
            }
        }
    }
    handleAddVLan() {
        let form = this.state.form;
        form.virtual_lanes.push({port : (form.virtual_lanes.length + 1).toString(), vport : (form.virtual_lanes.length + 1).toString(), service : this.props.olt_profiles.vlans.lists.length > 0 ? this.props.olt_profiles.vlans.lists[0] : null, user : this.props.olt_profiles.vlans.lists.length > 0 ? this.props.olt_profiles.vlans.lists[0] : null })
        this.setState({form});
    }
    handleDeleteVLan(event) {
        if (typeof event.currentTarget.getAttribute('data-index') !== 'undefined') {
            if (event.currentTarget.getAttribute('data-index') !== null) {
                let index = parseInt(event.currentTarget.getAttribute('data-index'));
                if (index >= 0) {
                    if (typeof this.state.form.virtual_lanes[index] !== 'undefined') {
                        let form = this.state.form;
                        form.pon_managements.map((item,idx)=>{
                            if (item.vlan !== null && form.virtual_lanes[index].user !== null) {
                                if (item.vlan.value === form.virtual_lanes[index].user.value) {
                                    form.pon_managements[idx].vlan = null;
                                }
                            }
                        });
                        form.virtual_lanes.splice(index,1);
                        this.setState({form});
                    }
                }
            }
        }
    }
    handleChangeVLanPort(event) {
        if (event != null) {
            if (typeof event.target.value !== 'undefined') {
                if (typeof event.currentTarget.getAttribute('data-index') !== 'undefined') {
                    if (event.currentTarget.getAttribute('data-index') !== null) {
                        let index = parseInt(event.currentTarget.getAttribute('data-index'));
                        if (index >= 0) {
                            if (typeof this.state.form.virtual_lanes[index] !== 'undefined') {
                                let form = this.state.form;
                                form.virtual_lanes[index].port = event.target.value;
                                this.setState({form});
                            }
                        }
                    }
                }
            }
        }
    }
    handleChangeVLanVPort(event) {
        if (event != null) {
            if (typeof event.target.value !== 'undefined') {
                if (typeof event.currentTarget.getAttribute('data-index') !== 'undefined') {
                    if (event.currentTarget.getAttribute('data-index') !== null) {
                        let index = parseInt(event.currentTarget.getAttribute('data-index'));
                        if (index >= 0) {
                            if (typeof this.state.form.virtual_lanes[index] !== 'undefined') {
                                let form = this.state.form;
                                form.virtual_lanes[index].vport = event.target.value;
                                this.setState({form});
                            }
                        }
                    }
                }
            }
        }
    }
    handleSelectVLanUser(value, index) {
        if (typeof this.state.form.virtual_lanes[index] !== "undefined") {
            let form = this.state.form;
            let defaultValue = null;
            if (form.virtual_lanes[index].user !== null) {
                defaultValue = form.virtual_lanes[index].user.value;
            }
            form.virtual_lanes[index].user = value;
            form.pon_managements.map((item,idx)=>{
                if (defaultValue !== null && item.vlan !== null) {
                    if (item.vlan.value === defaultValue) {
                        form.pon_managements[idx].vlan = { value : form.virtual_lanes[index].user.value, label : form.virtual_lanes[index].user.label};
                    }
                }
            });
            this.setState({form});
        }
    }
    handleSelectVLanService(value, index) {
        if (typeof this.state.form.virtual_lanes[index] !== "undefined") {
            let form = this.state.form;
            form.virtual_lanes[index].service = value;
            this.setState({form});
        }
    }
    handleSelectVLanPonMng(value, index) {
        if (typeof this.state.form.pon_managements[index] !== "undefined") {
            let form = this.state.form;
            form.pon_managements[index].vlan = value;
            this.setState({form});
        }
    }
    handleSelectGemPortPonMng(value, index) {
        if (typeof this.state.form.pon_managements[index] !== "undefined") {
            let form = this.state.form;
            form.pon_managements[index].gemport = value;
            this.setState({form});
        }
    }
    handleChangeNamePonMng(event) {
        if (event != null) {
            if (typeof event.target.value !== 'undefined') {
                if (typeof event.currentTarget.getAttribute('data-index') !== 'undefined') {
                    if (event.currentTarget.getAttribute('data-index') !== null) {
                        let index = parseInt(event.currentTarget.getAttribute('data-index'));
                        if (index >= 0) {
                            if (typeof this.state.form.pon_managements[index] !== 'undefined') {
                                let form = this.state.form;
                                form.pon_managements[index].name = event.target.value;
                                this.setState({form});
                            }
                        }
                    }
                }
            }
        }
    }
    handleDeletePonMng(event) {
        if (typeof event.currentTarget.getAttribute('data-index') !== 'undefined') {
            if (event.currentTarget.getAttribute('data-index') !== null) {
                let index = parseInt(event.currentTarget.getAttribute('data-index'));
                if (index >= 0) {
                    if (typeof this.state.form.pon_managements[index] !== 'undefined') {
                        let form = this.state.form;
                        form.pon_managements.splice(index,1);
                        this.setState({form});
                    }
                }
            }
        }
    }
    handleAddPonMng() {
        let form = this.state.form;
        form.pon_managements.push({
            name : form.customer === null ? 'PPPOE_' + (form.pon_managements.length + 1).toString() : 'PPPOE_' + form.customer.meta.code + '_' + (form.pon_managements.length).toString(),
            gemport : form.gem_ports.filter((f)=> f.id.length > 0 && f.downstream !== null).length === 0 ? null : {value : form.gem_ports.filter((f)=> f.id.length > 0 && f.downstream !== null)[0].id, label : form.gem_ports.filter((f)=> f.id.length > 0 && f.downstream !== null)[0].downstream.value},
            vlan : form.virtual_lanes.filter((f)=> f.user !== null).length === 0 ? null : { value : form.virtual_lanes.filter((f)=> f.user !== null)[0].user.value, label : form.virtual_lanes.filter((f)=> f.user !== null)[0].user.label}
        });
        this.setState({form});
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('_method','put');
            if (this.props.olt !== null) formData.append(Lang.get('olt.form_input.id'), this.props.olt.value);
            if (this.state.form.port.current !== null) formData.append(Lang.get('olt.form_input.onus.current'), this.state.form.port.current);
            if (this.state.form.port.olt !== null) formData.append(Lang.get('olt.form_input.onus.olt'), this.state.form.port.olt.value);
            if (this.state.form.port.onu_index !== null) formData.append(Lang.get('olt.form_input.onus.index'), this.state.form.port.onu_index.value);
            formData.append(Lang.get('olt.form_input.onus.name'), this.state.form.name);
            formData.append(Lang.get('olt.form_input.onus.description'), this.state.form.description);
            if (this.state.form.sn !== null) formData.append(Lang.get('olt.form_input.onus.sn'), this.state.form.sn);
            if (this.state.form.customer !== null) formData.append(Lang.get('customers.form_input.id'), this.state.form.customer.value);
            if (this.state.form.onu_type !== null) formData.append(Lang.get('olt.form_input.onus.type'), this.state.form.onu_type.value);
            if (this.state.form.pon_management_vlan !== null) formData.append(Lang.get('olt.form_input.onus.pon_mng.vlan'), this.state.form.pon_management_vlan.value);
            if (this.state.form.modem_brand !== null) formData.append(Lang.get('olt.form_input.brand'), this.state.form.modem_brand.value);
            this.state.form.t_controllers.map((item,index)=>{
                formData.append(`${Lang.get('olt.form_input.onus.tcont.input')}[${index}][${Lang.get('olt.form_input.onus.tcont.id')}]`, item.id);
                if (item.profile !== null) formData.append(`${Lang.get('olt.form_input.onus.tcont.input')}[${index}][${Lang.get('olt.form_input.onus.tcont.profile')}]`, item.profile.value);
            });
            this.state.form.gem_ports.map((item,index)=>{
                formData.append(`${Lang.get('olt.form_input.onus.gemport.input')}[${index}][${Lang.get('olt.form_input.onus.gemport.id')}]`, item.id);
                if (item.upstream !== null) formData.append(`${Lang.get('olt.form_input.onus.gemport.input')}[${index}][${Lang.get('olt.form_input.onus.gemport.upstream')}]`, item.upstream.value);
                if (item.downstream !== null) formData.append(`${Lang.get('olt.form_input.onus.gemport.input')}[${index}][${Lang.get('olt.form_input.onus.gemport.downstream')}]`, item.downstream.value);
                if (item.tcont !== null) formData.append(`${Lang.get('olt.form_input.onus.gemport.input')}[${index}][${Lang.get('olt.form_input.onus.tcont.input')}]`, item.tcont.value);
            });
            this.state.form.virtual_lanes.map((item,index)=>{
                formData.append(`${Lang.get('olt.form_input.onus.vlan.input')}[${index}][${Lang.get('olt.form_input.onus.vlan.port')}]`, item.port);
                formData.append(`${Lang.get('olt.form_input.onus.vlan.input')}[${index}][${Lang.get('olt.form_input.onus.vlan.vport')}]`, item.vport);
                if (item.user !== null) formData.append(`${Lang.get('olt.form_input.onus.vlan.input')}[${index}][${Lang.get('olt.form_input.onus.vlan.user')}]`, item.user.value);
                if (item.service !== null) formData.append(`${Lang.get('olt.form_input.onus.vlan.input')}[${index}][${Lang.get('olt.form_input.onus.vlan.service')}]`, item.service.value);
            });
            this.state.form.pon_managements.map((item,index)=>{
                formData.append(`${Lang.get('olt.form_input.onus.pon_mng.input')}[${index}][${Lang.get('olt.form_input.onus.pon_mng.name')}]`, item.name);
                if (item.gemport !== null) formData.append(`${Lang.get('olt.form_input.onus.pon_mng.input')}[${index}][${Lang.get('olt.form_input.onus.gemport.input')}]`, item.gemport.value);
                if (item.vlan !== null) formData.append(`${Lang.get('olt.form_input.onus.pon_mng.input')}[${index}][${Lang.get('olt.form_input.onus.vlan.input')}]`, item.vlan.value);
            });
            let response = await crudGponStates(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                this.props.handleClose();
                this.props.handleUpdate(null,this.props.data);
                showSuccess(response.data.message);
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    render() {
        return (
            <React.Fragment>
                <FormCustomer privilege={this.props.privilege} loadings={this.props.loadings} type="pppoe" nas={this.props.nas} companies={this.props.companies} open={this.state.modals.customer.open} data={this.state.modals.customer.data} user={JSON.parse(localStorage.getItem('user'))} handleClose={this.toggleCustomer} handleUpdate={this.handleUpdateCustomer} profiles={this.props.profiles} onUpdateProfiles={this.props.onProfile} bandwidths={this.props.bandwidths} onUpdateBandwidth={this.props.onBandwidth} pools={this.props.pools} onUpdatePool={this.props.onPool} taxes={this.props.taxes} onUpdateTaxes={this.props.onTax} discounts={this.props.discounts} onUpdateDiscounts={this.props.onDiscount}/>

                <Dialog fullScreen fullWidth scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                    <form onSubmit={this.handleSave}>
                        <ModalHeader handleClose={()=>this.props.handleClose()} loading={this.state.loading} title={Lang.get('olt.configure.title')}/>
                        <DialogContent dividers>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">Port Onu Sekarang</label>
                                        <div className="col-md-3">
                                            <div className="form-control form-control-sm text-xs">{this.state.form.port.current}&nbsp;</div>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">Port Onu Selanjutnya</label>
                                        <div className="col-md-3">
                                            <div className="form-control form-control-sm text-xs">{this.state.form.port.olt !== null && this.state.form.port.olt.value}&nbsp;</div>
                                        </div>
                                        <div className="col-md-3">
                                            <Select options={this.state.form.port.olt === null ? [] : this.state.form.port.olt.available}
                                                    value={this.state.form.port.onu_index}
                                                    onChange={this.handleSelectPort}
                                                    styles={FormControlSMReactSelect} maxMenuHeight={150}
                                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('olt.labelt.port')})}
                                                    placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('olt.labels.port')})}
                                                    isDisabled={this.state.loading}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-form-label col-md-4 text-xs">{Lang.get('olt.labels.onu.sn')}</label>
                                        <div className="col-md-8">
                                            <div className="form-control form-control-sm text-xs">{this.state.form.sn}&nbsp;</div>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-form-label col-md-4 text-xs">{Lang.get('olt.labels.onu.name')}</label>
                                        <div className="col-md-8">
                                            <input className="form-control-sm form-control text-xs" value={this.state.form.name} name="name" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('olt.labels.onu.name')}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-form-label col-md-4 text-xs">{Lang.get('olt.labels.onu.description')}</label>
                                        <div className="col-md-8">
                                            <input className="form-control-sm form-control text-xs" value={this.state.form.description} name="description" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('olt.labels.onu.description')}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-form-label col-md-4 text-xs">{Lang.get('olt.labels.onu.type')}</label>
                                        <div className="col-md-6">
                                            <Select options={this.props.olt_profiles.onu_type.lists}
                                                    value={this.state.form.onu_type}
                                                    onChange={this.handleSelectOnuType}
                                                    styles={FormControlSMReactSelect}
                                                    isLoading={this.props.olt_profiles.onu_type.loading}
                                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('olt.labels.onu.type')})}
                                                    placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('olt.labels.onu.type')})}
                                                    isDisabled={this.state.loading || this.props.olt_profiles.onu_type.loading}/>
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" disabled={this.props.olt_profiles.onu_type.loading || this.state.loading} className="btn btn-outline-primary btn-sm text-xs" onClick={()=>this.props.onReloadOnuType}>
                                                <FontAwesomeIcon icon={this.props.olt_profiles.onu_type.loading ? faCircleNotch : faRefresh} spin={this.props.olt_profiles.onu_type.loading} size="xs"/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-form-label col-md-4 text-xs">{Lang.get('olt.labels.pon_mng.vlan')}</label>
                                        <div className="col-md-6">
                                            <Select options={this.props.olt_profiles.mng_vlan.lists}
                                                    value={this.state.form.pon_management_vlan}
                                                    onChange={this.handleSelectPonMngVLan}
                                                    styles={FormControlSMReactSelect}
                                                    isLoading={this.props.olt_profiles.mng_vlan.loading}
                                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('olt.labels.pon_mng.vlan')})}
                                                    placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('olt.labels.pon_mng.vlan')})}
                                                    isDisabled={this.state.loading || this.props.olt_profiles.mng_vlan.loading}/>
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" disabled={this.props.olt_profiles.mng_vlan.loading || this.state.loading} className="btn btn-outline-primary btn-sm text-xs" onClick={()=>this.props.onReloadProfileMng}>
                                                <FontAwesomeIcon icon={this.props.olt_profiles.mng_vlan.loading ? faCircleNotch : faRefresh} spin={this.props.olt_profiles.mng_vlan.loading} size="xs"/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-form-label col-md-4 text-xs">{Lang.get('olt.labels.pon_mng.vlan')}</label>
                                        <div className="col-md-4">
                                            <Select options={ModemONTLists}
                                                    value={this.state.form.modem_brand}
                                                    onChange={this.handleSelectBrand}
                                                    styles={FormControlSMReactSelect}
                                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('olt.labels.onu.brand')})}
                                                    placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('olt.labels.onu.brand')})}
                                                    isDisabled={this.state.loading}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">{Lang.get('customers.labels.name')}</label>
                                        <div className="col-md-6">
                                            <Select value={this.state.form.customer} options={this.props.customers}
                                                    onChange={this.handleSelectCustomer}
                                                    isDisabled={this.state.loading || this.props.loadings.customers}
                                                    styles={FormControlSMReactSelect}
                                                    isLoading={this.props.loadings.customers}
                                                    noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('customers.labels.menu')})}
                                                    placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('customers.labels.menu')})}/>
                                        </div>
                                        <div className="col-md-2">
                                            {this.props.privilege !== null && this.props.privilege.customers.create &&
                                                <button type="button" disabled={this.state.loading} onClick={()=>this.toggleCustomer()} className="btn btn-outline-primary btn-sm">
                                                    <FontAwesomeIcon icon={faPlus} size="xs"/>
                                                </button>
                                            }
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">{Lang.get('customers.labels.code')}</label>
                                        <div className="col-md-8">
                                            <div className="form-control-sm form-control text-xs">{this.state.form.customer !== null && this.state.form.customer.meta.code}&nbsp;</div>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">{Lang.get('customers.labels.address.tab')}</label>
                                        <div className="col-md-8">
                                            <div className="form-control form-control-sm text-xs" style={{height:70}}>
                                                {this.state.form.customer !== null &&
                                                    <React.Fragment>
                                                        {this.state.form.customer.meta.address.street}
                                                        {this.state.form.customer.meta.address.village !== null && `, ${ucWord(this.state.form.customer.meta.address.village.name)}`}
                                                        {this.state.form.customer.meta.address.district !== null && `, ${ucWord(this.state.form.customer.meta.address.district.name)}`}
                                                        {this.state.form.customer.meta.address.city !== null && `, ${ucWord(this.state.form.customer.meta.address.city.name)}`}
                                                        {this.state.form.customer.meta.address.province !== null && `, ${ucWord(this.state.form.customer.meta.address.province.name)}`}
                                                        {this.state.form.customer.meta.address.postal}
                                                    </React.Fragment>
                                                }
                                                &nbsp;
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">{Lang.get('customers.labels.username.label')}</label>
                                        <div className="col-md-8">
                                            <div className="form-control-sm form-control text-xs">{this.state.form.customer !== null && this.state.form.customer.meta.auth.user}&nbsp;</div>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">{Lang.get('customers.labels.password.label')}</label>
                                        <div className="col-md-8">
                                            <div className="form-control-sm form-control text-xs">{this.state.form.customer !== null && this.state.form.customer.meta.auth.pass}&nbsp;</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <div className="row">
                                <div className="col-md-6">
                                    <FormConfigureTableTCont onReloadProfile={this.props.onReloadTcont} onSelect={this.handleSelectTContProfile} onChangeId={this.handleChangeTContId} onAdd={this.handleAddTCont} onDelete={this.handleDeleteTCont} olt_profiles={this.props.olt_profiles} {...this.state}/>
                                </div>
                                <div className="col-md-6">
                                    <FormConfigureTableGemPort onReloadProfile={this.props.onReloadTcont} onAdd={this.handleAddGemPort} onDelete={this.handleDeleteGemPort} onChangeId={this.handleChangeGemPortId} onSelectUpstream={this.handleSelectGemPortUpstream} onSelectDownstream={this.handleSelectGemPortDownstream} onSelectTCont={this.handleSelectGemPortTCont} olt_profiles={this.props.olt_profiles} {...this.state}/>
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <div className="row">
                                <div className="col-md-6">
                                    <FormConfigureTableVLan onReloadProfile={this.props.onReloadVLan} onSelectService={this.handleSelectVLanService} onSelectUser={this.handleSelectVLanUser} onChangeVPort={this.handleChangeVLanVPort} onChangePort={this.handleChangeVLanPort} onDelete={this.handleDeleteVLan} onAdd={this.handleAddVLan} olt_profiles={this.props.olt_profiles} {...this.state}/>
                                </div>
                                <div className="col-md-6">
                                    <FormConfigureTablePonManagement onAdd={this.handleAddPonMng} onDelete={this.handleDeletePonMng} onChangeName={this.handleChangeNamePonMng} onSelectGemPort={this.handleSelectGemPortPonMng} onSelectVLan={this.handleSelectVLanPonMng} olt_profiles={this.props.olt_profiles} {...this.state}/>
                                </div>
                            </div>
                            <FormConfigureCommandPreview {...this.state}/>
                        </DialogContent>
                        <ModalFooter
                            pending={Lang.get('olt.configure.pending')}
                            submit={Lang.get('olt.configure.submit')}
                            handleClose={()=>this.props.handleClose()}
                            loading={this.state.loading}
                            />
                    </form>
                </Dialog>
            </React.Fragment>
        )
    }
}

export default FormConfigure;
