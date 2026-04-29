import{C as e,E as t,F as n,K as r,T as i,U as a,W as o,at as s,c,i as l,j as u,l as d,tt as f,v as p,x as m}from"./runtime-core.esm-bundler-C1tvenqo.js";import{c as h,g,h as _,l as v}from"./Tag-agQvjLW6.js";import{t as y}from"./Add-ChWULR2p.js";import{An as b,At as x,Bt as S,Ct as C,Dn as w,Et as T,Fn as E,Gn as D,Ht as O,In as k,Jt as A,Kt as j,Nn as M,Nt as ee,Pn as N,Pt as te,Q as P,Tn as ne,Vt as re,W as ie,Wn as F,en as I,et as ae,fn as L,jn as R,mn as oe,o as se,qt as z,rn as B}from"./index-CCQInGbo.js";var V=h(`.v-x-scroll`,{overflow:`auto`,scrollbarWidth:`none`},[h(`&::-webkit-scrollbar`,{width:0,height:0})]),ce=p({name:`XScroll`,props:{disabled:Boolean,onScroll:Function},setup(){let e=f(null);function t(e){!(e.currentTarget.offsetWidth<e.currentTarget.scrollWidth)||e.deltaY===0||(e.currentTarget.scrollLeft+=e.deltaY+e.deltaX,e.preventDefault())}let n=B();return V.mount({id:`vueuc/x-scroll`,head:!0,anchorMetaName:v,ssr:n}),Object.assign({selfRef:e,handleWheel:t},{scrollTo(...t){var n;(n=e.value)==null||n.scrollTo(...t)}})},render(){return m(`div`,{ref:`selfRef`,onScroll:this.onScroll,onWheel:this.disabled?void 0:this.handleWheel,class:`v-x-scroll`},this.$slots)}}),le=/\s/;function ue(e){for(var t=e.length;t--&&le.test(e.charAt(t)););return t}var H=/^\s+/;function U(e){return e&&e.slice(0,ue(e)+1).replace(H,``)}var W=NaN,de=/^[-+]0x[0-9a-f]+$/i,fe=/^0b[01]+$/i,G=/^0o[0-7]+$/i,K=parseInt;function q(e){if(typeof e==`number`)return e;if(T(e))return W;if(C(e)){var t=typeof e.valueOf==`function`?e.valueOf():e;e=C(t)?t+``:t}if(typeof e!=`string`)return e===0?e:+e;e=U(e);var n=fe.test(e);return n||G.test(e)?K(e.slice(2),n?2:8):de.test(e)?W:+e}var J=function(){return x.Date.now()},pe=`Expected a function`,me=Math.max,he=Math.min;function Y(e,t,n){var r,i,a,o,s,c,l=0,u=!1,d=!1,f=!0;if(typeof e!=`function`)throw TypeError(pe);t=q(t)||0,C(n)&&(u=!!n.leading,d=`maxWait`in n,a=d?me(q(n.maxWait)||0,t):a,f=`trailing`in n?!!n.trailing:f);function p(t){var n=r,a=i;return r=i=void 0,l=t,o=e.apply(a,n),o}function m(e){return l=e,s=setTimeout(_,t),u?p(e):o}function h(e){var n=e-c,r=e-l,i=t-n;return d?he(i,a-r):i}function g(e){var n=e-c,r=e-l;return c===void 0||n>=t||n<0||d&&r>=a}function _(){var e=J();if(g(e))return v(e);s=setTimeout(_,h(e))}function v(e){return s=void 0,f&&r?p(e):(r=i=void 0,o)}function y(){s!==void 0&&clearTimeout(s),l=0,r=c=i=s=void 0}function b(){return s===void 0?o:v(J())}function x(){var e=J(),n=g(e);if(r=arguments,i=this,c=e,n){if(s===void 0)return m(c);if(d)return clearTimeout(s),s=setTimeout(_,t),p(c)}return s===void 0&&(s=setTimeout(_,t)),o}return x.cancel=y,x.flush=b,x}var ge=`Expected a function`;function _e(e,t,n){var r=!0,i=!0;if(typeof e!=`function`)throw TypeError(ge);return C(n)&&(r=`leading`in n?!!n.leading:r,i=`trailing`in n?!!n.trailing:i),Y(e,t,{leading:r,maxWait:t,trailing:i})}var ve=L(`n-tabs`),ye={tab:[String,Number,Object,Function],name:{type:[String,Number],required:!0},disabled:Boolean,displayDirective:{type:String,default:`if`},closable:{type:Boolean,default:void 0},tabProps:Object,label:[String,Number,Object,Function]},X=p({__TAB_PANE__:!0,name:`TabPane`,alias:[`TabPanel`],props:ye,slots:Object,setup(t){let n=e(ve,null);return n||A(`tab-pane`,"`n-tab-pane` must be placed inside `n-tabs`."),{style:n.paneStyleRef,class:n.paneClassRef,mergedClsPrefix:n.mergedClsPrefixRef}},render(){return m(`div`,{class:[`${this.mergedClsPrefix}-tab-pane`,this.class],style:this.style},this.$slots)}}),Z=p({__TAB__:!0,inheritAttrs:!1,name:`Tab`,props:Object.assign({internalLeftPadded:Boolean,internalAddable:Boolean,internalCreatedByPane:Boolean},O(ye,[`displayDirective`])),setup(t){let{mergedClsPrefixRef:n,valueRef:r,typeRef:i,closableRef:a,tabStyleRef:o,addTabStyleRef:s,tabClassRef:c,addTabClassRef:l,tabChangeIdRef:u,onBeforeLeaveRef:f,triggerRef:p,handleAdd:m,activateTab:h,handleClose:g}=e(ve);return{trigger:p,mergedClosable:d(()=>{if(t.internalAddable)return!1;let{closable:e}=t;return e===void 0?a.value:e}),style:o,addStyle:s,tabClass:c,addTabClass:l,clsPrefix:n,value:r,type:i,handleClose(e){e.stopPropagation(),!t.disabled&&g(t.name)},activateTab(){if(t.disabled)return;if(t.internalAddable){m();return}let{name:e}=t,n=++u.id;if(e!==r.value){let{value:i}=f;i?Promise.resolve(i(t.name,r.value)).then(t=>{t&&u.id===n&&h(e)}):h(e)}}}},render(){let{internalAddable:e,clsPrefix:t,name:n,disabled:r,label:a,tab:o,value:s,mergedClosable:c,trigger:u,$slots:{default:d}}=this,f=a??o;return m(`div`,{class:`${t}-tabs-tab-wrapper`},this.internalLeftPadded?m(`div`,{class:`${t}-tabs-tab-pad`}):null,m(`div`,Object.assign({key:n,"data-name":n,"data-disabled":r?!0:void 0},i({class:[`${t}-tabs-tab`,s===n&&`${t}-tabs-tab--active`,r&&`${t}-tabs-tab--disabled`,c&&`${t}-tabs-tab--closable`,e&&`${t}-tabs-tab--addable`,e?this.addTabClass:this.tabClass],onClick:u===`click`?this.activateTab:void 0,onMouseenter:u===`hover`?this.activateTab:void 0,style:e?this.addStyle:this.style},this.internalCreatedByPane?this.tabProps||{}:this.$attrs)),m(`span`,{class:`${t}-tabs-tab__label`},e?m(l,null,m(`div`,{class:`${t}-tabs-tab__height-placeholder`},`\xA0`),m(P,{clsPrefix:t},{default:()=>m(y,null)})):d?d():typeof f==`object`?f:re(f??n)),c&&this.type===`card`?m(ie,{clsPrefix:t,class:`${t}-tabs-tab__close`,onClick:this.handleClose,disabled:r}):null))}}),be=R(`tabs`,`
 box-sizing: border-box;
 width: 100%;
 display: flex;
 flex-direction: column;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
`,[N(`segment-type`,[R(`tabs-rail`,[b(`&.transition-disabled`,[R(`tabs-capsule`,`
 transition: none;
 `)])])]),N(`top`,[R(`tab-pane`,`
 padding: var(--n-pane-padding-top) var(--n-pane-padding-right) var(--n-pane-padding-bottom) var(--n-pane-padding-left);
 `)]),N(`left`,[R(`tab-pane`,`
 padding: var(--n-pane-padding-right) var(--n-pane-padding-bottom) var(--n-pane-padding-left) var(--n-pane-padding-top);
 `)]),N(`left, right`,`
 flex-direction: row;
 `,[R(`tabs-bar`,`
 width: 2px;
 right: 0;
 transition:
 top .2s var(--n-bezier),
 max-height .2s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `),R(`tabs-tab`,`
 padding: var(--n-tab-padding-vertical); 
 `)]),N(`right`,`
 flex-direction: row-reverse;
 `,[R(`tab-pane`,`
 padding: var(--n-pane-padding-left) var(--n-pane-padding-top) var(--n-pane-padding-right) var(--n-pane-padding-bottom);
 `),R(`tabs-bar`,`
 left: 0;
 `)]),N(`bottom`,`
 flex-direction: column-reverse;
 justify-content: flex-end;
 `,[R(`tab-pane`,`
 padding: var(--n-pane-padding-bottom) var(--n-pane-padding-right) var(--n-pane-padding-top) var(--n-pane-padding-left);
 `),R(`tabs-bar`,`
 top: 0;
 `)]),R(`tabs-rail`,`
 position: relative;
 padding: 3px;
 border-radius: var(--n-tab-border-radius);
 width: 100%;
 background-color: var(--n-color-segment);
 transition: background-color .3s var(--n-bezier);
 display: flex;
 align-items: center;
 `,[R(`tabs-capsule`,`
 border-radius: var(--n-tab-border-radius);
 position: absolute;
 pointer-events: none;
 background-color: var(--n-tab-color-segment);
 box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .08);
 transition: transform 0.3s var(--n-bezier);
 `),R(`tabs-tab-wrapper`,`
 flex-basis: 0;
 flex-grow: 1;
 display: flex;
 align-items: center;
 justify-content: center;
 `,[R(`tabs-tab`,`
 overflow: hidden;
 border-radius: var(--n-tab-border-radius);
 width: 100%;
 display: flex;
 align-items: center;
 justify-content: center;
 `,[N(`active`,`
 font-weight: var(--n-font-weight-strong);
 color: var(--n-tab-text-color-active);
 `),b(`&:hover`,`
 color: var(--n-tab-text-color-hover);
 `)])])]),N(`flex`,[R(`tabs-nav`,`
 width: 100%;
 position: relative;
 `,[R(`tabs-wrapper`,`
 width: 100%;
 `,[R(`tabs-tab`,`
 margin-right: 0;
 `)])])]),R(`tabs-nav`,`
 box-sizing: border-box;
 line-height: 1.5;
 display: flex;
 transition: border-color .3s var(--n-bezier);
 `,[M(`prefix, suffix`,`
 display: flex;
 align-items: center;
 `),M(`prefix`,`padding-right: 16px;`),M(`suffix`,`padding-left: 16px;`)]),N(`top, bottom`,[b(`>`,[R(`tabs-nav`,[R(`tabs-nav-scroll-wrapper`,[b(`&::before`,`
 top: 0;
 bottom: 0;
 left: 0;
 width: 20px;
 `),b(`&::after`,`
 top: 0;
 bottom: 0;
 right: 0;
 width: 20px;
 `),N(`shadow-start`,[b(`&::before`,`
 box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, .12);
 `)]),N(`shadow-end`,[b(`&::after`,`
 box-shadow: inset -10px 0 8px -8px rgba(0, 0, 0, .12);
 `)])])])])]),N(`left, right`,[R(`tabs-nav-scroll-content`,`
 flex-direction: column;
 `),b(`>`,[R(`tabs-nav`,[R(`tabs-nav-scroll-wrapper`,[b(`&::before`,`
 top: 0;
 left: 0;
 right: 0;
 height: 20px;
 `),b(`&::after`,`
 bottom: 0;
 left: 0;
 right: 0;
 height: 20px;
 `),N(`shadow-start`,[b(`&::before`,`
 box-shadow: inset 0 10px 8px -8px rgba(0, 0, 0, .12);
 `)]),N(`shadow-end`,[b(`&::after`,`
 box-shadow: inset 0 -10px 8px -8px rgba(0, 0, 0, .12);
 `)])])])])]),R(`tabs-nav-scroll-wrapper`,`
 flex: 1;
 position: relative;
 overflow: hidden;
 `,[R(`tabs-nav-y-scroll`,`
 height: 100%;
 width: 100%;
 overflow-y: auto; 
 scrollbar-width: none;
 `,[b(`&::-webkit-scrollbar, &::-webkit-scrollbar-track-piece, &::-webkit-scrollbar-thumb`,`
 width: 0;
 height: 0;
 display: none;
 `)]),b(`&::before, &::after`,`
 transition: box-shadow .3s var(--n-bezier);
 pointer-events: none;
 content: "";
 position: absolute;
 z-index: 1;
 `)]),R(`tabs-nav-scroll-content`,`
 display: flex;
 position: relative;
 min-width: 100%;
 min-height: 100%;
 width: fit-content;
 box-sizing: border-box;
 `),R(`tabs-wrapper`,`
 display: inline-flex;
 flex-wrap: nowrap;
 position: relative;
 `),R(`tabs-tab-wrapper`,`
 display: flex;
 flex-wrap: nowrap;
 flex-shrink: 0;
 flex-grow: 0;
 `),R(`tabs-tab`,`
 cursor: pointer;
 white-space: nowrap;
 flex-wrap: nowrap;
 display: inline-flex;
 align-items: center;
 color: var(--n-tab-text-color);
 font-size: var(--n-tab-font-size);
 background-clip: padding-box;
 padding: var(--n-tab-padding);
 transition:
 box-shadow .3s var(--n-bezier),
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[N(`disabled`,{cursor:`not-allowed`}),M(`close`,`
 margin-left: 6px;
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),M(`label`,`
 display: flex;
 align-items: center;
 z-index: 1;
 `)]),R(`tabs-bar`,`
 position: absolute;
 bottom: 0;
 height: 2px;
 border-radius: 1px;
 background-color: var(--n-bar-color);
 transition:
 left .2s var(--n-bezier),
 max-width .2s var(--n-bezier),
 opacity .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `,[b(`&.transition-disabled`,`
 transition: none;
 `),N(`disabled`,`
 background-color: var(--n-tab-text-color-disabled)
 `)]),R(`tabs-pane-wrapper`,`
 position: relative;
 overflow: hidden;
 transition: max-height .2s var(--n-bezier);
 `),R(`tab-pane`,`
 color: var(--n-pane-text-color);
 width: 100%;
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 opacity .2s var(--n-bezier);
 left: 0;
 right: 0;
 top: 0;
 `,[b(`&.next-transition-leave-active, &.prev-transition-leave-active, &.next-transition-enter-active, &.prev-transition-enter-active`,`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 transform .2s var(--n-bezier),
 opacity .2s var(--n-bezier);
 `),b(`&.next-transition-leave-active, &.prev-transition-leave-active`,`
 position: absolute;
 `),b(`&.next-transition-enter-from, &.prev-transition-leave-to`,`
 transform: translateX(32px);
 opacity: 0;
 `),b(`&.next-transition-leave-to, &.prev-transition-enter-from`,`
 transform: translateX(-32px);
 opacity: 0;
 `),b(`&.next-transition-leave-from, &.next-transition-enter-to, &.prev-transition-leave-from, &.prev-transition-enter-to`,`
 transform: translateX(0);
 opacity: 1;
 `)]),R(`tabs-tab-pad`,`
 box-sizing: border-box;
 width: var(--n-tab-gap);
 flex-grow: 0;
 flex-shrink: 0;
 `),N(`line-type, bar-type`,[R(`tabs-tab`,`
 font-weight: var(--n-tab-font-weight);
 box-sizing: border-box;
 vertical-align: bottom;
 `,[b(`&:hover`,{color:`var(--n-tab-text-color-hover)`}),N(`active`,`
 color: var(--n-tab-text-color-active);
 font-weight: var(--n-tab-font-weight-active);
 `),N(`disabled`,{color:`var(--n-tab-text-color-disabled)`})])]),R(`tabs-nav`,[N(`line-type`,[N(`top`,[M(`prefix, suffix`,`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),R(`tabs-nav-scroll-content`,`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),R(`tabs-bar`,`
 bottom: -1px;
 `)]),N(`left`,[M(`prefix, suffix`,`
 border-right: 1px solid var(--n-tab-border-color);
 `),R(`tabs-nav-scroll-content`,`
 border-right: 1px solid var(--n-tab-border-color);
 `),R(`tabs-bar`,`
 right: -1px;
 `)]),N(`right`,[M(`prefix, suffix`,`
 border-left: 1px solid var(--n-tab-border-color);
 `),R(`tabs-nav-scroll-content`,`
 border-left: 1px solid var(--n-tab-border-color);
 `),R(`tabs-bar`,`
 left: -1px;
 `)]),N(`bottom`,[M(`prefix, suffix`,`
 border-top: 1px solid var(--n-tab-border-color);
 `),R(`tabs-nav-scroll-content`,`
 border-top: 1px solid var(--n-tab-border-color);
 `),R(`tabs-bar`,`
 top: -1px;
 `)]),M(`prefix, suffix`,`
 transition: border-color .3s var(--n-bezier);
 `),R(`tabs-nav-scroll-content`,`
 transition: border-color .3s var(--n-bezier);
 `),R(`tabs-bar`,`
 border-radius: 0;
 `)]),N(`card-type`,[M(`prefix, suffix`,`
 transition: border-color .3s var(--n-bezier);
 `),R(`tabs-pad`,`
 flex-grow: 1;
 transition: border-color .3s var(--n-bezier);
 `),R(`tabs-tab-pad`,`
 transition: border-color .3s var(--n-bezier);
 `),R(`tabs-tab`,`
 font-weight: var(--n-tab-font-weight);
 border: 1px solid var(--n-tab-border-color);
 background-color: var(--n-tab-color);
 box-sizing: border-box;
 position: relative;
 vertical-align: bottom;
 display: flex;
 justify-content: space-between;
 font-size: var(--n-tab-font-size);
 color: var(--n-tab-text-color);
 `,[N(`addable`,`
 padding-left: 8px;
 padding-right: 8px;
 font-size: 16px;
 justify-content: center;
 `,[M(`height-placeholder`,`
 width: 0;
 font-size: var(--n-tab-font-size);
 `),E(`disabled`,[b(`&:hover`,`
 color: var(--n-tab-text-color-hover);
 `)])]),N(`closable`,`padding-right: 8px;`),N(`active`,`
 background-color: #0000;
 font-weight: var(--n-tab-font-weight-active);
 color: var(--n-tab-text-color-active);
 `),N(`disabled`,`color: var(--n-tab-text-color-disabled);`)])]),N(`left, right`,`
 flex-direction: column; 
 `,[M(`prefix, suffix`,`
 padding: var(--n-tab-padding-vertical);
 `),R(`tabs-wrapper`,`
 flex-direction: column;
 `),R(`tabs-tab-wrapper`,`
 flex-direction: column;
 `,[R(`tabs-tab-pad`,`
 height: var(--n-tab-gap-vertical);
 width: 100%;
 `)])]),N(`top`,[N(`card-type`,[R(`tabs-scroll-padding`,`border-bottom: 1px solid var(--n-tab-border-color);`),M(`prefix, suffix`,`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),R(`tabs-tab`,`
 border-top-left-radius: var(--n-tab-border-radius);
 border-top-right-radius: var(--n-tab-border-radius);
 `,[N(`active`,`
 border-bottom: 1px solid #0000;
 `)]),R(`tabs-tab-pad`,`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),R(`tabs-pad`,`
 border-bottom: 1px solid var(--n-tab-border-color);
 `)])]),N(`left`,[N(`card-type`,[R(`tabs-scroll-padding`,`border-right: 1px solid var(--n-tab-border-color);`),M(`prefix, suffix`,`
 border-right: 1px solid var(--n-tab-border-color);
 `),R(`tabs-tab`,`
 border-top-left-radius: var(--n-tab-border-radius);
 border-bottom-left-radius: var(--n-tab-border-radius);
 `,[N(`active`,`
 border-right: 1px solid #0000;
 `)]),R(`tabs-tab-pad`,`
 border-right: 1px solid var(--n-tab-border-color);
 `),R(`tabs-pad`,`
 border-right: 1px solid var(--n-tab-border-color);
 `)])]),N(`right`,[N(`card-type`,[R(`tabs-scroll-padding`,`border-left: 1px solid var(--n-tab-border-color);`),M(`prefix, suffix`,`
 border-left: 1px solid var(--n-tab-border-color);
 `),R(`tabs-tab`,`
 border-top-right-radius: var(--n-tab-border-radius);
 border-bottom-right-radius: var(--n-tab-border-radius);
 `,[N(`active`,`
 border-left: 1px solid #0000;
 `)]),R(`tabs-tab-pad`,`
 border-left: 1px solid var(--n-tab-border-color);
 `),R(`tabs-pad`,`
 border-left: 1px solid var(--n-tab-border-color);
 `)])]),N(`bottom`,[N(`card-type`,[R(`tabs-scroll-padding`,`border-top: 1px solid var(--n-tab-border-color);`),M(`prefix, suffix`,`
 border-top: 1px solid var(--n-tab-border-color);
 `),R(`tabs-tab`,`
 border-bottom-left-radius: var(--n-tab-border-radius);
 border-bottom-right-radius: var(--n-tab-border-radius);
 `,[N(`active`,`
 border-top: 1px solid #0000;
 `)]),R(`tabs-tab-pad`,`
 border-top: 1px solid var(--n-tab-border-color);
 `),R(`tabs-pad`,`
 border-top: 1px solid var(--n-tab-border-color);
 `)])])])]),xe=_e,Se=p({name:`Tabs`,props:Object.assign(Object.assign({},ae.props),{value:[String,Number],defaultValue:[String,Number],trigger:{type:String,default:`click`},type:{type:String,default:`bar`},closable:Boolean,justifyContent:String,size:String,placement:{type:String,default:`top`},tabStyle:[String,Object],tabClass:String,addTabStyle:[String,Object],addTabClass:String,barWidth:Number,paneClass:String,paneStyle:[String,Object],paneWrapperClass:String,paneWrapperStyle:[String,Object],addable:[Boolean,Object],tabsPadding:{type:Number,default:0},animated:Boolean,onBeforeLeave:Function,onAdd:Function,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],onClose:[Function,Array],labelSize:String,activeName:[String,Number],onActiveNameChange:[Function,Array]}),slots:Object,setup(e,{slots:r}){let{mergedClsPrefixRef:i,inlineThemeDisabled:c,mergedComponentPropsRef:l}=te(e),p=ae(`Tabs`,`-tabs`,be,se,e,i),m=f(null),h=f(null),v=f(null),y=f(null),b=f(null),x=f(null),S=f(!0),C=f(!0),T=_(e,[`labelSize`,`size`]),E=d(()=>T.value?T.value:l?.value?.Tabs?.size||`medium`),D=_(e,[`activeName`,`value`]),O=f(D.value??e.defaultValue??(r.default?j(r.default())[0]?.props?.name:null)),A=oe(D,O),M={id:0},N=d(()=>{if(!(!e.justifyContent||e.type===`card`))return{display:`flex`,justifyContent:e.justifyContent}});a(A,()=>{M.id=0,I(),L()});function P(){let{value:e}=A;return e===null?null:m.value?.querySelector(`[data-name="${e}"]`)}function re(t){if(e.type===`card`)return;let{value:n}=h;if(!n)return;let r=n.style.opacity===`0`;if(t){let a=`${i.value}-tabs-bar--disabled`,{barWidth:o,placement:s}=e;if(t.dataset.disabled===`true`?n.classList.add(a):n.classList.remove(a),[`top`,`bottom`].includes(s)){if(F([`top`,`maxHeight`,`height`]),typeof o==`number`&&t.offsetWidth>=o){let e=Math.floor((t.offsetWidth-o)/2)+t.offsetLeft;n.style.left=`${e}px`,n.style.maxWidth=`${o}px`}else n.style.left=`${t.offsetLeft}px`,n.style.maxWidth=`${t.offsetWidth}px`;n.style.width=`8192px`,r&&(n.style.transition=`none`),n.offsetWidth,r&&(n.style.transition=``,n.style.opacity=`1`)}else{if(F([`left`,`maxWidth`,`width`]),typeof o==`number`&&t.offsetHeight>=o){let e=Math.floor((t.offsetHeight-o)/2)+t.offsetTop;n.style.top=`${e}px`,n.style.maxHeight=`${o}px`}else n.style.top=`${t.offsetTop}px`,n.style.maxHeight=`${t.offsetHeight}px`;n.style.height=`8192px`,r&&(n.style.transition=`none`),n.offsetHeight,r&&(n.style.transition=``,n.style.opacity=`1`)}}}function ie(){if(e.type===`card`)return;let{value:t}=h;t&&(t.style.opacity=`0`)}function F(e){let{value:t}=h;if(t)for(let n of e)t.style[n]=``}function I(){if(e.type===`card`)return;let t=P();t?re(t):ie()}function L(){let e=b.value?.$el;if(!e)return;let t=P();if(!t)return;let{scrollLeft:n,offsetWidth:r}=e,{offsetLeft:i,offsetWidth:a}=t;n>i?e.scrollTo({top:0,left:i,behavior:`smooth`}):i+a>n+r&&e.scrollTo({top:0,left:i+a-r,behavior:`smooth`})}let R=f(null),B=0,V=null;function ce(e){let t=R.value;if(t){B=e.getBoundingClientRect().height;let n=`${B}px`,r=()=>{t.style.height=n,t.style.maxHeight=n};V?(r(),V(),V=null):V=r}}function le(e){let t=R.value;if(t){let n=e.getBoundingClientRect().height,r=()=>{document.body.offsetHeight,t.style.maxHeight=`${n}px`,t.style.height=`${Math.max(B,n)}px`};V?(V(),V=null,r()):V=r}}function ue(){let t=R.value;if(t){t.style.maxHeight=``,t.style.height=``;let{paneWrapperStyle:n}=e;if(typeof n==`string`)t.style.cssText=n;else if(n){let{maxHeight:e,height:r}=n;e!==void 0&&(t.style.maxHeight=e),r!==void 0&&(t.style.height=r)}}}let H={value:[]},U=f(`next`);function W(e){let t=A.value,n=`next`;for(let r of H.value){if(r===t)break;if(r===e){n=`prev`;break}}U.value=n,de(e)}function de(t){let{onActiveNameChange:n,onUpdateValue:r,"onUpdate:value":i}=e;n&&z(n,t),r&&z(r,t),i&&z(i,t),O.value=t}function fe(t){let{onClose:n}=e;n&&z(n,t)}let G=!0;function K(){let{value:e}=h;if(!e)return;G||=!1;let t=`transition-disabled`;e.classList.add(t),I(),e.classList.remove(t)}let q=f(null);function J({transitionDisabled:e}){let t=m.value;if(!t)return;e&&t.classList.add(`transition-disabled`);let n=P();n&&q.value&&(q.value.style.width=`${n.offsetWidth}px`,q.value.style.height=`${n.offsetHeight}px`,q.value.style.transform=`translateX(${n.offsetLeft-ne(getComputedStyle(t).paddingLeft)}px)`,e&&q.value.offsetWidth),e&&t.classList.remove(`transition-disabled`)}a([A],()=>{e.type===`segment`&&t(()=>{J({transitionDisabled:!1})})}),u(()=>{e.type===`segment`&&J({transitionDisabled:!0})});let pe=0;function me(t){if(t.contentRect.width===0&&t.contentRect.height===0||pe===t.contentRect.width)return;pe=t.contentRect.width;let{type:n}=e;if((n===`line`||n===`bar`)&&(G||e.justifyContent?.startsWith(`space`))&&K(),n!==`segment`){let{placement:t}=e;X((t===`top`||t===`bottom`?b.value?.$el:x.value)||null)}}let he=xe(me,64);a([()=>e.justifyContent,()=>e.size],()=>{t(()=>{let{type:t}=e;(t===`line`||t===`bar`)&&K()})});let Y=f(!1);function ge(t){let{target:n,contentRect:{width:r,height:i}}=t,a=n.parentElement.parentElement.offsetWidth,o=n.parentElement.parentElement.offsetHeight,{placement:s}=e;if(!Y.value)s===`top`||s===`bottom`?a<r&&(Y.value=!0):o<i&&(Y.value=!0);else{let{value:e}=y;if(!e)return;s===`top`||s===`bottom`?a-r>e.$el.offsetWidth&&(Y.value=!1):o-i>e.$el.offsetHeight&&(Y.value=!1)}X(b.value?.$el||null)}let _e=xe(ge,64);function ye(){let{onAdd:n}=e;n&&n(),t(()=>{let e=P(),{value:t}=b;!e||!t||t.scrollTo({left:e.offsetLeft,top:0,behavior:`smooth`})})}function X(t){if(!t)return;let{placement:n}=e;if(n===`top`||n===`bottom`){let{scrollLeft:e,scrollWidth:n,offsetWidth:r}=t;S.value=e<=0,C.value=e+r>=n}else{let{scrollTop:e,scrollHeight:n,offsetHeight:r}=t;S.value=e<=0,C.value=e+r>=n}}let Z=xe(e=>{X(e.target)},64);n(ve,{triggerRef:s(e,`trigger`),tabStyleRef:s(e,`tabStyle`),tabClassRef:s(e,`tabClass`),addTabStyleRef:s(e,`addTabStyle`),addTabClassRef:s(e,`addTabClass`),paneClassRef:s(e,`paneClass`),paneStyleRef:s(e,`paneStyle`),mergedClsPrefixRef:i,typeRef:s(e,`type`),closableRef:s(e,`closable`),valueRef:A,tabChangeIdRef:M,onBeforeLeaveRef:s(e,`onBeforeLeave`),activateTab:W,handleClose:fe,handleAdd:ye}),g(()=>{I(),L()}),o(()=>{let{value:e}=v;if(!e)return;let{value:t}=i,n=`${t}-tabs-nav-scroll-wrapper--shadow-start`,r=`${t}-tabs-nav-scroll-wrapper--shadow-end`;S.value?e.classList.remove(n):e.classList.add(n),C.value?e.classList.remove(r):e.classList.add(r)});let Se={syncBarPosition:()=>{I()}},Ce=()=>{J({transitionDisabled:!0})},Q=d(()=>{let{value:t}=E,{type:n}=e,r=`${t}${{card:`Card`,bar:`Bar`,line:`Line`,segment:`Segment`}[n]}`,{self:{barColor:i,closeIconColor:a,closeIconColorHover:o,closeIconColorPressed:s,tabColor:c,tabBorderColor:l,paneTextColor:u,tabFontWeight:d,tabBorderRadius:f,tabFontWeightActive:m,colorSegment:h,fontWeightStrong:g,tabColorSegment:_,closeSize:v,closeIconSize:y,closeColorHover:b,closeColorPressed:x,closeBorderRadius:S,[k(`panePadding`,t)]:C,[k(`tabPadding`,r)]:T,[k(`tabPaddingVertical`,r)]:D,[k(`tabGap`,r)]:O,[k(`tabGap`,`${r}Vertical`)]:A,[k(`tabTextColor`,n)]:j,[k(`tabTextColorActive`,n)]:M,[k(`tabTextColorHover`,n)]:ee,[k(`tabTextColorDisabled`,n)]:N,[k(`tabFontSize`,t)]:te},common:{cubicBezierEaseInOut:P}}=p.value;return{"--n-bezier":P,"--n-color-segment":h,"--n-bar-color":i,"--n-tab-font-size":te,"--n-tab-text-color":j,"--n-tab-text-color-active":M,"--n-tab-text-color-disabled":N,"--n-tab-text-color-hover":ee,"--n-pane-text-color":u,"--n-tab-border-color":l,"--n-tab-border-radius":f,"--n-close-size":v,"--n-close-icon-size":y,"--n-close-color-hover":b,"--n-close-color-pressed":x,"--n-close-border-radius":S,"--n-close-icon-color":a,"--n-close-icon-color-hover":o,"--n-close-icon-color-pressed":s,"--n-tab-color":c,"--n-tab-font-weight":d,"--n-tab-font-weight-active":m,"--n-tab-padding":T,"--n-tab-padding-vertical":D,"--n-tab-gap":O,"--n-tab-gap-vertical":A,"--n-pane-padding-left":w(C,`left`),"--n-pane-padding-right":w(C,`right`),"--n-pane-padding-top":w(C,`top`),"--n-pane-padding-bottom":w(C,`bottom`),"--n-font-weight-strong":g,"--n-tab-color-segment":_}}),$=c?ee(`tabs`,d(()=>`${E.value[0]}${e.type[0]}`),Q,e):void 0;return Object.assign({mergedClsPrefix:i,mergedValue:A,renderedNames:new Set,segmentCapsuleElRef:q,tabsPaneWrapperRef:R,tabsElRef:m,barElRef:h,addTabInstRef:y,xScrollInstRef:b,scrollWrapperElRef:v,addTabFixed:Y,tabWrapperStyle:N,handleNavResize:he,mergedSize:E,handleScroll:Z,handleTabsResize:_e,cssVars:c?void 0:Q,themeClass:$?.themeClass,animationDirection:U,renderNameListRef:H,yScrollElRef:x,handleSegmentResize:Ce,onAnimationBeforeLeave:ce,onAnimationEnter:le,onAnimationAfterEnter:ue,onRender:$?.onRender},Se)},render(){let{mergedClsPrefix:e,type:t,placement:n,addTabFixed:r,addable:i,mergedSize:a,renderNameListRef:o,onRender:s,paneWrapperClass:c,paneWrapperStyle:l,$slots:{default:u,prefix:d,suffix:f}}=this;s?.();let p=u?j(u()).filter(e=>e.type.__TAB_PANE__===!0):[],h=u?j(u()).filter(e=>e.type.__TAB__===!0):[],g=!h.length,_=t===`card`,v=t===`segment`,y=!_&&!v&&this.justifyContent;o.value=[];let b=()=>{let t=m(`div`,{style:this.tabWrapperStyle,class:`${e}-tabs-wrapper`},y?null:m(`div`,{class:`${e}-tabs-scroll-padding`,style:n===`top`||n===`bottom`?{width:`${this.tabsPadding}px`}:{height:`${this.tabsPadding}px`}}),g?p.map((e,t)=>(o.value.push(e.props.name),we(m(Z,Object.assign({},e.props,{internalCreatedByPane:!0,internalLeftPadded:t!==0&&(!y||y===`center`||y===`start`||y===`end`)}),e.children?{default:e.children.tab}:void 0)))):h.map((e,t)=>(o.value.push(e.props.name),we(t!==0&&!y?$(e):e))),!r&&i&&_?Q(i,(g?p.length:h.length)!==0):null,y?null:m(`div`,{class:`${e}-tabs-scroll-padding`,style:{width:`${this.tabsPadding}px`}}));return m(`div`,{ref:`tabsElRef`,class:`${e}-tabs-nav-scroll-content`},_&&i?m(I,{onResize:this.handleTabsResize},{default:()=>t}):t,_?m(`div`,{class:`${e}-tabs-pad`}):null,_?null:m(`div`,{ref:`barElRef`,class:`${e}-tabs-bar`}))},x=v?`top`:n;return m(`div`,{class:[`${e}-tabs`,this.themeClass,`${e}-tabs--${t}-type`,`${e}-tabs--${a}-size`,y&&`${e}-tabs--flex`,`${e}-tabs--${x}`],style:this.cssVars},m(`div`,{class:[`${e}-tabs-nav--${t}-type`,`${e}-tabs-nav--${x}`,`${e}-tabs-nav`]},S(d,t=>t&&m(`div`,{class:`${e}-tabs-nav__prefix`},t)),v?m(I,{onResize:this.handleSegmentResize},{default:()=>m(`div`,{class:`${e}-tabs-rail`,ref:`tabsElRef`},m(`div`,{class:`${e}-tabs-capsule`,ref:`segmentCapsuleElRef`},m(`div`,{class:`${e}-tabs-wrapper`},m(`div`,{class:`${e}-tabs-tab`}))),g?p.map((e,t)=>(o.value.push(e.props.name),m(Z,Object.assign({},e.props,{internalCreatedByPane:!0,internalLeftPadded:t!==0}),e.children?{default:e.children.tab}:void 0))):h.map((e,t)=>(o.value.push(e.props.name),t===0?e:$(e))))}):m(I,{onResize:this.handleNavResize},{default:()=>m(`div`,{class:`${e}-tabs-nav-scroll-wrapper`,ref:`scrollWrapperElRef`},[`top`,`bottom`].includes(x)?m(ce,{ref:`xScrollInstRef`,onScroll:this.handleScroll},{default:b}):m(`div`,{class:`${e}-tabs-nav-y-scroll`,onScroll:this.handleScroll,ref:`yScrollElRef`},b()))}),r&&i&&_?Q(i,!0):null,S(f,t=>t&&m(`div`,{class:`${e}-tabs-nav__suffix`},t))),g&&(this.animated&&(x===`top`||x===`bottom`)?m(`div`,{ref:`tabsPaneWrapperRef`,style:l,class:[`${e}-tabs-pane-wrapper`,c]},Ce(p,this.mergedValue,this.renderedNames,this.onAnimationBeforeLeave,this.onAnimationEnter,this.onAnimationAfterEnter,this.animationDirection)):Ce(p,this.mergedValue,this.renderedNames)))}});function Ce(e,t,n,i,a,o,s){let c=[];return e.forEach(e=>{let{name:i,displayDirective:a,"display-directive":o}=e.props,s=e=>a===e||o===e,l=t===i;if(e.key!==void 0&&(e.key=i),l||s(`show`)||s(`show:lazy`)&&n.has(i)){n.has(i)||n.add(i);let t=!s(`if`);c.push(t?r(e,[[D,l]]):e)}}),s?m(F,{name:`${s}-transition`,onBeforeLeave:i,onEnter:a,onAfterEnter:o},{default:()=>c}):c}function Q(e,t){return m(Z,{ref:`addTabInstRef`,key:`__addable`,name:`__addable`,internalCreatedByPane:!0,internalAddable:!0,internalLeftPadded:t,disabled:typeof e==`object`&&e.disabled})}function $(e){let t=c(e);return t.props?t.props.internalLeftPadded=!0:t.props={internalLeftPadded:!0},t}function we(e){return Array.isArray(e.dynamicProps)?e.dynamicProps.includes(`internalLeftPadded`)||e.dynamicProps.push(`internalLeftPadded`):e.dynamicProps=[`internalLeftPadded`],e}export{X as n,Se as t};