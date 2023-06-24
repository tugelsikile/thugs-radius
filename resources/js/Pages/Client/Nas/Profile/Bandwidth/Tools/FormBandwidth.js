import React from "react";
import {
    FormControlSMReactSelect,
    parseInputFloat,
    priorityList,
    responseMessage
} from "../../../../../../Components/mixedConsts";
import {crudProfileBandwidth} from "../../../../../../Services/NasService";
import {showError, showSuccess} from "../../../../../../Components/Toaster";
import {ModalFooter, ModalHeader} from "../../../../../../Components/ModalComponent";
import {InputText, LabelRequired} from "../../../../../../Components/CustomInput";
import Select from "react-select";
import {Dialog, DialogContent} from "@mui/material";

// noinspection JSCheckFunctionSignatures,DuplicatedCode,CommaExpressionJS
class FormBandwidth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : {
                id : null, company : null,
                name : '', description : '',
                max_limit : { up : { value : 0, invalid : false, message : '' }, down : { value : 0, invalid : false, message : '' } },
                burst_limit : { up : { value : 0, invalid : false, message : '' }, down : { value : 0, invalid : false, message : '' } },
                threshold : { up : { value : 0, invalid : false, message : '' }, down : { value : 0, invalid : false, message : '' } },
                time : { up : { value : 0, invalid : false, message : '' }, down : { value : 0, invalid : false, message : '' } },
                limit_at : { up : { value : 0, invalid : false, message : '' }, down : { value : 0, invalid : false, message : '' } },
                priority : { value : 8, label : 8},
            }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    componentWillReceiveProps(props) {
        let form = this.state.form;
        this.setState({loading:true});
        if (! props.open) {
            form.id = null, form.company = null, form.nas = null,
                form.name = '', form.description = '',
                form.burst_limit.up.value = 0, form.burst_limit.down.value = 0,
                form.burst_limit.up.invalid = false, form.burst_limit.down.invalid = false,
                form.burst_limit.up.message = '', form.burst_limit.down.message = '',
                form.threshold.up.value = 0, form.threshold.down.value = 0,
                form.threshold.up.invalid = false, form.threshold.down.invalid = false,
                form.threshold.up.message = '', form.threshold.down.message = '',
                form.time.up.value = 0, form.time.down.value = 0,
                form.time.up.invalid = false, form.time.down.invalid = false,
                form.time.up.message = '', form.time.down.message = '',
                form.limit_at.up.value = 0, form.limit_at.down.value = 0,
                form.limit_at.up.invalid = false, form.limit_at.down.invalid = false,
                form.limit_at.up.message = '', form.limit_at.down.message = '',
                form.priority = { value : 8, label : 8 },
                form.max_limit.up.value = 0, form.max_limit.down.value = 0;
        } else {
            if (props.data !== null) {
                form.id = props.data.value, form.name = props.data.label,
                    form.description = props.data.meta.description,
                    form.max_limit.up.value = props.data.meta.max_limit.up,
                    form.max_limit.down.value = props.data.meta.max_limit.down,
                    form.burst_limit.up.value = props.data.meta.burst.up,
                    form.burst_limit.down.value = props.data.meta.burst.down,
                    form.threshold.up.value = props.data.meta.threshold.up,
                    form.threshold.down.value = props.data.meta.threshold.down,
                    form.time.up.value = props.data.meta.time.up,
                    form.time.down.value = props.data.meta.time.down,
                    form.limit_at.up.value = props.data.meta.limit_at.up,
                    form.limit_at.down.value = props.data.meta.limit_at.down,
                    form.priority = {value : props.data.meta.priority, label : props.data.meta.priority};
            }
        }
        this.setState({loading:false,form});
    }
    handleChange(event) {
        let form = this.state.form;
        if (['name','description'].indexOf(event.target.name) !== -1) {
            form[event.target.name] = event.target.value;
        } else if (['max_limit','burst_limit','threshold','limit_at','time'].indexOf(event.target.getAttribute('data-parent')) !== -1) {
            let parent = event.target.getAttribute('data-parent');
            let type = event.target.name;
            form[parent][type].value = parseInputFloat(event);
            if (form.burst_limit[type].value > 0) {
                if (form.max_limit[type].value > form.burst_limit[type].value) {
                    form.max_limit[type].invalid = true;
                    form.max_limit[type].message = Lang.get(`bandwidths.labels.max_limit.${type}_invalid`);
                } else {
                    form.max_limit[type].invalid = false;
                    form.max_limit[type].message = '';
                }
            } else {
                form.max_limit[type].invalid = false;
                form.max_limit[type].message = '';
            }

            if (form.burst_limit[type].value > 0) {
                if (form.time[type].value === 0) {
                    form.burst_limit[type].invalid = true;
                    form.burst_limit[type].message = Lang.get(`bandwidths.labels.burst_limit.${type}_invalid`);
                } else {
                    form.burst_limit[type].invalid = false;
                    form.burst_limit[type].message = '';
                }
            } else {
                form.burst_limit[type].invalid = false;
                form.burst_limit[type].message = '';
            }

            if (form.threshold[type].value > form.burst_limit[type].value) {
                form.threshold[type].invalid = true;
                form.threshold[type].message = Lang.get(`bandwidths.labels.threshold.${type}_invalid`);
            } else {
                form.threshold[type].invalid = false;
                form.threshold[type].message = '';
            }
            if (form.limit_at[type].value > 0) {
                if (form.limit_at[type].value > form.max_limit[type].value) {
                    form.limit_at[type].invalid = true;
                    form.limit_at[type].message = Lang.get(`bandwidths.labels.limit_at.${type}_invalid`);
                } else {
                    form.limit_at[type].invalid = false;
                    form.limit_at[type].message = '';
                }
            } else {
                form.limit_at[type].invalid = false;
                form.limit_at[type].message = '';
            }
        } else if (['priority'].indexOf(event.target.name) !== -1) {
            form[event.target.name] = parseInputFloat(event);
        }
        this.setState({form});
    }
    handleSelect(event, name) {
        let form = this.state.form;
        form[name] = event;
        this.setState({form});
    }
    handleJoinErrorMessage() {
        let errors = [];
        let response = "";
        if (this.state.form.max_limit.up.invalid) errors.push(this.state.form.max_limit.up.message);
        if (this.state.form.max_limit.down.invalid) errors.push(this.state.form.max_limit.down.message);
        if (this.state.form.burst_limit.up.invalid) errors.push(this.state.form.burst_limit.up.message);
        if (this.state.form.burst_limit.down.invalid) errors.push(this.state.form.burst_limit.down.message);
        if (this.state.form.threshold.up.invalid) errors.push(this.state.form.threshold.up.message);
        if (this.state.form.threshold.down.invalid) errors.push(this.state.form.threshold.down.message);
        if (this.state.form.time.up.invalid) errors.push(this.state.form.time.up.message);
        if (this.state.form.time.down.invalid) errors.push(this.state.form.time.down.message);
        if (this.state.form.limit_at.up.invalid) errors.push(this.state.form.limit_at.up.message);
        if (this.state.form.limit_at.down.invalid) errors.push(this.state.form.limit_at.down.message);
        if (errors.length > 0) {
            response = errors.join("\n");
        }
        return response;
    }
    async handleSave(e) {
        e.preventDefault();
        this.setState({loading:true});
        try {
            let errors = this.handleJoinErrorMessage();
            if (errors.length > 0) {
                showError(errors);
                this.setState({loading:false});
            } else {
                const formData = new FormData();
                formData.append('_method', this.state.form.id === null ? 'put' : 'patch');
                if (this.state.form.id !== null) formData.append(Lang.get('bandwidths.form_input.id'), this.state.form.id);
                formData.append(Lang.get('bandwidths.form_input.name'), this.state.form.name);
                formData.append(Lang.get('bandwidths.form_input.description'), this.state.form.description);
                formData.append(Lang.get('bandwidths.form_input.max_limit.up'), this.state.form.max_limit.up.value);
                formData.append(Lang.get('bandwidths.form_input.max_limit.down'), this.state.form.max_limit.down.value);
                formData.append(Lang.get('bandwidths.form_input.burst.up'), this.state.form.burst_limit.up.value);
                formData.append(Lang.get('bandwidths.form_input.burst.down'), this.state.form.burst_limit.down.value);
                formData.append(Lang.get('bandwidths.form_input.threshold.up'), this.state.form.threshold.up.value);
                formData.append(Lang.get('bandwidths.form_input.threshold.down'), this.state.form.threshold.down.value);
                formData.append(Lang.get('bandwidths.form_input.time.up'), this.state.form.time.up.value);
                formData.append(Lang.get('bandwidths.form_input.time.down'), this.state.form.time.down.value);
                formData.append(Lang.get('bandwidths.form_input.limit_at.up'), this.state.form.limit_at.up.value);
                formData.append(Lang.get('bandwidths.form_input.limit_at.down'), this.state.form.limit_at.down.value);
                if (this.state.form.priority !== null) formData.append(Lang.get('bandwidths.form_input.priority'), this.state.form.priority.value);

                let response = await crudProfileBandwidth(formData);
                if (response.data.params === null) {
                    this.setState({loading:false});
                    showError(response.data.message);
                } else {
                    this.setState({loading:false});
                    showSuccess(response.data.message);
                    this.props.handleUpdate(response.data.params);
                    this.props.handleClose();
                }
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    render() {
        return (
            <Dialog fullWidth maxWidth="lg" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('bandwidths.labels.menu')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('bandwidths.labels.menu')})}}/>
                    <DialogContent dividers>
                        {this.props.user === null ? null :
                            this.props.user.meta.company !== null ? null :
                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">
                                        {this.state.form.id === null ? <LabelRequired/> : null}
                                        {Lang.get('companies.labels.name')}
                                    </label>
                                    <div className="col-sm-4">
                                        {this.state.form.id !== null ?
                                            <div className="form-control text-sm">{this.state.form.company.label}</div>
                                            :
                                            <Select onChange={(e)=>this.handleSelect(e,'company')} noOptionsMessage={()=>Lang.get('companies.labels.not_found')} options={this.props.companies} value={this.state.form.company} isLoading={this.props.loadings.companies} isDisabled={this.state.loading || this.state.loadings.companies}/>
                                        }
                                    </div>
                                </div>
                        }

                        <InputText type="text" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-10' },
                            placeholder : Lang.get('bandwidths.labels.name'), name : Lang.get('bandwidths.labels.name') }}
                                   input={{ name : 'name', value : this.state.form.name, id : 'name', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>

                        <InputText type="textarea" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-10' },
                            placeholder : Lang.get('bandwidths.labels.description'), name : Lang.get('bandwidths.labels.description') }}
                                   input={{ name : 'description', value : this.state.form.description, id : 'description', }} required={true} handleChange={this.handleChange} loading={this.state.loading}/>

                        <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-2' },
                            placeholder : Lang.get('bandwidths.labels.max_limit.up_long'), name : Lang.get('bandwidths.labels.max_limit.up_long') }}
                                   isByte={true}
                                   input={{ name : 'up', value : this.state.form.max_limit.up.value, id : 'max_limit-up', parent : 'max_limit' }} handleChange={this.handleChange} loading={this.state.loading}
                                   appends={[
                                       <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-2' },
                                           placeholder : Lang.get('bandwidths.labels.max_limit.down_long'), name : Lang.get('bandwidths.labels.max_limit.down_long') }} thousandSeparator="."
                                                  isByte={true}
                                                  input={{ name : 'down', value : this.state.form.max_limit.down.value, id : 'max_limit-down', parent : 'max_limit' }}
                                                  inputAppends={<span className="input-group-text">kb</span>}
                                                  invalid={this.state.form.max_limit.down.invalid}
                                                  inv_message={this.state.form.max_limit.down.message}
                                                  handleChange={this.handleChange} loading={this.state.loading}/>
                                   ]} invalid={this.state.form.max_limit.up.invalid}
                                   inv_message={this.state.form.max_limit.up.message}
                                   inputAppends={<span className="input-group-text">kb</span>}
                                   thousandSeparator="."/>

                        <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-2' },
                            placeholder : Lang.get('bandwidths.labels.burst_limit.up_long'), name : Lang.get('bandwidths.labels.burst_limit.up_long') }}
                                   isByte={true}
                                   input={{ name : 'up', value : this.state.form.burst_limit.up.value, id : 'burst_limit-up', parent : 'burst_limit' }} handleChange={this.handleChange} loading={this.state.loading}
                                   appends={[
                                       <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-2' },
                                           placeholder : Lang.get('bandwidths.labels.burst_limit.down_long'), name : Lang.get('bandwidths.labels.burst_limit.down_long') }} thousandSeparator="."
                                                  isByte={true}
                                                  input={{ name : 'down', value : this.state.form.burst_limit.down.value, id : 'burst_limit-down', parent : 'burst_limit' }}
                                                  inputAppends={<span className="input-group-text">kb</span>}
                                                  invalid={this.state.form.burst_limit.down.invalid}
                                                  inv_message={this.state.form.burst_limit.down.message}
                                                  handleChange={this.handleChange} loading={this.state.loading}/>
                                   ]}
                                   inputAppends={<span className="input-group-text">kb</span>}
                                   invalid={this.state.form.burst_limit.up.invalid}
                                   inv_message={this.state.form.burst_limit.up.message}
                                   thousandSeparator="."/>

                        <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-2' },
                            placeholder : Lang.get('bandwidths.labels.threshold.up_long'), name : Lang.get('bandwidths.labels.threshold.up_long') }}
                                   isByte={true}
                                   input={{ name : 'up', value : this.state.form.threshold.up.value, id : 'threshold-up', parent : 'threshold' }} handleChange={this.handleChange} loading={this.state.loading}
                                   appends={[
                                       <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-2' },
                                           placeholder : Lang.get('bandwidths.labels.threshold.down_long'), name : Lang.get('bandwidths.labels.threshold.down_long') }} thousandSeparator="."
                                                  isByte={true}
                                                  input={{ name : 'down', value : this.state.form.threshold.down.value, id : 'threshold-down', parent : 'threshold' }}
                                                  inputAppends={<span className="input-group-text">kb</span>}
                                                  invalid={this.state.form.threshold.down.invalid}
                                                  inv_message={this.state.form.threshold.down.message}
                                                  handleChange={this.handleChange} loading={this.state.loading}/>
                                   ]}
                                   invalid={this.state.form.threshold.up.invalid}
                                   inv_message={this.state.form.threshold.up.message}
                                   inputAppends={<span className="input-group-text">kb</span>}
                                   thousandSeparator="."/>

                        <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-2' },
                            placeholder : Lang.get('bandwidths.labels.time.up_long'), name : Lang.get('bandwidths.labels.time.up_long') }}
                                   input={{ name : 'up', value : this.state.form.time.up.value, id : 'time-up', parent : 'time' }} handleChange={this.handleChange} loading={this.state.loading}
                                   appends={[
                                       <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2 offset-2', input : 'col-sm-2' },
                                           placeholder : Lang.get('bandwidths.labels.time.down_long'), name : Lang.get('bandwidths.labels.time.down_long') }} thousandSeparator="."
                                                  input={{ name : 'down', value : this.state.form.time.down.value, id : 'time-down', parent : 'time' }}
                                                  inputAppends={<span className="input-group-text">Sec</span>}
                                                  invalid={this.state.form.time.down.invalid}
                                                  inv_message={this.state.form.time.down.message}
                                                  handleChange={this.handleChange} loading={this.state.loading}/>
                                   ]}
                                   invalid={this.state.form.time.up.invalid}
                                   inv_message={this.state.form.time.up.message}
                                   inputAppends={<span className="input-group-text">Sec</span>}
                                   thousandSeparator="."/>

                        <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-2' },
                            placeholder : Lang.get('bandwidths.labels.limit_at.up_long'), name : Lang.get('bandwidths.labels.limit_at.up_long') }}
                                   input={{ name : 'up', value : this.state.form.limit_at.up.value, id : 'limit_at-up', parent : 'limit_at' }} handleChange={this.handleChange} loading={this.state.loading}
                                   isByte={true}
                                   appends={[
                                       <InputText type="numeric" labels={{ cols:{ label : 'col-sm-2', input : 'col-sm-2' },
                                           placeholder : Lang.get('bandwidths.labels.limit_at.down_long'), name : Lang.get('bandwidths.labels.limit_at.down_long') }} thousandSeparator="."
                                                  isByte={true}
                                                  input={{ name : 'down', value : this.state.form.limit_at.down.value, id : 'limit_at-down', parent : 'limit_at' }}
                                                  inputAppends={<span className="input-group-text">kb</span>}
                                                  invalid={this.state.form.limit_at.down.invalid}
                                                  inv_message={this.state.form.limit_at.down.message}
                                                  handleChange={this.handleChange} loading={this.state.loading}/>
                                   ]}
                                   invalid={this.state.form.limit_at.up.invalid}
                                   inv_message={this.state.form.limit_at.up.message}
                                   inputAppends={<span className="input-group-text">kb</span>}
                                   thousandSeparator="."/>

                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">{Lang.get('bandwidths.labels.priority.name')}</label>
                            <div className="col-sm-2">
                                <Select menuPlacement="top" maxMenuHeight={150} styles={FormControlSMReactSelect} className="text-sm" noOptionsMessage={()=>Lang.get('bandwidths.labels.priority.not_found')} onChange={(e)=>this.handleSelect(e,'priority')} isDisabled={this.state.loading} options={priorityList} value={this.state.form.priority} placeholder={Lang.get('bandwidths.labels.priority.name')}/>
                            </div>
                        </div>
                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        buttons={[]} loading={this.state.loading}
                        pendings={{create:Lang.get('labels.create.pending',{Attribute:Lang.get('bandwidths.labels.menu')}),update:Lang.get('labels.update.pending',{Attribute:Lang.get('bandwidths.labels.menu')})}}
                        langs={{create:Lang.get('labels.create.submit',{Attribute:Lang.get('bandwidths.labels.menu')}),update:Lang.get('labels.update.submit',{Attribute:Lang.get('bandwidths.labels.menu')})}}/>
                </form>
            </Dialog>
        )
    }
}
export default FormBandwidth;
