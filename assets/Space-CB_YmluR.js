import{i as e,l as t,r as n,v as r,x as i}from"./runtime-core.esm-bundler-C1tvenqo.js";import{En as a,Fn as o,In as s,Kt as c,Nn as l,Nt as u,Pn as d,Pt as f,Tn as p,cn as m,et as h,jn as g,p as _,rt as v,u as y}from"./index-KI1_B8hx.js";function b(e,t=`default`,n=[]){let r=e.$slots[t];return r===void 0?n:r()}var x=g(`divider`,`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[o(`vertical`,`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[o(`no-title`,`
 display: flex;
 align-items: center;
 `)]),l(`title`,`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),d(`title-position-left`,[l(`line`,[d(`left`,{width:`28px`})])]),d(`title-position-right`,[l(`line`,[d(`right`,{width:`28px`})])]),d(`dashed`,[l(`line`,`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),d(`vertical`,`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),l(`line`,`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),o(`dashed`,[l(`line`,{backgroundColor:`var(--n-color)`})]),d(`dashed`,[l(`line`,{borderColor:`var(--n-color)`})]),d(`vertical`,{backgroundColor:`var(--n-color)`})]),S=r({name:`Divider`,props:Object.assign(Object.assign({},h.props),{titlePlacement:{type:String,default:`center`},dashed:Boolean,vertical:Boolean}),setup(e){let{mergedClsPrefixRef:n,inlineThemeDisabled:r}=f(e),i=h(`Divider`,`-divider`,x,_,e,n),a=t(()=>{let{common:{cubicBezierEaseInOut:e},self:{color:t,textColor:n,fontWeight:r}}=i.value;return{"--n-bezier":e,"--n-color":t,"--n-text-color":n,"--n-font-weight":r}}),o=r?u(`divider`,void 0,a,e):void 0;return{mergedClsPrefix:n,cssVars:r?void 0:a,themeClass:o?.themeClass,onRender:o?.onRender}},render(){var t;let{$slots:n,titlePlacement:r,vertical:a,dashed:o,cssVars:s,mergedClsPrefix:c}=this;return(t=this.onRender)==null||t.call(this),i(`div`,{role:`separator`,class:[`${c}-divider`,this.themeClass,{[`${c}-divider--vertical`]:a,[`${c}-divider--no-title`]:!n.default,[`${c}-divider--dashed`]:o,[`${c}-divider--title-position-${r}`]:n.default&&r}],style:s},a?null:i(`div`,{class:`${c}-divider__line ${c}-divider__line--left`}),!a&&n.default?i(e,null,i(`div`,{class:`${c}-divider__title`},this.$slots),i(`div`,{class:`${c}-divider__line ${c}-divider__line--right`})):null)}});function C(){return y}var w={name:`Space`,self:C},T;function E(){if(!m)return!0;if(T===void 0){let e=document.createElement(`div`);e.style.display=`flex`,e.style.flexDirection=`column`,e.style.rowGap=`1px`,e.appendChild(document.createElement(`div`)),e.appendChild(document.createElement(`div`)),document.body.appendChild(e);let t=e.scrollHeight===1;return document.body.removeChild(e),T=t}return T}var D=r({name:`Space`,props:Object.assign(Object.assign({},h.props),{align:String,justify:{type:String,default:`start`},inline:Boolean,vertical:Boolean,reverse:Boolean,size:[String,Number,Array],wrapItem:{type:Boolean,default:!0},itemClass:String,itemStyle:[String,Object],wrap:{type:Boolean,default:!0},internalUseGap:{type:Boolean,default:void 0}}),setup(e){let{mergedClsPrefixRef:n,mergedRtlRef:r,mergedComponentPropsRef:i}=f(e),o=t(()=>e.size||i?.value?.Space?.size||`medium`),c=h(`Space`,`-space`,void 0,w,e,n),l=v(`Space`,r,n);return{useGap:E(),rtlEnabled:l,mergedClsPrefix:n,margin:t(()=>{let e=o.value;if(Array.isArray(e))return{horizontal:e[0],vertical:e[1]};if(typeof e==`number`)return{horizontal:e,vertical:e};let{self:{[s(`gap`,e)]:t}}=c.value,{row:n,col:r}=a(t);return{horizontal:p(r),vertical:p(n)}})}},render(){let{vertical:e,reverse:t,align:r,inline:a,justify:o,itemClass:s,itemStyle:l,margin:u,wrap:d,mergedClsPrefix:f,rtlEnabled:p,useGap:m,wrapItem:h,internalUseGap:g}=this,_=c(b(this),!1);if(!_.length)return null;let v=`${u.horizontal}px`,y=`${u.horizontal/2}px`,x=`${u.vertical}px`,S=`${u.vertical/2}px`,C=_.length-1,w=o.startsWith(`space-`);return i(`div`,{role:`none`,class:[`${f}-space`,p&&`${f}-space--rtl`],style:{display:a?`inline-flex`:`flex`,flexDirection:e&&!t?`column`:e&&t?`column-reverse`:!e&&t?`row-reverse`:`row`,justifyContent:[`start`,`end`].includes(o)?`flex-${o}`:o,flexWrap:!d||e?`nowrap`:`wrap`,marginTop:m||e?``:`-${S}`,marginBottom:m||e?``:`-${S}`,alignItems:r,gap:m?`${u.vertical}px ${u.horizontal}px`:``}},!h&&(m||g)?_:_.map((t,r)=>t.type===n?t:i(`div`,{role:`none`,class:s,style:[l,{maxWidth:`100%`},m?``:e?{marginBottom:r===C?``:x}:p?{marginLeft:w?o===`space-between`&&r===C?``:y:r===C?``:v,marginRight:w?o===`space-between`&&r===0?``:y:``,paddingTop:S,paddingBottom:S}:{marginRight:w?o===`space-between`&&r===C?``:y:r===C?``:v,marginLeft:w?o===`space-between`&&r===0?``:y:``,paddingTop:S,paddingBottom:S}]},t)))}});export{S as n,b as r,D as t};