import React from "react";
import ReactDOM from "react-dom/client";
import {responseMessage, siteData} from "../../../../Components/mixedConsts";
import {HeaderAndSideBar} from "../../../../Components/Layout/Layout";
import {getPrivileges, getRootUrl} from "../../../../Components/Authentication";
import PageTitle from "../../../../Components/Layout/PageTitle";
import MainFooter from "../../../../Components/Layout/MainFooter";
import PageLoader from "../../../../Components/PageLoader";
import {crudUsers} from "../../../../Services/UserService";
import {showError, showSuccess} from "../../../../Components/Toaster";
import {ProfileCard} from "./Mixed";
import {Skeleton} from "@mui/material";
import {updateAvatar} from "../../../../Services/AuthService";
import {getMessaging, getToken, onMessage} from "firebase/messaging";
import AccountForm from "./AccountForm";
import PasswordForm from "./PasswordForm";
import {guestTimezones} from "../../../../Services/ConfigService";
import LocaleForm from "./LocaleForm";

// noinspection DuplicatedCode
class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : getRootUrl(), site : null,
            loadings : { privilege : true, site : true, profile : true, avatar : false, timezones : true },
            privilege : null, menus : [], profile : null, timezones : [],
        };
        this.handleAvatar = this.handleAvatar.bind(this);
        this.handleUpdateMe = this.handleUpdateMe.bind(this);
    }
    componentDidMount() {
        let loadings = this.state.loadings;
        loadings.site = true;
        this.setState({loadings},()=>{
            siteData()
                .then((response)=>{
                    loadings.site = false;
                    this.setState({site:response,loadings});
                })
                .then(()=>{
                    loadings.privilege = true;
                    this.setState({loadings},()=>{
                        getPrivileges(this.props.route)
                            .then((response)=>{
                                loadings.privilege = false;
                                this.setState({loadings,privilege:response.privileges,menus:response.menus});
                            })
                            .then(()=>{
                                loadings.profile = false; this.setState({loadings},()=>this.loadProfile());
                            })
                            .then(()=>{
                                loadings.timezones = false; this.setState({loadings},()=>this.loadTimezones());
                            })
                    });
                });
        });
    }
    async handleUpdateMe(data) {
        if (typeof data === 'object') {
            if (data !== null) {
                localStorage.setItem('user', JSON.stringify(data));
                this.setState({user:data});
            }
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
    async handleAvatar(event) {
        let loadings = this.state.loadings;
        loadings.avatar = true; this.setState({loadings});
        try {
            const formData = new FormData();
            formData.append('_method','patch');
            formData.append(Lang.get('users.form_input.id'), this.state.profile.value);
            formData.append(Lang.get('users.form_input.avatar'), event.target.files[0], event.target.files[0].name);
            let response = await updateAvatar(formData);
            if (response.data.params === null) {
                loadings.avatar = false; this.setState({loadings});
                showError(response.data.message);
            } else {
                localStorage.setItem('user', JSON.stringify(response.data.params.user));
                loadings.avatar = false; this.setState({loadings,profile:response.data.params.profile,user:response.data.params.user});
                showSuccess(Lang.get('users.labels.avatar.success'));
            }
        } catch (e) {
            loadings.avatar = false; this.setState({loadings});
            responseMessage(e);
        }
    }
    async loadProfile(updating = null) {
        if (! this.state.loadings.profile) {
            let scripts = document.getElementsByTagName('script');
            let userId = null;
            for (let el of scripts) {
                if (el.src !== null) {
                    if (el.src.length > 0) {
                        if (el.src.indexOf('users/profile') !== -1) {
                            if (el.getAttribute('data-value') !== null) {
                                if (el.getAttribute('data-value').length > 20) {
                                    userId = el.getAttribute('data-value');
                                }
                            }
                        }
                    }
                }
            }
            if (userId !== null) {
                if (updating !== null) {
                    this.setState({profile:updating});
                } else {
                    let loadings = this.state.loadings;
                    loadings.profile = true; this.setState({loadings});
                    try {
                        let response = await crudUsers({id:userId});
                        if (response.data.params === null) {
                            loadings.profile = false; this.setState({loadings});
                            showError(response.data.message);
                        } else {
                            let profile = null;
                            if (response.data.params.length > 0) {
                                profile = response.data.params[0];
                            }
                            loadings.profile = false; this.setState({loadings,profile});
                        }
                    } catch (e) {
                        loadings.profile = false; this.setState({loadings});
                        responseMessage(e);
                    }
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <PageLoader/>
                <HeaderAndSideBar site={this.state.site} root={this.state.root} user={this.state.user} route={this.props.route} menus={this.state.menus} loadings={this.state.loadings}/>
                <div className="content-wrapper">

                    <PageTitle title={this.state.loadings.profile ? <Skeleton height={30} animation="wave" variant="text"/> :
                        this.state.profile === null ? <Skeleton height={30} animation="wave" variant="text"/> : Lang.get('users.labels.profile',{User:this.state.profile.label})} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">
                            <div className="row">
                                <ProfileCard onAvatar={this.handleAvatar} loadings={this.state.loadings} profile={this.state.profile} user={this.state.user}/>
                                <div className="col-md-9">
                                    <div className="card card-outline card-primary">
                                        <div className="card-header p-2">
                                            <ul className="nav nav-pills">
                                                <li className="nav-item"><a className="nav-link active" href="#account" data-toggle="tab">{Lang.get('users.labels.account.label')}</a></li>
                                                <li className="nav-item"><a className="nav-link" href="#password" data-toggle="tab">{Lang.get('users.labels.password.current')}</a></li>
                                                <li className="nav-item"><a className="nav-link" href="#locale" data-toggle="tab">{Lang.get('users.labels.locale.label')}</a></li>
                                            </ul>
                                        </div>
                                        <div className="card-body">
                                            <div className="tab-content">

                                                <div className="tab-pane active" id="account">
                                                    <AccountForm onUpdate={this.handleUpdateMe} user={this.state.user}/>
                                                </div>

                                                <div className="tab-pane" id="password">
                                                    <PasswordForm onUpdate={this.handleUpdateMe} user={this.state.user}/>
                                                </div>

                                                <div className="tab-pane" id="locale">
                                                    <LocaleForm onUpdate={this.handleUpdateMe} user={this.state.user} loadings={this.state.loadings} time_zones={this.state.timezones}/>
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>

                    </section>
                </div>
                <MainFooter/>
            </React.StrictMode>
        )
    }
}
export default ProfilePage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><ProfilePage route="auth.profile"/></React.StrictMode>);
