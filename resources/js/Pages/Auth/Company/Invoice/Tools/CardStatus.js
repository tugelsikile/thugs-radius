import React from "react";
import {
    CardPreloader,
    formatLocaleString,
    sumTotalInvoices,
    sumTotalPaid,
    sumTotalTaxes
} from "../../../../../Components/mixedConsts";

class CardStatus extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="row">
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-info">
                        {this.props.loading && <div className="overlay"><CardPreloader/></div>}
                        <div className="inner">
                            <h3>{formatLocaleString(sumTotalInvoices(this.props.invoices),2)}</h3>
                            <p>{Lang.get('companies.invoices.labels.cards.total')}</p>
                        </div>
                        <div className="icon">
                            <i className="fas fa-cash-register"></i>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-success">
                        {this.props.loading && <div className="overlay"><CardPreloader/></div>}
                        <div className="inner">
                            <h3>{formatLocaleString(sumTotalPaid(this.props.invoices),2)}</h3>
                            <p>{Lang.get('companies.invoices.labels.cards.paid')}</p>
                        </div>
                        <div className="icon">
                            <i className="fas fa-hand-holding-usd"></i>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-warning">
                        {this.props.loading && <div className="overlay"><CardPreloader/></div>}
                        <div className="inner">
                            <h3>{formatLocaleString(sumTotalInvoices(this.props.invoices) - sumTotalPaid(this.props.invoices),2)}</h3>
                            <p>{Lang.get('companies.invoices.labels.cards.unpaid')}</p>
                        </div>
                        <div className="icon">
                            <i className="fas fa-praying-hands"></i>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-secondary" title={Lang.get('companies.invoices.labels.cards.tax_info')}>
                        {this.props.loading && <div className="overlay"><CardPreloader/></div>}
                        <div className="inner">
                            <h3>{formatLocaleString(sumTotalTaxes(this.props.invoices))}</h3>
                            <p>{Lang.get('companies.invoices.labels.cards.tax')}</p>
                        </div>
                        <div className="icon">
                            <i className="fas fa-american-sign-language-interpreting"></i>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default CardStatus;
