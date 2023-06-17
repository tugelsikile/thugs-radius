import React from "react";
import {
    faInfoCircle,
    faArchive,
    faFileInvoiceDollar,
    faCashRegister,
    faUserSecret,
    faUserShield,
    faTools,
    faTags,
    faWallet,
    faMoneyBill,
    faAtlas,
    faServer,
    faPollH,
    faWifi,
    faConciergeBell,
    faUserTie,
    faTicketAlt,
    faFileInvoice, faKey, faCog
} from "@fortawesome/free-solid-svg-icons";
import {faHandPointer} from "@fortawesome/free-regular-svg-icons";

export const MenuIcon = (iconName) => {
    let icon = faInfoCircle;
    switch (iconName) {
        default : icon = faInfoCircle; break;
        case 'fas fa-archive': icon = faArchive; break;
        case 'fas fa-file-invoice-dollar': icon = faFileInvoiceDollar; break;
        case 'fas fa-cash-register': icon = faCashRegister; break;
        case 'fas fa-user-secret': icon = faUserSecret; break;
        case 'fas fa-user-shield': icon = faUserShield; break;
        case 'fas fa-tools': icon = faTools; break;
        case 'fas fa-tags': icon = faTags; break;
        case 'fas fa-wallet': icon = faWallet; break;
        case 'fas fa-money-bill': icon = faMoneyBill; break;
        case 'fas fa-atlas': icon = faAtlas; break;
        case 'fas fa-server': icon = faServer; break;
        case 'fas fa-hand-pointer': icon = faHandPointer; break;
        case 'fas fa-poll-h': icon = faPollH; break;
        case 'fas fa-wifi': icon = faWifi; break;
        case 'fas fa-concierge-bell': icon = faConciergeBell; break;
        case 'fas fa-user-tie': icon = faUserTie; break;
        case 'fas fa-ticket-alt': icon = faTicketAlt; break;
        case 'fas fa-file-invoice': icon = faFileInvoice; break;
        case 'fas fa-key': icon = faKey; break;
        case 'fas fa-cog': icon = faCog; break;
    }
    return icon;
}
