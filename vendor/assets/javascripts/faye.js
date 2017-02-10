var Faye=function(t){function e(i){if(n[i])return n[i].exports;var s=n[i]={exports:{},id:i,loaded:!1};return t[i].call(s.exports,s,s.exports,e),s.loaded=!0,s.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){"use strict";var i=n(1),s=n(2),r={VERSION:i.VERSION,Client:n(4),Scheduler:n(32)};s.wrapper=r,t.exports=r},function(t){t.exports={VERSION:"1.2.4",BAYEUX_VERSION:"1.0",ID_LENGTH:160,JSONP_CALLBACK:"jsonpcallback",CONNECTION_TYPES:["long-polling","cross-origin-long-polling","callback-polling","websocket","eventsource","in-process"],MANDATORY_CONNECTION_TYPES:["long-polling","callback-polling","in-process"]}},function(t,e,n){"use strict";var i=n(3),s={LOG_LEVELS:{fatal:4,error:3,warn:2,info:1,debug:0},writeLog:function(t,e){var n=s.logger||(s.wrapper||s).logger;if(n){var r=Array.prototype.slice.apply(t),o="[Faye",c=this.className,a=r.shift().replace(/\?/g,function(){try{return i(r.shift())}catch(t){return"[Object]"}});c&&(o+="."+c),o+="] ","function"==typeof n[e]?n[e](o+a):"function"==typeof n&&n(o+a)}}};for(var r in s.LOG_LEVELS)(function(t){s[t]=function(){this.writeLog(arguments,t)}})(r);t.exports=s},function(t){"use strict";t.exports=function(t){return JSON.stringify(t,function(t,e){return this[t]instanceof Array?this[t]:e})}},function(t,e,n){(function(e){"use strict";var i=n(5),s=n(7),r=(n(9),n(10)),o=n(11),c=n(12),a=n(1),h=n(8),u=n(13),l=n(14),f=n(2),d=n(15),p=n(17),_=n(19),v=n(33),g=n(34),m=n(35),y=n(36),E=s({className:"Client",UNCONNECTED:1,CONNECTING:2,CONNECTED:3,DISCONNECTED:4,HANDSHAKE:"handshake",RETRY:"retry",NONE:"none",CONNECTION_TIMEOUT:60,DEFAULT_ENDPOINT:"/bayeux",INTERVAL:0,initialize:function(t,n){this.info("New client created for ?",t),n=n||{},u(n,["interval","timeout","endpoints","proxy","retry","scheduler","websocketExtensions","tls","ca"]),this._channels=new p.Set,this._dispatcher=_.create(this,t||this.DEFAULT_ENDPOINT,n),this._messageId=0,this._state=this.UNCONNECTED,this._responseCallbacks={},this._advice={reconnect:this.RETRY,interval:1e3*(n.interval||this.INTERVAL),timeout:1e3*(n.timeout||this.CONNECTION_TIMEOUT)},this._dispatcher.timeout=this._advice.timeout/1e3,this._dispatcher.bind("message",this._receiveMessage,this),c.Event&&void 0!==e.onbeforeunload&&c.Event.on(e,"beforeunload",function(){o.indexOf(this._dispatcher._disabled,"autodisconnect")<0&&this.disconnect()},this)},addWebsocketExtension:function(t){return this._dispatcher.addWebsocketExtension(t)},disable:function(t){return this._dispatcher.disable(t)},setHeader:function(t,e){return this._dispatcher.setHeader(t,e)},handshake:function(t,n){if(this._advice.reconnect!==this.NONE&&this._state===this.UNCONNECTED){this._state=this.CONNECTING;var s=this;this.info("Initiating handshake with ?",r.stringify(this._dispatcher.endpoint)),this._dispatcher.selectTransport(a.MANDATORY_CONNECTION_TYPES),this._sendMessage({channel:p.HANDSHAKE,version:a.BAYEUX_VERSION,supportedConnectionTypes:this._dispatcher.getConnectionTypes()},{},function(r){r.successful?(this._state=this.CONNECTED,this._dispatcher.clientId=r.clientId,this._dispatcher.selectTransport(r.supportedConnectionTypes),this.info("Handshake successful: ?",this._dispatcher.clientId),this.subscribe(this._channels.getKeys(),!0),t&&i(function(){t.call(n)})):(this.info("Handshake unsuccessful"),e.setTimeout(function(){s.handshake(t,n)},1e3*this._dispatcher.retry),this._state=this.UNCONNECTED)},this)}},connect:function(t,e){if(this._advice.reconnect!==this.NONE&&this._state!==this.DISCONNECTED){if(this._state===this.UNCONNECTED)return this.handshake(function(){this.connect(t,e)},this);this.callback(t,e),this._state===this.CONNECTED&&(this.info("Calling deferred actions for ?",this._dispatcher.clientId),this.setDeferredStatus("succeeded"),this.setDeferredStatus("unknown"),this._connectRequest||(this._connectRequest=!0,this.info("Initiating connection for ?",this._dispatcher.clientId),this._sendMessage({channel:p.CONNECT,clientId:this._dispatcher.clientId,connectionType:this._dispatcher.connectionType},{},this._cycleConnection,this)))}},disconnect:function(){if(this._state===this.CONNECTED){this._state=this.DISCONNECTED,this.info("Disconnecting ?",this._dispatcher.clientId);var t=new m;return this._sendMessage({channel:p.DISCONNECT,clientId:this._dispatcher.clientId},{},function(e){e.successful?(this._dispatcher.close(),t.setDeferredStatus("succeeded")):t.setDeferredStatus("failed",v.parse(e.error))},this),this.info("Clearing channel listeners for ?",this._dispatcher.clientId),this._channels=new p.Set,t}},subscribe:function(t,e,n){if(t instanceof Array)return o.map(t,function(t){return this.subscribe(t,e,n)},this);var i=new y(this,t,e,n),s=e===!0,r=this._channels.hasSubscription(t);return r&&!s?(this._channels.subscribe([t],i),i.setDeferredStatus("succeeded"),i):(this.connect(function(){this.info("Client ? attempting to subscribe to ?",this._dispatcher.clientId,t),s||this._channels.subscribe([t],i),this._sendMessage({channel:p.SUBSCRIBE,clientId:this._dispatcher.clientId,subscription:t},{},function(e){if(!e.successful)return i.setDeferredStatus("failed",v.parse(e.error)),this._channels.unsubscribe(t,i);var n=[].concat(e.subscription);this.info("Subscription acknowledged for ? to ?",this._dispatcher.clientId,n),i.setDeferredStatus("succeeded")},this)},this),i)},unsubscribe:function(t,e){if(t instanceof Array)return o.map(t,function(t){return this.unsubscribe(t,e)},this);var n=this._channels.unsubscribe(t,e);n&&this.connect(function(){this.info("Client ? attempting to unsubscribe from ?",this._dispatcher.clientId,t),this._sendMessage({channel:p.UNSUBSCRIBE,clientId:this._dispatcher.clientId,subscription:t},{},function(t){if(t.successful){var e=[].concat(t.subscription);this.info("Unsubscription acknowledged for ? from ?",this._dispatcher.clientId,e)}},this)},this)},publish:function(t,e,n){u(n||{},["attempts","deadline"]);var i=new m;return this.connect(function(){this.info("Client ? queueing published message to ?: ?",this._dispatcher.clientId,t,e),this._sendMessage({channel:t,data:e,clientId:this._dispatcher.clientId},n,function(t){t.successful?i.setDeferredStatus("succeeded"):i.setDeferredStatus("failed",v.parse(t.error))},this)},this),i},_sendMessage:function(t,e,n,i){t.id=this._generateMessageId();var s=this._advice.timeout?1.2*this._advice.timeout/1e3:1.2*this._dispatcher.retry;this.pipeThroughExtensions("outgoing",t,null,function(t){t&&(n&&(this._responseCallbacks[t.id]=[n,i]),this._dispatcher.sendMessage(t,s,e||{}))},this)},_generateMessageId:function(){return this._messageId+=1,this._messageId>=Math.pow(2,32)&&(this._messageId=0),this._messageId.toString(36)},_receiveMessage:function(t){var e,n=t.id;void 0!==t.successful&&(e=this._responseCallbacks[n],delete this._responseCallbacks[n]),this.pipeThroughExtensions("incoming",t,null,function(t){t&&(t.advice&&this._handleAdvice(t.advice),this._deliverMessage(t),e&&e[0].call(e[1],t))},this)},_handleAdvice:function(t){h(this._advice,t),this._dispatcher.timeout=this._advice.timeout/1e3,this._advice.reconnect===this.HANDSHAKE&&this._state!==this.DISCONNECTED&&(this._state=this.UNCONNECTED,this._dispatcher.clientId=null,this._cycleConnection())},_deliverMessage:function(t){t.channel&&void 0!==t.data&&(this.info("Client ? calling listeners for ? with ?",this._dispatcher.clientId,t.channel,t.data),this._channels.distributeMessage(t))},_cycleConnection:function(){this._connectRequest&&(this._connectRequest=null,this.info("Closed connection for ?",this._dispatcher.clientId));var t=this;e.setTimeout(function(){t.connect()},this._advice.interval)}});h(E.prototype,l),h(E.prototype,d),h(E.prototype,f),h(E.prototype,g),t.exports=E}).call(e,function(){return this}())},function(t,e,n){"use strict";function i(){if(a.length)throw a.shift()}function s(t){var e;e=c.length?c.pop():new r,e.task=t,o(e)}function r(){this.task=null}var o=n(6),c=[],a=[],h=o.makeRequestCallFromTimer(i);t.exports=s,r.prototype.call=function(){try{this.task.call()}catch(t){s.onerror?s.onerror(t):(a.push(t),h())}finally{this.task=null,c[c.length]=this}}},function(t,e){(function(e){"use strict";function n(t){c.length||(o(),a=!0),c[c.length]=t}function i(){for(;h<c.length;){var t=h;if(h+=1,c[t].call(),h>u){for(var e=0,n=c.length-h;n>e;e++)c[e]=c[e+h];c.length-=h,h=0}}c.length=0,h=0,a=!1}function s(t){var e=1,n=new f(t),i=document.createTextNode("");return n.observe(i,{characterData:!0}),function(){e=-e,i.data=e}}function r(t){return function(){function e(){clearTimeout(n),clearInterval(i),t()}var n=setTimeout(e,0),i=setInterval(e,50)}}t.exports=n;var o,c=[],a=!1,h=0,u=1024,l="undefined"!=typeof e?e:self,f=l.MutationObserver||l.WebKitMutationObserver;o="function"==typeof f?s(i):r(i),n.requestFlush=o,n.makeRequestCallFromTimer=r}).call(e,function(){return this}())},function(t,e,n){"use strict";var i=n(8);t.exports=function(t,e){"function"!=typeof t&&(e=t,t=Object);var n=function(){return this.initialize?this.initialize.apply(this,arguments)||this:this},s=function(){};return s.prototype=t.prototype,n.prototype=new s,i(n.prototype,e),n}},function(t){"use strict";t.exports=function(t,e,n){if(!e)return t;for(var i in e)e.hasOwnProperty(i)&&(t.hasOwnProperty(i)&&n===!1||t[i]!==e[i]&&(t[i]=e[i]));return t}},function(t,e,n){"use strict";var i=n(5),s=0,r=1,o=2,c=function(t){return t},a=function(t){throw t},h=function(t){if(this._state=s,this._onFulfilled=[],this._onRejected=[],"function"==typeof t){var e=this;t(function(t){p(e,t)},function(t){v(e,t)})}};h.prototype.then=function(t,e){var n=new h;return u(this,t,n),l(this,e,n),n},h.prototype["catch"]=function(t){return this.then(null,t)};var u=function(t,e,n){"function"!=typeof e&&(e=c);var i=function(t){f(e,t,n)};t._state===s?t._onFulfilled.push(i):t._state===r&&i(t._value)},l=function(t,e,n){"function"!=typeof e&&(e=a);var i=function(t){f(e,t,n)};t._state===s?t._onRejected.push(i):t._state===o&&i(t._reason)},f=function(t,e,n){i(function(){d(t,e,n)})},d=function(t,e,n){var i;try{i=t(e)}catch(s){return v(n,s)}i===n?v(n,new TypeError("Recursive promise chain detected")):p(n,i)},p=function(t,e){var n,i,s=!1;try{if(n=typeof e,i=null!==e&&("function"===n||"object"===n)&&e.then,"function"!=typeof i)return _(t,e);i.call(e,function(e){s^(s=!0)&&p(t,e)},function(e){s^(s=!0)&&v(t,e)})}catch(r){if(!(s^(s=!0)))return;v(t,r)}},_=function(t,e){if(t._state===s){t._state=r,t._value=e,t._onRejected=[];for(var n,i=t._onFulfilled;n=i.shift();)n(e)}},v=function(t,e){if(t._state===s){t._state=o,t._reason=e,t._onFulfilled=[];for(var n,i=t._onRejected;n=i.shift();)n(e)}};h.resolve=function(t){return new h(function(e){e(t)})},h.reject=function(t){return new h(function(e,n){n(t)})},h.all=function(t){return new h(function(e,n){var i,s=[],r=t.length;if(0===r)return e(s);for(i=0;r>i;i++)(function(t,i){h.resolve(t).then(function(t){s[i]=t,0===--r&&e(s)},n)})(t[i],i)})},h.race=function(t){return new h(function(e,n){for(var i=0,s=t.length;s>i;i++)h.resolve(t[i]).then(e,n)})},h.deferred=h.pending=function(){var t={};return t.promise=new h(function(e,n){t.resolve=e,t.reject=n}),t},t.exports=h},function(t){"use strict";t.exports={isURI:function(t){return t&&t.protocol&&t.host&&t.path},isSameOrigin:function(t){return t.protocol===location.protocol&&t.hostname===location.hostname&&t.port===location.port},parse:function(t){if("string"!=typeof t)return t;var e,n,i,s,r,o,c={},a=function(e,n){t=t.replace(n,function(t){return c[e]=t,""}),c[e]=c[e]||""};for(a("protocol",/^[a-z]+\:/i),a("host",/^\/\/[^\/\?#]+/),/^\//.test(t)||c.host||(t=location.pathname.replace(/[^\/]*$/,"")+t),a("pathname",/^[^\?#]*/),a("search",/^\?[^#]*/),a("hash",/^#.*/),c.protocol=c.protocol||location.protocol,c.host?(c.host=c.host.substr(2),e=c.host.split(":"),c.hostname=e[0],c.port=e[1]||""):(c.host=location.host,c.hostname=location.hostname,c.port=location.port),c.pathname=c.pathname||"/",c.path=c.pathname+c.search,n=c.search.replace(/^\?/,""),i=n?n.split("&"):[],o={},s=0,r=i.length;r>s;s++)e=i[s].split("="),o[decodeURIComponent(e[0]||"")]=decodeURIComponent(e[1]||"");return c.query=o,c.href=this.stringify(c),c},stringify:function(t){var e=t.protocol+"//"+t.hostname;return t.port&&(e+=":"+t.port),e+=t.pathname+this.queryString(t.query)+(t.hash||"")},queryString:function(t){var e=[];for(var n in t)t.hasOwnProperty(n)&&e.push(encodeURIComponent(n)+"="+encodeURIComponent(t[n]));return 0===e.length?"":"?"+e.join("&")}}},function(t){"use strict";t.exports={commonElement:function(t,e){for(var n=0,i=t.length;i>n;n++)if(-1!==this.indexOf(e,t[n]))return t[n];return null},indexOf:function(t,e){if(t.indexOf)return t.indexOf(e);for(var n=0,i=t.length;i>n;n++)if(t[n]===e)return n;return-1},map:function(t,e,n){if(t.map)return t.map(e,n);var i=[];if(t instanceof Array)for(var s=0,r=t.length;r>s;s++)i.push(e.call(n||null,t[s],s));else for(var o in t)t.hasOwnProperty(o)&&i.push(e.call(n||null,o,t[o]));return i},filter:function(t,e,n){if(t.filter)return t.filter(e,n);for(var i=[],s=0,r=t.length;r>s;s++)e.call(n||null,t[s],s)&&i.push(t[s]);return i},asyncEach:function(t,e,n,i){var s=t.length,r=-1,o=0,c=!1,a=function(){return o-=1,r+=1,r===s?n&&n.call(i):void e(t[r],u)},h=function(){if(!c){for(c=!0;o>0;)a();c=!1}},u=function(){o+=1,h()};u()}}},function(t,e){(function(e){"use strict";var n={_registry:[],on:function(t,e,n,i){var s=function(){n.call(i)};t.addEventListener?t.addEventListener(e,s,!1):t.attachEvent("on"+e,s),this._registry.push({_element:t,_type:e,_callback:n,_context:i,_handler:s})},detach:function(t,e,n,i){for(var s,r=this._registry.length;r--;)s=this._registry[r],t&&t!==s._element||e&&e!==s._type||n&&n!==s._callback||i&&i!==s._context||(s._element.removeEventListener?s._element.removeEventListener(s._type,s._handler,!1):s._element.detachEvent("on"+s._type,s._handler),this._registry.splice(r,1),s=null)}};void 0!==e.onunload&&n.on(e,"unload",n.detach,n),t.exports={Event:n}}).call(e,function(){return this}())},function(t,e,n){"use strict";var i=n(11);t.exports=function(t,e){for(var n in t)if(i.indexOf(e,n)<0)throw new Error("Unrecognized option: "+n)}},function(t,e,n){(function(e){"use strict";var i=n(9);t.exports={then:function(t,e){var n=this;return this._promise||(this._promise=new i(function(t,e){n._resolve=t,n._reject=e})),0===arguments.length?this._promise:this._promise.then(t,e)},callback:function(t,e){return this.then(function(n){t.call(e,n)})},errback:function(t,e){return this.then(null,function(n){t.call(e,n)})},timeout:function(t,n){this.then();var i=this;this._timer=e.setTimeout(function(){i._reject(n)},1e3*t)},setDeferredStatus:function(t,n){this._timer&&e.clearTimeout(this._timer),this.then(),"succeeded"===t?this._resolve(n):"failed"===t?this._reject(n):delete this._promise}}}).call(e,function(){return this}())},function(t,e,n){"use strict";var i=n(8),s=n(16),r={countListeners:function(t){return this.listeners(t).length},bind:function(t,e,n){var i=Array.prototype.slice,s=function(){e.apply(n,i.call(arguments))};return this._listeners=this._listeners||[],this._listeners.push([t,e,n,s]),this.on(t,s)},unbind:function(t,e,n){this._listeners=this._listeners||[];for(var i,s=this._listeners.length;s--;)i=this._listeners[s],i[0]===t&&(!e||i[1]===e&&i[2]===n)&&(this._listeners.splice(s,1),this.removeListener(t,i[3]))}};i(r,s.prototype),r.trigger=r.emit,t.exports=r},function(t){function e(t,e){if(t.indexOf)return t.indexOf(e);for(var n=0;n<t.length;n++)if(e===t[n])return n;return-1}function n(){}var i="function"==typeof Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)};t.exports=n,n.prototype.emit=function(t){if("error"===t&&(!this._events||!this._events.error||i(this._events.error)&&!this._events.error.length))throw arguments[1]instanceof Error?arguments[1]:new Error("Uncaught, unspecified 'error' event.");if(!this._events)return!1;var e=this._events[t];if(!e)return!1;if("function"==typeof e){switch(arguments.length){case 1:e.call(this);break;case 2:e.call(this,arguments[1]);break;case 3:e.call(this,arguments[1],arguments[2]);break;default:var n=Array.prototype.slice.call(arguments,1);e.apply(this,n)}return!0}if(i(e)){for(var n=Array.prototype.slice.call(arguments,1),s=e.slice(),r=0,o=s.length;o>r;r++)s[r].apply(this,n);return!0}return!1},n.prototype.addListener=function(t,e){if("function"!=typeof e)throw new Error("addListener only takes instances of Function");return this._events||(this._events={}),this.emit("newListener",t,e),this._events[t]?i(this._events[t])?this._events[t].push(e):this._events[t]=[this._events[t],e]:this._events[t]=e,this},n.prototype.on=n.prototype.addListener,n.prototype.once=function(t,e){var n=this;return n.on(t,function i(){n.removeListener(t,i),e.apply(this,arguments)}),this},n.prototype.removeListener=function(t,n){if("function"!=typeof n)throw new Error("removeListener only takes instances of Function");if(!this._events||!this._events[t])return this;var s=this._events[t];if(i(s)){var r=e(s,n);if(0>r)return this;s.splice(r,1),0==s.length&&delete this._events[t]}else this._events[t]===n&&delete this._events[t];return this},n.prototype.removeAllListeners=function(t){return 0===arguments.length?(this._events={},this):(t&&this._events&&this._events[t]&&(this._events[t]=null),this)},n.prototype.listeners=function(t){return this._events||(this._events={}),this._events[t]||(this._events[t]=[]),i(this._events[t])||(this._events[t]=[this._events[t]]),this._events[t]}},function(t,e,n){"use strict";var i=n(7),s=n(8),r=n(15),o=n(18),c=i({initialize:function(t){this.id=this.name=t},push:function(t){this.trigger("message",t)},isUnused:function(){return 0===this.countListeners("message")}});s(c.prototype,r),s(c,{HANDSHAKE:"/meta/handshake",CONNECT:"/meta/connect",SUBSCRIBE:"/meta/subscribe",UNSUBSCRIBE:"/meta/unsubscribe",DISCONNECT:"/meta/disconnect",META:"meta",SERVICE:"service",expand:function(t){var e=this.parse(t),n=["/**",t],i=e.slice();i[i.length-1]="*",n.push(this.unparse(i));for(var s=1,r=e.length;r>s;s++)i=e.slice(0,s),i.push("**"),n.push(this.unparse(i));return n},isValid:function(t){return o.CHANNEL_NAME.test(t)||o.CHANNEL_PATTERN.test(t)},parse:function(t){return this.isValid(t)?t.split("/").slice(1):null},unparse:function(t){return"/"+t.join("/")},isMeta:function(t){var e=this.parse(t);return e?e[0]===this.META:null},isService:function(t){var e=this.parse(t);return e?e[0]===this.SERVICE:null},isSubscribable:function(t){return this.isValid(t)?!this.isMeta(t)&&!this.isService(t):null},Set:i({initialize:function(){this._channels={}},getKeys:function(){var t=[];for(var e in this._channels)t.push(e);return t},remove:function(t){delete this._channels[t]},hasSubscription:function(t){return this._channels.hasOwnProperty(t)},subscribe:function(t,e){for(var n,i=0,s=t.length;s>i;i++){n=t[i];var r=this._channels[n]=this._channels[n]||new c(n);r.bind("message",e)}},unsubscribe:function(t,e){var n=this._channels[t];return n?(n.unbind("message",e),n.isUnused()?(this.remove(t),!0):!1):!1},distributeMessage:function(t){for(var e=c.expand(t.channel),n=0,i=e.length;i>n;n++){var s=this._channels[e[n]];s&&s.trigger("message",t)}}})}),t.exports=c},function(t){"use strict";t.exports={CHANNEL_NAME:/^\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*$/,CHANNEL_PATTERN:/^(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*\/\*{1,2}$/,ERROR:/^([0-9][0-9][0-9]:(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*(,(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*)*:(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*|[0-9][0-9][0-9]::(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*)$/,VERSION:/^([0-9])+(\.(([a-z]|[A-Z])|[0-9])(((([a-z]|[A-Z])|[0-9])|\-|\_))*)*$/}},function(t,e,n){(function(e){"use strict";var i=n(7),s=n(10),r=n(20),o=n(8),c=n(2),a=n(15),h=n(21),u=n(32),l=i({className:"Dispatcher",MAX_REQUEST_SIZE:2048,DEFAULT_RETRY:5,UP:1,DOWN:2,initialize:function(t,e,n){this._client=t,this.endpoint=s.parse(e),this._alternates=n.endpoints||{},this.cookies=r.CookieJar&&new r.CookieJar,this._disabled=[],this._envelopes={},this.headers={},this.retry=n.retry||this.DEFAULT_RETRY,this._scheduler=n.scheduler||u,this._state=0,this.transports={},this.wsExtensions=[],this.proxy=n.proxy||{},"string"==typeof this._proxy&&(this._proxy={origin:this._proxy});var i=n.websocketExtensions;if(i){i=[].concat(i);for(var o=0,c=i.length;c>o;o++)this.addWebsocketExtension(i[o])}this.tls=n.tls||{},this.tls.ca=this.tls.ca||n.ca;for(var a in this._alternates)this._alternates[a]=s.parse(this._alternates[a]);this.maxRequestSize=this.MAX_REQUEST_SIZE},endpointFor:function(t){return this._alternates[t]||this.endpoint},addWebsocketExtension:function(t){this.wsExtensions.push(t)},disable:function(t){this._disabled.push(t)},setHeader:function(t,e){this.headers[t]=e},close:function(){var t=this._transport;delete this._transport,t&&t.close()},getConnectionTypes:function(){return h.getConnectionTypes()},selectTransport:function(t){h.get(this,t,this._disabled,function(t){this.debug("Selected ? transport for ?",t.connectionType,s.stringify(t.endpoint)),t!==this._transport&&(this._transport&&this._transport.close(),this._transport=t,this.connectionType=t.connectionType)},this)},sendMessage:function(t,e,n){n=n||{};var i,s=t.id,r=n.attempts,o=n.deadline&&(new Date).getTime()+1e3*n.deadline,c=this._envelopes[s];c||(i=new this._scheduler(t,{timeout:e,interval:this.retry,attempts:r,deadline:o}),c=this._envelopes[s]={message:t,scheduler:i}),this._sendEnvelope(c)},_sendEnvelope:function(t){if(this._transport&&!t.request&&!t.timer){var n=t.message,i=t.scheduler,s=this;if(!i.isDeliverable())return i.abort(),void delete this._envelopes[n.id];t.timer=e.setTimeout(function(){s.handleError(n)},1e3*i.getTimeout()),i.send(),t.request=this._transport.sendMessage(n)}},handleResponse:function(t){var n=this._envelopes[t.id];void 0!==t.successful&&n&&(n.scheduler.succeed(),delete this._envelopes[t.id],e.clearTimeout(n.timer)),this.trigger("message",t),this._state!==this.UP&&(this._state=this.UP,this._client.trigger("transport:up"))},handleError:function(t,n){var i=this._envelopes[t.id],s=i&&i.request,r=this;if(s){s.then(function(t){t&&t.abort&&t.abort()});var o=i.scheduler;o.fail(),e.clearTimeout(i.timer),i.request=i.timer=null,n?this._sendEnvelope(i):i.timer=e.setTimeout(function(){i.timer=null,r._sendEnvelope(i)},1e3*o.getInterval()),this._state!==this.DOWN&&(this._state=this.DOWN,this._client.trigger("transport:down"))}}});l.create=function(t,e,n){return new l(t,e,n)},o(l.prototype,a),o(l.prototype,c),t.exports=l}).call(e,function(){return this}())},function(t){"use strict";t.exports={}},function(t,e,n){"use strict";var i=n(22);i.register("websocket",n(24)),i.register("eventsource",n(28)),i.register("long-polling",n(29)),i.register("cross-origin-long-polling",n(30)),i.register("callback-polling",n(31)),t.exports=i},function(t,e,n){"use strict";var i=n(7),s=n(20).Cookie,r=n(9),o=n(10),c=n(11),a=n(8),h=n(2),u=n(23),l=n(17),f=a(i({className:"Transport",DEFAULT_PORTS:{"http:":80,"https:":443,"ws:":80,"wss:":443},MAX_DELAY:0,batching:!0,initialize:function(t,e){this._dispatcher=t,this.endpoint=e,this._outbox=[],this._proxy=a({},this._dispatcher.proxy),this._proxy.origin||(this._proxy.origin=this._findProxy())},close:function(){},encode:function(){return""},sendMessage:function(t){return this.debug("Client ? sending message to ?: ?",this._dispatcher.clientId,o.stringify(this.endpoint),t),this.batching?(this._outbox.push(t),this._flushLargeBatch(),t.channel===l.HANDSHAKE?this._publish(.01):(t.channel===l.CONNECT&&(this._connectMessage=t),this._publish(this.MAX_DELAY))):r.resolve(this.request([t]))},_makePromise:function(){var t=this;this._requestPromise=this._requestPromise||new r(function(e){t._resolvePromise=e})},_publish:function(t){return this._makePromise(),this.addTimeout("publish",t,function(){this._flush(),delete this._requestPromise},this),this._requestPromise},_flush:function(){this.removeTimeout("publish"),this._outbox.length>1&&this._connectMessage&&(this._connectMessage.advice={timeout:0}),this._resolvePromise(this.request(this._outbox)),this._connectMessage=null,this._outbox=[]},_flushLargeBatch:function(){var t=this.encode(this._outbox);if(!(t.length<this._dispatcher.maxRequestSize)){var e=this._outbox.pop();this._makePromise(),this._flush(),e&&this._outbox.push(e)}},_receive:function(t){if(t){t=[].concat(t),this.debug("Client ? received from ? via ?: ?",this._dispatcher.clientId,o.stringify(this.endpoint),this.connectionType,t);for(var e=0,n=t.length;n>e;e++)this._dispatcher.handleResponse(t[e])}},_handleError:function(t){t=[].concat(t),this.debug("Client ? failed to send to ? via ?: ?",this._dispatcher.clientId,o.stringify(this.endpoint),this.connectionType,t);for(var e=0,n=t.length;n>e;e++)this._dispatcher.handleError(t[e])},_getCookies:function(){var t=this._dispatcher.cookies,e=o.stringify(this.endpoint);return t?c.map(t.getCookiesSync(e),function(t){return t.cookieString()}).join("; "):""},_storeCookies:function(t){var e,n=this._dispatcher.cookies,i=o.stringify(this.endpoint);if(t&&n){t=[].concat(t);for(var r=0,c=t.length;c>r;r++)e=s.parse(t[r]),n.setCookieSync(e,i)}},_findProxy:function(){if("undefined"==typeof process)return void 0;var t=this.endpoint.protocol;if(!t)return void 0;var e,n,i=t.replace(/:$/,"").toLowerCase()+"_proxy",s=i.toUpperCase(),r=process.env;return"http_proxy"===i&&r.REQUEST_METHOD?(e=Object.keys(r).filter(function(t){return/^http_proxy$/i.test(t)}),1===e.length?e[0]===i&&void 0===r[s]&&(n=r[i]):e.length>1&&(n=r[i]),n=n||r["CGI_"+s]):(n=r[i]||r[s],n&&!r[i]&&console.warn("The environment variable "+s+" is discouraged. Use "+i+".")),n}}),{get:function(t,e,n,i,s){var r=t.endpoint;c.asyncEach(this._transports,function(r,o){var a=r[0],h=r[1],u=t.endpointFor(a);return c.indexOf(n,a)>=0?o():c.indexOf(e,a)<0?(h.isUsable(t,u,function(){}),o()):void h.isUsable(t,u,function(e){if(!e)return o();var n=h.hasOwnProperty("create")?h.create(t,u):new h(t,u);i.call(s,n)})},function(){throw new Error("Could not find a usable connection type for "+o.stringify(r))})},register:function(t,e){this._transports.push([t,e]),e.prototype.connectionType=t},getConnectionTypes:function(){return c.map(this._transports,function(t){return t[0]})},_transports:[]});a(f.prototype,h),a(f.prototype,u),t.exports=f},function(t,e){(function(e){"use strict";t.exports={addTimeout:function(t,n,i,s){if(this._timeouts=this._timeouts||{},!this._timeouts.hasOwnProperty(t)){var r=this;this._timeouts[t]=e.setTimeout(function(){delete r._timeouts[t],i.call(s)},1e3*n)}},removeTimeout:function(t){this._timeouts=this._timeouts||{};var n=this._timeouts[t];n&&(e.clearTimeout(n),delete this._timeouts[t])},removeAllTimeouts:function(){this._timeouts=this._timeouts||{};for(var t in this._timeouts)this.removeTimeout(t)}}}).call(e,function(){return this}())},function(t,e,n){(function(e){"use strict";var i=n(7),s=n(9),r=n(25),o=n(10),c=n(12),a=n(26),h=n(8),u=n(3),l=n(27),f=n(14),d=n(22),p=h(i(d,{UNCONNECTED:1,CONNECTING:2,CONNECTED:3,batching:!1,isUsable:function(t,e){this.callback(function(){t.call(e,!0)}),this.errback(function(){t.call(e,!1)}),this.connect()},request:function(t){this._pending=this._pending||new r;for(var e=0,n=t.length;n>e;e++)this._pending.add(t[e]);var i=this,o=new s(function(e){i.callback(function(n){n&&1===n.readyState&&(n.send(u(t)),e(n))}),i.connect()});return{abort:function(){o.then(function(t){t.close()})}}},connect:function(){if(!p._unloaded&&(this._state=this._state||this.UNCONNECTED,this._state===this.UNCONNECTED)){this._state=this.CONNECTING;var t=this._createSocket();if(!t)return this.setDeferredStatus("failed");var e=this;t.onopen=function(){t.headers&&e._storeCookies(t.headers["set-cookie"]),e._socket=t,e._state=e.CONNECTED,e._everConnected=!0,e._ping(),e.setDeferredStatus("succeeded",t)};var n=!1;t.onclose=t.onerror=function(){if(!n){n=!0;var i=e._state===e.CONNECTED;t.onopen=t.onclose=t.onerror=t.onmessage=null,delete e._socket,e._state=e.UNCONNECTED,e.removeTimeout("ping");var s=e._pending?e._pending.toArray():[];delete e._pending,i||e._everConnected?(e.setDeferredStatus("unknown"),e._handleError(s,i)):e.setDeferredStatus("failed")}},t.onmessage=function(t){var n;try{n=JSON.parse(t.data)}catch(i){}if(n){n=[].concat(n);for(var s=0,r=n.length;r>s;s++)void 0!==n[s].successful&&e._pending.remove(n[s]);e._receive(n)}}}},close:function(){this._socket&&this._socket.close()},_createSocket:function(){var t=p.getSocketUrl(this.endpoint),e=this._dispatcher.headers,n=this._dispatcher.wsExtensions,i=this._getCookies(),s=this._dispatcher.tls,r={extensions:n,headers:e,proxy:this._proxy,tls:s};return""!==i&&(r.headers.Cookie=i),l.create(t,[],r)},_ping:function(){this._socket&&1===this._socket.readyState&&(this._socket.send("[]"),this.addTimeout("ping",this._dispatcher.timeout/2,this._ping,this))}}),{PROTOCOLS:{"http:":"ws:","https:":"wss:"},create:function(t,e){var n=t.transports.websocket=t.transports.websocket||{};return n[e.href]=n[e.href]||new this(t,e),n[e.href]},getSocketUrl:function(t){return t=a(t),t.protocol=this.PROTOCOLS[t.protocol],o.stringify(t)},isUsable:function(t,e,n,i){this.create(t,e).isUsable(n,i)}});h(p.prototype,f),c.Event&&void 0!==e.onbeforeunload&&c.Event.on(e,"beforeunload",function(){p._unloaded=!0}),t.exports=p}).call(e,function(){return this}())},function(t,e,n){"use strict";var i=n(7);t.exports=i({initialize:function(){this._index={}},add:function(t){var e=void 0!==t.id?t.id:t;return this._index.hasOwnProperty(e)?!1:(this._index[e]=t,!0)},forEach:function(t,e){for(var n in this._index)this._index.hasOwnProperty(n)&&t.call(e,this._index[n])},isEmpty:function(){for(var t in this._index)if(this._index.hasOwnProperty(t))return!1;return!0},member:function(t){for(var e in this._index)if(this._index[e]===t)return!0;return!1},remove:function(t){var e=void 0!==t.id?t.id:t,n=this._index[e];return delete this._index[e],n},toArray:function(){var t=[];return this.forEach(function(e){t.push(e)}),t}})},function(t){"use strict";var e=function(t){var n,i,s;if(t instanceof Array){for(n=[],i=t.length;i--;)n[i]=e(t[i]);return n}if("object"==typeof t){n=null===t?null:{};for(s in t)n[s]=e(t[s]);return n}return t};t.exports=e},function(t,e){(function(e){"use strict";var n=e.MozWebSocket||e.WebSocket;t.exports={create:function(t){return"function"!=typeof n?null:new n(t)}}}).call(e,function(){return this}())},function(t,e,n){(function(e){"use strict";var i=n(7),s=n(10),r=n(26),o=n(8),c=n(14),a=n(22),h=n(29),u=o(i(a,{initialize:function(t,n){if(a.prototype.initialize.call(this,t,n),!e.EventSource)return this.setDeferredStatus("failed");this._xhr=new h(t,n),n=r(n),n.pathname+="/"+t.clientId;var i=new e.EventSource(s.stringify(n)),o=this;i.onopen=function(){o._everConnected=!0,o.setDeferredStatus("succeeded")},i.onerror=function(){o._everConnected?o._handleError([]):(o.setDeferredStatus("failed"),i.close())},i.onmessage=function(t){var e;try{e=JSON.parse(t.data)}catch(n){}e?o._receive(e):o._handleError([])},this._socket=i},close:function(){this._socket&&(this._socket.onopen=this._socket.onerror=this._socket.onmessage=null,this._socket.close(),delete this._socket)},isUsable:function(t,e){this.callback(function(){t.call(e,!0)}),this.errback(function(){t.call(e,!1)})},encode:function(t){return this._xhr.encode(t)},request:function(t){return this._xhr.request(t)}}),{isUsable:function(t,e,n,i){var s=t.clientId;return s?void h.isUsable(t,e,function(s){return s?void this.create(t,e).isUsable(n,i):n.call(i,!1)},this):n.call(i,!1)},create:function(t,e){var n=t.transports.eventsource=t.transports.eventsource||{},i=t.clientId,o=r(e);return o.pathname+="/"+(i||""),o=s.stringify(o),n[o]=n[o]||new this(t,e),n[o]}});o(u.prototype,c),t.exports=u}).call(e,function(){return this}())},function(t,e,n){(function(e){"use strict";var i=n(7),s=n(10),r=n(12),o=n(8),c=n(3),a=n(22),h=o(i(a,{encode:function(t){return c(t)},request:function(t){var n,i=this.endpoint.href,s=this;if(e.XMLHttpRequest)n=new XMLHttpRequest;
else{if(!e.ActiveXObject)return this._handleError(t);n=new ActiveXObject("Microsoft.XMLHTTP")}n.open("POST",i,!0),n.setRequestHeader("Content-Type","application/json"),n.setRequestHeader("Pragma","no-cache"),n.setRequestHeader("X-Requested-With","XMLHttpRequest");var o=this._dispatcher.headers;for(var c in o)o.hasOwnProperty(c)&&n.setRequestHeader(c,o[c]);var a=function(){n.abort()};return void 0!==e.onbeforeunload&&r.Event.on(e,"beforeunload",a),n.onreadystatechange=function(){if(n&&4===n.readyState){var i=null,o=n.status,c=n.responseText,h=o>=200&&300>o||304===o||1223===o;if(void 0!==e.onbeforeunload&&r.Event.detach(e,"beforeunload",a),n.onreadystatechange=function(){},n=null,!h)return s._handleError(t);try{i=JSON.parse(c)}catch(u){}i?s._receive(i):s._handleError(t)}},n.send(this.encode(t)),n}}),{isUsable:function(t,e,n,i){var r="ReactNative"===navigator.product||s.isSameOrigin(e);n.call(i,r)}});t.exports=h}).call(e,function(){return this}())},function(t,e,n){(function(e){"use strict";var i=n(7),s=n(25),r=n(10),o=n(8),c=n(3),a=n(22),h=o(i(a,{encode:function(t){return"message="+encodeURIComponent(c(t))},request:function(t){var n,i=e.XDomainRequest?XDomainRequest:XMLHttpRequest,s=new i,o=++h._id,c=this._dispatcher.headers,a=this;if(s.open("POST",r.stringify(this.endpoint),!0),s.setRequestHeader){s.setRequestHeader("Pragma","no-cache");for(n in c)c.hasOwnProperty(n)&&s.setRequestHeader(n,c[n])}var u=function(){return s?(h._pending.remove(o),s.onload=s.onerror=s.ontimeout=s.onprogress=null,void(s=null)):!1};return s.onload=function(){var e;try{e=JSON.parse(s.responseText)}catch(n){}u(),e?a._receive(e):a._handleError(t)},s.onerror=s.ontimeout=function(){u(),a._handleError(t)},s.onprogress=function(){},i===e.XDomainRequest&&h._pending.add({id:o,xhr:s}),s.send(this.encode(t)),s}}),{_id:0,_pending:new s,isUsable:function(t,n,i,s){if(r.isSameOrigin(n))return i.call(s,!1);if(e.XDomainRequest)return i.call(s,n.protocol===location.protocol);if(e.XMLHttpRequest){var o=new XMLHttpRequest;return i.call(s,void 0!==o.withCredentials)}return i.call(s,!1)}});t.exports=h}).call(e,function(){return this}())},function(t,e,n){(function(e){"use strict";var i=n(7),s=n(10),r=n(26),o=n(8),c=n(3),a=n(22),h=o(i(a,{encode:function(t){var e=r(this.endpoint);return e.query.message=c(t),e.query.jsonp="__jsonp"+h._cbCount+"__",s.stringify(e)},request:function(t){var n=document.getElementsByTagName("head")[0],i=document.createElement("script"),o=h.getCallbackName(),a=r(this.endpoint),u=this;a.query.message=c(t),a.query.jsonp=o;var l=function(){if(!e[o])return!1;e[o]=void 0;try{delete e[o]}catch(t){}i.parentNode.removeChild(i)};return e[o]=function(t){l(),u._receive(t)},i.type="text/javascript",i.src=s.stringify(a),n.appendChild(i),i.onerror=function(){l(),u._handleError(t)},{abort:l}}}),{_cbCount:0,getCallbackName:function(){return this._cbCount+=1,"__jsonp"+this._cbCount+"__"},isUsable:function(t,e,n,i){n.call(i,!0)}});t.exports=h}).call(e,function(){return this}())},function(t,e,n){"use strict";var i=n(8),s=function(t,e){this.message=t,this.options=e,this.attempts=0};i(s.prototype,{getTimeout:function(){return this.options.timeout},getInterval:function(){return this.options.interval},isDeliverable:function(){var t=this.options.attempts,e=this.attempts,n=this.options.deadline,i=(new Date).getTime();return void 0!==t&&e>=t?!1:void 0!==n&&i>n?!1:!0},send:function(){this.attempts+=1},succeed:function(){},fail:function(){},abort:function(){}}),t.exports=s},function(t,e,n){"use strict";var i=n(7),s=n(18),r=i({initialize:function(t,e,n){this.code=t,this.params=Array.prototype.slice.call(e),this.message=n},toString:function(){return this.code+":"+this.params.join(",")+":"+this.message}});r.parse=function(t){if(t=t||"",!s.ERROR.test(t))return new r(null,[],t);var e=t.split(":"),n=parseInt(e[0]),i=e[1].split(","),t=e[2];return new r(n,i,t)};var o={versionMismatch:[300,"Version mismatch"],conntypeMismatch:[301,"Connection types not supported"],extMismatch:[302,"Extension mismatch"],badRequest:[400,"Bad request"],clientUnknown:[401,"Unknown client"],parameterMissing:[402,"Missing required parameter"],channelForbidden:[403,"Forbidden channel"],channelUnknown:[404,"Unknown channel"],channelInvalid:[405,"Invalid channel"],extUnknown:[406,"Unknown extension"],publishFailed:[407,"Failed to publish"],serverError:[500,"Internal server error"]};for(var c in o)(function(t){r[t]=function(){return new r(o[t][0],arguments,o[t][1]).toString()}})(c);t.exports=r},function(t,e,n){"use strict";var i=n(8),s=n(2),r={addExtension:function(t){this._extensions=this._extensions||[],this._extensions.push(t),t.added&&t.added(this)},removeExtension:function(t){if(this._extensions)for(var e=this._extensions.length;e--;)this._extensions[e]===t&&(this._extensions.splice(e,1),t.removed&&t.removed(this))},pipeThroughExtensions:function(t,e,n,i,s){if(this.debug("Passing through ? extensions: ?",t,e),!this._extensions)return i.call(s,e);var r=this._extensions.slice(),o=function(e){if(!e)return i.call(s,e);var c=r.shift();if(!c)return i.call(s,e);var a=c[t];return a?void(a.length>=3?c[t](e,n,o):c[t](e,o)):o(e)};o(e)}};i(r,s),t.exports=r},function(t,e,n){"use strict";var i=n(7),s=n(14);t.exports=i(s)},function(t,e,n){"use strict";var i=n(7),s=n(8),r=n(14),o=i({initialize:function(t,e,n,i){this._client=t,this._channels=e,this._callback=n,this._context=i,this._cancelled=!1},withChannel:function(t,e){return this._withChannel=[t,e],this},apply:function(t,e){var n=e[0];this._callback&&this._callback.call(this._context,n.data),this._withChannel&&this._withChannel[0].call(this._withChannel[1],n.channel,n.data)},cancel:function(){this._cancelled||(this._client.unsubscribe(this._channels,this),this._cancelled=!0)},unsubscribe:function(){this.cancel()}});s(o.prototype,r),t.exports=o}]);
