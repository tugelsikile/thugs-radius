import React from "react";
import {ModalFooter, ModalHeader} from "../../../../Components/ModalComponent";
import {Dialog, DialogContent} from "@mui/material";
import {responseMessage} from "../../../../Components/mixedConsts";
import {crudCategory} from "../../../../Services/AccountingService";
import {showError} from "../../../../Components/Toaster";

// noinspection CommaExpressionJS,DuplicatedCode
class FormCategory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            form : { id : null, name : '', description : '' }
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let form = this.state.form;
        if (nextProps.open) {
            if (nextProps.data !== null) {
                if (form.id === null) {
                    form.id = nextProps.data.value,
                        form.name = nextProps.data.label,
                        form.description = nextProps.data.meta.description;
                }
            }
        } else {
            form.id = null, form.name = '', form.description = '';
        }
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
            if (this.state.form.id !== null) formData.append(Lang.get('cash_flow.form_input.category.id'), this.state.form.id);
            formData.append(Lang.get('cash_flow.form_input.category.name'), this.state.form.name);
            formData.append(Lang.get('cash_flow.form_input.category.description'), this.state.form.description);
            let response = await crudCategory(formData);
            if (response.data.params === null) {
                this.setState({loading:false});
                showError(response.data.message);
            } else {
                this.setState({loading:false});
                this.props.handleClose();
                this.props.handleUpdate(response.data.params);
            }
        } catch (e) {
            this.setState({loading:false});
            responseMessage(e);
        }
    }
    render() {
        return (
            <Dialog fullWidth maxWidth="sm" scroll="body" open={this.props.open} onClose={()=>this.state.loading ? null : this.props.handleClose()}>
                <form onSubmit={this.handleSave}>
                    <ModalHeader handleClose={()=>this.props.handleClose()} form={this.state.form} loading={this.state.loading} langs={{create:Lang.get('labels.create.form',{Attribute:Lang.get('cash_flow.labels.category.label')}),update:Lang.get('labels.update.form',{Attribute:Lang.get('cash_flow.labels.category.label')})}}/>
                    <DialogContent dividers={true}>
                        <div className="form-group row">
                            <label className="col-form-label col-md-3 text-xs">{Lang.get('cash_flow.labels.category.name')}</label>
                            <div className="col-md-9">
                                <input className="form-control form-control-sm text-xs" value={this.state.form.name} name="name" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('cash_flow.labels.category.label')}/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-form-label col-md-3 text-xs">{Lang.get('cash_flow.labels.category.description')}</label>
                            <div className="col-md-9">
                                <textarea className="form-control form-control-sm text-xs" value={this.state.form.description} name="description" onChange={this.handleChange} disabled={this.state.loading} placeholder={Lang.get('cash_flow.labels.category.description')} style={{resize:'none'}}/>
                            </div>
                        </div>
                    </DialogContent>
                    <ModalFooter
                        form={this.state.form} handleClose={()=>this.props.handleClose()}
                        loading={this.state.loading}
                        pendings={{create:Lang.get('labels.create.pending',{Attribute:Lang.get('cash_flow.labels.category.label')}),update:Lang.get('labels.update.pending',{Attribute:Lang.get('cash_flow.labels.category.label')})}}
                        langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('cash_flow.labels.category.label')}),update:Lang.get('labels.update.label',{Attribute:Lang.get('cash_flow.labels.category.label')})}}/>
                </form>
            </Dialog>
        )
    }
}
export default FormCategory;
