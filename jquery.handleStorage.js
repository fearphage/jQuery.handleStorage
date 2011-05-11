/**
 *
 * jQuery plugin to impliment local storage with optional AES
 * encryption support via the Gibberish-AES libraries
 *
 * Fork me @ https://www.github.com/jas-/jQuery.handleStorage
 *
 * FEATURES:
 * - HTML5 localStorage support
 * - HTML5 sessionStorage support
 * - Cookie support
 * - AES encryption support
 *
 * REQUIREMENTS:
 * - jQuery libraries (required - http://www.jquery.com)
 * - jQuery cookie plugin (optional - http://plugins.jquery.com/files/jquery.cookie.js.txt)
 * - Gibberish-AES libraries (optional - https://github.com/mdp/gibberish-aes)
 *
 * OPTIONS:
 * - storage: HTML5 localStorage, sessionStorage and cookies supported
 * - aes:     Use AES encryption for local storage
 * - uuid:    Random RFC-4122 string used as AES password
 *
 * Author: Jason Gerfen
 * Email: jason.gerfen@gmail.com
 * Copyright: Jason Gerfen
 *
 * License: GPL
 *
 */

(function($){

 /* jQuery.handleStorage plugin */
 $.fn.handleStorage = function(method) {

  /* defined methods */
  var methods = {

   /* primary method of usage */
   init: function(options){

    /* default options */
    var defaults = {
     appid:   'jQuery.handleStorage', // Plugin name (unique ID for local, session or cookie storage id)
     storage: 'localStorage',         // Storage type localStorage || sessionStorage || cookie (cookie storage requires jQuery cookie plugin)
     aes:     false,                  // Use AES encryption? (true or false)
     uuid:    '',                     // Random RFC-4122 string used as AES password
     form:    $(this).attr('id')      // Place holder for form ID
    };

    /* merge specified options with defaults */
    var opts = $.extend({}, defaults, options);

    /* perform aes key setting/getting */
    $.handleKey(opts);

    /* try to get existing storage items */
    var orig = $.getStorage(opts);

    /* if they exist attempt to populate the form or wait for form submit to save data */
    if ((typeof orig==='object')&&($.size(orig)>0)){
     $.setForm(opts, orig);
    }
    $('#'+opts.form).live('submit', function(e){
     $.saveForm(opts);
    });
   },

   /* handle getting of individual form elements */
   get: function(opts){
    return ((opts.aes)&&(opts.key)) ? GibberishAES.dec($.getItem(opts.storage, opts.k), opts.key) : $.getItem(opts.storage, opts.k);
   },

   /* handle setting of individual form elements */
   set: function(opts){
    return ((opts.aes)&&(opts.key)) ? $.setItem(opts.storage, opts.k, GibberishAES.enc(opts.v, opts.key)) : $.setItem(opts.storage, opts.k, opts.v);
   }
  };

  /* associative object size */
  $.size = function(obj) {
   var n = 0;
   $.each(obj, function(k, v){
    if (obj.hasOwnProperty(k)) n++;
   });
   return n;
  };

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
  $.setCookie = function(k, v) {
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
    return ($.cookie(name)) ? $.cookie(name) : false;
   } else {
    return false;
   }
  }

  /* create array of storage items (decrypting if specified) */
  $.getStorage = function(options) {
   var ret = {}, x;
   $.each($('#'+options.form+' :text, :password, :file, input:hidden, input:checkbox:checked, input:radio:checked, textarea'), function(k, v){
    if (($.validateString(v.name)!==false)&&($.validateString($.getItem(options.storage, v.name))!==false)){
     ret[v.name] = ((options.aes)&&(options.key)&&(x!==false)) ? GibberishAES.dec($.getItem(options.storage, v.name), options.uuid) : $.getItem(options.storage, v.name);
    }
   });
   return ret;
  }

  /* if storage items exist attempt to populate form */
  $.setForm = function(options, arg){
   $.each(arg, function(a, b){
    if (($('#'+options.form+' input[name='+a+']').attr('name')===a)&&($.validateString(b)!==false)){
     $('#'+options.form+' input[name='+a+']').val(b);
    }
   });
  }

  /* save contents of form to specified storage mechanism (encrypting if specified) */
  $.saveForm = function(options) {
   $.each($('#'+options.form+' :text, :password, :file, input:hidden, input:checkbox:checked, input:radio:checked, textarea'), function(k, v){
    if (($.validateString(v.value)!==false)&&($.validateString(v.name)!==false)){
     ((options.aes)&&(options.key)) ? $.setItem(options.storage, v.name, GibberishAES.enc(v.value, options.uuid)) : $.setItem(options.storage, v.name, v.value);
    }
   });
  }

  /* validate string integrity */
  $.validateString = function(string) {
   return ((string===false)||(string.length===0)||(!string)||(string===null)||(string==='')||(typeof string==='undefined')) ? false : true;
  }

  /* validate localStorage/localSession functionality */
  $.validateStorage = function(type) {
   return ((window[type])&&(typeof window[type]=='object')) ? true : false;
  }

  /* generate a uuid (RFC-4122) */
  $.genUUID = function(len){
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
    options.key = ($.getItem(options.storage, 'uuid')) ? $.getItem(options.storage, 'uuid') : $.genUUID(null);
    $.setItem(options.storage, 'uuid', options.key);
   }
  }

  /* robot, do something */
  if (methods[method]){
   return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
  } else if (typeof method==='object' || ! method){
   return methods.init.apply(this, arguments);
  } else {
   $.error('Method '+method+' does not exist on '+opts.name);
  }

 };
})(jQuery);
