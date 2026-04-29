const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./citation-js-CEbIPOCp.js","./chunk-BNv3lrIs.js"])))=>i.map(i=>d[i]);
import{a as e}from"./chunk-BNv3lrIs.js";import{P as t,W as n,l as r,p as i,tt as a,u as o,v as s,x as c}from"./runtime-core.esm-bundler-C1tvenqo.js";import{c as l,f as u,g as d,i as f,t as p,u as m,y as h}from"./db-C2gVU3iG.js";import{t as g}from"./preload-helper-I1wKxk_B.js";import{h as _}from"./Tag-agQvjLW6.js";import{An as v,B as y,H as b,Hn as x,In as S,Nt as C,On as w,Pn as T,Pt as E,Un as D,V as O,et as k,jn as A,s as j}from"./index-CCQInGbo.js";var M=v([v(`@keyframes spin-rotate`,`
 from {
 transform: rotate(0);
 }
 to {
 transform: rotate(360deg);
 }
 `),A(`spin-container`,`
 position: relative;
 `,[A(`spin-body`,`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 `,[y()])]),A(`spin-body`,`
 display: inline-flex;
 align-items: center;
 justify-content: center;
 flex-direction: column;
 `),A(`spin`,`
 display: inline-flex;
 height: var(--n-size);
 width: var(--n-size);
 font-size: var(--n-size);
 color: var(--n-color);
 `,[T(`rotate`,`
 animation: spin-rotate 2s linear infinite;
 `)]),A(`spin-description`,`
 display: inline-block;
 font-size: var(--n-font-size);
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 margin-top: 8px;
 `),A(`spin-content`,`
 opacity: 1;
 transition: opacity .3s var(--n-bezier);
 pointer-events: all;
 `,[T(`spinning`,`
 user-select: none;
 -webkit-user-select: none;
 pointer-events: none;
 opacity: var(--n-opacity-spinning);
 `)])]),N={small:20,medium:18,large:16},P=s({name:`Spin`,props:Object.assign(Object.assign(Object.assign({},k.props),{contentClass:String,contentStyle:[Object,String],description:String,size:{type:[String,Number],default:`medium`},show:{type:Boolean,default:!0},rotate:{type:Boolean,default:!0},spinning:{type:Boolean,validator:()=>!0,default:void 0},delay:Number}),b),slots:Object,setup(e){let{mergedClsPrefixRef:t,inlineThemeDisabled:i}=E(e),o=k(`Spin`,`-spin`,M,j,e,t),s=r(()=>{let{size:t}=e,{common:{cubicBezierEaseInOut:n},self:r}=o.value,{opacitySpinning:i,color:a,textColor:s}=r;return{"--n-bezier":n,"--n-opacity-spinning":i,"--n-size":typeof t==`number`?w(t):r[S(`size`,t)],"--n-color":a,"--n-text-color":s}}),c=i?C(`spin`,r(()=>{let{size:t}=e;return typeof t==`number`?String(t):t[0]}),s,e):void 0,l=_(e,[`spinning`,`show`]),u=a(!1);return n(t=>{let n;if(l.value){let{delay:r}=e;if(r){n=window.setTimeout(()=>{u.value=!0},r),t(()=>{clearTimeout(n)});return}}u.value=l.value}),{mergedClsPrefix:t,active:u,mergedStrokeWidth:r(()=>{let{strokeWidth:t}=e;if(t!==void 0)return t;let{size:n}=e;return N[typeof n==`number`?`medium`:n]}),cssVars:i?void 0:s,themeClass:c?.themeClass,onRender:c?.onRender}},render(){var e;let{$slots:t,mergedClsPrefix:n,description:r}=this,i=t.icon&&this.rotate,a=(r||t.description)&&c(`div`,{class:`${n}-spin-description`},r||t.description?.call(t)),o=t.icon?c(`div`,{class:[`${n}-spin-body`,this.themeClass]},c(`div`,{class:[`${n}-spin`,i&&`${n}-spin--rotate`],style:t.default?``:this.cssVars},t.icon()),a):c(`div`,{class:[`${n}-spin-body`,this.themeClass]},c(O,{clsPrefix:n,style:t.default?``:this.cssVars,stroke:this.stroke,"stroke-width":this.mergedStrokeWidth,radius:this.radius,scale:this.scale,class:`${n}-spin`}),a);return(e=this.onRender)==null||e.call(this),t.default?c(`div`,{class:[`${n}-spin-container`,this.themeClass],style:this.cssVars},c(`div`,{class:[`${n}-spin-content`,this.active&&`${n}-spin-content--spinning`,this.contentClass],style:this.contentStyle},t),c(D,{name:`fade-in-transition`},{default:()=>this.active?o:null})):o}}),F={xmlns:`http://www.w3.org/2000/svg`,"xmlns:xlink":`http://www.w3.org/1999/xlink`,viewBox:`0 0 512 512`},I=s({name:`DocumentTextOutline`,render:function(e,n){return t(),i(`svg`,F,n[0]||=[o(`path`,{d:`M416 221.25V416a48 48 0 0 1-48 48H144a48 48 0 0 1-48-48V96a48 48 0 0 1 48-48h98.75a32 32 0 0 1 22.62 9.37l141.26 141.26a32 32 0 0 1 9.37 22.62z`,fill:`none`,stroke:`currentColor`,"stroke-linejoin":`round`,"stroke-width":`32`},null,-1),o(`path`,{d:`M256 56v120a32 32 0 0 0 32 32h120`,fill:`none`,stroke:`currentColor`,"stroke-linecap":`round`,"stroke-linejoin":`round`,"stroke-width":`32`},null,-1),o(`path`,{fill:`none`,stroke:`currentColor`,"stroke-linecap":`round`,"stroke-linejoin":`round`,"stroke-width":`32`,d:`M176 288h160`},null,-1),o(`path`,{fill:`none`,stroke:`currentColor`,"stroke-linecap":`round`,"stroke-linejoin":`round`,"stroke-width":`32`,d:`M176 368h160`},null,-1)])}}),L=x(`favorites`,()=>{let t=a([]),n=a([]),i=a(new Set),o=a(!1);function s(e){return t.value.filter(t=>t.tags.includes(e))}function c(e){return t.value.filter(t=>t.readingStatus===e)}function _(e){return t.value.some(t=>t.id===e)}function v(e){return t.value.find(t=>t.id===e)?.notes??``}let y=r(()=>i.value.size);async function b(){o.value=!0;try{let[e,r]=await Promise.all([u(),d()]);t.value=e,n.value=r}catch(e){console.error(`Failed to load library:`,e)}finally{o.value=!1}}async function x(e){if(_(e.id))return;let n=new Date,r={...e,tags:[],notes:``,readingStatus:`unread`,addedAt:n,updatedAt:n};await p(r),t.value.push(r)}async function S(e){await l(e),t.value=t.value.filter(t=>t.id!==e),i.value.delete(e)}async function C(e,n){await h(e,{notes:n,updatedAt:new Date});let r=t.value.find(t=>t.id===e);r&&(r.notes=n,r.updatedAt=new Date)}async function w(e,n){await h(e,{readingStatus:n,updatedAt:new Date});let r=t.value.find(t=>t.id===e);r&&(r.readingStatus=n,r.updatedAt=new Date)}async function T(e,n){let r=t.value.find(t=>t.id===e);if(!r||r.tags.includes(n))return;let i=[...r.tags,n];await h(e,{tags:i,updatedAt:new Date}),r.tags=i,r.updatedAt=new Date}async function E(e,n){let r=t.value.find(t=>t.id===e);if(!r)return;let i=r.tags.filter(e=>e!==n);await h(e,{tags:i,updatedAt:new Date}),r.tags=i,r.updatedAt=new Date}async function D(e,t=`#1890ff`){if(n.value.some(t=>t.name===e))return;let r={id:crypto.randomUUID(),name:e,color:t,createdAt:new Date};await f(r),n.value.push(r)}async function O(e){await m(e),n.value=n.value.filter(t=>t.id!==e);let r=t.value.filter(t=>t.tags.includes(e));for(let t of r){let n=t.tags.filter(t=>t!==e);await h(t.id,{tags:n,updatedAt:new Date}),t.tags=n,t.updatedAt=new Date}}function k(e){i.value.has(e)?i.value.delete(e):i.value.add(e),i.value=new Set(i.value)}function A(){i.value=new Set(t.value.map(e=>e.id))}function j(){i.value=new Set}async function M(e){let t=Array.from(i.value);for(let n of t)await T(n,e)}async function N(){let e=Array.from(i.value);for(let t of e)await S(t);i.value=new Set}async function P(e){let n=Array.from(i.value);return I(t.value.filter(e=>n.includes(e.id)),e)}async function F(e){return I(t.value,e)}async function I(t,n){if(n===`json`)return JSON.stringify(t,null,2);let{Cite:r}=await g(async()=>{let{Cite:t}=await import(`./citation-js-CEbIPOCp.js`).then(t=>e(t.default,1));return{Cite:t}},__vite__mapDeps([0,1]),import.meta.url),i=new r;for(let e of t)i.add({type:`article-journal`,title:e.title,author:e.authors.map(e=>({literal:e.name})),issued:e.year?{"date-parts":[[e.year]]}:void 0,DOI:e.doi,"container-title":e.venue,abstract:e.abstract});return i.format(`bibtex`)}return{papers:t,tags:n,selectedPapers:i,loading:o,papersByTag:s,papersByStatus:c,isSaved:_,getPaperNotes:v,selectedCount:y,loadLibrary:b,addPaper:x,removePaper:S,updateNotes:C,updateReadingStatus:w,addTagToPaper:T,removeTagFromPaper:E,createTag:D,deleteTag:O,toggleSelect:k,selectAll:A,deselectAll:j,batchAddTag:M,batchRemove:N,exportSelected:P,exportAll:F}});export{I as n,P as r,L as t};