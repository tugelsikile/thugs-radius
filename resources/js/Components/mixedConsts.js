import React from "react";

Lang.setLocale(localStorage.getItem('locale_lang'));
export const langSelect = [
    { value : 'id', label : 'Bahasa Indonesia'},
    { value : 'en', label : 'English' }
]
export const dateFormatSelect = [
    { value : 'DD/MM/yyyy HH:mm:ss', label : 'DD/MM/yyyy HH:mm:ss'},
    { value : 'DD/MM/yyyy HH:mm', label : 'DD/MM/yyyy HH:mm'},
    { value : 'DD/MM/yy HH:mm', label : 'DD/MM/yy HH:mm'},
    { value : 'DD-MM-yyyy HH:mm:ss', label : 'DD-MM-yyyy HH:mm:ss'},
    { value : 'DD MMMM yyyy HH:mm:ss', label : 'DD MMMM yyyy HH:mm:ss'},
    { value : 'dd, DD MMMM yyyy HH:mm:ss', label : 'dd, DD MMMM yyyy HH:mm:ss'},
    { value : 'ddd, DD MMMM yyyy HH:mm:ss', label : 'ddd, DD MMMM yyyy HH:mm:ss'},
    { value : 'dddd, DD MMMM yyyy HH:mm:ss', label : 'dddd, DD MMMM yyyy HH:mm:ss'},
    { value : 'DD MMM yyyy HH:mm:ss', label : 'DD MMM yyyy HH:mm:ss'},
    { value : 'yyyy/MM/DD HH:mm:ss', label : 'yyyy/MM/DD HH:mm:ss'},
    { value : 'yyyy/MM/DD HH:mm', label : 'yyyy/MM/DD HH:mm'},
    { value : 'yy/MM/DD HH:mm', label : 'yy/MM/DD HH:mm'},
]
export const ucFirst = (string) => {
    return string.toLowerCase().replace(/\b[a-z]/g, (letter) => {
        return letter.toUpperCase();
    })
}
export const durationType = [
    { value : 'minutes', label : Lang.get('durations.minutes') },
    { value : 'hours', label : Lang.get('durations.hours') },
    { value : 'days', label : Lang.get('durations.days') },
    { value : 'weeks', label : Lang.get('durations.weeks') },
    { value : 'months', label : Lang.get('durations.months') },
    { value : 'years', label : Lang.get('durations.years') },
]
export const durationBy = (ammount, type) => {
    let response = 0;
    switch (type) {
        case 'minutes' : response = ammount * 60; break;
        case 'hours' : response = ammount * ( 60 * 60 ); break;
        case 'days' : response = ammount * ( ( 60 * 60 ) * 24 ); break;
        case 'weeks' : response = ammount * ( (60 * 60 )* 24 ) * 7; break;
        case 'months' : response = ammount * ( ( (60 * 60 )* 24 ) * 7 ) * 30; break;
        case 'years' : response = ammount * ( ( ( (60 * 60 )* 24 ) * 7 ) * 30 ) * 12 ; break;
    }
    return response;
}
