/**
 *
 * jQuery plugin to impliment local storage with optional AES
 * encryption support via the Gibberish-AES libraries
 *
 * FEATURES:
 * - HTML5 localStorage support
 * - HTML5 sessionStorage support
 * - Cookie support
 * - AES encrypted storage support
 *
 * REQUIREMENTS:
 * - jQuery libraries (required - http://www.jquery.com)
 * - jQuery cookie plugin (optional - http://plugins.jquery.com/files/jquery.cookie.js.txt)
 * - Gibberish-AES libraries (optional - https://github.com/mdp/gibberish-aes)
 *
 * OPTIONS:
 * - appid:   Unique identifier for storage mechanism
 * - storage: HTML5 localStorage, sessionStorage and cookies supported
 * - dowhat:  Get or set local storage items
 * - data:    Data to be stored
 * - name:    Name of data to store or retrieve
 * - aes:     Use AES encryption for local storage
 * - key:     Client password for local storage aes encrypted items
 *
 * Author: Jason Gerfen
 * Email: jason.gerfen@gmail.com
 * Copyright: Jason Gerfen
 *
 * License: GPL
 *
 */

(function($){

 /* Store data in specified storage mechanism */
 $.setItem = function(type, k, v) {
  var x = false;
  type = ($.validateStorage(type)) ? type : 'cookie';
  switch(type) {
   case 'localStorage':
    x = $.setLocal(k, v);
    break;
   case 'sessionStorage':
    x = $.setSession(k, v);
    break;
   case 'cookie':
    x = $.setCookie(k, v);
    break;
   default:
    x = $.setLocal(k, v);
    break;
  }
  return x;
 }

 /* Get public key from specified storage mechanism */
 $.getItem = function(type, k) {
  var x = false;
  type = ($.validateStorage(type)) ? type : 'cookie';
  switch(type) {
   case 'localStorage':
    x = $.getLocal(k);
    break;
   case 'sessionStorage':
    x = $.getSession(k);
    break;
   case 'cookie':
    x = $.getCookie(k);
    break;
   default:
    x = $.getLocal(k);
    break;
  }
  return x;
 }

 /* localStorage setter */
 $.setLocal = function(k, v) {
  return (localStorage.setItem(k, v)) ? false : true;
 }

 /* sessionStorage setter */
 $.setSession = function(k, v) {
  return (sessionStorage.setItem(k, v)) ? false : true;
 }

 /* cookie setter */
 $.setCookie = function(k, v) { alert(k+' => '+v+' => '+localStorage.setItem(k, v));
  if (typeof $.cookie === 'function') {
   return ($.cookie(k, v, {expires: 7})) ? true : false;
  } else {
   return false;
  }
 }

 /* localStorage getter */
 $.getLocal = function(k) {
  return (localStorage.getItem(k)) ? localStorage.getItem(k) : false;
 }

 /* sessionStorage getter */
 $.getSession = function(k) {
  return (sessionStorage.getItem(k)) ? sessionStorage.getItem(k) : false;
 }

 /* cookie getter */
 $.getCookie = function(name) {
  if (typeof $.cookie === 'function') {
   return ($.cookie(k)) ? $.cookie(k) : false;
  } else {
   return false;
  }
 }

 /* validate string integrity */
 $.validateString = function(string) {
  return ((string==='false')||(string.length===0)||(!string)||(string===null)||(string==='')||(typeof string==='undefined')) ? false : true;
 }

 /* validate localStorage/localSession functionality */
 $.validateStorage = function(type) {
  return ((window[type])&&(typeof window[type]=='object')) ? true : false;
 }

 /* generate a uuid (RFC-4122) */
 $.uuid = function(len){
  var chars = '0123456789abcdef'.split('');
  var uuid = [], rnd = Math.random, r;
  uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
  uuid[14] = '4';
  for (var i = 0; i < 36; i++){
   if (!uuid[i]){
    r = 0 | rnd()*16;
    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
   }
  }
  return (len!==null) ? uuid.join('').replace(/-/g, '').split('',len).join('') : uuid.join('');
 }

 /* generate or use existing uuid key */
 $.handleKey = function(options) {
  if (options.aes) {
   options.key = ($.getItem(options.storage, 'key')) ? $.getItem(options.storage, 'key') : $.uuid(null);
   $.setItem(options.storage, 'key', options.key);
  }
 }

 /* the plug-in meat and potatoes */
 $.fn.handleStorage = function(options) {

  /* default options */
  var defaults = {
   appid:   'jQuery.handleStorage', // Plugin name (unique ID for local, session or cookie storage id)
   storage: 'localStorage',         // localStorage || sessionStorage || cookie (cookie storage requires jQuery cookie plugin)
   dowhat:  'set',                  // set || get storage items
   k:       $(this).k,              // name to use for index
   v:       $(this).v,              // value to use for indexed storage item
   aes:     false,                  // Use encrypted storage?
   key:     '',                     // key for encrypted storage
   display: $(this).display         // div element used to display contents of storage
  };

  /* merge specified options with defaults */
  options = $.extend(defaults, options);

  /* perform key setting/getting */
  $.handleKey(options);

  /* what are we doing? */
  switch(options.dowhat){
   case 'get':
    ret = ((options.aes)&&(options.key)) ? GibberishAES.dec($.getItem(options.storage, options.k), options.key) : $.getItem(options.storage, options.k);
    break;
   case 'set':
    ret = ((options.aes)&&(options.key)) ? $.setItem(options.storage, options.k, GibberishAES.enc(options.v, options.key)) : $.setItem(options.storage, options.k, options.v);
    break;
   default:
    ret = false;
    break;
  }

  /* set the display item */
  $('#'+options.display).html(ret);
  return true;

 };
})(jQuery);
