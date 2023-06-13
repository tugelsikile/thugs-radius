import React from "react";

export const TutorialSSL = (props) => {
    return (
        <>
            <strong>#{Lang.get('nas.tutorial.title')}</strong>
            <ol style={{paddingLeft:30}}>
                <li>
                    Buka mikrotik anda kemudian ketik perintah dibawah ini kedalam terminal<br/>
                    <code>
                        <span className="text-primary">/certificate</span>/<span className="text-danger">add</span> <span className="text-success">name=</span><span className="text-dark">ca-template</span> <span className="text-success">days-valid=</span><span className="text-dark">3650</span> <span className="text-success">common-name=</span><span className="text-dark">{props.domain === null ? '' : props.domain.replaceAll('https://','').replaceAll('http://','')}</span> <span className="text-success">key-usage=</span><span className="text-dark">key-cert-sign,crl-sign</span><br/>
                        <span className="text-primary">/certificate</span>/<span className="text-danger">add</span> <span className="text-success">name=</span><span className="text-dark">server-template</span> <span className="text-success">days-valid=</span><span className="text-dark">3650</span> <span className="text-success">common-name=</span><span className="text-dark">{props.domain === null ? '' : props.domain.replaceAll('https://','').replaceAll('http://','')}</span><br/>
                        <span className="text-primary">/certificate</span>/<span className="text-danger">sign</span> <span className="text-dark">ca-template</span> <span className="text-success">name=</span><span className="text-dark">root-ca</span><br/>
                        ********** tunggu 5 detik<br/>
                        <span className="text-primary">/certificate</span>/<span className="text-danger">sign</span> <span className="text-success">ca=</span><span className="text-dark">root-ca</span> <span className="text-dark">server-template</span> <span className="text-success">name=</span><span className="text-dark">server</span><br/>
                        ********** tunggu 5 detik<br/>
                        <span className="text-primary">/certificate</span>/<span className="text-danger">set</span> <span className="text-dark">root-ca</span> <span className="text-success">trusted=</span><span className="text-dark">yes</span><br/>
                        <span className="text-primary">/certificate</span>/<span className="text-danger">set</span> <span className="text-dark">server</span> <span className="text-success">trusted=</span><span className="text-dark">yes</span><br/>
                        <span className="text-primary">/ip/service</span>/<span className="text-danger">set</span> <span className="text-dark">www-ssl</span> <span className="text-success">certificate=</span><span className="text-dark">server</span> <span className="text-success">disabled=</span><span className="text-dark">no</span>
                    </code>
                </li>
                <li>Jika perintah tidak ada error, untuk mengetesnya cukup buka browser kemudian buka link <a target="_blank" href={props.domain}>{props.domain}</a>, maka browser akan menampilkan webfig mikrotik anda.</li>
            </ol>
        </>
    )
}
export const TutorialAPI = (props) => {
    return (
        <code>
            as
        </code>
    )
}
