const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */


//mix.copy('node_modules/crypto-js','public/js/plugins/crypto-js');
//mix.js('resources/js/src/guests/welcome.js','public/js/guests');
//mix.sass('resources/css/progress-animation.scss','public/css');
//mix.sass('resources/css/captcha.scss','public/css');
/********* GUESTS ***********/
/*
mix.js('resources/js/src/guests/forgot-password.js','public/js/guests');
mix.js('resources/js/src/guests/register.js','public/js/guests');
mix.js('resources/js/src/guests/reset-password.js','public/js/guests');
*/

/******* AUTH ***********/
/*

mix.js('resources/js/src/auth/login.js','public/js');
mix.js('resources/js/src/auth/index.js','public/js/auth');
mix.js('resources/js/src/auth/users/index.js','public/js/auth/users');
mix.js('resources/js/src/auth/users/privileges.js','public/js/auth/users');
mix.js('resources/js/src/auth/users/profile.js','public/js/auth/users');
mix.js('resources/js/src/auth/companies/index.js','public/js/auth/companies');
mix.js('resources/js/src/auth/companies/packages.js','public/js/auth/companies');
mix.js('resources/js/src/auth/companies/invoices.js','public/js/auth/companies');
mix.js('resources/js/src/auth/companies/print-invoices.js','public/js/auth/companies');
mix.js('resources/js/src/auth/configs/timezones.js','public/js/auth/configs');
mix.js('resources/js/src/auth/configs/currencies.js','public/js/auth/configs');
mix.js('resources/js/src/auth/configs/taxes.js','public/js/auth/configs');
mix.js('resources/js/src/auth/configs/discounts.js','public/js/auth/configs');
*/


/*---------- CLIENTS ----------*/

mix.js('resources/js/src/clients/index.js','public/js/clients');
/*
mix.js('resources/js/src/clients/wizard.js','public/js/clients');
mix.js('resources/js/src/clients/configs/index.js','public/js/clients/configs');
*/
mix.js('resources/js/src/clients/configs/payment-gateways.js','public/js/clients/configs');
/*
mix.js('resources/js/src/clients/configs/discounts.js','public/js/clients/configs');
mix.js('resources/js/src/clients/configs/taxes.js','public/js/clients/configs');
mix.js('resources/js/src/clients/nas/index.js','public/js/clients/nas');
mix.js('resources/js/src/clients/nas/profiles/pools.js','public/js/clients/nas/profiles');
mix.js('resources/js/src/clients/nas/profiles/bandwidths.js','public/js/clients/nas/profiles');
mix.js('resources/js/src/clients/nas/profiles/index.js','public/js/clients/nas/profiles');
mix.js('resources/js/src/clients/customers/index.js','public/js/clients/customers');
mix.js('resources/js/src/clients/customers/pppoe.js','public/js/clients/customers');
mix.js('resources/js/src/clients/customers/hotspot.js','public/js/clients/customers');
mix.js('resources/js/src/clients/customers/invoices.js','public/js/clients/customers');
mix.js('resources/js/src/clients/users/index.js','public/js/clients/users');
mix.js('resources/js/src/clients/users/privileges.js','public/js/clients/users');
*/

/********* CUSTOMERS ***********/
/*
mix.js('resources/js/src/customer/index.js', 'public/js/customers');
*/
