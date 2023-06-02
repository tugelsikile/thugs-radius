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

//mix.sass('resources/css/captcha.scss','public/css');
mix.js('resources/js/src/auth/login.js','public/js');
mix.js('resources/js/src/auth/index.js','public/js/auth');
mix.js('resources/js/src/auth/users/index.js','public/js/auth/users');
mix.js('resources/js/src/auth/users/privileges.js','public/js/auth/users');
mix.js('resources/js/src/auth/companies/index.js','public/js/auth/companies');
mix.js('resources/js/src/auth/companies/packages.js','public/js/auth/companies');
mix.js('resources/js/src/auth/companies/invoices.js','public/js/auth/companies');
