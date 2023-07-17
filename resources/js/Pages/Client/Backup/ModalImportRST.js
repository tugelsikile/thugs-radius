import React from "react";
import {Dialog, DialogContent} from "@mui/material";
import {ModalFooter, ModalHeader} from "../../../Components/ModalComponent";
import {randomString, responseMessage} from "../../../Components/mixedConsts";
import {readDataRST} from "../../../Services/BackupService";
import {showError, showSuccess} from "../../../Components/Toaster";
import {crudNas, crudProfile, crudProfileBandwidth, crudProfilePools} from "../../../Services/NasService";
import {GetLocalCounter} from "./Mixed";

class ModalImportRST extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                hostname : '172.16.16.10', port : 3306, id : null,
                user : 'root', pass : '', name : 'rstnet_sistem'
            },
            lists : {
                labels : [
                    { value : 'branches', label : 'Cabang', data : [], current : [] },
                    { value : 'nas', label : 'Nas', data : [], current : [] },
                    { value : 'profiles', label : 'Profil Nas', data : [], current : [] },
                    { value : 'packages', label : 'Paket', data : [], current : [] },
                    { value : 'customers', label: 'Pelanggan', data : [], current : [] },
                    { value : 'invoices', label: 'Tagihan', data : [], current : [] },
                ],
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        let form = this.state.form;
        form[event.target.name] = event.target.value;
        this.setState({form});
    }
    handleLoopProfile() {
        if (this.state.lists.labels[2].data.length > 0) {
            let lists = this.state.lists;
            this.state.lists.labels[2].data.map((item)=>{
                let index = this.state.lists.labels[2].data.findIndex((f)=> f.id === item.id);
                if (item.value === null) {
                    const formBandwidth = {
                        name : item.name,
                        max_limit : { up : 0, down : 0 },
                        burst_limit : { up : 0, down : 0 },
                        threshold: { up : 0, down : 0 },
                        time : { up : 0, down : 0 },
                        limit_at : { up : 0, down : 0 },
                        priority : 8
                    };
                    let bwstrings = item.burst;
                    if (bwstrings !== null) {
                        bwstrings = bwstrings.split(" ");
                        if (bwstrings.length > 0) {
                            if (typeof bwstrings[0] !== 'undefined') {
                                if (bwstrings[0].length > 0) {
                                    formBandwidth.max_limit.up = parseInt(bwstrings[0].split("/")[0]);
                                    formBandwidth.max_limit.down = parseInt(bwstrings[0].split("/")[1]);
                                    if (bwstrings[0].split("/")[0].indexOf("m") !== -1) {
                                        formBandwidth.max_limit.up = parseInt(bwstrings[0].split("/")[0]) * 1000;
                                    }
                                    if (bwstrings[0].split("/")[1].indexOf("m") !== -1) {
                                        formBandwidth.max_limit.down = parseInt(bwstrings[0].split("/")[1]) * 1000;
                                    }
                                }
                            }
                            if (typeof bwstrings[1] !== 'undefined') {
                                if (bwstrings[1].length > 0) {
                                    formBandwidth.burst_limit.up = parseInt(bwstrings[1].split("/")[0]);
                                    formBandwidth.burst_limit.down = parseInt(bwstrings[1].split("/")[1]);
                                    if (bwstrings[1].split("/")[0].indexOf("m") !== -1) {
                                        formBandwidth.burst_limit.up = parseInt(bwstrings[1].split("/")[0]) * 1000;
                                    }
                                    if (bwstrings[1].split("/")[1].indexOf("m") !== -1) {
                                        formBandwidth.burst_limit.down = parseInt(bwstrings[1].split("/")[1]) * 1000;
                                    }
                                }
                            }
                            if (typeof bwstrings[2] !== 'undefined') {
                                if (bwstrings[2].length > 0) {
                                    formBandwidth.threshold.up = parseInt(bwstrings[2].split("/")[0]);
                                    formBandwidth.threshold.down = parseInt(bwstrings[2].split("/")[1]);
                                    if (bwstrings[2].split("/")[0].indexOf("m") !== -1) {
                                        formBandwidth.threshold.up = parseInt(bwstrings[2].split("/")[0]) * 1000;
                                    }
                                    if (bwstrings[2].split("/")[1].indexOf("m") !== -1) {
                                        formBandwidth.threshold.down = parseInt(bwstrings[2].split("/")[1]) * 1000;
                                    }
                                }
                            }
                            if (typeof bwstrings[3] !== 'undefined') {
                                if (bwstrings[3].length > 0) {
                                    formBandwidth.time.up = parseInt(bwstrings[3].split("/"));
                                    formBandwidth.time.down = parseInt(bwstrings[3].split("/"));
                                }
                            }
                            if (typeof bwstrings[4] !== 'undefined') {
                                if (bwstrings[4].length > 0) {
                                    formBandwidth.priority = parseInt(bwstrings[4]);
                                }
                            }
                            if (typeof bwstrings[5] !== 'undefined')  {
                                if (bwstrings[5].length > 0) {
                                    formBandwidth.limit_at.up = parseInt(bwstrings[5].split("/")[0]);
                                    formBandwidth.limit_at.down = parseInt(bwstrings[5].split("/")[1]);
                                    if (bwstrings[5].split("/")[0].indexOf("m") !== -1) {
                                        formBandwidth.limit_at.up = parseInt(bwstrings[5].split("/")[0]) * 1000;
                                    }
                                    if (bwstrings[5].split("/")[1].indexOf("m") !== -1) {
                                        formBandwidth.limit_at.down = parseInt(bwstrings[5].split("/")[1]) * 1000;
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
                        }
                    }
                    this.handleSubmitBandwidth(formBandwidth)
                        .then((response)=>{
                            if (response !== null) {
                                let formPool = {
                                    nas : item.group.routerboard,
                                    code : item.group.name + randomString(5),
                                    name : item.group.name,
                                    first : item.group.first_address,
                                    last : item.group.last_address,
                                }
                                this.handleSubmitPool(formPool)
                                    .then((response2)=>{
                                        if (response2 !== null) {
                                            let formProfile = {
                                                code : item.name + randomString(5),
                                                local : item.group.local_address,
                                                nas : item.routerboard,
                                                pool : response.value,
                                                bandwidth : response2.value,
                                                type : item.type === 'PPP' ? 'pppoe' : 'hotspot',
                                                name : item.name,
                                                price : 0, dns : item.group.dns_servers === null ? [] : item.group.dns_servers.split(",")
                                            };
                                            this.handleSubmitProfile(formProfile)
                                                .then((response3)=>{
                                                    if (response3 !== null) {
                                                        if (index >= 0) {
                                                            lists.labels[2].data.current.push(response);
                                                        }
                                                    }
                                                })
                                        }
                                    })
                            }
                        });
                }
            });
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
                return null;
            } else {
                return response.data.params;
            }
        } catch (e) {
            return null;
        }
    }
    async handleSubmitPool(form) {
        try {
            const formData = new FormData();
            formData.append('_method', 'put');
            formData.append(Lang.get('nas.form_input.name'), form.nas);
            formData.append(Lang.get('nas.pools.form_input.module'), "radius");
            formData.append(Lang.get('nas.pools.form_input.code'), form.code);
            formData.append(Lang.get('nas.pools.form_input.name'), form.name);
            formData.append(Lang.get('nas.pools.form_input.address.first'), form.first);
            formData.append(Lang.get('nas.pools.form_input.address.last'), form.last);
            formData.append(Lang.get('nas.pools.form_input.upload'), '1');
            let response = await crudProfilePools(formData);
            if (response.data.params === null) {
                return null;
            } else {
                return response.data.params;
            }
        } catch (e) {
            return null;
        }
    }
    async handleSubmitProfile(form) {
        try {
            const formData = new FormData();
            formData.append(Lang.get('profiles.form_input.code'), form.code);
            formData.append(Lang.get('profiles.form_input.is_additional'), '0');
            formData.append(Lang.get('profiles.form_input.address.local'), form.local);
            //formData.append(Lang.get('profiles.form_input.address.subnet'), form.subnet);
            formData.append(Lang.get('companies.form_input.name'), this.props.user.meta.company.id);
            formData.append(Lang.get('nas.form_input.name'), form.nas);
            formData.append(Lang.get('nas.pools.form_input.name'), form.pool);
            formData.append(Lang.get('bandwidths.form_input.name'), form.bandwidth);
            formData.append(Lang.get('profiles.form_input.type'), form.type);
            formData.append(Lang.get('profiles.form_input.name'), form.name);
            formData.append(Lang.get('profiles.form_input.price'), form.price);
            if (form.limit.type !== null) {
                formData.append(Lang.get('profiles.form_input.limitation.type'), form.limit.type.value);
                formData.append(Lang.get('profiles.form_input.limitation.rate'), form.limit.rate);
                formData.append(Lang.get('profiles.form_input.limitation.unit'), form.limit.unit);
            }
            form.dns.map((item,index)=>{
                formData.append(`${Lang.get('profiles.form_input.address.dns')}[${index}]`, item.label);
            });

            let response = await crudProfile(formData);
            if (response.data.params === null) {
                return null;
            } else {
                return response.data.params;
            }
        } catch (e) {
            return null;
        }
    }
    handleLoopNas() {
        if (this.state.lists.labels[1].data.length > 0) {
            let lists = this.state.lists;
            this.state.lists.labels[1].data.map((item)=>{
                let index = this.state.lists.labels[1].data.findIndex((f)=> f.id === item.id);
                if (item.value === null) {
                    const data = {
                        id : item.id, name : item.name,
                        port : item.port, secret : item.radius_secret,
                        ip : item.ip, user : item.username, pass : item.password,
                    };
                    this.handleSubmitNas(data)
                        .then((response)=>{
                            if (response !== null) {
                                if (index >= 0) {
                                    lists.labels[1].data.current.push(response);
                                }
                            }
                        });
                }
            });
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
            formData.append(Lang.get('nas.form_input.domain'), form.domain);
            formData.append(Lang.get('nas.form_input.user'), form.user);
            formData.append(Lang.get('nas.form_input.pass'), form.pass);
            formData.append(Lang.get('nas.form_input.pass_confirm'), form.pass);
            let response = await crudNas(formData);
            if (response.data.params === null) {
                return null;
            } else {
                return response.data.params;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            const formData = new FormData();
            formData.append('hostname', this.state.form.hostname);
            formData.append('port', this.state.form.port);
            formData.append('user', this.state.form.user);
            formData.append('db_name', this.state.form.name);
            formData.append('pass', this.state.form.pass);
            let response = await readDataRST(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                let index;
                let lists = this.state.lists;
                response.data.params.map((item)=>{
                    index = lists.labels.findIndex((f)=> f.value === item.value);
                    if (index >= 0) {
                        lists.labels[index].data = item.data;
                    }
                });
                this.setState({loading:false,lists},()=>{
                    this.handleLoopNas();
                    this.handleLoopProfile();
                });
                console.log(response.data.params);
            }
        } catch (e) {
            console.log(e);
            this.setState({loading:false});
            responseMessage(e);
        }
    }

    render() {
        return (
            <React.Fragment>
                <Dialog fullWidth maxWidth="xl" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                    <form onSubmit={this.handleSave}>
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
                                </div>
                                <div className="col-md-8">
                                    <table className="table table-sm table-striped">
                                        <thead>
                                        <tr>
                                            <th className="align-middle text-xs">TABEL</th>
                                            <th width={100} className="align-middle text-xs text-center">TOTAL</th>
                                            <th width={100} className="align-middle text-xs text-center">CURRENT</th>
                                            <th width={50} className="align-middle text-xs text-center">%</th>
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
                                                <td className="align-middle text-xs text-center">0</td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </DialogContent>
                        <ModalFooter
                            form={this.state.form} handleClose={()=>this.props.handleClose()}
                            loading={this.state.loading}
                            pendings={{create:Lang.get('labels.create.pending',{Attribute:Lang.get('backup.labels.menu')}),update:Lang.get('labels.update.pending',{Attribute:Lang.get('backup.labels.menu')})}}
                            langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('backup.labels.menu')}),update:Lang.get('labels.update.label',{Attribute:Lang.get('backup.labels.menu')})}}/>
                    </form>
                </Dialog>
            </React.Fragment>
        )
    }

}
export default ModalImportRST;
