import{P as e,T as t,l as n,p as r,tt as i,u as a,v as o,x as s}from"./runtime-core.esm-bundler-C1tvenqo.js";import{A as c,An as l,Bt as u,Cn as d,Dn as f,In as p,J as m,K as h,Nn as g,Nt as _,Pn as v,Pt as y,Q as b,Rt as x,Sn as S,U as C,W as w,Y as T,et as E,jn as D,k as O,q as k,rt as A,z as j}from"./index-HwI7Tn1x.js";function M(e){let{lineHeight:t,borderRadius:n,fontWeightStrong:r,baseColor:i,dividerColor:a,actionColor:o,textColor1:s,textColor2:l,closeColorHover:u,closeColorPressed:f,closeIconColor:p,closeIconColorHover:m,closeIconColorPressed:h,infoColor:g,successColor:_,warningColor:v,errorColor:y,fontSize:b}=e;return Object.assign(Object.assign({},c),{fontSize:b,lineHeight:t,titleFontWeight:r,borderRadius:n,border:`1px solid ${a}`,color:o,titleTextColor:s,iconColor:l,contentTextColor:l,closeBorderRadius:n,closeColorHover:u,closeColorPressed:f,closeIconColor:p,closeIconColorHover:m,closeIconColorPressed:h,borderInfo:`1px solid ${d(i,S(g,{alpha:.25}))}`,colorInfo:d(i,S(g,{alpha:.08})),titleTextColorInfo:s,iconColorInfo:g,contentTextColorInfo:l,closeColorHoverInfo:u,closeColorPressedInfo:f,closeIconColorInfo:p,closeIconColorHoverInfo:m,closeIconColorPressedInfo:h,borderSuccess:`1px solid ${d(i,S(_,{alpha:.25}))}`,colorSuccess:d(i,S(_,{alpha:.08})),titleTextColorSuccess:s,iconColorSuccess:_,contentTextColorSuccess:l,closeColorHoverSuccess:u,closeColorPressedSuccess:f,closeIconColorSuccess:p,closeIconColorHoverSuccess:m,closeIconColorPressedSuccess:h,borderWarning:`1px solid ${d(i,S(v,{alpha:.33}))}`,colorWarning:d(i,S(v,{alpha:.08})),titleTextColorWarning:s,iconColorWarning:v,contentTextColorWarning:l,closeColorHoverWarning:u,closeColorPressedWarning:f,closeIconColorWarning:p,closeIconColorHoverWarning:m,closeIconColorPressedWarning:h,borderError:`1px solid ${d(i,S(y,{alpha:.25}))}`,colorError:d(i,S(y,{alpha:.08})),titleTextColorError:s,iconColorError:y,contentTextColorError:l,closeColorHoverError:u,closeColorPressedError:f,closeIconColorError:p,closeIconColorHoverError:m,closeIconColorPressedError:h})}var N={name:`Alert`,common:j,self:M},P=D(`alert`,`
 line-height: var(--n-line-height);
 border-radius: var(--n-border-radius);
 position: relative;
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-color);
 text-align: start;
 word-break: break-word;
`,[g(`border`,`
 border-radius: inherit;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 transition: border-color .3s var(--n-bezier);
 border: var(--n-border);
 pointer-events: none;
 `),v(`closable`,[D(`alert-body`,[g(`title`,`
 padding-right: 24px;
 `)])]),g(`icon`,{color:`var(--n-icon-color)`}),D(`alert-body`,{padding:`var(--n-padding)`},[g(`title`,{color:`var(--n-title-text-color)`}),g(`content`,{color:`var(--n-content-text-color)`})]),O({originalTransition:`transform .3s var(--n-bezier)`,enterToProps:{transform:`scale(1)`},leaveToProps:{transform:`scale(0.9)`}}),g(`icon`,`
 position: absolute;
 left: 0;
 top: 0;
 align-items: center;
 justify-content: center;
 display: flex;
 width: var(--n-icon-size);
 height: var(--n-icon-size);
 font-size: var(--n-icon-size);
 margin: var(--n-icon-margin);
 `),g(`close`,`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 position: absolute;
 right: 0;
 top: 0;
 margin: var(--n-close-margin);
 `),v(`show-icon`,[D(`alert-body`,{paddingLeft:`calc(var(--n-icon-margin-left) + var(--n-icon-size) + var(--n-icon-margin-right))`})]),v(`right-adjust`,[D(`alert-body`,{paddingRight:`calc(var(--n-close-size) + var(--n-padding) + 2px)`})]),D(`alert-body`,`
 border-radius: var(--n-border-radius);
 transition: border-color .3s var(--n-bezier);
 `,[g(`title`,`
 transition: color .3s var(--n-bezier);
 font-size: 16px;
 line-height: 19px;
 font-weight: var(--n-title-font-weight);
 `,[l(`& +`,[g(`content`,{marginTop:`9px`})])]),g(`content`,{transition:`color .3s var(--n-bezier)`,fontSize:`var(--n-font-size)`})]),g(`icon`,{transition:`color .3s var(--n-bezier)`})]),F=o({name:`Alert`,inheritAttrs:!1,props:Object.assign(Object.assign({},E.props),{title:String,showIcon:{type:Boolean,default:!0},type:{type:String,default:`default`},bordered:{type:Boolean,default:!0},closable:Boolean,onClose:Function,onAfterLeave:Function,onAfterHide:Function}),slots:Object,setup(e){let{mergedClsPrefixRef:t,mergedBorderedRef:r,inlineThemeDisabled:a,mergedRtlRef:o}=y(e),s=E(`Alert`,`-alert`,P,N,e,t),c=A(`Alert`,o,t),l=n(()=>{let{common:{cubicBezierEaseInOut:t},self:n}=s.value,{fontSize:r,borderRadius:i,titleFontWeight:a,lineHeight:o,iconSize:c,iconMargin:l,iconMarginRtl:u,closeIconSize:d,closeBorderRadius:m,closeSize:h,closeMargin:g,closeMarginRtl:_,padding:v}=n,{type:y}=e,{left:b,right:x}=f(l);return{"--n-bezier":t,"--n-color":n[p(`color`,y)],"--n-close-icon-size":d,"--n-close-border-radius":m,"--n-close-color-hover":n[p(`closeColorHover`,y)],"--n-close-color-pressed":n[p(`closeColorPressed`,y)],"--n-close-icon-color":n[p(`closeIconColor`,y)],"--n-close-icon-color-hover":n[p(`closeIconColorHover`,y)],"--n-close-icon-color-pressed":n[p(`closeIconColorPressed`,y)],"--n-icon-color":n[p(`iconColor`,y)],"--n-border":n[p(`border`,y)],"--n-title-text-color":n[p(`titleTextColor`,y)],"--n-content-text-color":n[p(`contentTextColor`,y)],"--n-line-height":o,"--n-border-radius":i,"--n-font-size":r,"--n-title-font-weight":a,"--n-icon-size":c,"--n-icon-margin":l,"--n-icon-margin-rtl":u,"--n-close-size":h,"--n-close-margin":g,"--n-close-margin-rtl":_,"--n-padding":v,"--n-icon-margin-left":b,"--n-icon-margin-right":x}}),u=a?_(`alert`,n(()=>e.type[0]),l,e):void 0,d=i(!0),m=()=>{let{onAfterLeave:t,onAfterHide:n}=e;t&&t(),n&&n()};return{rtlEnabled:c,mergedClsPrefix:t,mergedBordered:r,visible:d,handleCloseClick:()=>{Promise.resolve(e.onClose?.call(e)).then(e=>{e!==!1&&(d.value=!1)})},handleAfterLeave:()=>{m()},mergedTheme:s,cssVars:a?void 0:l,themeClass:u?.themeClass,onRender:u?.onRender}},render(){var e;return(e=this.onRender)==null||e.call(this),s(C,{onAfterLeave:this.handleAfterLeave},{default:()=>{let{mergedClsPrefix:e,$slots:n}=this,r={class:[`${e}-alert`,this.themeClass,this.closable&&`${e}-alert--closable`,this.showIcon&&`${e}-alert--show-icon`,!this.title&&this.closable&&`${e}-alert--right-adjust`,this.rtlEnabled&&`${e}-alert--rtl`],style:this.cssVars,role:`alert`};return this.visible?s(`div`,Object.assign({},t(this.$attrs,r)),this.closable&&s(w,{clsPrefix:e,class:`${e}-alert__close`,onClick:this.handleCloseClick}),this.bordered&&s(`div`,{class:`${e}-alert__border`}),this.showIcon&&s(`div`,{class:`${e}-alert__icon`,"aria-hidden":`true`},x(n.icon,()=>[s(b,{clsPrefix:e},{default:()=>{switch(this.type){case`success`:return s(k,null);case`info`:return s(m,null);case`warning`:return s(h,null);case`error`:return s(T,null);default:return null}}})])),s(`div`,{class:[`${e}-alert-body`,this.mergedBordered&&`${e}-alert-body--bordered`]},u(n.header,t=>{let n=t||this.title;return n?s(`div`,{class:`${e}-alert-body__title`},n):null}),n.default&&s(`div`,{class:`${e}-alert-body__content`},n))):null}})}}),I={xmlns:`http://www.w3.org/2000/svg`,"xmlns:xlink":`http://www.w3.org/1999/xlink`,viewBox:`0 0 512 512`},L=o({name:`SparklesOutline`,render:function(t,n){return e(),r(`svg`,I,n[0]||=[a(`path`,{d:`M259.92 262.91L216.4 149.77a9 9 0 0 0-16.8 0l-43.52 113.14a9 9 0 0 1-5.17 5.17L37.77 311.6a9 9 0 0 0 0 16.8l113.14 43.52a9 9 0 0 1 5.17 5.17l43.52 113.14a9 9 0 0 0 16.8 0l43.52-113.14a9 9 0 0 1 5.17-5.17l113.14-43.52a9 9 0 0 0 0-16.8l-113.14-43.52a9 9 0 0 1-5.17-5.17z`,fill:`none`,stroke:`currentColor`,"stroke-linecap":`round`,"stroke-linejoin":`round`,"stroke-width":`32`},null,-1),a(`path`,{fill:`none`,stroke:`currentColor`,"stroke-linecap":`round`,"stroke-linejoin":`round`,"stroke-width":`32`,d:`M108 68L88 16L68 68L16 88l52 20l20 52l20-52l52-20l-52-20z`},null,-1),a(`path`,{fill:`none`,stroke:`currentColor`,"stroke-linecap":`round`,"stroke-linejoin":`round`,"stroke-width":`32`,d:`M426.67 117.33L400 48l-26.67 69.33L304 144l69.33 26.67L400 240l26.67-69.33L496 144l-69.33-26.67z`},null,-1)])}});export{F as n,L as t};