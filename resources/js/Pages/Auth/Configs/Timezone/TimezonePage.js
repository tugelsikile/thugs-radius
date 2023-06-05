import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl, logout} from "../../../../Components/Authentication";
import {siteData} from "../../../../Components/mixedConsts";
import {crudTimeZone, guestTimezones} from "../../../../Services/ConfigService";
import {showError} from "../../../../Components/Toaster";
import PageLoader from "../../../../Components/PageLoader";
import MainHeader from "../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../Components/Layout/MainSidebar";
import PageTitle from "../../../../Components/Layout/PageTitle";
import MainFooter from "../../../../Components/Layout/MainFooter";
import Select from "react-select";
import moment from "moment";
const mtz = require('moment-timezone');

// noinspection DuplicatedCode
class TimezonePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, timezones : false },
            privilege : null, menus : [], site : null, timezones : [],
            timezone : null,
        };
        this.handleSave = this.handleSave.bind(this);
    }
    componentDidMount() {
        let timezone = localStorage.getItem('locale_time_zone');
        if (timezone != null) {
            timezone = { value : localStorage.getItem('locale_time_zone'), label : localStorage.getItem('locale_time_zone') };
            this.setState({timezone});
        }
        this.setState({root:getRootUrl()});
        if (! this.state.loadings.site) {
            let loadings = this.state.loadings;
            loadings.site = true; loadings.privilege = true;
            this.setState({loadings});
            if (this.state.site === null) {
                siteData()
                    .then((response)=>{
                        loadings.site = false;
                        this.setState({loadings,site:response},()=>{
                            getPrivileges(this.props.route)
                                .then((response)=>{
                                    loadings.privilege = false;
                                    this.setState({loadings,privilege:response.privileges,menus:response.menus});
                                });
                        });
                    }).then(()=>this.loadTimezones())
            }
        }
    }
    async handleSave(event) {
        event.preventDefault();
        let loadings = this.state.loadings;
        loadings.timezones = true;
        this.setState({loadings});
        try {
            const formData = new FormData();
            formData.append('_method','patch');
            if (this.state.timezone !== null) formData.append(Lang.get('timezones.form_input.name'), this.state.timezone.value);
            let response = await crudTimeZone(formData);
            if (response.data.params === null) {
                loadings.timezones = false; this.setState({loadings});
                showError(response.data.message);
            } else {
                localStorage.setItem('locale_time_zone', response.data.params);
                loadings.timezones = false; this.setState({loadings,timezone:{value:response.data.params,label:response.data.params}});
            }
        } catch (e) {
            loadings.timezones = false; this.setState({loadings});
            showError(e.response.data.message);
            if (e.response.status === 401) logout();
        }
    }
    async loadTimezones() {
        if (! this.state.loadings.timezones) {
            if (this.state.timezones.length === 0) {
                let loadings = this.state.loadings;
                loadings.timezones = true; this.setState({loadings});
                try {
                    let response = await guestTimezones();
                    if (response.data.params === null) {
                        loadings.timezones = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.timezones = false; this.setState({loadings,timezones:response.data.params});
                    }
                } catch (e) {
                    loadings.timezones = false; this.setState({loadings});
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user} site={this.state.site}/>
                <MainSidebar route={this.props.route} site={this.state.site}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
                <div className="content-wrapper">

                    <PageTitle title={Lang.get('timezones.labels.menu')} childrens={[
                        {label : Lang.get('configs.labels.menu'), url : getRootUrl() + '/configs' }
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <form onSubmit={this.handleSave} className="card card-outline card-primary">
                                <div className="card-header">
                                    <h3 className="card-title">{Lang.get('timezones.labels.form_title')}</h3>
                                </div>
                                <div className="card-body">
                                    <div className="form-group row">
                                        <label className="col-sm-3 col-form-label">{Lang.get('timezones.labels.name')}</label>
                                        <div className="col-sm-9">
                                            <Select onChange={(e)=>this.setState({timezone:e})} value={this.state.timezone} isLoading={this.state.loadings.timezones} isDisabled={this.state.loadings.timezones} options={this.state.timezones}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-sm-3 col-form-label">{Lang.get('timezones.labels.preview')}</label>
                                        <div className="col-sm-9">
                                            <div className="form-control text-sm">
                                                {this.state.timezone !== null && mtz.tz(this.state.timezone.value).format(localStorage.getItem('locale_date_format'))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer justify-content-between">
                                    <button type="submit" className="btn btn-outline-success" disabled={this.state.loadings.timezones}>
                                        <i className="fas fa-save mr-1"/> {Lang.get('messages.save')}
                                    </button>
                                </div>
                            </form>

                        </div>

                    </section>

                </div>
                <MainFooter/>
            </React.StrictMode>
        )
    }


}
export default TimezonePage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><TimezonePage route="auth.configs.timezones"/></React.StrictMode>)
