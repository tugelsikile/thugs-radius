import React from "react";
import {Dialog, DialogContent} from "@mui/material";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";
import {
    formatLocaleString,
    FormControlSMReactSelect,
    randomString,
    responseMessage,
    subnet2Mask
} from "../../../Components/mixedConsts";
import {readBranchRST, readDataRST} from "../../../Services/BackupService";
import {showError, showSuccess} from "../../../Components/Toaster";
import {crudNas, crudProfile, crudProfileBandwidth, crudProfilePools} from "../../../Services/NasService";
import {ButtonPlay, GetLocalCounter} from "./Mixed";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faPlay} from "@fortawesome/free-solid-svg-icons";
import {crudCustomerInvoicePayments, crudCustomerInvoices, crudCustomers} from "../../../Services/CustomerService";
import moment from "moment/moment";
import {sumGrandTotalInvoice, sumGrandTotalInvoiceForm, sumPaymentInvoiceForm} from "../Customer/Invoice/Tools/Mixed";
import Select from "react-select";

// noinspection DuplicatedCode,JSIgnoredPromiseFromCall
class ModalImportRST extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                hostname : '127.0.0.1', port : 3306, id : null,
                user : 'root', pass : '', name : 'rstnet_sistem',
                branch : null,
            },
            branches : [],
            lists : {
                process : 0, max : 0,
                labels : [
                    //{ value : 'branches', label : 'Cabang', data : [], current : [], handle : null, loading : false, process : 0, max : 0 },
                    { value : 'nas', label : Lang.get('nas.labels.menu'), data : [], current : [], handle : ()=> this.handleLoopNas(), loading : false, process : 0, max : 0, errors : '', },
                    { value : 'bandwidths', label : Lang.get('bandwidths.labels.menu'), data : [], current : [], handle : ()=> this.handleLoopBandwidth(), loading : false, process : 0, max : 0, errors : '', },
                    { value : 'pools', label : Lang.get('nas.pools.labels.menu'), data : [], current : [], handle : ()=> this.handleLoolPool(), loading : false, process : 0, max : 0, errors : '', },
                    { value : 'profiles', label : Lang.get('profiles.labels.menu'), data : [], current : [], handle : ()=> this.handleLoopProfile(), loading : false, process : 0, max : 0, errors : '', },
                    { value : 'packages', label : 'Paket', data : [], current : [], handle : ()=> this.handleLoopPackage(), loading : false, process : 0, max : 0, errors : '', },
                    { value : 'customers', label: Lang.get('customers.labels.menu'), data : [], current : [], handle : ()=> this.handleLoopCustomer(), loading : false, process : 0, max : 0, errors : '', },
                    { value : 'invoices', label: Lang.get('customers.invoices.labels.menu'), data : [], current : [], handle : ()=> this.handleLoopInvoice(), loading : false, process : 0, max : 0, errors : '', },
                    { value : 'payments', label: Lang.get('invoices.payments.name'), data : [], current : [], handle : ()=> this.handleLoopPayment(), loading : false, process : 0, max : 0, errors : '', },
                ],
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleLoopNas = this.handleLoopNas.bind(this);
        this.handleLoopProfile = this.handleLoopProfile.bind(this);
        this.handleLoolPool = this.handleLoolPool.bind(this);
        this.handleLoopCustomer = this.handleLoopCustomer.bind(this);
        this.handleLoopBandwidth = this.handleLoopBandwidth.bind(this);
        this.handleLoopPackage = this.handleLoopPackage.bind(this);
        this.handleLoopInvoice = this.handleLoopInvoice.bind(this);
        this.handleLoopPayment = this.handleLoopPayment.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleReadBranch = this.handleReadBranch.bind(this);
    }
    handleSelect(event) {
        let form = this.state.form;
        form.branch = event;
        this.setState({form});
    }
    handleChange(event) {
        let form = this.state.form;
        form[event.target.name] = event.target.value;
        this.setState({form});
    }
    handleLoopNas() {
        let indexList = this.state.lists.labels.findIndex((f)=> f.value === 'nas');
        if (indexList >= 0) {
            if (this.state.lists.labels[indexList].data.filter((f)=> f.value === null).length > 0) {
                let lists = this.state.lists;
                lists.labels[indexList].process = 0;
                lists.labels[indexList].loading = true;
                lists.labels[indexList].max = lists.labels[indexList].data.filter((f)=> f.value === null).length;
                this.state.lists.labels[indexList].data.filter((f)=> f.value === null).map((item,index)=>{
                    if (item.value === null) {
                        const data = {
                            id : item.id, name : item.name,
                            port : item.port, secret : item.radius_secret,
                            ip : item.ip, user : item.username, pass : item.password,
                        };
                        this.handleSubmitNas(data)
                            .then((response)=>{
                                if (response !== null) {
                                    lists.labels[indexList].data[index].value = response.value;
                                    lists.labels[indexList].data[index].system = response;
                                    this.setState({lists});
                                }
                            })
                            .catch(()=>{
                                lists.labels[indexList].process++;
                                if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                    lists.labels[indexList].loading = false;
                                    lists.labels[indexList].process = 0;
                                    lists.labels[indexList].max = 0;
                                    this.setState({lists}, () => {
                                        if (!lists.labels[indexList].loading) {
                                            let next = null;
                                            if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                next = lists.labels[indexList + 1].value;
                                            }
                                            this.handleSave(null, next);
                                        }
                                    });
                                }
                            })
                            .finally(()=>{
                                lists.labels[indexList].process++;
                                if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                    lists.labels[indexList].loading = false;
                                    lists.labels[indexList].process = 0;
                                    lists.labels[indexList].max = 0;
                                    this.setState({lists}, () => {
                                        if (!lists.labels[indexList].loading) {
                                            let next = null;
                                            if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                next = lists.labels[indexList + 1].value;
                                            }
                                            this.handleSave(null, next);
                                        }
                                    });
                                }
                            });
                    }
                });
            }
        }
    }
    async handleSubmitNas(form) {
        try {
            const formData = new FormData();
            formData.append('_method', 'put');
            formData.append('default_id', form.id);
            if (this.props.user.meta.company !== null) formData.append(Lang.get('companies.form_input.name'), this.props.user.meta.company.id);
            formData.append(Lang.get('nas.form_input.name'), form.name);
            formData.append(Lang.get('nas.form_input.port'), form.port);
            formData.append(Lang.get('nas.form_input.secret'), form.secret);
            formData.append(Lang.get('nas.form_input.method'), "api");
            formData.append(Lang.get('nas.form_input.ip'), form.ip);
            formData.append(Lang.get('nas.form_input.user'), form.user);
            formData.append(Lang.get('nas.form_input.pass'), form.pass);
            formData.append(Lang.get('nas.form_input.pass_confirm'), form.pass);
            let response = await crudNas(formData);
            if (response.data.params === null) {
                showError(response.data.message,500);
                return null;
            } else {
                //showSuccess(response.data.message,500);
                return response.data.params;
            }
        } catch (e) {
            responseMessage(e,500);
            return null;
        }
    }
    handleLoopBandwidth() {
        let indexList = this.state.lists.labels.findIndex((f)=> f.value === 'bandwidths');
        if (indexList >= 0) {
            if (this.state.lists.labels[indexList - 1].data.filter((f)=> f.value === null).length > 0) {
                showError("Please complete previous lists");
            } else {
                if (! this.state.lists.labels[indexList].loading) {
                    if (this.state.lists.labels[indexList].data.length > 0) {
                        if (this.state.lists.labels[indexList].data.filter((f)=> f.value === null).length > 0) {
                            let lists = this.state.lists;
                            lists.labels[indexList].loading = true;
                            lists.labels[indexList].process = 0;
                            lists.labels[indexList].max = lists.labels[indexList].data.filter((f)=> f.value === null).length;
                            this.setState({lists});
                            lists.labels[indexList].data.filter((f)=> f.value === null).map(async (item, index) => {
                                if (item.value === null) {
                                    const formBandwidth = {
                                        name: item.name, id: item.id,
                                        max_limit: {up: 0, down: 0},
                                        burst_limit: {up: 0, down: 0},
                                        threshold: {up: 0, down: 0},
                                        time: {up: 0, down: 0},
                                        limit_at: {up: 0, down: 0},
                                        priority: 8
                                    };
                                    let bandwidthStrings = item.burst;
                                    if (bandwidthStrings !== null) {
                                        bandwidthStrings = bandwidthStrings.split(" ");
                                        if (bandwidthStrings.length > 0) {
                                            if (typeof bandwidthStrings[0] !== 'undefined') {
                                                if (bandwidthStrings[0].length > 0) {
                                                    formBandwidth.max_limit.up = parseInt(bandwidthStrings[0].split("/")[0]);
                                                    formBandwidth.max_limit.down = parseInt(bandwidthStrings[0].split("/")[1]);
                                                    if (bandwidthStrings[0].split("/")[0].indexOf("m") !== -1) {
                                                        formBandwidth.max_limit.up = parseInt(bandwidthStrings[0].split("/")[0]) * 1000;
                                                    }
                                                    if (bandwidthStrings[0].split("/")[1].indexOf("m") !== -1) {
                                                        formBandwidth.max_limit.down = parseInt(bandwidthStrings[0].split("/")[1]) * 1000;
                                                    }
                                                }
                                            }
                                            if (typeof bandwidthStrings[1] !== 'undefined') {
                                                if (bandwidthStrings[1].length > 0) {
                                                    formBandwidth.burst_limit.up = parseInt(bandwidthStrings[1].split("/")[0]);
                                                    formBandwidth.burst_limit.down = parseInt(bandwidthStrings[1].split("/")[1]);
                                                    if (bandwidthStrings[1].split("/")[0].indexOf("m") !== -1) {
                                                        formBandwidth.burst_limit.up = parseInt(bandwidthStrings[1].split("/")[0]) * 1000;
                                                    }
                                                    if (bandwidthStrings[1].split("/")[1].indexOf("m") !== -1) {
                                                        formBandwidth.burst_limit.down = parseInt(bandwidthStrings[1].split("/")[1]) * 1000;
                                                    }
                                                }
                                            }
                                            if (typeof bandwidthStrings[2] !== 'undefined') {
                                                if (bandwidthStrings[2].length > 0) {
                                                    formBandwidth.threshold.up = parseInt(bandwidthStrings[2].split("/")[0]);
                                                    formBandwidth.threshold.down = parseInt(bandwidthStrings[2].split("/")[1]);
                                                    if (bandwidthStrings[2].split("/")[0].indexOf("m") !== -1) {
                                                        formBandwidth.threshold.up = parseInt(bandwidthStrings[2].split("/")[0]) * 1000;
                                                    }
                                                    if (bandwidthStrings[2].split("/")[1].indexOf("m") !== -1) {
                                                        formBandwidth.threshold.down = parseInt(bandwidthStrings[2].split("/")[1]) * 1000;
                                                    }
                                                }
                                            }
                                            if (typeof bandwidthStrings[3] !== 'undefined') {
                                                if (bandwidthStrings[3].length > 0) {
                                                    formBandwidth.time.up = parseInt(bandwidthStrings[3].split("/"));
                                                    formBandwidth.time.down = parseInt(bandwidthStrings[3].split("/"));
                                                }
                                            }
                                            if (typeof bandwidthStrings[4] !== 'undefined') {
                                                if (bandwidthStrings[4].length > 0) {
                                                    formBandwidth.priority = parseInt(bandwidthStrings[4]);
                                                }
                                            }
                                            if (typeof bandwidthStrings[5] !== 'undefined') {
                                                if (bandwidthStrings[5].length > 0) {
                                                    formBandwidth.limit_at.up = parseInt(bandwidthStrings[5].split("/")[0]);
                                                    formBandwidth.limit_at.down = parseInt(bandwidthStrings[5].split("/")[1]);
                                                    if (bandwidthStrings[5].split("/")[0].indexOf("m") !== -1) {
                                                        formBandwidth.limit_at.up = parseInt(bandwidthStrings[5].split("/")[0]) * 1000;
                                                    }
                                                    if (bandwidthStrings[5].split("/")[1].indexOf("m") !== -1) {
                                                        formBandwidth.limit_at.down = parseInt(bandwidthStrings[5].split("/")[1]) * 1000;
                                                    }
                                                }
                                            }
                                            if (formBandwidth.threshold.up > 0 || formBandwidth.burst_limit.up > 0 || formBandwidth.limit_at.up > 0) {
                                                if (formBandwidth.time.up === 0) {
                                                    formBandwidth.time.up = 1;
                                                }
                                            }
                                            if (formBandwidth.threshold.down > 0 || formBandwidth.burst_limit.down > 0 || formBandwidth.limit_at.down > 0) {
                                                if (formBandwidth.time.down === 0) {
                                                    formBandwidth.time.down = 1;
                                                }
                                            }
                                            if (formBandwidth.priority <= 0) {
                                                formBandwidth.priority = 8;
                                            }
                                        }
                                    }
                                    await this.handleSubmitBandwidth(formBandwidth)
                                        .then((response) => {
                                            if (response !== null) {
                                                lists.labels[indexList].data[index].value = response.value;
                                                lists.labels[indexList].data[index].system = response;
                                                this.setState({lists});
                                            }
                                        })
                                        .catch(() => {
                                            lists.labels[indexList].process++;
                                            if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                                lists.labels[indexList].loading = false;
                                                lists.labels[indexList].process = 0;
                                                lists.labels[indexList].max = 0;
                                            }
                                            this.setState({lists}, () => {
                                                if (!lists.labels[indexList].loading) {
                                                    let next = null;
                                                    if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                        next = lists.labels[indexList + 1].value;
                                                    }
                                                    this.handleSave(null, next);
                                                }
                                            });
                                        })
                                        .finally(() => {
                                            lists.labels[indexList].process++;
                                            if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                                lists.labels[indexList].loading = false;
                                                lists.labels[indexList].process = 0;
                                                lists.labels[indexList].max = 0;
                                            }
                                            this.setState({lists}, () => {
                                                if (!lists.labels[indexList].loading) {
                                                    let next = null;
                                                    if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                        next = lists.labels[indexList + 1].value;
                                                    }
                                                    this.handleSave(null, next);
                                                }
                                            });
                                        })
                                }
                            });
                        }
                    }
                }
            }
        }
    }
    async handleSubmitBandwidth(form) {
        try {
            const formData = new FormData();
            formData.append('_method', 'put');
            formData.append('system_id', form.id);
            formData.append(Lang.get('bandwidths.form_input.name'), form.name);
            formData.append(Lang.get('bandwidths.form_input.max_limit.up'), form.max_limit.up);
            formData.append(Lang.get('bandwidths.form_input.max_limit.down'), form.max_limit.down);
            formData.append(Lang.get('bandwidths.form_input.burst.up'), form.burst_limit.up);
            formData.append(Lang.get('bandwidths.form_input.burst.down'), form.burst_limit.down);
            formData.append(Lang.get('bandwidths.form_input.threshold.up'), form.threshold.up);
            formData.append(Lang.get('bandwidths.form_input.threshold.down'), form.threshold.down);
            formData.append(Lang.get('bandwidths.form_input.time.up'), form.time.up);
            formData.append(Lang.get('bandwidths.form_input.time.down'), form.time.down);
            formData.append(Lang.get('bandwidths.form_input.limit_at.up'), form.limit_at.up);
            formData.append(Lang.get('bandwidths.form_input.limit_at.down'), form.limit_at.down);
            formData.append(Lang.get('bandwidths.form_input.priority'), form.priority);

            let response = await crudProfileBandwidth(formData);
            if (response.data.params === null) {
                showError(response.data.message,500);
                return null;
            } else {
                //showSuccess(response.data.message,500);
                return response.data.params;
            }
        } catch (e) {
            responseMessage(e,500);
            return null;
        }
    }
    handleLoolPool() {
        let indexList = this.state.lists.labels.findIndex((f)=> f.value === 'pools');
        if (indexList >= 0) {
            if (this.state.lists.labels[indexList - 1].data.filter((f)=> f.value === null).length > 0) {
                showError("Please complete previous lists");
            } else {
                if (this.state.lists.labels[indexList].data.length > 0) {
                    if (! this.state.lists.labels[indexList].data.loading) {
                        let lists = this.state.lists;
                        lists.labels[indexList].process = 0;
                        lists.labels[indexList].max = this.state.lists.labels[indexList].data.filter((f)=> f.value === null && f.first_address !== null && f.last_address !== null).length;
                        lists.labels[indexList].loading = true;
                        this.setState({lists});
                        this.state.lists.labels[indexList].data.map((item,index)=>{
                            if (item.value === null) {
                                if (item.first_address !== null && item.last_address !== null) {
                                    let formPool = {
                                        id : item.id,
                                        nas : item.routerboard,
                                        code : item.name,
                                        name : item.name,
                                        first : item.first_address,
                                        last : item.last_address,
                                    }
                                    this.handleSubmitPool(formPool)
                                        .then((response)=>{
                                            if (response !== null) {
                                                lists.labels[indexList].data[index].value = response.value;
                                                lists.labels[indexList].data[index].system = response;
                                            }
                                            this.setState({lists});
                                        })
                                        .catch(()=>{
                                            lists.labels[indexList].process++;
                                            if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                                lists.labels[indexList].loading = false;
                                                lists.labels[indexList].process = 0;
                                                lists.labels[indexList].max = 0;
                                                this.setState({lists}, () => {
                                                    if (!lists.labels[indexList].loading) {
                                                        let next = null;
                                                        if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                            next = lists.labels[indexList + 1].value;
                                                        }
                                                        this.handleSave(null, next);
                                                    }
                                                });
                                            }
                                        })
                                        .finally(()=>{
                                            lists.labels[indexList].process++;
                                            if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                                lists.labels[indexList].loading = false;
                                                lists.labels[indexList].process = 0;
                                                lists.labels[indexList].max = 0;
                                                this.setState({lists}, () => {
                                                    if (!lists.labels[indexList].loading) {
                                                        let next = null;
                                                        if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                            next = lists.labels[indexList + 1].value;
                                                        }
                                                        this.handleSave(null, next);
                                                    }
                                                });
                                            }
                                        });
                                }
                            }
                        })
                    }
                }
            }
        }
    }
    async handleSubmitPool(form) {
        try {
            const formData = new FormData();
            formData.append('_method', 'put');
            formData.append('system_id', form.id);
            formData.append(Lang.get('nas.form_input.name'), form.nas);
            formData.append(Lang.get('nas.pools.form_input.module'), "radius");
            formData.append(Lang.get('nas.pools.form_input.code'), form.code);
            formData.append(Lang.get('nas.pools.form_input.name'), form.name);
            formData.append(Lang.get('nas.pools.form_input.address.first'), form.first);
            formData.append(Lang.get('nas.pools.form_input.address.last'), form.last);
            formData.append(Lang.get('nas.pools.form_input.upload'), '1');
            let response = await crudProfilePools(formData);
            if (response.data.params === null) {
                showError(response.data.message,500);
                return null;
            } else {
                //showSuccess(response.data.message,500);
                return response.data.params;
            }
        } catch (e) {
            responseMessage(e,500);
            return null;
        }
    }
    handleLoopProfile() {
        let indexList = this.state.lists.labels.findIndex((f)=> f.value === 'profiles');
        if (indexList >= 0) {
            if (this.state.lists.labels[indexList - 1].data.filter((f)=> f.value === null && f.bandwidth.value !== null && f.pool.value !== null).length > 0) {
                showError("Please complete previous lists");
            } else {
                if (this.state.lists.labels[indexList].data.filter((f)=> f.value === null && f.bandwidth.value !== null && f.pool.value !== null).length > 0) {
                    let lists = this.state.lists;
                    lists.labels[indexList].process = 0;
                    lists.labels[indexList].max = lists.labels[indexList].data.filter((f)=> f.value === null && f.bandwidth.value !== null && f.pool.value !== null).length;
                    lists.labels[indexList].loading = true;
                    this.setState({lists});
                    this.state.lists.labels[indexList].data.filter((f)=> f.value === null && f.bandwidth.value !== null && f.pool.value !== null).map(async (item, index) => {
                        if (item.value === null) {
                            if (item.bandwidth.value !== null && item.pool.value !== null) {
                                let formProfile = {
                                    id: item.id,
                                    package_id : null,
                                    code: item.name,
                                    local: item.group.local_address,
                                    nas: item.routerboard,
                                    pool: item.pool.value,
                                    additional: false,
                                    bandwidth: item.bandwidth.value,
                                    type: item.type === 'PPP' ? 'pppoe' : 'hotspot',
                                    name: item.name,
                                    price: 0,
                                    dns: item.group.dns_servers === null ? [] : item.group.dns_servers.split(","),
                                    netmask: null,
                                    limit: {
                                        type: null,
                                        rate: 0,
                                        unit: null,
                                    }
                                };
                                if (item.validity !== null && item.validity_unit !== null) {
                                    if (item.validity > 0) {
                                        formProfile.limit.type = 'time';
                                        formProfile.limit.rate = item.validity;
                                        formProfile.limit.unit = item.validity_unit.toLowerCase();
                                    }
                                } else {
                                    if (item.limit_data_rate !== null && item.limit_data_unit !== null) {
                                        if (item.limit_data_rate > 0) {
                                            formProfile.limit.type = 'data';
                                            formProfile.limit.rate = item.limit_data_rate;
                                            formProfile.limit.unit = item.limit_data_unit.toLowerCase();
                                        }
                                    }
                                }
                                await this.handleSubmitProfile(formProfile)
                                    .then((response) => {
                                        if (response !== null) {
                                            lists.labels[indexList].data[index].value = response.value;
                                            lists.labels[indexList].data[index].system = response;
                                            this.setState({lists});
                                        }
                                    })
                                    .catch(()=>{
                                        lists.labels[indexList].process++;
                                        if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                            lists.labels[indexList].loading = false;
                                            lists.labels[indexList].process = 0;
                                            lists.labels[indexList].max = 0;
                                            this.setState({lists}, () => {
                                                if (!lists.labels[indexList].loading) {
                                                    let next = null;
                                                    if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                        next = lists.labels[indexList + 1].value;
                                                    }
                                                    this.handleSave(null, next);
                                                }
                                            });
                                        }
                                    })
                                    .finally(()=>{
                                        lists.labels[indexList].process++;
                                        if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                            lists.labels[indexList].loading = false;
                                            lists.labels[indexList].process = 0;
                                            lists.labels[indexList].max = 0;
                                            this.setState({lists}, () => {
                                                if (!lists.labels[indexList].loading) {
                                                    let next = null;
                                                    if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                        next = lists.labels[indexList + 1].value;
                                                    }
                                                    this.handleSave(null, next);
                                                }
                                            });
                                        }
                                    })
                            }
                        }
                    });
                }
            }
        }
    }
    async handleSubmitProfile(form) {
        try {
            const formData = new FormData();
            formData.append('_method','put');
            if (form.id !== null) formData.append('system_id', form.id);
            if (form.package_id !== null) formData.append('package_id', form.package_id);
            formData.append(Lang.get('profiles.form_input.code'), form.code);
            formData.append(Lang.get('profiles.form_input.is_additional'), form.additional ? '1' : '0');
            formData.append(Lang.get('profiles.form_input.address.local'), form.local);
            formData.append(Lang.get('companies.form_input.name'), this.props.user.meta.company.id);
            formData.append(Lang.get('profiles.form_input.price'), form.price);
            formData.append(Lang.get('profiles.form_input.name'), form.name);
            //formData.append(Lang.get('profiles.form_input.address.subnet'), form.subnet);
            if (!form.additional) {
                formData.append(Lang.get('nas.form_input.name'), form.nas);
                formData.append(Lang.get('nas.pools.form_input.name'), form.pool);
                formData.append(Lang.get('bandwidths.form_input.name'), form.bandwidth);
                formData.append(Lang.get('profiles.form_input.type'), form.type);
                if (form.limit.type !== null) {
                    formData.append(Lang.get('profiles.form_input.limitation.type'), form.limit.type);
                    formData.append(Lang.get('profiles.form_input.limitation.rate'), form.limit.rate);
                    formData.append(Lang.get('profiles.form_input.limitation.unit'), form.limit.unit);
                }
                form.dns.map((item,index)=>{
                    formData.append(`${Lang.get('profiles.form_input.address.dns')}[${index}]`, item);
                });
            }


            let response = await crudProfile(formData);
            if (response.data.params === null) {
                showError(response.data.message,500);
                return null;
            } else {
                //showSuccess(response.data.message,500);
                return response.data.params;
            }
        } catch (e) {
            responseMessage(e,500);
            return null;
        }
    }
    handleLoopPackage() {
        let indexList = this.state.lists.labels.findIndex((f)=> f.value === 'packages');
        if (indexList >= 0) {
            if (this.state.lists.labels[indexList - 1].data.filter((f)=> f.value === null).length > 0) {
                showError("Please complete previous lists");
            } else {
                if (this.state.lists.labels[indexList].data.filter((f) => f.value === null).length > 0) {
                    let lists = this.state.lists;
                    lists.labels[indexList].process = 0;
                    lists.labels[indexList].max = lists.labels[indexList].data.filter((f)=> f.value === null).length;
                    lists.labels[indexList].loading = true;
                    this.setState({lists});
                    this.state.lists.labels[indexList].data.filter((f)=> f.value === null).map(async (item, index) => {
                        let formProfile = {
                            id : null,
                            package_id: item.id,
                            code: null,
                            local: null,
                            nas: null,
                            pool: null,
                            additional: true,
                            bandwidth: null,
                            type: null,
                            name: item.name,
                            price: item.price_with_tax,
                            dns: [],
                            netmask: null,
                            limit: {
                                type: null,
                                rate: 0,
                                unit: null,
                            }
                        };
                        await this.handleSubmitProfile(formProfile)
                            .then((response) => {
                                if (response !== null) {
                                    lists.labels[indexList].data[index].value = response.value;
                                    lists.labels[indexList].data[index].system = response;
                                    this.setState({lists});
                                }
                            })
                            .catch(()=>{
                                lists.labels[indexList].process++;
                                if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                    lists.labels[indexList].loading = false;
                                    lists.labels[indexList].process = 0;
                                    lists.labels[indexList].max = 0;
                                    this.setState({lists}, () => {
                                        if (!lists.labels[indexList].loading) {
                                            let next = null;
                                            if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                next = lists.labels[indexList + 1].value;
                                            }
                                            this.handleSave(null, next);
                                        }
                                    });
                                }
                            })
                            .finally(()=>{
                                lists.labels[indexList].process++;
                                if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                    lists.labels[indexList].loading = false;
                                    lists.labels[indexList].process = 0;
                                    lists.labels[indexList].max = 0;
                                    this.setState({lists}, () => {
                                        if (!lists.labels[indexList].loading) {
                                            let next = null;
                                            if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                next = lists.labels[indexList + 1].value;
                                            }
                                            this.handleSave(null, next);
                                        }
                                    });
                                }
                            })
                    });
                }
            }
        }
    }
    handleLoopCustomer() {
        let indexList = this.state.lists.labels.findIndex((f)=> f.value === 'customers');
        if (indexList >= 0) {
            if (this.state.lists.labels[indexList - 1].data.filter((f)=> f.value === null).length > 0) {
                showError("Please complete previous lists");
            } else {
                if (this.state.lists.labels[indexList].data.filter((f) => f.value === null && f.main_service !== null && f.nas_customer !== null).length > 0) {
                    let lists = this.state.lists;
                    lists.labels[indexList].process = 0;
                    lists.labels[indexList].max = lists.labels[indexList].data.filter((f) => f.value === null && f.main_service !== null && f.nas_customer !== null).length;
                    lists.labels[indexList].loading = true;
                    this.setState({lists});
                    this.state.lists.labels[indexList].data.filter((f) => f.value === null && f.main_service !== null && f.nas_customer !== null).map(async (item, index) => {
                        if (item.value === null && item.main_service !== null && item.nas_customer !== null) {
                            let formCustomer = {
                                id : item.id,
                                due_at : item.nas_customer.due_at,
                                code : item.code,
                                profile : item.main_service.id,
                                nas : item.routerboard,
                                type : item.nas_customer.type === 'PPOE' ? 'pppoe' : 'hotspot',
                                name : item.name,
                                address : item.address,
                                paid_type : item.nas_customer.paid_type.toLowerCase(),
                                email : null,
                                village : item.village_obj === null ? null : item.village_obj.code,
                                district : item.district_obj === null ? null : item.district_obj.code,
                                city : item.city_obj === null ? null : item.city_obj.code,
                                province : item.province_obj === null ? null : item.province_obj.code,
                                postal : item.postal,
                                phone : item.phone,
                                username : item.nas_customer.username,
                                password : item.nas_customer.password,
                                services : []
                            };
                            /*if (item.email !== null) {
                                if (item.email.length > 5) {
                                    formCustomer.email = item.email;
                                }
                            }*/
                            //formCustomer.services.push(item.main_service.id);
                            if (item.additional_service !== null) {
                                formCustomer.services.push(item.additional_service.id);
                            }
                            await this.handleSubmitCustomer(formCustomer)
                                .then((response) => {
                                    if (response !== null) {
                                        lists.labels[indexList].data[index].value = response.value;
                                        lists.labels[indexList].data[index].system = response;
                                        this.setState({lists});
                                    }
                                })
                                .catch(()=>{
                                    lists.labels[indexList].process++;
                                    if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                        lists.labels[indexList].loading = false;
                                        lists.labels[indexList].process = 0;
                                        lists.labels[indexList].max = 0;
                                        this.setState({lists}, () => {
                                            if (!lists.labels[indexList].loading) {
                                                let next = null;
                                                if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                    next = lists.labels[indexList + 1].value;
                                                }
                                                this.handleSave(null, next);
                                            }
                                        });
                                    }
                                })
                                .finally(()=>{
                                    lists.labels[indexList].process++;
                                    if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                        lists.labels[indexList].loading = false;
                                        lists.labels[indexList].process = 0;
                                        lists.labels[indexList].max = 0;
                                        this.setState({lists}, () => {
                                            if (!lists.labels[indexList].loading) {
                                                let next = null;
                                                if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                    next = lists.labels[indexList + 1].value;
                                                }
                                                this.handleSave(null, next);
                                            }
                                        });
                                    }
                                });
                        }
                    });
                }
            }
        }
    }
    async handleSubmitCustomer(form) {
        try {
            const formData = new FormData();
            formData.append('_method', 'put');
            formData.append('system_id', form.id);
            formData.append('code', form.code);
            formData.append(Lang.get('profiles.form_input.name'), form.profile);
            formData.append(Lang.get('nas.form_input.name'), form.nas);
            formData.append(Lang.get('customers.form_input.type'), form.type);
            formData.append(Lang.get('customers.form_input.name'), form.name);
            formData.append(Lang.get('customers.form_input.address.street'), form.address);
            formData.append(Lang.get('customers.form_input.paid_type'), form.paid_type);
            if (form.due_at !== null) formData.append('due_at', form.due_at);
            if (form.email !== null) formData.append(Lang.get('customers.form_input.email'), form.email);
            if (form.village !== null) formData.append(Lang.get('customers.form_input.address.village'), form.village);
            if (form.district !== null) formData.append(Lang.get('customers.form_input.address.district'), form.district);
            if (form.city !== null) formData.append(Lang.get('customers.form_input.address.city'), form.city);
            if (form.province !== null) formData.append(Lang.get('customers.form_input.address.province'), form.province);
            formData.append(Lang.get('customers.form_input.address.postal'), form.postal);
            formData.append(Lang.get('customers.form_input.address.phone'), form.phone);
            if (form.username.length > 1) formData.append(Lang.get('customers.form_input.username'), form.username);
            if (form.password.length > 1) formData.append(Lang.get('customers.form_input.password'), form.password);
            form.services.map((item,index)=>{
                formData.append(`${Lang.get('customers.form_input.service.input')}[${index}][${Lang.get('customers.form_input.service.name')}]`, item);
            });

            let response = await crudCustomers(formData);
            if (response.data.params === null) {
                showError(response.data.message,500);
                return null;
            } else {
                //showSuccess(response.data.message,500);
                return response.data.params;
            }
        } catch (e) {
            responseMessage(e,500);
            return null;
        }
    }
    handleLoopInvoice() {
        let indexList = this.state.lists.labels.findIndex((f)=> f.value === 'invoices');
        if (indexList >= 0) {
            if (this.state.lists.labels[indexList - 1].data.filter((f) => f.value === null).length > 0) {
                showError("Please complete previous lists");
            } else {
                if (this.state.lists.labels[indexList].data.filter((f) => f.value === null).length > 0) {
                    let lists = this.state.lists;
                    lists.labels[indexList].process = 0;
                    lists.labels[indexList].max = lists.labels[indexList].data.filter((f) => f.value === null).length;
                    lists.labels[indexList].loading = true;
                    this.setState({lists});
                    this.state.lists.labels[indexList].data.filter((f) => f.value === null).map(async (item, index) => {
                        if (item.value === null) {
                            let formInvoice = {
                                id: item.id,
                                bill_period: item.date_invoice,
                                customer: item.system_customer,
                                note: item.order_id,
                                order_id: item.order_id,
                                services: [],
                                total: item.price_with_tax,
                            };
                            formInvoice.services.push(item.system_package);
                            await this.handleSubmitInvoice(formInvoice)
                                .then((response) => {
                                    if (response !== null) {
                                        lists.labels[indexList].data[index].value = response.value;
                                        lists.labels[indexList].data[index].system = response;
                                        this.setState({lists});
                                    }
                                })
                                .catch(()=>{
                                    lists.labels[indexList].process++;
                                    if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                        lists.labels[indexList].loading = false;
                                        lists.labels[indexList].process = 0;
                                        lists.labels[indexList].max = 0;
                                        this.setState({lists}, () => {
                                            if (!lists.labels[indexList].loading) {
                                                let next = null;
                                                if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                    next = lists.labels[indexList + 1].value;
                                                }
                                                this.handleSave(null, next);
                                            }
                                        });
                                    }
                                })
                                .finally(()=>{
                                    lists.labels[indexList].process++;
                                    if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                        lists.labels[indexList].loading = false;
                                        lists.labels[indexList].process = 0;
                                        lists.labels[indexList].max = 0;
                                        this.setState({lists}, () => {
                                            if (!lists.labels[indexList].loading) {
                                                let next = null;
                                                if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                    next = lists.labels[indexList + 1].value;
                                                }
                                                this.handleSave(null, next);
                                            }
                                        });
                                    }
                                });
                        }
                    });
                }
            }
        }
    }
    async handleSubmitInvoice(form) {
        try {
            const formData = new FormData();
            formData.append('_method', 'put');
            if (form.id !== null) formData.append('system_id', form.id);
            formData.append('order_id', form.order_id);
            if (form.bill_period !== null) formData.append(Lang.get('invoices.form_input.bill_period'), moment(form.bill_period).format('yyyy-MM-DD'));
            if (form.customer !== null) formData.append(Lang.get('customers.form_input.name'), form.customer);
            formData.append(Lang.get('invoices.form_input.note'), form.note);
            form.services.map((item,index)=>{
                formData.append(`${Lang.get('invoices.form_input.service.input')}[${index}][${Lang.get('profiles.form_input.name')}]`, item);
            });
            formData.append(Lang.get('invoices.form_input.total'), form.total);
            let response = await crudCustomerInvoices(formData);
            if (response.data.params === null) {
                showError(response.data.message,500);
                return null;
            } else {
                //showSuccess(response.data.message,500);
                return response.data.params;
            }
        } catch (err) {
            responseMessage(err,500);
            return null;
        }
    }
    handleLoopPayment() {
        let indexList = this.state.lists.labels.findIndex((f)=> f.value === 'payments');
        if (indexList >= 0) {
            if (this.state.lists.labels[indexList - 1].data.filter((f) => f.value === null && f.system_customer !== null).length > 0) {
                showError("Please complete previous lists");
            } else {
                if (this.state.lists.labels[indexList].data.filter((f) => f.value === null).length > 0) {
                    let lists = this.state.lists;
                    lists.labels[indexList].process = 0;
                    lists.labels[indexList].max = lists.labels[indexList].data.filter((f) => f.value === null).length;
                    lists.labels[indexList].loading = true;
                    this.setState({lists});
                    this.state.lists.labels[indexList].data.filter((f) => f.value === null).map(async (item, index) => {
                        if (item.value === null) {
                            let formPayments = {
                                id : item.id,
                                invoice: item.system_invoice,
                                payments: [],
                                total: item.ammount,
                            };
                            formPayments.payments.push({
                                at: item.periode,
                                note: item.note,
                                amount: item.ammount,
                            });
                            await this.handleSubmitPayment(formPayments)
                                .then((response) => {
                                    if (response !== null) {
                                        lists.labels[indexList].data[index].value = response.value;
                                        lists.labels[indexList].data[index].system = response;
                                        this.setState({lists});
                                    }
                                })
                                .catch(()=>{
                                    lists.labels[indexList].process++;
                                    if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                        lists.labels[indexList].loading = false;
                                        lists.labels[indexList].process = 0;
                                        lists.labels[indexList].max = 0;
                                        this.setState({lists}, () => {
                                            if (!lists.labels[indexList].loading) {
                                                let next = null;
                                                if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                    next = lists.labels[indexList + 1].value;
                                                }
                                                this.handleSave(null, next);
                                            }
                                        });
                                    }
                                })
                                .finally(()=>{
                                    lists.labels[indexList].process++;
                                    if (lists.labels[indexList].process >= lists.labels[indexList].max) {
                                        lists.labels[indexList].loading = false;
                                        lists.labels[indexList].process = 0;
                                        lists.labels[indexList].max = 0;
                                        this.setState({lists}, () => {
                                            if (!lists.labels[indexList].loading) {
                                                let next = null;
                                                if (typeof lists.labels[indexList + 1] !== 'undefined') {
                                                    next = lists.labels[indexList + 1].value;
                                                }
                                                this.handleSave(null, next);
                                            }
                                        });
                                    }
                                });
                        }
                    });
                }
            }
        }
    }
    async handleSubmitPayment(form) {
        try {
            const formData = new FormData();
            formData.append('_method', 'put');
            if (form.invoice !== null) formData.append(Lang.get('invoices.form_input.id'), form.invoice);
            form.payments.map((item,index)=>{
                if (item.at !== null) formData.append(`${Lang.get('invoices.payments.form_input.payment.input')}[${index}][${Lang.get('invoices.payments.form_input.payment.date')}]`, moment(item.at).format('yyyy-MM-DD HH:mm:ss'));
                if (form.id !== null) formData.append('system_id', form.id);
                formData.append(`${Lang.get('invoices.payments.form_input.payment.input')}[${index}][${Lang.get('invoices.payments.form_input.payment.note')}]`, item.note);
                formData.append(`${Lang.get('invoices.payments.form_input.payment.input')}[${index}][${Lang.get('invoices.payments.form_input.payment.amount')}]`, item.amount);
            });
            formData.append(Lang.get('invoices.payments.form_input.total.payment'), form.total);
            let response = await crudCustomerInvoicePayments(formData);
            if (response.data.params === null) {
                showError(response.data.message,500);
                return null;
            } else {
                //showSuccess(response.data.message,500);
                return response.data.params;
            }
        } catch (err) {
            responseMessage(err,500);
            return null;
        }
    }
    async loadLists(labels) {
        if (this.state.form.branch !== null) {
            try {
                const formData = new FormData();
                formData.append('hostname', this.state.form.hostname);
                formData.append('port', this.state.form.port);
                formData.append('user', this.state.form.user);
                formData.append('db_name', this.state.form.name);
                formData.append('pass', this.state.form.pass);
                formData.append('type', labels);
                formData.append('branch', this.state.form.branch.value);
                let response = await readDataRST(formData);
                if (response.data.params === null) {
                    return null;
                    //this.setState({loading:false});
                    //showError(response.data.message);
                } else {
                    //console.log(response.data.params);
                    return response.data.params;
                    /*let index;
                    response.data.params.map((item)=>{
                        index = lists.labels.findIndex((f)=> f.value === item.value);
                        if (index >= 0) {
                            lists.labels[index].data = item.data;
                            lists.labels[index].process = 0;
                            lists.labels[index].max = 0;
                        }
                    });
                    this.setState({loading:false,lists},()=>{
                        /!*this.handleLoopNas();
                        this.handleLoopProfile();*!/
                    });*/
                    //console.log(response.data.params);
                }
            } catch (e) {
                responseMessage(e);
                return null;
                //this.setState({loading:false});
            }
        }
    }
    async handleReadBranch(e = null) {
        if (e !== null) {
            e.preventDefault();
        }
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('hostname', this.state.form.hostname);
            formData.append('port', this.state.form.port);
            formData.append('user', this.state.form.user);
            formData.append('db_name', this.state.form.name);
            formData.append('pass', this.state.form.pass);
            let response = await readBranchRST(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false,branches:response.data.params});
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    async handleSave(e = null, listValue = null) {
        if (e !== null) {
            e.preventDefault();
        }
        if (this.state.form.branch === null) {
            showError("Please select branch");
        } else {
            let lists = this.state.lists;
            if (listValue !== null) {
                let index = lists.labels.findIndex((f)=> f.value === listValue);
                if (index >= 0) {
                    lists.process = 0;
                    lists.max = 1;
                    this.setState({loading:true,lists});
                    lists.labels[index].loading = true;
                    this.setState({lists});
                    this.loadLists(listValue)
                        .then((response)=>{
                            if (response !== null) {
                                lists.labels[index].loading = false;
                                lists.labels[index].data = response.data;
                                this.setState({lists});
                            }
                        })
                        .catch(()=>{
                            lists.process++;
                            lists.labels[index].loading = false;
                            if (lists.process >= lists.max) {
                                lists.process = 0;
                                lists.max = 0;
                                this.setState({loading:false});
                            }
                            this.setState({lists});
                        })
                        .finally(()=>{
                            lists.process++;
                            lists.labels[index].loading = false;
                            if (lists.process >= lists.max) {
                                lists.process = 0;
                                lists.max = 0;
                                this.setState({loading:false});
                            }
                            this.setState({lists});
                        });
                }
            } else {
                lists.max = lists.labels.length;
                this.setState({loading:true,lists});
                lists.labels.map((item,index)=>{
                    if (lists.labels[index].data.filter((f)=> f.value !== null).length < lists.labels[index].data.length || lists.labels[index].data.length === 0 || ! lists.labels[index].loading) {
                        lists.labels[index].loading = true;
                        this.setState({lists});
                        this.loadLists(item.value)
                            .then((response)=>{
                                if (response !== null) {
                                    lists.labels[index].loading = false;
                                    lists.labels[index].data = response.data;
                                    this.setState({lists});
                                }
                            })
                            .catch(()=>{
                                lists.process++;
                                lists.labels[index].loading = false;
                                if (lists.process >= lists.max) {
                                    lists.process = 0;
                                    lists.max = 0;
                                    this.setState({loading:false});
                                }
                                this.setState({lists});
                            })
                            .finally(()=>{
                                lists.process++;
                                lists.labels[index].loading = false;
                                if (lists.process >= lists.max) {
                                    lists.process = 0;
                                    lists.max = 0;
                                    this.setState({loading:false});
                                }
                                this.setState({lists});
                            })
                    } else {
                        lists.process++;
                        lists.labels[index].loading = false;
                        if (lists.process >= lists.max) {
                            lists.process = 0;
                            lists.max = 0;
                            this.setState({loading:false});
                        }
                        this.setState({lists});
                    }
                });
            }
        }
    }

    render() {
        return (
            <React.Fragment>
                <Dialog fullWidth maxWidth="xl" scroll="body" open={this.props.open} onClose={()=>this.state.loading || this.state.lists.labels.filter((f)=> f.loading).length > 0 ? null : this.props.handleClose()}>
                    <form onSubmit={this.state.branches.length === 0 ? this.handleReadBranch : this.handleSave}>
                        <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('backup.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('backup.labels.menu')})}}/>
                        <DialogContent dividers>
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">Hostname</label>
                                        <div className="col-md-8">
                                            <input className="form-control form-control-sm text-xs" value={this.state.form.hostname} name="hostname" onChange={this.handleChange} disabled={this.state.loading}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">Port</label>
                                        <div className="col-md-8">
                                            <input className="form-control form-control-sm text-xs" value={this.state.form.port} name="port" onChange={this.handleChange} disabled={this.state.loading}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">User</label>
                                        <div className="col-md-8">
                                            <input className="form-control form-control-sm text-xs" value={this.state.form.user} name="user" onChange={this.handleChange} disabled={this.state.loading}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">Password</label>
                                        <div className="col-md-8">
                                            <input className="form-control form-control-sm text-xs" value={this.state.form.pass} name="pass" onChange={this.handleChange} disabled={this.state.loading}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">DB Name</label>
                                        <div className="col-md-8">
                                            <input className="form-control form-control-sm text-xs" value={this.state.form.name} name="name" onChange={this.handleChange} disabled={this.state.loading}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-md-4 col-form-label text-xs">CABANG RST</label>
                                        <div className="col-md-8">
                                            <Select options={this.state.branches}
                                                    value={this.state.form.branch}
                                                    onChange={this.handleSelect}
                                                    isLoading={this.state.loading} isDisabled={this.state.loading}
                                                    menuPlacement="top" maxMenuHeight={150}
                                                    styles={FormControlSMReactSelect}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    <table className="table table-sm table-striped">
                                        <thead>
                                        <tr>
                                            <th className="align-middle text-xs">TABEL</th>
                                            <th width={100} className="align-middle text-xs text-center">TOTAL</th>
                                            <th width={100} className="align-middle text-xs text-center">IMPORTED</th>
                                            <th width={120} className="align-middle text-xs text-center">PROGRESS</th>
                                            <th width={50} className="align-middle text-xs text-center">START</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.lists.labels.map((item,index)=>
                                            <tr key={`row${index}`}>
                                                <td className="align-middle text-xs">{item.label}</td>
                                                <td className="align-middle text-xs text-center">{item.data.length}</td>
                                                <td className="align-middle text-xs text-center">
                                                    <GetLocalCounter {...this.state} item={item}/>
                                                </td>
                                                <td className="align-middle text-xs text-center">
                                                    {item.max === 0 ? '-' :
                                                        <div className="progress">
                                                            <div className="progress-bar bg-primary progress-bar-striped" role="progressbar" aria-valuenow={(item.process / item.max) * 100} aria-valuemin="0" aria-valuemax="100" style={{width:( (item.process / item.max) * 100 )+'%'}}>
                                                                <span style={{fontSize:'8px'}}>{formatLocaleString((item.process / item.max) * 100,2)} %</span>
                                                            </div>
                                                        </div>
                                                    }
                                                </td>
                                                <td className="align-middle text-xs text-center">
                                                    {item.handle !== null && item.data.length > 0 && item.data.filter((f)=> f.value === null).length > 0 &&
                                                        <ButtonPlay lists={this.state.lists} loading={this.state.loading} item={item}/>
                                                    }
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </DialogContent>
                        {
                            this.state.branches.length === 0 ?
                                <ModalFooter
                                    form={this.state.form} handleClose={()=>this.props.handleClose()}
                                    loading={this.state.loading || this.state.lists.labels.filter((f)=> f.loading).length > 0}
                                    pendings={{create:Lang.get('labels.read.pending',{Attribute:'Database'}),update:Lang.get('labels.read.pending',{Attribute:'Database'})}}
                                    langs={{create:Lang.get('labels.read.submit',{Attribute:'Database'}),update:Lang.get('labels.read.submit',{Attribute:'Database'})}}/>
                                :
                                <ModalFooter
                                    form={this.state.form} handleClose={()=>this.props.handleClose()}
                                    loading={this.state.loading || this.state.lists.labels.filter((f)=> f.loading).length > 0}
                                    pendings={{create:Lang.get('labels.read.pending',{Attribute:'Cabang'}),update:Lang.get('labels.read.pending',{Attribute:'Cabang'})}}
                                    langs={{create:Lang.get('labels.read.submit',{Attribute:'Cabang'}),update:Lang.get('labels.read.submit',{Attribute:'Cabang'})}}/>
                        }
                    </form>
                </Dialog>
            </React.Fragment>
        )
    }

}
export default ModalImportRST;
