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
import {
    CardPreloader,
    formatLocalePeriode, formatLocaleString,
    siteData, sumTotalInvoiceSingle,
    sumTotalPackageSingle,
    ucFirst
} from "../../../../../Components/mixedConsts";

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
                <MainHeader root={this.state.root} user={this.state.user}/>
                <MainSidebar route={this.props.route}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>

                <div className="content-wrapper">
                    <PageTitle title={Lang.get('companies.invoices.labels.print')} childrens={[
                        {label : Lang.get('companies.labels.menu'), url : getRootUrl() + '/clients' },
                        {label : Lang.get('companies.invoices.labels.menu'), url : getRootUrl() + '/clients/invoices'}
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            {this.state.site !== null && this.state.invoice !== null &&
                                <div className="invoice p-3 mb-3">
                                    {this.state.loadings.invoice &&
                                        <CardPreloader/>
                                    }
                                    <div className="row">
                                        <div className="col-12">
                                            <h4>
                                                <i className="fas fa-globe mr-1"/>{this.state.site.name}
                                                <small className="float-right">
                                                    {Lang.get('companies.invoices.labels.periode')} : {formatLocalePeriode(this.state.invoice.meta.periode,'D MMMM yyyy')}
                                                </small>
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="row invoice-info">
                                        <div className="col-sm-4 invoice-col">
                                            From
                                            <address>
                                                <strong>{this.state.user.label}</strong><br/>
                                                {this.state.site.address.street}, {this.state.site.address.village !== null && ucFirst(this.state.site.address.village.name)} {this.state.site.address.district !== null && ucFirst(this.state.site.address.district.name)} {this.state.site.address.city !== null && ucFirst(this.state.site.address.city.name)} {this.state.site.address.province !== null && ucFirst(this.state.site.address.province.name)} {this.state.site.address.postal}<br/>
                                                Phone: {this.state.site.phone}<br/>
                                                Email: {this.state.site.email}
                                            </address>
                                        </div>
                                        <div className="col-sm-4 invoice-col">
                                            To
                                            <address>
                                                <strong>{this.state.invoice.meta.company.name}</strong><br/>
                                                {this.state.invoice.meta.company.address}, {this.state.invoice.meta.company.village_obj !== null && ucFirst(this.state.invoice.meta.company.village_obj.name)} {this.state.invoice.meta.company.district_obj !== null && ucFirst(this.state.invoice.meta.company.district_obj.name)} {this.state.invoice.meta.company.city_obj !== null && ucFirst(this.state.invoice.meta.company.city_obj.name)} {this.state.invoice.meta.company.province_obj !== null && ucFirst(this.state.invoice.meta.company.province_obj.name)} {this.state.invoice.meta.company.postal}<br/>
                                                Phone: {this.state.invoice.meta.company.phone}<br/>
                                                Email: {this.state.invoice.meta.company.email}
                                            </address>
                                        </div>

                                        <div className="col-sm-4 invoice-col">
                                            <b>Invoice #{this.state.invoice.label}</b><br/>
                                            <br/>
                                            <b>Payment Due:</b> {formatLocalePeriode(this.state.invoice.meta.company.expired_at,'DD MMMM yyyy')}<br/>
                                        </div>
                                    </div>


                                    <div className="row">
                                        <div className="col-12 table-responsive">
                                            <table className="table table-striped">
                                                <thead>
                                                <tr>
                                                    <th>{Lang.get('companies.invoices.labels.package.name')}</th>
                                                    <th width={100}>{Lang.get('companies.invoices.labels.package.qty')}</th>
                                                    <th width={150}>{Lang.get('companies.invoices.labels.package.price')}</th>
                                                    <th width={100}>{Lang.get('companies.invoices.labels.package.vat')}</th>
                                                    <th width={150}>{Lang.get('companies.invoices.labels.subtotal.item')}</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {this.state.invoice.meta.packages.map((item)=>
                                                    <tr key={item.value}>
                                                        <td>{item.label}</td>
                                                        <td>{item.meta.prices.qty}</td>
                                                        <td>{formatLocaleString(item.meta.prices.price)}</td>
                                                        <td>{item.meta.prices.vat}%</td>
                                                        <td>{formatLocaleString(sumTotalPackageSingle(item))}</td>
                                                    </tr>
                                                )}
                                                </tbody>
                                            </table>
                                        </div>

                                    </div>

                                    <div className="row">

                                        <div className="col-6">
                                            <p className="lead">Payment Methods:</p>
                                            <img src="../../dist/img/credit/visa.png" alt="Visa"/>
                                            <img src="../../dist/img/credit/mastercard.png" alt="Mastercard"/>
                                            <img src="../../dist/img/credit/american-express.png" alt="American Express"/>
                                            <img src="../../dist/img/credit/paypal2.png" alt="Paypal"/>
                                            <p className="text-muted well well-sm shadow-none mt-2">
                                                Etsy doostang zoodles disqus groupon greplin oooj voxy zoodles, weebly ning heekya handango imeem plugg dopplr jibjab, movity jajah plickers sifteo edmodo ifttt zimbra.
                                            </p>
                                        </div>

                                        <div className="col-6">
                                            <p className="lead">Amount Due 2/22/2014</p>
                                            <div className="table-responsive">
                                                <table className="table">
                                                    <tbody>
                                                    <tr>
                                                        <th style={{width:'50%'}}>{Lang.get('companies.invoices.labels.subtotal.item')}:</th>
                                                        <td>{formatLocaleString(this.state.invoice.meta.packages.reduce((a,b) => a + sumTotalPackageSingle(b),0))}</td>
                                                    </tr>
                                                    {this.state.invoice.meta.vat > 0 &&
                                                        <tr>
                                                            <th>Tax ({this.state.invoice.meta.vat}%)</th>
                                                            <td>$10.34</td>
                                                        </tr>
                                                    }
                                                    <tr>
                                                        <th>Shipping:</th>
                                                        <td>$5.80</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Total:</th>
                                                        <td>$265.24</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row no-print">
                                        <div className="col-12">
                                            <a href="invoice-print.html" rel="noopener" target="_blank" className="btn btn-default"><i className="fas fa-print"></i> Print</a>
                                            <button type="button" className="btn btn-success float-right"><i className="far fa-credit-card"></i> Submit Payment
                                            </button>
                                            <button type="button" className="btn btn-primary float-right" style={{marginRight:'5px'}}>
                                                <i className="fas fa-download"></i> Generate PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
