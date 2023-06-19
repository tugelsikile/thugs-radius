import React from "react";
import ReactDOM from "react-dom/client";
import {responseMessage, siteData} from "../../../Components/mixedConsts";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import PageLoader from "../../../Components/PageLoader";
import {HeaderAndSideBar} from "../../../Components/Layout/Layout";
import MainFooter from "../../../Components/Layout/MainFooter";
import {crudCompanyConfig} from "../../../Services/ConfigService";
import {showError} from "../../../Components/Toaster";
import FormAddress from "./Tools/FormAddress";
import PageTitle from "../../../Components/Layout/PageTitle";
import {allProvinces} from "../../../Services/RegionService";

// noinspection DuplicatedCode
class ConfigPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin, site : null,
            loadings : { privileges : true, site : false, configs : true, provinces : true },
            privileges : null, menus : [],  configs : [], provinces : [],
        };
        this.loadConfigs = this.loadConfigs.bind(this);
    }
    componentDidMount() {
        let loadings = this.state.loadings;
        if (this.state.privileges === null) {
            getPrivileges(this.props.route)
                .then((response)=>{
                    this.setState({privileges:response.privileges,menus:response.menus});
                })
                .then(()=>{
                    if (this.state.site === null) {
                        siteData()
                            .then((response)=>this.setState({site:response}))
                            .then(()=>{
                                if (this.state.configs.length === 0) {
                                    loadings.configs = false; this.setState({loadings},()=>this.loadConfigs());
                                }
                            })
                            .then(()=>{
                                loadings.provinces = false; this.setState({loadings},()=>this.loadProvinces());
                            });
                    }
                });
        }
    }
    async loadProvinces() {
        if (! this.state.loadings.provinces) {
            if (this.state.provinces.length === 0) {
                let loadings = this.state.loadings;
                loadings.provinces = true; this.setState({loadings});
                try {
                    let response = await allProvinces();
                    if (response.data.params === null) {
                        loadings.provinces = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.provinces = false; this.setState({loadings,provinces:response.data.params});
                    }
                } catch (e) {
                    loadings.provinces = false; this.setState({loadings});
                    showError(e.response.data.message);
                }
            }
        }
    }
    async loadConfigs(data = null) {
        if (! this.state.loadings.configs) {
            let loadings = this.state.loadings;
            if (data !== null) {
                let configs = this.state.configs;
                let index = configs.findIndex((f) => f.value === data.value);
                if (index >= 0) {
                    configs[index] = data;
                    if (index === 0) {
                        if (this.state.user !== null) {
                            if (this.state.user.meta.company !== null) {
                                let user = this.state.user;
                                user.meta.company.name = data.label;
                                user.meta.company.address = data.meta.address.street;
                                if (data.meta.address.village !== null) user.meta.company.village = data.meta.address.village.code;
                                if (data.meta.address.district !== null) user.meta.company.district = data.meta.address.district.code;
                                if (data.meta.address.city !== null) user.meta.company.city = data.meta.address.city.code;
                                if (data.meta.address.province !== null) user.meta.company.province = data.meta.address.province.code;
                                user.meta.company.postal = data.meta.address.postal;
                                user.meta.company.email = data.meta.address.email;
                                user.meta.company.phone = data.meta.address.phone;
                                if (data.meta.logo !== null) {
                                    if (user.meta.company.config === null) {
                                        user.meta.company.config = {logo : data.meta.logo };
                                    } else {
                                        user.meta.company.config.logo = data.meta.logo;
                                    }
                                } else {
                                    if (user.meta.company.config !== null) {
                                        user.meta.company.config.logo = null;
                                    }
                                }
                                this.setState({user},()=>localStorage.setItem('user',JSON.stringify(user)));
                            }
                        }
                    }
                }
                loadings.configs = false;
                this.setState({configs,loadings});
            } else {
                if (this.state.user !== null) {
                    if (this.state.user.meta.company !== null) {
                        let configs = [];
                        configs.push({
                            value :'client',
                            label : this.state.user.meta.company.name,
                            meta : {
                                id : this.state.user.meta.company.id,
                                logo : this.state.user.meta.company.config === null ? null : typeof this.state.user.meta.company.config.logo === 'undefined' ? null : this.state.user.meta.company.config.logo,
                                address : {
                                    street : this.state.user.meta.company.address,
                                    village : this.state.user.meta.company.village,
                                    district : this.state.user.meta.company.district,
                                    city : this.state.user.meta.company.city,
                                    province : this.state.user.meta.company.province,
                                    postal : this.state.user.meta.company.postal,
                                    email : this.state.user.meta.company.email,
                                    phone : this.state.user.meta.company.phone
                                }
                            }
                        });
                        this.setState({configs});
                    }
                }
            }
        }
        /*if (! this.state.loadings.configs) {
            let configs = this.state.configs;
            let loadings = this.state.loadings;
            loadings.configs = true; this.setState({loadings});
            if (data !== null) {

            } else {
                try {
                    let response = await crudCompanyConfig(null,true);
                    if (response.data.params === null) {
                        showError(response.data.message);
                        loadings.configs = false; this.setState({loadings});
                    } else {
                        loadings.configs = false;
                        loadings.configs = false; this.setState({loadings,configs:response.data.params});
                    }
                } catch (e) {
                    loadings.configs = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }*/
    }
    render() {
        return (
            <React.StrictMode>
                <PageLoader/>

                <HeaderAndSideBar route={this.props.route} user={this.state.user} menus={this.state.menus} site={this.state.site} loadings={this.state.loadings}/>

                <div className="content-wrapper">

                    <PageTitle title={Lang.get('configs.labels.menu')} childrens={[
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">
                            <FormAddress privilege={this.state.privileges} handleUpdate={this.loadConfigs} provinces={this.state.provinces} loadings={this.state.loadings} loading={this.state.loadings.configs} data={this.state.configs.length === 0 ? null : this.state.configs[0]}/>
                        </div>

                    </section>
                </div>

                <MainFooter/>
            </React.StrictMode>
        )
    }
}
export default ConfigPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><ConfigPage route="clients.configs"/></React.StrictMode>)
