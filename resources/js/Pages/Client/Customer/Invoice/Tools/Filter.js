import React from "react";
import id from "date-fns/locale/id";
import en from "date-fns/locale/en-US";
import DatePicker from "react-datepicker";

export const FilterInvoice = (props) => {
    return (
        <div className="card card-outline card-info" style={{display:props.open ? 'block' : 'none'}}>
            <div className="card-body px-2 py-2">
                <div className="form-group row mb-0">
                    <div className="col-sm-2">
                        <DatePicker showMonthYearPicker showFullMonthYearPicker
                                    selected={props.filter.bill_period} maxDate={new Date()}
                                    title={Lang.get('invoices.labels.bill_period.select')}
                                    className="form-control form-control-sm text-sm" disabled={props.loading}
                                    locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                                    onChange={props.handleDate} dateFormat="MMMM yyyy"/>
                    </div>
                    <div className="col-sm-3 pl-0">
                        <DatePicker showYearDropdown
                                    selected={props.filter.paid_date} maxDate={new Date()}
                                    title={Lang.get('invoices.labels.paid.date.select')}
                                    placeholderText={Lang.get('invoices.labels.paid.date.select')} isClearable
                                    className="form-control form-control-sm text-xs" disabled={props.loading}
                                    locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                                    onChange={props.handlePaidDate} dateFormat={localStorage.getItem('locale_date_format').replaceAll('D','d').replaceAll('HH:mm:ss','')}/>
                    </div>
                </div>
            </div>
        </div>
    )
}
