import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl, logout} from "../../../../../Components/Authentication";
import PageLoader from "../../../../../Components/PageLoader";
import MainHeader from "../../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../../Components/Layout/MainSidebar";
import MainFooter from "../../../../../Components/Layout/MainFooter";
import PageTitle from "../../../../../Components/Layout/PageTitle";
import {showError} from "../../../../../Components/Toaster";
import {crudCompanyInvoice} from "../../../../../Services/CompanyService";
import {siteData} from "../../../../../Components/mixedConsts";
import BodyInvoiceWM from "./BodyInvoiceWM";
import BodyInvoice from "./BodyInvoice";
import {HeaderAndSideBar} from "../../../../../Components/Layout/Layout";

class PrintInvoicePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, invoice : true, site : false },
            site : null,
            privilege : null, menus : [], invoice : null,
        };
        this.loadInvoices = this.loadInvoices.bind(this);
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        if (! this.state.loadings.privilege) {
            if (this.state.privilege === null) {
                let loadings = this.state.loadings;
                loadings.privilege = true; this.setState({loadings});
                siteData()
                    .then((response)=>this.setState({site:response}))
                    .then(()=>getPrivileges(this.props.route)
                        .then((response) => this.setState({privilege:response.privileges,menus:response.menus}))
                        .then(()=>this.loadInvoices())
                        .then(()=>{
                            loadings.privilege = false; this.setState({loadings});
                        }));
            }
        }
    }
    async loadInvoices() {
        let loadings = this.state.loadings;
        let invoice = this.state.invoice;
        if (invoice === null) {
            loadings.invoice = true; this.setState({loadings});
            let scripts = document.getElementsByTagName('script');
            let id_invoice = null;
            for(let index = 0; index < scripts.length; index++) {
                if (scripts[index].src.indexOf('print-invoices') !== -1) {
                    id_invoice = scripts[index].getAttribute('data-id');
                }
            }
            if (id_invoice === null) {
                loadings.invoice = false; this.setState({loadings});
            } else {
                try {
                    const formData = new FormData();
                    formData.append('id', id_invoice);
                    let response = await crudCompanyInvoice(formData);
                    if (response.data.params === null) {
                        loadings.invoice = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        if (response.data.params.length > 0) {
                            invoice = response.data.params[0];
                        }
                        loadings.invoice = false; this.setState({loadings,invoice});
                    }
                } catch (e) {
                    loadings.invoice = false; this.setState({loadings});
                    if (e.response.status === 401) logout();
                    showError(e.response.data.message);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <PageLoader/>
                <HeaderAndSideBar root={this.state.root} user={this.state.user} route={this.props.route} menus={this.state.menus} site={this.state.site} loadings={this.state.loadings}/>

                <div className="content-wrapper">
                    <PageTitle title={Lang.get('companies.invoices.labels.print')} childrens={[
                        {label : Lang.get('companies.labels.menu'), url : getRootUrl() + '/clients' },
                        {label : Lang.get('companies.invoices.labels.menu'), url : getRootUrl() + '/clients/invoices'}
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            {this.state.site === null || this.state.invoice === null ? null :
                                this.state.invoice.meta.timestamps.paid.at === null ?
                                    <BodyInvoice user={this.state.user}
                                                 site={this.state.site}
                                                 loadings={this.state.loadings}
                                                 invoice={this.state.invoice}/>
                                    :
                                    <BodyInvoiceWM user={this.state.user}
                                                   site={this.state.site}
                                                   loadings={this.state.loadings}
                                                   invoice={this.state.invoice}/>
                            }

                        </div>

                    </section>

                </div>

                <MainFooter/>
            </React.StrictMode>
        )
    }
}
export default PrintInvoicePage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><PrintInvoicePage route="auth.clients.invoices"/></React.StrictMode>)
