!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["isdirty-isnew-vuexorm-plugin"]=t():e["isdirty-isnew-vuexorm-plugin"]=t()}(window,function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";n.r(t);const r={isDirtyFlagName:"$isDirty",isNewFlagName:"$isNew"};t.default={install(e,t){const n={...r,...t},{Model:i,Query:o,RootGetters:a,Getters:u,RootMutations:l,RootActions:c,Actions:s}=e,f=i.prototype.$fill;i.prototype.$fill=function(e){f.call(this,e),this[n.isDirtyFlagName]=e&&e[n.isDirtyFlagName]||!1,this[n.isNewFlagName]=e&&e[n.isNewFlagName]||!1},o.on("beforeUpdate",function(e){e[n.isDirtyFlagName]=!0}),a.allDirty=function(e){return function(t){if(t)return new o(e,t).where(e=>e[n.isDirtyFlagName]).get();{let t=[];return i.database().entities.forEach(r=>{let i=new o(e,r.name).where(e=>e[n.isDirtyFlagName]).get();t=t.concat(i)}),t}}},u.allDirty=function(e,t,n,r){return function(){return r[`${e.$connection}/allDirty`](e.$name)}},a.allNew=function(e){return function(t){if(t)return new o(e,t).where(e=>e[n.isNewFlagName]).get();{let t=[];return i.database().entities.forEach(r=>{let i=new o(e,r.name).where(e=>e[n.isNewFlagName]).get();t=t.concat(i)}),t}}},u.allNew=function(e,t,n,r){return function(){return r[`${e.$connection}/allNew`](e.$name)}},i.createNew=function(e=!0){if(e)return this.dispatch("createNew");{let e=new this;return e[n.isNewFlagName]=!0,e[n.isDirtyFlagName]=!0,Promise.resolve(e)}},l.createNew=function(e,t){const n=t.entity,r=t.result;new o(e,n).setResult(r).createNew()},s.createNew=function(e){const t=e.state,n=t.$name;return e.dispatch(`${t.$connection}/createNew`,{entity:n},{root:!0})},c.createNew=function(e,t){const n={data:{}};return e.commit("createNew",{...t,result:n}),n.data},o.prototype.createNew=function(){let e=(new this.model).$toJson();e[n.isNewFlagName]=!0,e[n.isDirtyFlagName]=!0;const t=this.insert(e,{});return this.result.data=t[this.entity][0],this.result.data}}}}])});