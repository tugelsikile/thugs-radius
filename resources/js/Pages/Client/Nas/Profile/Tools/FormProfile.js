import React from "react";
import {
    durationType, durationTypeByte,
    formatBytes, FormControlSMReactSelect, hasWhiteSpace,
    limitType,
    parseInputFloat, pipeIp,
    responseMessage, serviceType
} from "../../../../../Components/mixedConsts";
import {ModalFooter, ModalHeader} from "../../../../../Components/ModalComponent";
import {Dialog, DialogContent, Tooltip} from "@mui/material";
import Select from "react-select";
import {InputText} from "../../../../../Components/CustomInput";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faRefresh, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {crudProfile, getParentQueue} from "../../../../../Services/NasService";
import {showError, showSuccess} from "../../../../../Components/Toaster";
import {NumericFormat} from "react-number-format";
import MaskedInput from "react-text-mask";
import FormNas from "../../Tools/FormNas";
import FormPool from "../Pool/Tools/FormPool";
import FormBandwidth from "../Bandwidth/Tools/FormBandwidth";

// noinspection JSCheckFunctionSignatures,CommaExpressionJS,DuplicatedCode
class FormProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false, queues : [],
            form : {
                id : null, company : null, pool : null, bandwidth : null, nas : null,
                description : '', name : '', type : serviceType[0],
                additional : false, price : 0,
                address : { local : '', dns : [] },
                limit : { type : null, rate : 0, unit : null },
                queue : null,
            },
            modals : {
                nas : { open : false, data : null },
                pool : { open : false, data : null },
                bandwidth : { open : false, data : null },
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.loadParentQueue = this.loadParentQueue.bind(this);
        this.handleAddDns = this.handleAddDns.bind(this);
        this.handleRemoveDns = this.handleRemoveDns.bind(this);
        this.toggleNas = this.toggleNas.bind(this);
        this.toggleBandwidth = this.toggleBandwidth.bind(this);
        this.togglePool = this.togglePool.bind(this);
    }
    componentWillReceiveProps(props) {
        this.setState({loading:true});
        let dataParentQueue = null;
        let form = this.state.form;
        let index;
        if (! props.open) {
            form.id = null, form.company = null, form.pool = null, form.bandwidth = null,
                form.name = '', form.type = serviceType[0],
                form.nas = null,
                form.additional = false, form.price = 0,
                form.description = '',
                form.address.local = '', form.address.dns = [],
                form.queue = null;
        } else {
            if (props.data !== null) {
                if (props.nas !== null) {
                    if (props.nas.length > 0) {
                        if (props.data.meta.nas !== null) {
                            index = props.nas.findIndex((f) => f.value === props.data.meta.nas.id);
                            if (index >= 0) {
                                form.nas = props.nas[index];
                            }
                        }
                    }
                }
                if (props.pools !== null) {
                    if (props.pools.length > 0) {
                        if (props.data.meta.pool !== null) {
                            index = props.pools.findIndex((f) => f.value === props.data.meta.pool.id);
                            if (index >= 0) {
                                form.pool = props.pools[index];
                            }
                        }
                    }
                }
                if (props.bandwidths !== null) {
                    if (props.bandwidths.length > 0) {
                        if (props.data.meta.bandwidth !== null) {
                            index = props.bandwidths.findIndex((f) => f.value === props.data.meta.bandwidth.id);
                            if (index >= 0) {
                                form.bandwidth = props.bandwidths[index];
                            }
                        }
                    }
                }
                form.id = props.data.value, form.name = props.data.label,
                    form.description = props.data.meta.description,
                    form.additional = props.data.meta.additional,
                    form.limit.rate = props.data.meta.limit.rate,
                    form.price = props.data.meta.price;
                index = limitType.findIndex((f) => f.value === props.data.meta.limit.type);
                if (index >= 0) {
                    form.limit.type = limitType[index];
                }
                if (props.data.meta.limit.type === 'time') {
                    index = durationType.findIndex((f) => f.value === props.data.meta.limit.unit);
                    if (index >= 0) {
                        form.limit.unit = durationType[index];
                    }
                } else if (props.data.meta.limit.type === 'data') {
                    index = durationTypeByte.findIndex((f) => f.value === props.data.meta.limit.unit);
                    if (index >= 0) {
                        form.limit.unit = durationTypeByte[index];
                    }
                }
                if (props.data.meta.dns !== null) {
                    form.address.dns = [];
                    if (props.data.meta.dns.length > 0) {
                        props.data.meta.dns.map((item)=>{
                            form.address.dns.push({label:item});
                        });
                    }
                }
                if (props.data.meta.queue !== null) {
                    dataParentQueue = props.data.meta.queue;
                }
            }
        }
        this.setState({form,loading:false}, ()=>{
            if (form.nas !== null) {
                this.loadParentQueue(dataParentQueue);
            }
        });
    }
    toggleNas(data = null) {
        let modals = this.state.modals;
        modals.nas.open = ! this.state.modals.nas.open;
        modals.nas.data = data;
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
    handleRemoveDns(index) {
        let form = this.state.form;
        form.address.dns.splice(index,1); this.setState({form});
    }
    handleAddDns() {
        let form = this.state.form;
        form.address.dns.push({label:''});
        this.setState({form});
    }
    handleCheck(event) {
        let form = this.state.form;
        form.additional = event.target.checked;
        form.queue = null, form.limit.rate = 0,
        form.nas = null, form.pool = null, form.bandwidth = null,form.address.dns = [];
        this.setState({form,queues:[]});
    }
    handleChange(event) {
        let form = this.state.form;
        if (['price','value','limit'].indexOf(event.target.name) !== -1) {
            switch (event.target.name) {
                case 'price' : form.price = parseInputFloat(event); break;
                case 'value' : form.duration.value = parseInputFloat(event); break;
                case 'limit' : form.limit.rate = parseInputFloat(event); break;
            }
        } else if (['name','description','local'].indexOf(event.target.name) !== -1) {
            if (event.target.name === 'local') {
                form.address.local = event.target.value;
            } else {
                form[event.target.name] = event.target.value;
            }
        } else if (event.target.name === 'dns') {
            let index = event.target.getAttribute('data-index');
            form.address.dns[index].label = event.target.value;
        }
        this.setState({form});
    }
    handleSelect(event, name) {
        let form = this.state.form;
        if (name === 'duration') {
            form.duration.unit = event;
        } else if (name === 'limit') {
            form.limit.type = event;
            if (form.limit.type !== null) {
                if (form.limit.type.value === 'time') {
                    form.limit.unit = durationType[1];
                } else {
                    form.limit.unit = durationTypeByte[0];
                }
            } else {
                form.limit.rate = 0, form.limit.unit = null;
            }
        } else if (name === 'unit') {
            form.limit.unit = event;
        } else {
            form[name] = event;
        }
        if (name === 'nas') {
            form.pool = null,
            form.queue = null;
            if (form.nas !== null) {
                this.loadParentQueue();
            }
        }
        this.setState({form});
    }
    async loadParentQueue(data = null) {
        this.setState({loading:true,queues:[]});
        try {
            const formData = new FormData();
            if (this.state.form.nas !== null) formData.append(Lang.get('nas.form_input.name'), this.state.form.nas.value);
            let response = await getParentQueue(formData,true);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                let form = this.state.form;
                let queues = response.data.params;
                if (data != null) {
                    let index = null;
                    if (data.value !== null) {
                        index = queues.findIndex((f) => f.value === data['.id']);
                    } else if (data.label !== null) {
                        index = queues.findIndex((f) => f.label === data.label);
                    }
                    if (index >= 0) {
                        form.queue = queues[index];
                    }
                }
                this.setState({loading:false,queues,form});
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    async handleSave(e) {
        e.preventDefault();
        if (hasWhiteSpace(this.state.form.name) && ! this.state.form.additional) {
            showError(Lang.get('profiles.labels.name_invalid'));
        } else {
            this.setState({loading:true});
            try {
                const formData = new FormData();
                formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
                if (this.state.form.id !== null) formData.append(Lang.get('profiles.form_input.id'), this.state.form.id);
                formData.append(Lang.get('profiles.form_input.is_additional'), this.state.form.additional ? 1 : 0);
                if (this.state.form.company !== null) formData.append(Lang.get('companies.form_input.name'), this.state.form.company.value);
                if (this.state.form.nas !== null) formData.append(Lang.get('nas.form_input.name'), this.state.form.nas.value);
                if (this.state.form.pool !== null) formData.append(Lang.get('nas.pools.form_input.name'), this.state.form.pool.value);
                if (this.state.form.bandwidth !== null) formData.append(Lang.get('bandwidths.form_input.name'), this.state.form.bandwidth.value);
                if (this.state.form.type !== null) formData.append(Lang.get('profiles.form_input.type'), this.state.form.type.value);

                if (this.state.form.queue !== null) {
                    formData.append(Lang.get('profiles.form_input.queue.name'), this.state.form.queue.label);
                    formData.append(Lang.get('profiles.form_input.queue.id'), this.state.form.queue.value);
                    formData.append(Lang.get('profiles.form_input.queue.target'), this.state.form.queue.meta.data.target);
                }
                formData.append(Lang.get('profiles.form_input.name'), this.state.form.name);
                formData.append(Lang.get('profiles.form_input.description'), this.state.form.description);
                formData.append(Lang.get('profiles.form_input.price'), this.state.form.price);
                if (this.state.form.limit.type !== null) {
                    formData.append(Lang.get('profiles.form_input.limitation.type'), this.state.form.limit.type.value);
                    formData.append(Lang.get('profiles.form_input.limitation.rate'), this.state.form.limit.rate);
                    if (this.state.form.limit.unit !== null) formData.append(Lang.get('profiles.form_input.limitation.unit'), this.state.form.limit.unit.value);
                }
                this.state.form.address.dns.map((item,index)=>{
                    formData.append(`${Lang.get('profiles.form_input.address.dns')}[${index}]`, item.label);
                });

                let response = await crudProfile(formData,true);
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
                responseMessage(e);
            }
        }
    }
    render() {
        return (
            <React.Fragment>
                <FormBandwidth user={this.props.user} companies={this.props.companies} loadings={this.props.loadings} open={this.state.modals.bandwidth.open} data={this.state.modals.bandwidth.data} handleClose={this.toggleBandwidth} handleUpdate={this.props.onUpdateBandwidth}/>
                <FormPool privilege={this.props.privilege} open={this.state.modals.pool.open} data={this.state.modals.pool.data} companies={this.props.companies} user={this.props.user} nas={this.props.nas} handleClose={this.togglePool} handleUpdate={this.props.onUpdatePool} loadings={this.props.loadings}/>
                <FormNas open={this.state.modals.nas.open} data={this.state.modals.nas.data} companies={this.props.companies} user={this.props.user} handleClose={this.toggleNas} handleUpdate={this.props.onUpdateNas}/>
                <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                    <form onSubmit={this.handleSave}>
                        <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('profiles.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('profiles.labels.menu')})}}/>
                        <DialogContent dividers>
                            {this.state.form.id === null &&
                                <div className="form-group row">
                                    <div className="col-md-10 offset-2">
                                        <div className="custom-control custom-checkbox">
                                            <input onChange={this.handleCheck} className="custom-control-input" type="checkbox" id="inputAdditional" checked={this.state.form.additional}/>
                                            <label htmlFor="inputAdditional" className="custom-control-label text-xs">
                                                {this.state.form.additional ? Lang.get('profiles.labels.additional.info_true') : Lang.get('profiles.labels.additional.info_false')}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            }

                            {this.state.form.additional ? null :
                                <React.Fragment>
                                    <div className="form-group row">
                                        <label className="col-md-2 col-form-label text-xs">{Lang.get('nas.labels.name')}</label>
                                        <div className="col-md-4">
                                            <div className="row">
                                                <div className="col-md-10">
                                                    {this.state.form.id === null ?
                                                        <Select styles={FormControlSMReactSelect}
                                                                noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('nas.labels.menu')})}
                                                                placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('nas.labels.menu')})}
                                                                onChange={(e)=>this.handleSelect(e,'nas')}
                                                                value={this.state.form.nas}
                                                                options={this.props.nas}
                                                                isLoading={this.props.loadings.nas}
                                                                isDisabled={this.state.loading || this.props.loadings.nas}/>
                                                        :
                                                        <div className="form-control form-control-sm text-xs">{this.state.form.nas.label}</div>
                                                    }
                                                </div>
                                                <div className="col-md-2">
                                                    {this.state.form.nas === null ?
                                                        this.props.privilege !== null && typeof this.props.privilege.nas !== 'undefined' && this.props.privilege.nas !== null && this.props.privilege.nas.create &&
                                                        <Tooltip title={Lang.get('labels.create.label',{Attribute:Lang.get('nas.labels.menu')})}>
                                                            <button onClick={()=>this.toggleNas()} type="button" disabled={this.state.loading || this.props.loadings.nas} className="btn btn-outline-primary btn-sm text-xs"><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                        </Tooltip>
                                                        :
                                                        this.props.privilege !== null && typeof this.props.privilege.nas !== 'undefined' && this.props.privilege.nas !== null && this.props.privilege.nas.create &&
                                                        <Tooltip title={Lang.get('labels.update.label',{Attribute:Lang.get('nas.labels.menu')})}>
                                                            <button onClick={()=>this.toggleNas(this.state.form.nas)} type="button" disabled={this.state.loading || this.props.loadings.nas} className="btn btn-outline-info btn-sm text-xs"><FontAwesomeIcon icon={faPencilAlt} size="sm"/></button>
                                                        </Tooltip>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {this.state.form.nas === null ? null :
                                            <React.Fragment>
                                                <label className="col-md-2 col-form-label text-xs">{this.state.form.nas.meta.auth.method === 'api' ? Lang.get('nas.labels.ip.label') : Lang.get('nas.labels.domain.label')}</label>
                                                <div className="col-md-2">
                                                    <div className="form-control form-control-sm text-xs">{this.state.form.nas.meta.auth.method === 'api' ? this.state.form.nas.meta.auth.ip : this.state.form.nas.meta.auth.host}</div>
                                                </div>
                                            </React.Fragment>
                                        }
                                    </div>

                                    <div className="form-group row">
                                        <label className="col-md-2 col-form-label text-xs">{Lang.get('profiles.labels.service_type')}</label>
                                        <div className="col-md-2">
                                            <Select styles={FormControlSMReactSelect} options={serviceType} value={this.state.form.type} isDisabled={this.state.loading} onChange={(e)=>this.handleSelect(e,'type')}/>
                                        </div>
                                    </div>

                                    <div className="form-group row">
                                        <label className="col-md-2 col-form-label text-xs">{Lang.get('nas.pools.labels.name')}</label>
                                        <div className="col-md-4">
                                            <div className="row">
                                                <div className="col-md-10">
                                                    <Select styles={FormControlSMReactSelect}
                                                            noOptionsMessage={()=>Lang.get('labels.select.not_found',{Attribute:Lang.get('nas.pools.labels.menu')})}
                                                            placeholder={Lang.get('labels.select.option',{Attribute:Lang.get('nas.pools.labels.menu')})}
                                                            onChange={(e)=>this.handleSelect(e,'pool')}
                                                            options={this.state.form.nas === null ? [] : this.props.pools.filter((f) => f.meta.nas.id === this.state.form.nas.value)}
                                                            value={this.state.form.pool} isLoading={this.props.loadings.pools} isDisabled={this.state.loading || this.props.loadings.pools}/>
                                                </div>
                                                <div className="col-md-2">
                                                    {this.state.form.nas === null ? null :
                                                        this.state.form.pool === null ?
                                                            this.props.privilege !== null && typeof this.props.privilege.pools !== 'undefined' && this.props.privilege.pools.create && ! this.props.loadings.pools && ! this.state.loading &&
                                                            <Tooltip title={Lang.get('labels.create.label',{Attribute:Lang.get('nas.pools.labels.menu')})}>
                                                                <button onClick={()=>this.togglePool()} disabled={this.state.loading || this.props.loadings.pools} type="button" className="btn btn-outline-primary btn-sm text-xs"><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                            </Tooltip>
                                                            :
                                                            this.props.privilege !== null && typeof this.props.privilege.pools !== 'undefined' && this.props.privilege.pools.update && ! this.props.loadings.pools && ! this.state.loading &&
                                                            <Tooltip title={Lang.get('labels.update.label',{Attribute:Lang.get('nas.pools.labels.menu')})}>
                                                                <button onClick={()=>this.togglePool(this.state.form.pool)} disabled={this.state.loading || this.props.loadings.pools} type="button" className="btn btn-outline-info btn-sm text-xs"><FontAwesomeIcon icon={faPencilAlt} size="sm"/></button>
                                                            </Tooltip>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {this.state.form.pool === null ? null :
                                            <React.Fragment>
                                                <label className="col-md-2 col-form-label text-xs">{Lang.get('nas.pools.labels.address.full')}</label>
                                                <div className="col-md-2">
                                                    <div className="form-control text-xs">{this.state.form.pool.meta.address.first} - {this.state.form.pool.meta.address.last}</div>
                                                </div>
                                            </React.Fragment>
                                        }
                                    </div>

                                    <div className="form-group row">
                                        <label className="col-md-2 col-form-label text-xs">{Lang.get('bandwidths.labels.name')}</label>
                                        <div className="col-md-4">
                                            <div className="row">
                                                <div className="col-md-10">
                                                    <Select styles={FormControlSMReactSelect} noOptionsMessage={()=>Lang.get('bandwidths.labels.not_found')} placeholder={Lang.get('bandwidths.labels.select')} onChange={(e)=>this.handleSelect(e,'bandwidth')} options={this.props.bandwidths} value={this.state.form.bandwidth} isLoading={this.props.loadings.bandwidths} isDisabled={this.state.loading || this.props.loadings.bandwidths}/>
                                                </div>
                                                <div className="col-md-2">
                                                    {this.state.form.bandwidth === null ?
                                                            this.props.privilege !== null && typeof this.props.privilege.bandwidths !== 'undefined' && this.props.privilege.bandwidths.create && !this.props.loadings.bandwidths && !this.state.loading &&
                                                            <Tooltip title={Lang.get('labels.create.label',{Attribute:Lang.get('bandwidths.labels.menu')})}>
                                                                <button onClick={()=>this.toggleBandwidth()} type="button" disabled={this.state.loading || this.props.loadings.bandwidths} className="btn btn-sm btn-outline-primary text-xs"><FontAwesomeIcon icon={faPlus} size="sm"/></button>
                                                            </Tooltip>
                                                            :
                                                            this.props.privilege !== null && typeof this.props.privilege.bandwidths !== 'undefined' && this.props.privilege.bandwidths.update && !this.props.loadings.bandwidths && !this.state.loading &&
                                                            <Tooltip title={Lang.get('labels.update.label',{Attribute:Lang.get('bandwidths.labels.menu')})}>
                                                                <button onClick={()=>this.toggleBandwidth(this.state.form.bandwidth)} type="button" disabled={this.state.loading || this.props.loadings.bandwidths} className="btn btn-sm btn-outline-info text-xs"><FontAwesomeIcon icon={faPencilAlt} size="sm"/></button>
                                                            </Tooltip>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {this.state.form.bandwidth === null ? null :
                                            <div className="col-md-6">
                                                <table className="table table-sm table-striped mb-0">
                                                    <thead>
                                                    <tr>
                                                        <th colSpan={2} className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.max_limit.main')}</th>
                                                        <th colSpan={2} className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.burst_limit.main')}</th>
                                                        <th colSpan={2} className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.threshold.main')}</th>
                                                        <th colSpan={2} className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.time.main')}</th>
                                                        <th colSpan={2} className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.limit_at.main')}</th>
                                                        <th rowSpan={2} className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.priority.name')}</th>
                                                    </tr>
                                                    <tr>
                                                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.max_limit.up')}</th>
                                                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.max_limit.down')}</th>
                                                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.burst_limit.up')}</th>
                                                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.burst_limit.down')}</th>
                                                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.threshold.up')}</th>
                                                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.threshold.down')}</th>
                                                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.time.up')}</th>
                                                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.time.down')}</th>
                                                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.limit_at.up')}</th>
                                                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.limit_at.down')}</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    <tr>
                                                        <td className="align-middle text-center text-xs">
                                                            {this.state.form.bandwidth.meta.max_limit.up === 0 ? <span className="badge badge-success">UNL</span> :formatBytes(this.state.form.bandwidth.meta.max_limit.up)}
                                                        </td>
                                                        <td className="align-middle text-center text-xs">
                                                            {this.state.form.bandwidth.meta.max_limit.down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(this.state.form.bandwidth.meta.max_limit.down)}
                                                        </td>
                                                        <td className="align-middle text-center text-xs">
                                                            {this.state.form.bandwidth.meta.burst.up === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(this.state.form.bandwidth.meta.burst.up)}
                                                        </td>
                                                        <td className="align-middle text-center text-xs">
                                                            {this.state.form.bandwidth.meta.burst.down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(this.state.form.bandwidth.meta.burst.down)}
                                                        </td>
                                                        <td className="align-middle text-center text-xs">
                                                            {this.state.form.bandwidth.meta.threshold.up === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(this.state.form.bandwidth.meta.threshold.up)}
                                                        </td>
                                                        <td className="align-middle text-center text-xs">
                                                            {this.state.form.bandwidth.meta.threshold.down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(this.state.form.bandwidth.meta.threshold.down)}
                                                        </td>
                                                        <td className="align-middle text-center text-xs">
                                                            {this.state.form.bandwidth.meta.burst.up === 0 ? <span className="badge badge-success">UNL</span> : `${this.state.form.bandwidth.meta.time.up}s`}
                                                        </td>
                                                        <td className="align-middle text-center text-xs">
                                                            {this.state.form.bandwidth.meta.burst.down === 0 ? <span className="badge badge-success">UNL</span> : `${this.state.form.bandwidth.meta.time.down}s`}
                                                        </td>
                                                        <td className="align-middle text-center text-xs">
                                                            {this.state.form.bandwidth.meta.limit_at.up === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(this.state.form.bandwidth.meta.limit_at.up)}
                                                        </td>
                                                        <td className="align-middle text-center text-xs">
                                                            {this.state.form.bandwidth.meta.limit_at.down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(this.state.form.bandwidth.meta.limit_at.down)}
                                                        </td>
                                                        <td className="align-middle text-center text-xs">{this.state.form.bandwidth.meta.priority}</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        }
                                    </div>

                                    <div className="form-group row">
                                        <label className="col-md-2 col-form-label text-xs">{Lang.get('queue.labels.name')}</label>
                                        <div className="col-md-4">
                                            <div className="row">
                                                <div className="col-md-10">
                                                    <Select styles={FormControlSMReactSelect} onChange={(e)=>this.handleSelect(e,'queue')} options={this.state.queues} value={this.state.form.queue} isLoading={this.state.loading} isDisabled={this.state.loading} isClearable placeholder={Lang.get('queue.labels.select')} noOptionsMessage={()=>Lang.get('queue.labels.no_data')}/>
                                                </div>
                                                <div className="col-md-2">
                                                    {this.state.form.nas === null ? null :
                                                        <Tooltip title={Lang.get('labels.search',{Attribute:Lang.get('queue.labels.name')})}>
                                                            <button type="button" onClick={this.loadParentQueue} disabled={this.state.loading || this.state.form.nas === null} className="btn btn-outline-secondary btn-sm text-xs"><FontAwesomeIcon icon={faRefresh} size="sm"/></button>
                                                        </Tooltip>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {this.state.form.queue === null ? null :
                                            <>
                                                <label className="col-md-2 col-form-label text-xs">{Lang.get('queue.labels.target')}</label>
                                                <div className="col-md-4">
                                                    <div className="form-control form-control-sm text-xs">{this.state.form.queue.meta.data.target}</div>
                                                </div>
                                            </>
                                        }
                                    </div>
                                </React.Fragment>
                            }

                            <InputText type="text" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-10' },
                                placeholder : Lang.get('profiles.labels.name'), name : Lang.get('profiles.labels.name') }}
                                       input={{ name : 'name', value : this.state.form.name, id : 'name', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>

                            <InputText type="textarea" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-10' },
                                placeholder : Lang.get('profiles.labels.description'), name : Lang.get('profiles.labels.description') }}
                                       input={{ name : 'description', value : this.state.form.description, id : 'description', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>

                            {this.state.form.additional ? null :
                                <>
                                    <div className="form-group row">
                                        <label className="col-md-2 col-form-label text-xs">{Lang.get('profiles.labels.limitation.name')}</label>
                                        <div className="col-md-2">
                                            <Select styles={FormControlSMReactSelect} placeholder={Lang.get('profiles.labels.limitation.select')} options={limitType} value={this.state.form.limit.type} isDisabled={this.state.loading} isClearable onChange={(e)=>this.handleSelect(e,'limit')}/>
                                        </div>
                                        {this.state.form.limit.type === null ? null :
                                            <>
                                                <div className="col-md-2">
                                                    <NumericFormat className="form-control form-control-sm text-xs" placeholder={Lang.get('profiles.labels.limitation.value')} disabled={this.state.loading} value={this.state.form.limit.rate} decimalScale={0} decimalSeparator="," thousandSeparator="." onChange={this.handleChange} name="limit"/>
                                                </div>
                                                <div className="col-md-2">
                                                    <Select styles={FormControlSMReactSelect} value={this.state.form.limit.unit} onChange={(e)=>this.handleSelect(e,'unit')} options={this.state.form.limit.type === null ? [] : this.state.form.limit.type.value === 'time' ? durationType : durationTypeByte} isDisabled={this.state.loading}/>
                                                </div>
                                            </>
                                        }
                                    </div>
                                </>
                            }
                            <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-2 text-right' }, placeholder : Lang.get('profiles.labels.price'), name : Lang.get('profiles.labels.price') }}
                                       decimalScale={2} decimalSeparator="," thousandSeparator="."
                                       input={{ name : 'price', value : this.state.form.price, id : 'price', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>

                            {this.state.form.additional ? null :
                                <>
                                    <div className="form-group row">
                                        <label className="col-md-2 col-form-label text-xs">{Lang.get('profiles.labels.address.dns')}</label>
                                        <div className="col-md-3">
                                            {this.state.form.address.dns.length === 0 ? null :
                                                <MaskedInput name="dns"
                                                             id="dns" data-index={0}
                                                             guide={false} placeholderChar={'\u2000'}
                                                             onChange={this.handleChange}
                                                             pipe={pipeIp}
                                                             disabled={this.state.loading} mask={value => Array(value.length).fill(/[\d.]/)}
                                                             placeholder={Lang.get('profiles.labels.address.dns')}
                                                             value={this.state.form.address.dns[0].label} className="form-control form-control-sm text-xs"/>
                                            }
                                        </div>
                                        <div className="col-md-3">
                                            <button type="button" className="btn btn-sm btn-default mr-1" disabled={this.state.loading} onClick={this.handleAddDns}><FontAwesomeIcon icon={faPlus}/></button>
                                            {this.state.form.address.dns.length > 0 &&
                                                <button type="button" className="btn btn-sm btn-default" disabled={this.state.loading} onClick={()=>this.handleRemoveDns(0)}><FontAwesomeIcon icon={faTrashAlt} className="mr-1"/></button>
                                            }
                                        </div>
                                    </div>
                                    {this.state.form.address.dns.length === 1 ? null :
                                        this.state.form.address.dns.map((item,index)=>
                                            index === 0 ? null :
                                                <div key={index} className="form-group row">
                                                    <div className="col-md-3 offset-2">
                                                        <MaskedInput name="dns"
                                                                     id="dns" data-index={index}
                                                                     guide={false} placeholderChar={'\u2000'}
                                                                     onChange={this.handleChange}
                                                                     pipe={pipeIp}
                                                                     disabled={this.state.loading} mask={value => Array(value.length).fill(/[\d.]/)}
                                                                     placeholder={Lang.get('profiles.labels.address.dns')}
                                                                     value={item.label} className="form-control text-xs form-control-sm"/>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <button type="button" className="btn btn-sm btn-default mr-1" disabled={this.state.loading} onClick={this.handleAddDns}><FontAwesomeIcon icon={faPlus}/></button>
                                                        <button type="button" className="btn btn-sm btn-default" disabled={this.state.loading} onClick={()=>this.handleRemoveDns(index)}><FontAwesomeIcon icon={faTrashAlt} className="mr-1"/></button>
                                                    </div>
                                                </div>
                                        )
                                    }
                                </>
                            }
                        </DialogContent>
                        <ModalFooter
                            form={this.state.form} handleClose={()=>this.props.handleClose()}
                            buttons={[]} loading={this.state.loading}
                            pendings={{create:Lang.get('labels.create.pending',{Attribute:Lang.get('profiles.labels.menu')}),update:Lang.get('labels.update.pending',{Attribute:Lang.get('profiles.labels.menu')})}}
                            langs={{create:Lang.get('labels.create.submit',{Attribute:Lang.get('profiles.labels.menu')}),update:Lang.get('labels.update.submit',{Attribute:Lang.get('profiles.labels.menu')})}}/>
                    </form>
                </Dialog>
            </React.Fragment>
        )
    }
}
export default FormProfile;
