@php use Carbon\Carbon; @endphp
@extends('layout.print')

@section('contents')
    @php $pages = $pettyCashes->chunk(50) @endphp
    @foreach($pages as $page)
        <div class="page">
            <h1 style="text-align: center;font-size: 15pt">{{strtoupper(__('petty_cash.labels.menu'))}}</h1>
            <h4 style="text-align: center;font-size: 10pt">{{strtoupper(__('petty_cash.labels.period') . " " . $period)}}</h4>
            <table class="it-grid" style="margin-top: 10pt; width: 100%">
                <thead>
                <tr>
                    <th style="width: 30px">No</th>
                    <th style="width: 80px">{{__('labels.date',['Attribute' => ''])}}</th>
                    <th>{{__('petty_cash.labels.name')}}</th>
                    <th style="width:120px">{{__('petty_cash.labels.amount')}}</th>
                    <th style="width:120px">{{__('petty_cash.labels.balance')}}</th>
                </tr>
                </thead>
                <tbody>
                @php $balance = 0 @endphp
                @forelse($page as $index => $pettyCash)
                    @php $balance = $balance + $pettyCash->meta->amount @endphp
                    <tr>
                        <td style="text-align: center;alignment: center">{{$index + 1}}</td>
                        <td style="alignment: center;text-align: center">{{Carbon::parse($pettyCash->period)->format('d/m/y')}}</td>
                        <td style="alignment: center">{{$pettyCash->label}}</td>
                        <td style="alignment: center;text-align: right">
                            {{formatPrice($pettyCash->meta->amount)}}
                        </td>
                        <td style="alignment: center;text-align: right">
                            {{formatPrice($balance)}}
                        </td>
                    </tr>
                @empty
                @endforelse
                </tbody>
            </table>
        </div>
    @endforeach
@endsection

@section('scripts')

@endsection
