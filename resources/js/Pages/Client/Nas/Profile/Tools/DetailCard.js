// noinspection DuplicatedCode

import React from "react";
import {formatBytes} from "../../../../../Components/mixedConsts";

export const DetailNas = (props) => {
    return (
        <div className="card card-outline card-info mb-0" style={{minWidth:300}}>
            <div className="card-body mb-0">
                <div className="form-group row">
                    <label className="col-sm-4 col-form-label text-xs">{Lang.get('nas.labels.name')}</label>
                    <div className="col-sm-8">
                        <div className="form-control text-xs form-control-sm">{props.data.meta.nas.shortname}</div>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-4 col-form-label text-xs">{Lang.get('nas.labels.description')}</label>
                    <div className="col-sm-8">
                        <div className="form-control text-xs form-control-sm">{props.data.meta.nas.description}</div>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-4 col-form-label text-xs">{Lang.get('nas.labels.method.label')}</label>
                    <div className="col-sm-8">
                        <div className="form-control text-xs form-control-sm">{props.data.meta.nas.method}</div>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-4 col-form-label text-xs">{Lang.get('nas.labels.ip.label')}</label>
                    <div className="col-sm-8">
                        <div className="form-control text-xs form-control-sm">{props.data.meta.nas.nasname}:{props.data.meta.nas.method_port}</div>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-4 col-form-label text-xs">{Lang.get('nas.labels.domain.label')}</label>
                    <div className="col-sm-8">
                        <div className="form-control text-xs form-control-sm">{props.data.meta.nas.method_domain}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const DetailPool = (props) => {
    return (
        <div className="mb-0 card card-outline card-info" style={{minWidth:300}}>
            <div className="card-body mb-0">
                <div className="form-group row">
                    <label className="col-sm-4 col-form-label text-xs">{Lang.get('nas.pools.labels.name')}</label>
                    <div className="col-sm-8">
                        <div className="form-control-sm form-control text-xs">{props.data.meta.pool.name}</div>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-4 col-form-label text-xs">{Lang.get('nas.pools.labels.address.first')}</label>
                    <div className="col-sm-8">
                        <div className="form-control-sm form-control text-xs">{props.data.meta.pool.first_address}</div>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-4 col-form-label text-xs">{Lang.get('nas.pools.labels.address.last')}</label>
                    <div className="col-sm-8">
                        <div className="form-control-sm form-control text-xs">{props.data.meta.pool.last_address}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export const DetailBandwidth = (props) => {
    return (
        <div className="card card-outline card-info mb-0">
            <div className="card-body p-0">
                <table className="table table-sm table-striped mb-0">
                    <thead>
                    <tr>
                        <th colSpan={2} className="align-middle text-center text-xs pl-2">{Lang.get('bandwidths.labels.max_limit.main')}</th>
                        <th colSpan={2} className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.burst_limit.main')}</th>
                        <th colSpan={2} className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.threshold.main')}</th>
                        <th colSpan={2} className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.time.main')}</th>
                        <th colSpan={2} className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.limit_at.main')}</th>
                        <th rowSpan={2} className="align-middle text-center text-xs pr-2">{Lang.get('bandwidths.labels.priority.name')}</th>
                    </tr>
                    <tr>
                        <th className="align-middle text-center text-xs pl-2">{Lang.get('bandwidths.labels.max_limit.up')}</th>
                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.max_limit.down')}</th>
                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.burst_limit.up')}</th>
                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.burst_limit.down')}</th>
                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.threshold.up')}</th>
                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.threshold.down')}</th>
                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.time.up')}</th>
                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.time.down')}</th>
                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.limit_at.up')}</th>
                        <th className="align-middle text-center text-xs">{Lang.get('bandwidths.labels.limit_at.down')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="align-middle text-xs text-center pl-2">
                            {props.data.meta.bandwidth.max_limit_up === 0 ? <span className="badge badge-success">UNL</span> :formatBytes(props.data.meta.bandwidth.max_limit_up)}
                        </td>
                        <td className="align-middle text-xs text-center">
                            {props.data.meta.bandwidth.max_limit_down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(props.data.meta.bandwidth.max_limit_down)}
                        </td>
                        <td className="align-middle text-xs text-center">
                            {props.data.meta.bandwidth.burst_limit_up === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(props.data.meta.bandwidth.burst_limit_up)}
                        </td>
                        <td className="align-middle text-xs text-center">
                            {props.data.meta.bandwidth.burst_limit_down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(props.data.meta.bandwidth.burst_limit_down)}
                        </td>
                        <td className="align-middle text-xs text-center">
                            {props.data.meta.bandwidth.threshold_up === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(props.data.meta.bandwidth.threshold_up)}
                        </td>
                        <td className="align-middle text-xs text-center">
                            {props.data.meta.bandwidth.threshold_down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(props.data.meta.bandwidth.threshold_down)}
                        </td>
                        <td className="align-middle text-xs text-center">
                            {props.data.meta.bandwidth.burst_time_up === 0 ? <span className="badge badge-success">UNL</span> : `${props.data.meta.bandwidth.burst_time_up}s`}
                        </td>
                        <td className="align-middle text-xs text-center">
                            {props.data.meta.bandwidth.burst_time_down === 0 ? <span className="badge badge-success">UNL</span> : `${props.data.meta.bandwidth.burst_time_down}s`}
                        </td>
                        <td className="align-middle text-xs text-center">
                            {props.data.meta.bandwidth.limit_at_up === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(props.data.meta.bandwidth.limit_at_up)}
                        </td>
                        <td className="align-middle text-xs text-center">
                            {props.data.meta.bandwidth.limit_at_down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(props.data.meta.bandwidth.limit_at_down)}
                        </td>
                        <td className="align-middle text-xs text-center pr-2">{props.data.meta.bandwidth.priority}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
