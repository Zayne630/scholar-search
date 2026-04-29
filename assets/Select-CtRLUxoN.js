import{A as e,C as t,D as n,E as r,F as i,K as a,L as o,T as s,U as c,W as l,at as u,i as d,j as f,k as p,l as m,tt as h,v as g,x as _}from"./runtime-core.esm-bundler-C1tvenqo.js";import{_ as v,a as y,c as b,d as x,f as S,h as C,l as w,m as T,n as E,p as D,s as O,t as k,u as A}from"./Tag-agQvjLW6.js";import{t as j}from"./use-locale-DdLUwkIy.js";import{n as ee}from"./Input-C8WwYzp-.js";import{An as M,Bt as N,Dn as P,F,Fn as I,Gn as te,In as L,It as ne,L as R,Mt as re,Nn as z,Nt as ie,On as B,P as V,Pn as H,Pt as ae,Q as oe,Rt as U,Tn as W,Un as G,V as se,Vt as K,Xt as ce,_n as q,an as le,en as J,et as ue,j as de,jn as Y,kn as fe,mn as pe,pn as me,qt as X,rn as he,rt as ge,tn as Z,x as _e}from"./index-CCQInGbo.js";function Q(e,t){let{target:n}=e;for(;n;){if(n.dataset&&n.dataset[t]!==void 0)return!0;n=n.parentElement}return!1}function ve(e){return e&-e}var ye=class{constructor(e,t){this.l=e,this.min=t;let n=Array(e+1);for(let t=0;t<e+1;++t)n[t]=0;this.ft=n}add(e,t){if(t===0)return;let{l:n,ft:r}=this;for(e+=1;e<=n;)r[e]+=t,e+=ve(e)}get(e){return this.sum(e+1)-this.sum(e)}sum(e){if(e===void 0&&(e=this.l),e<=0)return 0;let{ft:t,min:n,l:r}=this;if(e>r)throw Error("[FinweckTree.sum]: `i` is larger than length.");let i=e*n;for(;e>0;)i+=t[e],e-=ve(e);return i}getBound(e){let t=0,n=this.l;for(;n>t;){let r=Math.floor((t+n)/2),i=this.sum(r);if(i>e){n=r;continue}else if(i<e){if(t===r)return this.sum(t+1)<=e?t+1:r;t=r}else return r}return t}},be;function xe(){return typeof document>`u`?!1:(be===void 0&&(be=`matchMedia`in window?window.matchMedia(`(pointer:coarse)`).matches:!1),be)}var Se;function Ce(){return typeof document>`u`?1:(Se===void 0&&(Se=`chrome`in window?window.devicePixelRatio:1),Se)}var we=`VVirtualListXScroll`;function Te({columnsRef:e,renderColRef:t,renderItemWithColsRef:n}){let r=h(0),a=h(0),o=m(()=>{let t=e.value;if(t.length===0)return null;let n=new ye(t.length,0);return t.forEach((e,t)=>{n.add(t,e.width)}),n});return i(we,{startIndexRef:q(()=>{let e=o.value;return e===null?0:Math.max(e.getBound(a.value)-1,0)}),endIndexRef:q(()=>{let t=o.value;return t===null?0:Math.min(t.getBound(a.value+r.value)+1,e.value.length-1)}),columnsRef:e,renderColRef:t,renderItemWithColsRef:n,getLeft:e=>{let t=o.value;return t===null?0:t.sum(e)}}),{listWidthRef:r,scrollLeftRef:a}}var Ee=g({name:`VirtualListRow`,props:{index:{type:Number,required:!0},item:{type:Object,required:!0}},setup(){let{startIndexRef:e,endIndexRef:n,columnsRef:r,getLeft:i,renderColRef:a,renderItemWithColsRef:o}=t(we);return{startIndex:e,endIndex:n,columns:r,renderCol:a,renderItemWithCols:o,getLeft:i}},render(){let{startIndex:e,endIndex:t,columns:n,renderCol:r,renderItemWithCols:i,getLeft:a,item:o}=this;if(i!=null)return i({itemIndex:this.index,startColIndex:e,endColIndex:t,allColumns:n,item:o,getLeft:a});if(r!=null){let i=[];for(let s=e;s<=t;++s){let e=n[s];i.push(r({column:e,left:a(s),item:o}))}return i}return null}}),De=b(`.v-vl`,{maxHeight:`inherit`,height:`100%`,overflow:`auto`,minWidth:`1px`},[b(`&:not(.v-vl--show-scrollbar)`,{scrollbarWidth:`none`},[b(`&::-webkit-scrollbar, &::-webkit-scrollbar-track-piece, &::-webkit-scrollbar-thumb`,{width:0,height:0,display:`none`})])]),Oe=g({name:`VirtualList`,inheritAttrs:!1,props:{showScrollbar:{type:Boolean,default:!0},columns:{type:Array,default:()=>[]},renderCol:Function,renderItemWithCols:Function,items:{type:Array,default:()=>[]},itemSize:{type:Number,required:!0},itemResizable:Boolean,itemsStyle:[String,Object],visibleItemsTag:{type:[String,Object],default:`div`},visibleItemsProps:Object,ignoreItemResize:Boolean,onScroll:Function,onWheel:Function,onResize:Function,defaultScrollKey:[Number,String],defaultScrollIndex:Number,keyField:{type:String,default:`key`},paddingTop:{type:[Number,String],default:0},paddingBottom:{type:[Number,String],default:0}},setup(t){let r=he();De.mount({id:`vueuc/virtual-list`,head:!0,anchorMetaName:w,ssr:r}),f(()=>{let{defaultScrollIndex:e,defaultScrollKey:n}=t;e==null?n!=null&&C({key:n}):C({index:e})});let i=!1,a=!1;n(()=>{if(i=!1,!a){a=!0;return}C({top:b.value,left:c.value})}),e(()=>{i=!0,a||=!0});let o=q(()=>{if(t.renderCol==null&&t.renderItemWithCols==null||t.columns.length===0)return;let e=0;return t.columns.forEach(t=>{e+=t.width}),e}),s=m(()=>{let e=new Map,{keyField:n}=t;return t.items.forEach((t,r)=>{e.set(t[n],r)}),e}),{scrollLeftRef:c,listWidthRef:l}=Te({columnsRef:u(t,`columns`),renderColRef:u(t,`renderCol`),renderItemWithColsRef:u(t,`renderItemWithCols`)}),d=h(null),p=h(void 0),g=new Map,_=m(()=>{let{items:e,itemSize:n,keyField:r}=t,i=new ye(e.length,n);return e.forEach((e,t)=>{let n=e[r],a=g.get(n);a!==void 0&&i.add(t,a)}),i}),y=h(0),b=h(0),x=q(()=>Math.max(_.value.getBound(b.value-W(t.paddingTop))-1,0)),S=m(()=>{let{value:e}=p;if(e===void 0)return[];let{items:n,itemSize:r}=t,i=x.value,a=Math.min(i+Math.ceil(e/r+1),n.length-1),o=[];for(let e=i;e<=a;++e)o.push(n[e]);return o}),C=(e,t)=>{if(typeof e==`number`){O(e,t,`auto`);return}let{left:n,top:r,index:i,key:a,position:o,behavior:c,debounce:l=!0}=e;if(n!==void 0||r!==void 0)O(n,r,c);else if(i!==void 0)D(i,c,l);else if(a!==void 0){let e=s.value.get(a);e!==void 0&&D(e,c,l)}else o===`bottom`?O(0,2**53-1,c):o===`top`&&O(0,0,c)},T,E=null;function D(e,n,r){let{value:i}=_,a=i.sum(e)+W(t.paddingTop);if(!r)d.value.scrollTo({left:0,top:a,behavior:n});else{T=e,E!==null&&window.clearTimeout(E),E=window.setTimeout(()=>{T=void 0,E=null},16);let{scrollTop:t,offsetHeight:r}=d.value;if(a>t){let o=i.get(e);a+o<=t+r||d.value.scrollTo({left:0,top:a+o-r,behavior:n})}else d.value.scrollTo({left:0,top:a,behavior:n})}}function O(e,t,n){d.value.scrollTo({left:e,top:t,behavior:n})}function k(e,n){if(i||t.ignoreItemResize||F(n.target))return;let{value:r}=_,a=s.value.get(e),o=r.get(a),c=n.borderBoxSize?.[0]?.blockSize??n.contentRect.height;if(c===o)return;c-t.itemSize===0?g.delete(e):g.set(e,c-t.itemSize);let l=c-o;if(l===0)return;r.add(a,l);let u=d.value;if(u!=null){if(T===void 0){let e=r.sum(a);u.scrollTop>e&&u.scrollBy(0,l)}else (a<T||a===T&&c+r.sum(a)>u.scrollTop+u.offsetHeight)&&u.scrollBy(0,l);P()}y.value++}let A=!xe(),j=!1;function ee(e){var n;(n=t.onScroll)==null||n.call(t,e),(!A||!j)&&P()}function M(e){var n;if((n=t.onWheel)==null||n.call(t,e),A){let t=d.value;if(t!=null){if(e.deltaX===0&&(t.scrollTop===0&&e.deltaY<=0||t.scrollTop+t.offsetHeight>=t.scrollHeight&&e.deltaY>=0))return;e.preventDefault(),t.scrollTop+=e.deltaY/Ce(),t.scrollLeft+=e.deltaX/Ce(),P(),j=!0,v(()=>{j=!1})}}}function N(e){if(i||F(e.target))return;if(t.renderCol==null&&t.renderItemWithCols==null){if(e.contentRect.height===p.value)return}else if(e.contentRect.height===p.value&&e.contentRect.width===l.value)return;p.value=e.contentRect.height,l.value=e.contentRect.width;let{onResize:n}=t;n!==void 0&&n(e)}function P(){let{value:e}=d;e!=null&&(b.value=e.scrollTop,c.value=e.scrollLeft)}function F(e){let t=e;for(;t!==null;){if(t.style.display===`none`)return!0;t=t.parentElement}return!1}return{listHeight:p,listStyle:{overflow:`auto`},keyToIndex:s,itemsStyle:m(()=>{let{itemResizable:e}=t,n=B(_.value.sum());return y.value,[t.itemsStyle,{boxSizing:`content-box`,width:B(o.value),height:e?``:n,minHeight:e?n:``,paddingTop:B(t.paddingTop),paddingBottom:B(t.paddingBottom)}]}),visibleItemsStyle:m(()=>(y.value,{transform:`translateY(${B(_.value.sum(x.value))})`})),viewportItems:S,listElRef:d,itemsElRef:h(null),scrollTo:C,handleListResize:N,handleListScroll:ee,handleListWheel:M,handleItemResize:k}},render(){let{itemResizable:e,keyField:t,keyToIndex:n,visibleItemsTag:r}=this;return _(J,{onResize:this.handleListResize},{default:()=>{var i;return _(`div`,s(this.$attrs,{class:[`v-vl`,this.showScrollbar&&`v-vl--show-scrollbar`],onScroll:this.handleListScroll,onWheel:this.handleListWheel,ref:`listElRef`}),[this.items.length===0?(i=this.$slots).empty?.call(i):_(`div`,{ref:`itemsElRef`,class:`v-vl-items`,style:this.itemsStyle},[_(r,Object.assign({class:`v-vl-visible-items`,style:this.visibleItemsStyle},this.visibleItemsProps),{default:()=>{let{renderCol:r,renderItemWithCols:i}=this;return this.viewportItems.map(a=>{let o=a[t],s=n.get(o),c=r==null?void 0:_(Ee,{index:s,item:a}),l=i==null?void 0:_(Ee,{index:s,item:a}),u=this.$slots.default({item:a,renderedCols:c,renderedItemWithCols:l,index:s})[0];return e?_(J,{key:o,onResize:e=>this.handleItemResize(o,e)},{default:()=>u}):(u.key=o,u)})}})])])}})}}),$=`v-hidden`,ke=b(`[v-hidden]`,{display:`none!important`}),Ae=g({name:`Overflow`,props:{getCounter:Function,getTail:Function,updateCounter:Function,onUpdateCount:Function,onUpdateOverflow:Function},setup(e,{slots:t}){let n=h(null),r=h(null);function i(i){let{value:a}=n,{getCounter:o,getTail:s}=e,c;if(c=o===void 0?r.value:o(),!a||!c)return;c.hasAttribute($)&&c.removeAttribute($);let{children:l}=a;if(i.showAllItemsBeforeCalculate)for(let e of l)e.hasAttribute($)&&e.removeAttribute($);let u=a.offsetWidth,d=[],f=t.tail?s?.():null,p=f?f.offsetWidth:0,m=!1,h=a.children.length-+!!t.tail;for(let t=0;t<h-1;++t){if(t<0)continue;let n=l[t];if(m){n.hasAttribute($)||n.setAttribute($,``);continue}else n.hasAttribute($)&&n.removeAttribute($);let r=n.offsetWidth;if(p+=r,d[t]=r,p>u){let{updateCounter:n}=e;for(let r=t;r>=0;--r){let i=h-1-r;n===void 0?c.textContent=`${i}`:n(i);let a=c.offsetWidth;if(p-=d[r],p+a<=u||r===0){m=!0,t=r-1,f&&(t===-1?(f.style.maxWidth=`${u-a}px`,f.style.boxSizing=`border-box`):f.style.maxWidth=``);let{onUpdateCount:n}=e;n&&n(i);break}}}}let{onUpdateOverflow:g}=e;m?g!==void 0&&g(!0):(g!==void 0&&g(!1),c.setAttribute($,``))}let a=he();return ke.mount({id:`vueuc/overflow`,head:!0,anchorMetaName:w,ssr:a}),f(()=>i({showAllItemsBeforeCalculate:!1})),{selfRef:n,counterRef:r,sync:i}},render(){let{$slots:e}=this;return r(()=>this.sync({showAllItemsBeforeCalculate:!1})),_(`div`,{class:`v-overflow`,ref:`selfRef`},[o(e,`default`),e.counter?e.counter():_(`span`,{style:{display:`inline-block`},ref:`counterRef`}),e.tail?e.tail():null])}});function je(e,t){t&&(f(()=>{let{value:n}=e;n&&Z.registerHandler(n,t)}),c(e,(e,t)=>{t&&Z.unregisterHandler(t)},{deep:!1}),p(()=>{let{value:t}=e;t&&Z.unregisterHandler(t)}))}function Me(e){switch(typeof e){case`string`:return e||void 0;case`number`:return String(e);default:return}}function Ne(e){let t=e.filter(e=>e!==void 0);if(t.length!==0)return t.length===1?t[0]:t=>{e.forEach(e=>{e&&e(t)})}}var Pe=g({name:`Checkmark`,render(){return _(`svg`,{xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 16 16`},_(`g`,{fill:`none`},_(`path`,{d:`M14.046 3.486a.75.75 0 0 1-.032 1.06l-7.93 7.474a.85.85 0 0 1-1.188-.022l-2.68-2.72a.75.75 0 1 1 1.068-1.053l2.234 2.267l7.468-7.038a.75.75 0 0 1 1.06.032z`,fill:`currentColor`})))}}),Fe=g({props:{onFocus:Function,onBlur:Function},setup(e){return()=>_(`div`,{style:`width: 0; height: 0`,tabindex:0,onFocus:e.onFocus,onBlur:e.onBlur})}});function Ie(e){return Array.isArray(e)?e:[e]}var Le={STOP:`STOP`};function Re(e,t){let n=t(e);e.children!==void 0&&n!==Le.STOP&&e.children.forEach(e=>Re(e,t))}function ze(e,t={}){let{preserveGroup:n=!1}=t,r=[],i=n?e=>{e.isLeaf||(r.push(e.key),a(e.children))}:e=>{e.isLeaf||(e.isGroup||r.push(e.key),a(e.children))};function a(e){e.forEach(i)}return a(e),r}function Be(e,t){let{isLeaf:n}=e;return n===void 0?!t(e):n}function Ve(e){return e.children}function He(e){return e.key}function Ue(){return!1}function We(e,t){let{isLeaf:n}=e;return!(n===!1&&!Array.isArray(t(e)))}function Ge(e){return e.disabled===!0}function Ke(e,t){return e.isLeaf===!1&&!Array.isArray(t(e))}function qe(e){return e==null?[]:Array.isArray(e)?e:e.checkedKeys??[]}function Je(e){return e==null||Array.isArray(e)?[]:e.indeterminateKeys??[]}function Ye(e,t){let n=new Set(e);return t.forEach(e=>{n.has(e)||n.add(e)}),Array.from(n)}function Xe(e,t){let n=new Set(e);return t.forEach(e=>{n.has(e)&&n.delete(e)}),Array.from(n)}function Ze(e){return e?.type===`group`}function Qe(e){let t=new Map;return e.forEach((e,n)=>{t.set(e.key,n)}),e=>t.get(e)??null}var $e=class extends Error{constructor(){super(),this.message=`SubtreeNotLoadedError: checking a subtree whose required nodes are not fully loaded.`}};function et(e,t,n,r){return it(t.concat(e),n,r,!1)}function tt(e,t){let n=new Set;return e.forEach(e=>{let r=t.treeNodeMap.get(e);if(r!==void 0){let e=r.parent;for(;e!==null&&!(e.disabled||n.has(e.key));)n.add(e.key),e=e.parent}}),n}function nt(e,t,n,r){let i=it(t,n,r,!1),a=it(e,n,r,!0),o=tt(e,n),s=[];return i.forEach(e=>{(a.has(e)||o.has(e))&&s.push(e)}),s.forEach(e=>i.delete(e)),i}function rt(e,t){let{checkedKeys:n,keysToCheck:r,keysToUncheck:i,indeterminateKeys:a,cascade:o,leafOnly:s,checkStrategy:c,allowNotLoaded:l}=e;if(!o)return r===void 0?i===void 0?{checkedKeys:Array.from(n),indeterminateKeys:Array.from(a)}:{checkedKeys:Xe(n,i),indeterminateKeys:Array.from(a)}:{checkedKeys:Ye(n,r),indeterminateKeys:Array.from(a)};let{levelTreeNodeMap:u}=t,d;d=i===void 0?r===void 0?it(n,t,l,!1):et(r,n,t,l):nt(i,n,t,l);let f=c===`parent`,p=c===`child`||s,m=d,h=new Set,g=Math.max.apply(null,Array.from(u.keys()));for(let e=g;e>=0;--e){let t=e===0,n=u.get(e);for(let e of n){if(e.isLeaf)continue;let{key:n,shallowLoaded:r}=e;if(p&&r&&e.children.forEach(e=>{!e.disabled&&!e.isLeaf&&e.shallowLoaded&&m.has(e.key)&&m.delete(e.key)}),e.disabled||!r)continue;let i=!0,a=!1,o=!0;for(let t of e.children){let e=t.key;if(!t.disabled){if(o&&=!1,m.has(e))a=!0;else if(h.has(e)){a=!0,i=!1;break}else if(i=!1,a)break}}i&&!o?(f&&e.children.forEach(e=>{!e.disabled&&m.has(e.key)&&m.delete(e.key)}),m.add(n)):a&&h.add(n),t&&p&&m.has(n)&&m.delete(n)}}return{checkedKeys:Array.from(m),indeterminateKeys:Array.from(h)}}function it(e,t,n,r){let{treeNodeMap:i,getChildren:a}=t,o=new Set,s=new Set(e);return e.forEach(e=>{let t=i.get(e);t!==void 0&&Re(t,e=>{if(e.disabled)return Le.STOP;let{key:t}=e;if(!o.has(t)&&(o.add(t),s.add(t),Ke(e.rawNode,a))){if(r)return Le.STOP;if(!n)throw new $e}})}),s}function at(e,{includeGroup:t=!1,includeSelf:n=!0},r){let i=r.treeNodeMap,a=e==null?null:i.get(e)??null,o={keyPath:[],treeNodePath:[],treeNode:a};if(a?.ignored)return o.treeNode=null,o;for(;a;)!a.ignored&&(t||!a.isGroup)&&o.treeNodePath.push(a),a=a.parent;return o.treeNodePath.reverse(),n||o.treeNodePath.pop(),o.keyPath=o.treeNodePath.map(e=>e.key),o}function ot(e){if(e.length===0)return null;let t=e[0];return t.isGroup||t.ignored||t.disabled?t.getNext():t}function st(e,t){let n=e.siblings,r=n.length,{index:i}=e;return t?n[(i+1)%r]:i===n.length-1?null:n[i+1]}function ct(e,t,{loop:n=!1,includeDisabled:r=!1}={}){let i=t===`prev`?lt:st,a={reverse:t===`prev`},o=!1,s=null;function c(t){if(t!==null){if(t===e){if(!o)o=!0;else if(!e.disabled&&!e.isGroup){s=e;return}}else if((!t.disabled||r)&&!t.ignored&&!t.isGroup){s=t;return}if(t.isGroup){let e=dt(t,a);e===null?c(i(t,n)):s=e}else{let e=i(t,!1);if(e!==null)c(e);else{let e=ut(t);e?.isGroup?c(i(e,n)):n&&c(i(t,!0))}}}}return c(e),s}function lt(e,t){let n=e.siblings,r=n.length,{index:i}=e;return t?n[(i-1+r)%r]:i===0?null:n[i-1]}function ut(e){return e.parent}function dt(e,t={}){let{reverse:n=!1}=t,{children:r}=e;if(r){let{length:e}=r,i=n?e-1:0,a=n?-1:e,o=n?-1:1;for(let e=i;e!==a;e+=o){let n=r[e];if(!n.disabled&&!n.ignored)if(n.isGroup){let e=dt(n,t);if(e!==null)return e}else return n}}return null}var ft={getChild(){return this.ignored?null:dt(this)},getParent(){let{parent:e}=this;return e?.isGroup?e.getParent():e},getNext(e={}){return ct(this,`next`,e)},getPrev(e={}){return ct(this,`prev`,e)}};function pt(e,t){let n=t?new Set(t):void 0,r=[];function i(e){e.forEach(e=>{r.push(e),!(e.isLeaf||!e.children||e.ignored)&&(e.isGroup||n===void 0||n.has(e.key))&&i(e.children)})}return i(e),r}function mt(e,t){let n=e.key;for(;t;){if(t.key===n)return!0;t=t.parent}return!1}function ht(e,t,n,r,i,a=null,o=0){let s=[];return e.forEach((c,l)=>{var u;let d=Object.create(r);if(d.rawNode=c,d.siblings=s,d.level=o,d.index=l,d.isFirstChild=l===0,d.isLastChild=l+1===e.length,d.parent=a,!d.ignored){let e=i(c);Array.isArray(e)&&(d.children=ht(e,t,n,r,i,d,o+1))}s.push(d),t.set(d.key,d),n.has(o)||n.set(o,[]),(u=n.get(o))==null||u.push(d)}),s}function gt(e,t={}){let n=new Map,r=new Map,{getDisabled:i=Ge,getIgnored:a=Ue,getIsGroup:o=Ze,getKey:s=He}=t,c=t.getChildren??Ve,l=t.ignoreEmptyChildren?e=>{let t=c(e);return Array.isArray(t)?t.length?t:null:t}:c,u=ht(e,n,r,Object.assign({get key(){return s(this.rawNode)},get disabled(){return i(this.rawNode)},get isGroup(){return o(this.rawNode)},get isLeaf(){return Be(this.rawNode,l)},get shallowLoaded(){return We(this.rawNode,l)},get ignored(){return a(this.rawNode)},contains(e){return mt(this,e)}},ft),l);function d(e){if(e==null)return null;let t=n.get(e);return t&&!t.isGroup&&!t.ignored?t:null}function f(e){if(e==null)return null;let t=n.get(e);return t&&!t.ignored?t:null}function p(e,t){let n=f(e);return n?n.getPrev(t):null}function m(e,t){let n=f(e);return n?n.getNext(t):null}function h(e){let t=f(e);return t?t.getParent():null}function g(e){let t=f(e);return t?t.getChild():null}let _={treeNodes:u,treeNodeMap:n,levelTreeNodeMap:r,maxLevel:Math.max(...r.keys()),getChildren:l,getFlattenedNodes(e){return pt(u,e)},getNode:d,getPrev:p,getNext:m,getParent:h,getChild:g,getFirstAvailableNode(){return ot(u)},getPath(e,t={}){return at(e,t,_)},getCheckedKeys(e,t={}){let{cascade:n=!0,leafOnly:r=!1,checkStrategy:i=`all`,allowNotLoaded:a=!1}=t;return rt({checkedKeys:qe(e),indeterminateKeys:Je(e),cascade:n,leafOnly:r,checkStrategy:i,allowNotLoaded:a},_)},check(e,t,n={}){let{cascade:r=!0,leafOnly:i=!1,checkStrategy:a=`all`,allowNotLoaded:o=!1}=n;return rt({checkedKeys:qe(t),indeterminateKeys:Je(t),keysToCheck:e==null?[]:Ie(e),cascade:r,leafOnly:i,checkStrategy:a,allowNotLoaded:o},_)},uncheck(e,t,n={}){let{cascade:r=!0,leafOnly:i=!1,checkStrategy:a=`all`,allowNotLoaded:o=!1}=n;return rt({checkedKeys:qe(t),indeterminateKeys:Je(t),keysToUncheck:e==null?[]:Ie(e),cascade:r,leafOnly:i,checkStrategy:a,allowNotLoaded:o},_)},getNonLeafKeys(e={}){return ze(u,e)}};return _}var _t=g({name:`NBaseSelectGroupHeader`,props:{clsPrefix:{type:String,required:!0},tmNode:{type:Object,required:!0}},setup(){let{renderLabelRef:e,renderOptionRef:n,labelFieldRef:r,nodePropsRef:i}=t(T);return{labelField:r,nodeProps:i,renderLabel:e,renderOption:n}},render(){let{clsPrefix:e,renderLabel:t,renderOption:n,nodeProps:r,tmNode:{rawNode:i}}=this,a=r?.(i),o=t?t(i,!1):K(i[this.labelField],i,!1),s=_(`div`,Object.assign({},a,{class:[`${e}-base-select-group-header`,a?.class]}),o);return i.render?i.render({node:s,option:i}):n?n({node:s,option:i,selected:!1}):s}});function vt(e,t){return _(G,{name:`fade-in-scale-up-transition`},{default:()=>e?_(oe,{clsPrefix:t,class:`${t}-base-select-option__check`},{default:()=>_(Pe)}):null})}var yt=g({name:`NBaseSelectOption`,props:{clsPrefix:{type:String,required:!0},tmNode:{type:Object,required:!0}},setup(e){let{valueRef:n,pendingTmNodeRef:r,multipleRef:i,valueSetRef:a,renderLabelRef:o,renderOptionRef:s,labelFieldRef:c,valueFieldRef:l,showCheckmarkRef:u,nodePropsRef:d,handleOptionClick:f,handleOptionMouseEnter:p}=t(T),m=q(()=>{let{value:t}=r;return t?e.tmNode.key===t.key:!1});function h(t){let{tmNode:n}=e;n.disabled||f(t,n)}function g(t){let{tmNode:n}=e;n.disabled||p(t,n)}function _(t){let{tmNode:n}=e,{value:r}=m;n.disabled||r||p(t,n)}return{multiple:i,isGrouped:q(()=>{let{tmNode:t}=e,{parent:n}=t;return n&&n.rawNode.type===`group`}),showCheckmark:u,nodeProps:d,isPending:m,isSelected:q(()=>{let{value:t}=n,{value:r}=i;if(t===null)return!1;let o=e.tmNode.rawNode[l.value];if(r){let{value:e}=a;return e.has(o)}else return t===o}),labelField:c,renderLabel:o,renderOption:s,handleMouseMove:_,handleMouseEnter:g,handleClick:h}},render(){let{clsPrefix:e,tmNode:{rawNode:t},isSelected:n,isPending:r,isGrouped:i,showCheckmark:a,nodeProps:o,renderOption:s,renderLabel:c,handleClick:l,handleMouseEnter:u,handleMouseMove:d}=this,f=vt(n,e),p=c?[c(t,n),a&&f]:[K(t[this.labelField],t,n),a&&f],m=o?.(t),h=_(`div`,Object.assign({},m,{class:[`${e}-base-select-option`,t.class,m?.class,{[`${e}-base-select-option--disabled`]:t.disabled,[`${e}-base-select-option--selected`]:n,[`${e}-base-select-option--grouped`]:i,[`${e}-base-select-option--pending`]:r,[`${e}-base-select-option--show-checkmark`]:a}],style:[m?.style||``,t.style||``],onClick:Ne([l,m?.onClick]),onMouseenter:Ne([u,m?.onMouseenter]),onMousemove:Ne([d,m?.onMousemove])}),_(`div`,{class:`${e}-base-select-option__content`},p));return t.render?t.render({node:h,option:t,selected:n}):s?s({node:h,option:t,selected:n}):h}}),bt=Y(`base-select-menu`,`
 line-height: 1.5;
 outline: none;
 z-index: 0;
 position: relative;
 border-radius: var(--n-border-radius);
 transition:
 background-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 background-color: var(--n-color);
`,[Y(`scrollbar`,`
 max-height: var(--n-height);
 `),Y(`virtual-list`,`
 max-height: var(--n-height);
 `),Y(`base-select-option`,`
 min-height: var(--n-option-height);
 font-size: var(--n-option-font-size);
 display: flex;
 align-items: center;
 `,[z(`content`,`
 z-index: 1;
 white-space: nowrap;
 text-overflow: ellipsis;
 overflow: hidden;
 `)]),Y(`base-select-group-header`,`
 min-height: var(--n-option-height);
 font-size: .93em;
 display: flex;
 align-items: center;
 `),Y(`base-select-menu-option-wrapper`,`
 position: relative;
 width: 100%;
 `),z(`loading, empty`,`
 display: flex;
 padding: 12px 32px;
 flex: 1;
 justify-content: center;
 `),z(`loading`,`
 color: var(--n-loading-color);
 font-size: var(--n-loading-size);
 `),z(`header`,`
 padding: 8px var(--n-option-padding-left);
 font-size: var(--n-option-font-size);
 transition: 
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 border-bottom: 1px solid var(--n-action-divider-color);
 color: var(--n-action-text-color);
 `),z(`action`,`
 padding: 8px var(--n-option-padding-left);
 font-size: var(--n-option-font-size);
 transition: 
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 border-top: 1px solid var(--n-action-divider-color);
 color: var(--n-action-text-color);
 `),Y(`base-select-group-header`,`
 position: relative;
 cursor: default;
 padding: var(--n-option-padding);
 color: var(--n-group-header-text-color);
 `),Y(`base-select-option`,`
 cursor: pointer;
 position: relative;
 padding: var(--n-option-padding);
 transition:
 color .3s var(--n-bezier),
 opacity .3s var(--n-bezier);
 box-sizing: border-box;
 color: var(--n-option-text-color);
 opacity: 1;
 `,[H(`show-checkmark`,`
 padding-right: calc(var(--n-option-padding-right) + 20px);
 `),M(`&::before`,`
 content: "";
 position: absolute;
 left: 4px;
 right: 4px;
 top: 0;
 bottom: 0;
 border-radius: var(--n-border-radius);
 transition: background-color .3s var(--n-bezier);
 `),M(`&:active`,`
 color: var(--n-option-text-color-pressed);
 `),H(`grouped`,`
 padding-left: calc(var(--n-option-padding-left) * 1.5);
 `),H(`pending`,[M(`&::before`,`
 background-color: var(--n-option-color-pending);
 `)]),H(`selected`,`
 color: var(--n-option-text-color-active);
 `,[M(`&::before`,`
 background-color: var(--n-option-color-active);
 `),H(`pending`,[M(`&::before`,`
 background-color: var(--n-option-color-active-pending);
 `)])]),H(`disabled`,`
 cursor: not-allowed;
 `,[I(`selected`,`
 color: var(--n-option-text-color-disabled);
 `),H(`selected`,`
 opacity: var(--n-option-opacity-disabled);
 `)]),z(`check`,`
 font-size: 16px;
 position: absolute;
 right: calc(var(--n-option-padding-right) - 4px);
 top: calc(50% - 7px);
 color: var(--n-option-check-color);
 transition: color .3s var(--n-bezier);
 `,[V({enterScale:`0.5`})])])]),xt=g({name:`InternalSelectMenu`,props:Object.assign(Object.assign({},ue.props),{clsPrefix:{type:String,required:!0},scrollable:{type:Boolean,default:!0},treeMate:{type:Object,required:!0},multiple:Boolean,size:{type:String,default:`medium`},value:{type:[String,Number,Array],default:null},autoPending:Boolean,virtualScroll:{type:Boolean,default:!0},show:{type:Boolean,default:!0},labelField:{type:String,default:`label`},valueField:{type:String,default:`value`},loading:Boolean,focusable:Boolean,renderLabel:Function,renderOption:Function,nodeProps:Function,showCheckmark:{type:Boolean,default:!0},onMousedown:Function,onScroll:Function,onFocus:Function,onBlur:Function,onKeyup:Function,onKeydown:Function,onTabOut:Function,onMouseenter:Function,onMouseleave:Function,onResize:Function,resetMenuOnOptionsChange:{type:Boolean,default:!0},inlineThemeDisabled:Boolean,scrollbarProps:Object,onToggle:Function}),setup(e){let{mergedClsPrefixRef:t,mergedRtlRef:n,mergedComponentPropsRef:a}=ae(e),o=ge(`InternalSelectMenu`,n,t),s=ue(`InternalSelectMenu`,`-internal-select-menu`,bt,F,e,u(e,`clsPrefix`)),l=h(null),d=h(null),g=h(null),_=m(()=>e.treeMate.getFlattenedNodes()),v=m(()=>Qe(_.value)),y=h(null);function b(){let{treeMate:t}=e,n=null,{value:r}=e;r===null?n=t.getFirstAvailableNode():(n=e.multiple?t.getNode((r||[])[(r||[]).length-1]):t.getNode(r),(!n||n.disabled)&&(n=t.getFirstAvailableNode())),V(n||null)}function x(){let{value:t}=y;t&&!e.treeMate.getNode(t.key)&&(y.value=null)}let S;c(()=>e.show,t=>{t?S=c(()=>e.treeMate,()=>{e.resetMenuOnOptionsChange?(e.autoPending?b():x(),r(H)):x()},{immediate:!0}):S?.()},{immediate:!0}),p(()=>{S?.()});let C=m(()=>W(s.value.self[L(`optionHeight`,e.size)])),w=m(()=>P(s.value.self[L(`padding`,e.size)])),E=m(()=>e.multiple&&Array.isArray(e.value)?new Set(e.value):new Set),O=m(()=>{let e=_.value;return e&&e.length===0}),k=m(()=>a?.value?.Select?.renderEmpty);function A(t){let{onToggle:n}=e;n&&n(t)}function j(t){let{onScroll:n}=e;n&&n(t)}function ee(e){var t;(t=g.value)==null||t.sync(),j(e)}function M(){var e;(e=g.value)==null||e.sync()}function N(){let{value:e}=y;return e||null}function I(e,t){t.disabled||V(t,!1)}function te(e,t){t.disabled||A(t)}function ne(t){var n;Q(t,`action`)||(n=e.onKeyup)==null||n.call(e,t)}function R(t){var n;Q(t,`action`)||(n=e.onKeydown)==null||n.call(e,t)}function re(t){var n;(n=e.onMousedown)==null||n.call(e,t),!e.focusable&&t.preventDefault()}function z(){let{value:e}=y;e&&V(e.getNext({loop:!0}),!0)}function B(){let{value:e}=y;e&&V(e.getPrev({loop:!0}),!0)}function V(e,t=!1){y.value=e,t&&H()}function H(){var t,n;let r=y.value;if(!r)return;let i=v.value(r.key);i!==null&&(e.virtualScroll?(t=d.value)==null||t.scrollTo({index:i}):(n=g.value)==null||n.scrollTo({index:i,elSize:C.value}))}function oe(t){var n;l.value?.contains(t.target)&&((n=e.onFocus)==null||n.call(e,t))}function U(t){var n;l.value?.contains(t.relatedTarget)||(n=e.onBlur)==null||n.call(e,t)}i(T,{handleOptionMouseEnter:I,handleOptionClick:te,valueSetRef:E,pendingTmNodeRef:y,nodePropsRef:u(e,`nodeProps`),showCheckmarkRef:u(e,`showCheckmark`),multipleRef:u(e,`multiple`),valueRef:u(e,`value`),renderLabelRef:u(e,`renderLabel`),renderOptionRef:u(e,`renderOption`),labelFieldRef:u(e,`labelField`),valueFieldRef:u(e,`valueField`)}),i(D,l),f(()=>{let{value:e}=g;e&&e.sync()});let G=m(()=>{let{size:t}=e,{common:{cubicBezierEaseInOut:n},self:{height:r,borderRadius:i,color:a,groupHeaderTextColor:o,actionDividerColor:c,optionTextColorPressed:l,optionTextColor:u,optionTextColorDisabled:d,optionTextColorActive:f,optionOpacityDisabled:p,optionCheckColor:m,actionTextColor:h,optionColorPending:g,optionColorActive:_,loadingColor:v,loadingSize:y,optionColorActivePending:b,[L(`optionFontSize`,t)]:x,[L(`optionHeight`,t)]:S,[L(`optionPadding`,t)]:C}}=s.value;return{"--n-height":r,"--n-action-divider-color":c,"--n-action-text-color":h,"--n-bezier":n,"--n-border-radius":i,"--n-color":a,"--n-option-font-size":x,"--n-group-header-text-color":o,"--n-option-check-color":m,"--n-option-color-pending":g,"--n-option-color-active":_,"--n-option-color-active-pending":b,"--n-option-height":S,"--n-option-opacity-disabled":p,"--n-option-text-color":u,"--n-option-text-color-active":f,"--n-option-text-color-disabled":d,"--n-option-text-color-pressed":l,"--n-option-padding":C,"--n-option-padding-left":P(C,`left`),"--n-option-padding-right":P(C,`right`),"--n-loading-color":v,"--n-loading-size":y}}),{inlineThemeDisabled:se}=e,K=se?ie(`internal-select-menu`,m(()=>e.size[0]),G,e):void 0,ce={selfRef:l,next:z,prev:B,getPendingTmNode:N};return je(l,e.onResize),Object.assign({mergedTheme:s,mergedClsPrefix:t,rtlEnabled:o,virtualListRef:d,scrollbarRef:g,itemSize:C,padding:w,flattenedNodes:_,empty:O,mergedRenderEmpty:k,virtualListContainer(){let{value:e}=d;return e?.listElRef},virtualListContent(){let{value:e}=d;return e?.itemsElRef},doScroll:j,handleFocusin:oe,handleFocusout:U,handleKeyUp:ne,handleKeyDown:R,handleMouseDown:re,handleVirtualListResize:M,handleVirtualListScroll:ee,cssVars:se?void 0:G,themeClass:K?.themeClass,onRender:K?.onRender},ce)},render(){let{$slots:e,virtualScroll:t,clsPrefix:n,mergedTheme:r,themeClass:i,onRender:a}=this;return a?.(),_(`div`,{ref:`selfRef`,tabindex:this.focusable?0:-1,class:[`${n}-base-select-menu`,`${n}-base-select-menu--${this.size}-size`,this.rtlEnabled&&`${n}-base-select-menu--rtl`,i,this.multiple&&`${n}-base-select-menu--multiple`],style:this.cssVars,onFocusin:this.handleFocusin,onFocusout:this.handleFocusout,onKeyup:this.handleKeyUp,onKeydown:this.handleKeyDown,onMousedown:this.handleMouseDown,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},N(e.header,e=>e&&_(`div`,{class:`${n}-base-select-menu__header`,"data-header":!0,key:`header`},e)),this.loading?_(`div`,{class:`${n}-base-select-menu__loading`},_(se,{clsPrefix:n,strokeWidth:20})):this.empty?_(`div`,{class:`${n}-base-select-menu__empty`,"data-empty":!0},U(e.empty,()=>[this.mergedRenderEmpty?.call(this)||_(y,{theme:r.peers.Empty,themeOverrides:r.peerOverrides.Empty,size:this.size})])):_(R,Object.assign({ref:`scrollbarRef`,theme:r.peers.Scrollbar,themeOverrides:r.peerOverrides.Scrollbar,scrollable:this.scrollable,container:t?this.virtualListContainer:void 0,content:t?this.virtualListContent:void 0,onScroll:t?void 0:this.doScroll},this.scrollbarProps),{default:()=>t?_(Oe,{ref:`virtualListRef`,class:`${n}-virtual-list`,items:this.flattenedNodes,itemSize:this.itemSize,showScrollbar:!1,paddingTop:this.padding.top,paddingBottom:this.padding.bottom,onResize:this.handleVirtualListResize,onScroll:this.handleVirtualListScroll,itemResizable:!0},{default:({item:e})=>e.isGroup?_(_t,{key:e.key,clsPrefix:n,tmNode:e}):e.ignored?null:_(yt,{clsPrefix:n,key:e.key,tmNode:e})}):_(`div`,{class:`${n}-base-select-menu-option-wrapper`,style:{paddingTop:this.padding.top,paddingBottom:this.padding.bottom}},this.flattenedNodes.map(e=>e.isGroup?_(_t,{key:e.key,clsPrefix:n,tmNode:e}):_(yt,{clsPrefix:n,key:e.key,tmNode:e})))}),N(e.action,e=>e&&[_(`div`,{class:`${n}-base-select-menu__action`,"data-action":!0,key:`action`},e),_(Fe,{onFocus:this.onTabOut,key:`focus-detector`})]))}}),St=M([Y(`base-selection`,`
 --n-padding-single: var(--n-padding-single-top) var(--n-padding-single-right) var(--n-padding-single-bottom) var(--n-padding-single-left);
 --n-padding-multiple: var(--n-padding-multiple-top) var(--n-padding-multiple-right) var(--n-padding-multiple-bottom) var(--n-padding-multiple-left);
 position: relative;
 z-index: auto;
 box-shadow: none;
 width: 100%;
 max-width: 100%;
 display: inline-block;
 vertical-align: bottom;
 border-radius: var(--n-border-radius);
 min-height: var(--n-height);
 line-height: 1.5;
 font-size: var(--n-font-size);
 `,[Y(`base-loading`,`
 color: var(--n-loading-color);
 `),Y(`base-selection-tags`,`min-height: var(--n-height);`),z(`border, state-border`,`
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 pointer-events: none;
 border: var(--n-border);
 border-radius: inherit;
 transition:
 box-shadow .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `),z(`state-border`,`
 z-index: 1;
 border-color: #0000;
 `),Y(`base-suffix`,`
 cursor: pointer;
 position: absolute;
 top: 50%;
 transform: translateY(-50%);
 right: 10px;
 `,[z(`arrow`,`
 font-size: var(--n-arrow-size);
 color: var(--n-arrow-color);
 transition: color .3s var(--n-bezier);
 `)]),Y(`base-selection-overlay`,`
 display: flex;
 align-items: center;
 white-space: nowrap;
 pointer-events: none;
 position: absolute;
 top: 0;
 right: 0;
 bottom: 0;
 left: 0;
 padding: var(--n-padding-single);
 transition: color .3s var(--n-bezier);
 `,[z(`wrapper`,`
 flex-basis: 0;
 flex-grow: 1;
 overflow: hidden;
 text-overflow: ellipsis;
 `)]),Y(`base-selection-placeholder`,`
 color: var(--n-placeholder-color);
 `,[z(`inner`,`
 max-width: 100%;
 overflow: hidden;
 `)]),Y(`base-selection-tags`,`
 cursor: pointer;
 outline: none;
 box-sizing: border-box;
 position: relative;
 z-index: auto;
 display: flex;
 padding: var(--n-padding-multiple);
 flex-wrap: wrap;
 align-items: center;
 width: 100%;
 vertical-align: bottom;
 background-color: var(--n-color);
 border-radius: inherit;
 transition:
 color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `),Y(`base-selection-label`,`
 height: var(--n-height);
 display: inline-flex;
 width: 100%;
 vertical-align: bottom;
 cursor: pointer;
 outline: none;
 z-index: auto;
 box-sizing: border-box;
 position: relative;
 transition:
 color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 border-radius: inherit;
 background-color: var(--n-color);
 align-items: center;
 `,[Y(`base-selection-input`,`
 font-size: inherit;
 line-height: inherit;
 outline: none;
 cursor: pointer;
 box-sizing: border-box;
 border:none;
 width: 100%;
 padding: var(--n-padding-single);
 background-color: #0000;
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 caret-color: var(--n-caret-color);
 `,[z(`content`,`
 text-overflow: ellipsis;
 overflow: hidden;
 white-space: nowrap; 
 `)]),z(`render-label`,`
 color: var(--n-text-color);
 `)]),I(`disabled`,[M(`&:hover`,[z(`state-border`,`
 box-shadow: var(--n-box-shadow-hover);
 border: var(--n-border-hover);
 `)]),H(`focus`,[z(`state-border`,`
 box-shadow: var(--n-box-shadow-focus);
 border: var(--n-border-focus);
 `)]),H(`active`,[z(`state-border`,`
 box-shadow: var(--n-box-shadow-active);
 border: var(--n-border-active);
 `),Y(`base-selection-label`,`background-color: var(--n-color-active);`),Y(`base-selection-tags`,`background-color: var(--n-color-active);`)])]),H(`disabled`,`cursor: not-allowed;`,[z(`arrow`,`
 color: var(--n-arrow-color-disabled);
 `),Y(`base-selection-label`,`
 cursor: not-allowed;
 background-color: var(--n-color-disabled);
 `,[Y(`base-selection-input`,`
 cursor: not-allowed;
 color: var(--n-text-color-disabled);
 `),z(`render-label`,`
 color: var(--n-text-color-disabled);
 `)]),Y(`base-selection-tags`,`
 cursor: not-allowed;
 background-color: var(--n-color-disabled);
 `),Y(`base-selection-placeholder`,`
 cursor: not-allowed;
 color: var(--n-placeholder-color-disabled);
 `)]),Y(`base-selection-input-tag`,`
 height: calc(var(--n-height) - 6px);
 line-height: calc(var(--n-height) - 6px);
 outline: none;
 display: none;
 position: relative;
 margin-bottom: 3px;
 max-width: 100%;
 vertical-align: bottom;
 `,[z(`input`,`
 font-size: inherit;
 font-family: inherit;
 min-width: 1px;
 padding: 0;
 background-color: #0000;
 outline: none;
 border: none;
 max-width: 100%;
 overflow: hidden;
 width: 1em;
 line-height: inherit;
 cursor: pointer;
 color: var(--n-text-color);
 caret-color: var(--n-caret-color);
 `),z(`mirror`,`
 position: absolute;
 left: 0;
 top: 0;
 white-space: pre;
 visibility: hidden;
 user-select: none;
 -webkit-user-select: none;
 opacity: 0;
 `)]),[`warning`,`error`].map(e=>H(`${e}-status`,[z(`state-border`,`border: var(--n-border-${e});`),I(`disabled`,[M(`&:hover`,[z(`state-border`,`
 box-shadow: var(--n-box-shadow-hover-${e});
 border: var(--n-border-hover-${e});
 `)]),H(`active`,[z(`state-border`,`
 box-shadow: var(--n-box-shadow-active-${e});
 border: var(--n-border-active-${e});
 `),Y(`base-selection-label`,`background-color: var(--n-color-active-${e});`),Y(`base-selection-tags`,`background-color: var(--n-color-active-${e});`)]),H(`focus`,[z(`state-border`,`
 box-shadow: var(--n-box-shadow-focus-${e});
 border: var(--n-border-focus-${e});
 `)])])]))]),Y(`base-selection-popover`,`
 margin-bottom: -3px;
 display: flex;
 flex-wrap: wrap;
 margin-right: -8px;
 `),Y(`base-selection-tag-wrapper`,`
 max-width: 100%;
 display: inline-flex;
 padding: 0 7px 3px 0;
 `,[M(`&:last-child`,`padding-right: 0;`),Y(`tag`,`
 font-size: 14px;
 max-width: 100%;
 `,[z(`content`,`
 line-height: 1.25;
 text-overflow: ellipsis;
 overflow: hidden;
 `)])])]),Ct=g({name:`InternalSelection`,props:Object.assign(Object.assign({},ue.props),{clsPrefix:{type:String,required:!0},bordered:{type:Boolean,default:void 0},active:Boolean,pattern:{type:String,default:``},placeholder:String,selectedOption:{type:Object,default:null},selectedOptions:{type:Array,default:null},labelField:{type:String,default:`label`},valueField:{type:String,default:`value`},multiple:Boolean,filterable:Boolean,clearable:Boolean,disabled:Boolean,size:{type:String,default:`medium`},loading:Boolean,autofocus:Boolean,showArrow:{type:Boolean,default:!0},inputProps:Object,focused:Boolean,renderTag:Function,onKeydown:Function,onClick:Function,onBlur:Function,onFocus:Function,onDeleteOption:Function,maxTagCount:[String,Number],ellipsisTagPopoverProps:Object,onClear:Function,onPatternInput:Function,onPatternFocus:Function,onPatternBlur:Function,renderLabel:Function,status:String,inlineThemeDisabled:Boolean,ignoreComposition:{type:Boolean,default:!0},onResize:Function}),setup(e){let{mergedClsPrefixRef:t,mergedRtlRef:n}=ae(e),i=ge(`InternalSelection`,n,t),a=h(null),o=h(null),s=h(null),d=h(null),p=h(null),g=h(null),_=h(null),v=h(null),y=h(null),b=h(null),x=h(!1),S=h(!1),C=h(!1),w=ue(`InternalSelection`,`-internal-selection`,St,de,e,u(e,`clsPrefix`)),T=m(()=>e.clearable&&!e.disabled&&(C.value||e.active)),E=m(()=>e.selectedOption?e.renderTag?e.renderTag({option:e.selectedOption,handleClose:()=>{}}):e.renderLabel?e.renderLabel(e.selectedOption,!0):K(e.selectedOption[e.labelField],e.selectedOption,!0):e.placeholder),D=m(()=>{let t=e.selectedOption;if(t)return t[e.labelField]}),O=m(()=>e.multiple?!!(Array.isArray(e.selectedOptions)&&e.selectedOptions.length):e.selectedOption!==null);function k(){var t;let{value:n}=a;if(n){let{value:r}=o;r&&(r.style.width=`${n.offsetWidth}px`,e.maxTagCount!==`responsive`&&((t=y.value)==null||t.sync({showAllItemsBeforeCalculate:!1})))}}function A(){let{value:e}=b;e&&(e.style.display=`none`)}function j(){let{value:e}=b;e&&(e.style.display=`inline-block`)}c(u(e,`active`),e=>{e||A()}),c(u(e,`pattern`),()=>{e.multiple&&r(k)});function ee(t){let{onFocus:n}=e;n&&n(t)}function M(t){let{onBlur:n}=e;n&&n(t)}function N(t){let{onDeleteOption:n}=e;n&&n(t)}function F(t){let{onClear:n}=e;n&&n(t)}function I(t){let{onPatternInput:n}=e;n&&n(t)}function te(e){(!e.relatedTarget||!s.value?.contains(e.relatedTarget))&&ee(e)}function ne(e){s.value?.contains(e.relatedTarget)||M(e)}function R(e){F(e)}function re(){C.value=!0}function z(){C.value=!1}function B(t){!e.active||!e.filterable||t.target!==o.value&&t.preventDefault()}function V(e){N(e)}let H=h(!1);function oe(t){if(t.key===`Backspace`&&!H.value&&!e.pattern.length){let{selectedOptions:t}=e;t?.length&&V(t[t.length-1])}}let U=null;function W(t){let{value:n}=a;n&&(n.textContent=t.target.value,k()),e.ignoreComposition&&H.value?U=t:I(t)}function G(){H.value=!0}function se(){H.value=!1,e.ignoreComposition&&I(U),U=null}function ce(t){var n;S.value=!0,(n=e.onPatternFocus)==null||n.call(e,t)}function q(t){var n;S.value=!1,(n=e.onPatternBlur)==null||n.call(e,t)}function le(){var t,n;if(e.filterable)S.value=!1,(t=g.value)==null||t.blur(),(n=o.value)==null||n.blur();else if(e.multiple){let{value:e}=d;e?.blur()}else{let{value:e}=p;e?.blur()}}function J(){var t,n,r;e.filterable?(S.value=!1,(t=g.value)==null||t.focus()):e.multiple?(n=d.value)==null||n.focus():(r=p.value)==null||r.focus()}function Y(){let{value:e}=o;e&&(j(),e.focus())}function fe(){let{value:e}=o;e&&e.blur()}function pe(e){let{value:t}=_;t&&t.setTextContent(`+${e}`)}function me(){let{value:e}=v;return e}function X(){return o.value}let he=null;function Z(){he!==null&&window.clearTimeout(he)}function _e(){e.active||(Z(),he=window.setTimeout(()=>{O.value&&(x.value=!0)},100))}function Q(){Z()}function ve(e){e||(Z(),x.value=!1)}c(O,e=>{e||(x.value=!1)}),f(()=>{l(()=>{let t=g.value;t&&(e.disabled?t.removeAttribute(`tabindex`):t.tabIndex=S.value?-1:0)})}),je(s,e.onResize);let{inlineThemeDisabled:ye}=e,be=m(()=>{let{size:t}=e,{common:{cubicBezierEaseInOut:n},self:{fontWeight:r,borderRadius:i,color:a,placeholderColor:o,textColor:s,paddingSingle:c,paddingMultiple:l,caretColor:u,colorDisabled:d,textColorDisabled:f,placeholderColorDisabled:p,colorActive:m,boxShadowFocus:h,boxShadowActive:g,boxShadowHover:_,border:v,borderFocus:y,borderHover:b,borderActive:x,arrowColor:S,arrowColorDisabled:C,loadingColor:T,colorActiveWarning:E,boxShadowFocusWarning:D,boxShadowActiveWarning:O,boxShadowHoverWarning:k,borderWarning:A,borderFocusWarning:j,borderHoverWarning:ee,borderActiveWarning:M,colorActiveError:N,boxShadowFocusError:F,boxShadowActiveError:I,boxShadowHoverError:te,borderError:ne,borderFocusError:R,borderHoverError:re,borderActiveError:z,clearColor:ie,clearColorHover:B,clearColorPressed:V,clearSize:H,arrowSize:ae,[L(`height`,t)]:oe,[L(`fontSize`,t)]:U}}=w.value,W=P(c),G=P(l);return{"--n-bezier":n,"--n-border":v,"--n-border-active":x,"--n-border-focus":y,"--n-border-hover":b,"--n-border-radius":i,"--n-box-shadow-active":g,"--n-box-shadow-focus":h,"--n-box-shadow-hover":_,"--n-caret-color":u,"--n-color":a,"--n-color-active":m,"--n-color-disabled":d,"--n-font-size":U,"--n-height":oe,"--n-padding-single-top":W.top,"--n-padding-multiple-top":G.top,"--n-padding-single-right":W.right,"--n-padding-multiple-right":G.right,"--n-padding-single-left":W.left,"--n-padding-multiple-left":G.left,"--n-padding-single-bottom":W.bottom,"--n-padding-multiple-bottom":G.bottom,"--n-placeholder-color":o,"--n-placeholder-color-disabled":p,"--n-text-color":s,"--n-text-color-disabled":f,"--n-arrow-color":S,"--n-arrow-color-disabled":C,"--n-loading-color":T,"--n-color-active-warning":E,"--n-box-shadow-focus-warning":D,"--n-box-shadow-active-warning":O,"--n-box-shadow-hover-warning":k,"--n-border-warning":A,"--n-border-focus-warning":j,"--n-border-hover-warning":ee,"--n-border-active-warning":M,"--n-color-active-error":N,"--n-box-shadow-focus-error":F,"--n-box-shadow-active-error":I,"--n-box-shadow-hover-error":te,"--n-border-error":ne,"--n-border-focus-error":R,"--n-border-hover-error":re,"--n-border-active-error":z,"--n-clear-size":H,"--n-clear-color":ie,"--n-clear-color-hover":B,"--n-clear-color-pressed":V,"--n-arrow-size":ae,"--n-font-weight":r}}),xe=ye?ie(`internal-selection`,m(()=>e.size[0]),be,e):void 0;return{mergedTheme:w,mergedClearable:T,mergedClsPrefix:t,rtlEnabled:i,patternInputFocused:S,filterablePlaceholder:E,label:D,selected:O,showTagsPanel:x,isComposing:H,counterRef:_,counterWrapperRef:v,patternInputMirrorRef:a,patternInputRef:o,selfRef:s,multipleElRef:d,singleElRef:p,patternInputWrapperRef:g,overflowRef:y,inputTagElRef:b,handleMouseDown:B,handleFocusin:te,handleClear:R,handleMouseEnter:re,handleMouseLeave:z,handleDeleteOption:V,handlePatternKeyDown:oe,handlePatternInputInput:W,handlePatternInputBlur:q,handlePatternInputFocus:ce,handleMouseEnterCounter:_e,handleMouseLeaveCounter:Q,handleFocusout:ne,handleCompositionEnd:se,handleCompositionStart:G,onPopoverUpdateShow:ve,focus:J,focusInput:Y,blur:le,blurInput:fe,updateCounter:pe,getCounter:me,getTail:X,renderLabel:e.renderLabel,cssVars:ye?void 0:be,themeClass:xe?.themeClass,onRender:xe?.onRender}},render(){let{status:e,multiple:t,size:n,disabled:r,filterable:i,maxTagCount:a,bordered:o,clsPrefix:s,ellipsisTagPopoverProps:c,onRender:l,renderTag:u,renderLabel:f}=this;l?.();let p=a===`responsive`,m=typeof a==`number`,h=p||m,g=_(ne,null,{default:()=>_(ee,{clsPrefix:s,loading:this.loading,showArrow:this.showArrow,showClear:this.mergedClearable&&this.selected,onClear:this.handleClear},{default:()=>{var e;return(e=this.$slots).arrow?.call(e)}})}),v;if(t){let{labelField:e}=this,t=t=>_(`div`,{class:`${s}-base-selection-tag-wrapper`,key:t.value},u?u({option:t,handleClose:()=>{this.handleDeleteOption(t)}}):_(k,{size:n,closable:!t.disabled,disabled:r,onClose:()=>{this.handleDeleteOption(t)},internalCloseIsButtonTag:!1,internalCloseFocusable:!1},{default:()=>f?f(t,!0):K(t[e],t,!0)})),o=()=>(m?this.selectedOptions.slice(0,a):this.selectedOptions).map(t),l=i?_(`div`,{class:`${s}-base-selection-input-tag`,ref:`inputTagElRef`,key:`__input-tag__`},_(`input`,Object.assign({},this.inputProps,{ref:`patternInputRef`,tabindex:-1,disabled:r,value:this.pattern,autofocus:this.autofocus,class:`${s}-base-selection-input-tag__input`,onBlur:this.handlePatternInputBlur,onFocus:this.handlePatternInputFocus,onKeydown:this.handlePatternKeyDown,onInput:this.handlePatternInputInput,onCompositionstart:this.handleCompositionStart,onCompositionend:this.handleCompositionEnd})),_(`span`,{ref:`patternInputMirrorRef`,class:`${s}-base-selection-input-tag__mirror`},this.pattern)):null,y=p?()=>_(`div`,{class:`${s}-base-selection-tag-wrapper`,ref:`counterWrapperRef`},_(k,{size:n,ref:`counterRef`,onMouseenter:this.handleMouseEnterCounter,onMouseleave:this.handleMouseLeaveCounter,disabled:r})):void 0,b;if(m){let e=this.selectedOptions.length-a;e>0&&(b=_(`div`,{class:`${s}-base-selection-tag-wrapper`,key:`__counter__`},_(k,{size:n,ref:`counterRef`,onMouseenter:this.handleMouseEnterCounter,disabled:r},{default:()=>`+${e}`})))}let x=p?i?_(Ae,{ref:`overflowRef`,updateCounter:this.updateCounter,getCounter:this.getCounter,getTail:this.getTail,style:{width:`100%`,display:`flex`,overflow:`hidden`}},{default:o,counter:y,tail:()=>l}):_(Ae,{ref:`overflowRef`,updateCounter:this.updateCounter,getCounter:this.getCounter,style:{width:`100%`,display:`flex`,overflow:`hidden`}},{default:o,counter:y}):m&&b?o().concat(b):o(),S=h?()=>_(`div`,{class:`${s}-base-selection-popover`},p?o():this.selectedOptions.map(t)):void 0,C=h?Object.assign({show:this.showTagsPanel,trigger:`hover`,overlap:!0,placement:`top`,width:`trigger`,onUpdateShow:this.onPopoverUpdateShow,theme:this.mergedTheme.peers.Popover,themeOverrides:this.mergedTheme.peerOverrides.Popover},c):null,w=!this.selected&&(!this.active||!this.pattern&&!this.isComposing)?_(`div`,{class:`${s}-base-selection-placeholder ${s}-base-selection-overlay`},_(`div`,{class:`${s}-base-selection-placeholder__inner`},this.placeholder)):null,T=i?_(`div`,{ref:`patternInputWrapperRef`,class:`${s}-base-selection-tags`},x,p?null:l,g):_(`div`,{ref:`multipleElRef`,class:`${s}-base-selection-tags`,tabindex:r?void 0:0},x,g);v=_(d,null,h?_(E,Object.assign({},C,{scrollable:!0,style:`max-height: calc(var(--v-target-height) * 6.6);`}),{trigger:()=>T,default:S}):T,w)}else if(i){let e=this.pattern||this.isComposing,t=this.active?!e:!this.selected,n=this.active?!1:this.selected;v=_(`div`,{ref:`patternInputWrapperRef`,class:`${s}-base-selection-label`,title:this.patternInputFocused?void 0:Me(this.label)},_(`input`,Object.assign({},this.inputProps,{ref:`patternInputRef`,class:`${s}-base-selection-input`,value:this.active?this.pattern:``,placeholder:``,readonly:r,disabled:r,tabindex:-1,autofocus:this.autofocus,onFocus:this.handlePatternInputFocus,onBlur:this.handlePatternInputBlur,onInput:this.handlePatternInputInput,onCompositionstart:this.handleCompositionStart,onCompositionend:this.handleCompositionEnd})),n?_(`div`,{class:`${s}-base-selection-label__render-label ${s}-base-selection-overlay`,key:`input`},_(`div`,{class:`${s}-base-selection-overlay__wrapper`},u?u({option:this.selectedOption,handleClose:()=>{}}):f?f(this.selectedOption,!0):K(this.label,this.selectedOption,!0))):null,t?_(`div`,{class:`${s}-base-selection-placeholder ${s}-base-selection-overlay`,key:`placeholder`},_(`div`,{class:`${s}-base-selection-overlay__wrapper`},this.filterablePlaceholder)):null,g)}else v=_(`div`,{ref:`singleElRef`,class:`${s}-base-selection-label`,tabindex:this.disabled?void 0:0},this.label===void 0?_(`div`,{class:`${s}-base-selection-placeholder ${s}-base-selection-overlay`,key:`placeholder`},_(`div`,{class:`${s}-base-selection-placeholder__inner`},this.placeholder)):_(`div`,{class:`${s}-base-selection-input`,title:Me(this.label),key:`input`},_(`div`,{class:`${s}-base-selection-input__content`},u?u({option:this.selectedOption,handleClose:()=>{}}):f?f(this.selectedOption,!0):K(this.label,this.selectedOption,!0))),g);return _(`div`,{ref:`selfRef`,class:[`${s}-base-selection`,this.rtlEnabled&&`${s}-base-selection--rtl`,this.themeClass,e&&`${s}-base-selection--${e}-status`,{[`${s}-base-selection--active`]:this.active,[`${s}-base-selection--selected`]:this.selected||this.active&&this.pattern,[`${s}-base-selection--disabled`]:this.disabled,[`${s}-base-selection--multiple`]:this.multiple,[`${s}-base-selection--focus`]:this.focused}],style:this.cssVars,onClick:this.onClick,onMouseenter:this.handleMouseEnter,onMouseleave:this.handleMouseLeave,onKeydown:this.onKeydown,onFocusin:this.handleFocusin,onFocusout:this.handleFocusout,onMousedown:this.handleMouseDown},v,o?_(`div`,{class:`${s}-base-selection__border`}):null,o?_(`div`,{class:`${s}-base-selection__state-border`}):null)}});function wt(e){return e.type===`group`}function Tt(e){return e.type===`ignored`}function Et(e,t){try{return!!(1+t.toString().toLowerCase().indexOf(e.trim().toLowerCase()))}catch{return!1}}function Dt(e,t){return{getIsGroup:wt,getIgnored:Tt,getKey(t){return wt(t)?t.name||t.key||`key-required`:t[e]},getChildren(e){return e[t]}}}function Ot(e,t,n,r){if(!t)return e;function i(e){if(!Array.isArray(e))return[];let a=[];for(let o of e)if(wt(o)){let e=i(o[r]);e.length&&a.push(Object.assign({},o,{[r]:e}))}else if(Tt(o))continue;else t(n,o)&&a.push(o);return a}return i(e)}function kt(e,t,n){let r=new Map;return e.forEach(e=>{wt(e)?e[n].forEach(e=>{r.set(e[t],e)}):r.set(e[t],e)}),r}var At=M([Y(`select`,`
 z-index: auto;
 outline: none;
 width: 100%;
 position: relative;
 font-weight: var(--n-font-weight);
 `),Y(`select-menu`,`
 margin: 4px 0;
 box-shadow: var(--n-menu-box-shadow);
 `,[V({originalTransition:`background-color .3s var(--n-bezier), box-shadow .3s var(--n-bezier)`})])]),jt=g({name:`Select`,props:Object.assign(Object.assign({},ue.props),{to:S.propTo,bordered:{type:Boolean,default:void 0},clearable:Boolean,clearCreatedOptionsOnClear:{type:Boolean,default:!0},clearFilterAfterSelect:{type:Boolean,default:!0},options:{type:Array,default:()=>[]},defaultValue:{type:[String,Number,Array],default:null},keyboard:{type:Boolean,default:!0},value:[String,Number,Array],placeholder:String,menuProps:Object,multiple:Boolean,size:String,menuSize:{type:String},filterable:Boolean,disabled:{type:Boolean,default:void 0},remote:Boolean,loading:Boolean,filter:Function,placement:{type:String,default:`bottom-start`},widthMode:{type:String,default:`trigger`},tag:Boolean,onCreate:Function,fallbackOption:{type:[Function,Boolean],default:void 0},show:{type:Boolean,default:void 0},showArrow:{type:Boolean,default:!0},maxTagCount:[Number,String],ellipsisTagPopoverProps:Object,consistentMenuWidth:{type:Boolean,default:!0},virtualScroll:{type:Boolean,default:!0},labelField:{type:String,default:`label`},valueField:{type:String,default:`value`},childrenField:{type:String,default:`children`},renderLabel:Function,renderOption:Function,renderTag:Function,"onUpdate:value":[Function,Array],inputProps:Object,nodeProps:Function,ignoreComposition:{type:Boolean,default:!0},showOnFocus:Boolean,onUpdateValue:[Function,Array],onBlur:[Function,Array],onClear:[Function,Array],onFocus:[Function,Array],onScroll:[Function,Array],onSearch:[Function,Array],onUpdateShow:[Function,Array],"onUpdate:show":[Function,Array],displayDirective:{type:String,default:`show`},resetMenuOnOptionsChange:{type:Boolean,default:!0},status:String,showCheckmark:{type:Boolean,default:!0},scrollbarProps:Object,onChange:[Function,Array],items:Array}),slots:Object,setup(e){let{mergedClsPrefixRef:t,mergedBorderedRef:n,namespaceRef:r,inlineThemeDisabled:i,mergedComponentPropsRef:a}=ae(e),o=ue(`Select`,`-select`,At,_e,e,t),s=h(e.defaultValue),l=pe(u(e,`value`),s),d=h(!1),f=h(``),p=C(e,[`items`,`options`]),g=h([]),_=h([]),v=m(()=>_.value.concat(g.value).concat(p.value)),y=m(()=>{let{filter:t}=e;if(t)return t;let{labelField:n,valueField:r}=e;return(e,t)=>{if(!t)return!1;let i=t[n];if(typeof i==`string`)return Et(e,i);let a=t[r];return typeof a==`string`?Et(e,a):typeof a==`number`?Et(e,String(a)):!1}}),b=m(()=>{if(e.remote)return p.value;{let{value:t}=v,{value:n}=f;return!n.length||!e.filterable?t:Ot(t,y.value,n,e.childrenField)}}),x=m(()=>{let{valueField:t,childrenField:n}=e,r=Dt(t,n);return gt(b.value,r)}),w=m(()=>kt(v.value,e.valueField,e.childrenField)),T=h(!1),E=pe(u(e,`show`),T),D=h(null),O=h(null),k=h(null),{localeRef:A}=j(`Select`),ee=m(()=>e.placeholder??A.value.placeholder),M=[],N=h(new Map),P=m(()=>{let{fallbackOption:t}=e;if(t===void 0){let{labelField:t,valueField:n}=e;return e=>({[t]:String(e),[n]:e})}return t===!1?!1:e=>Object.assign(t(e),{value:e})});function F(t){let n=e.remote,{value:r}=N,{value:i}=w,{value:a}=P,o=[];return t.forEach(e=>{if(i.has(e))o.push(i.get(e));else if(n&&r.has(e))o.push(r.get(e));else if(a){let t=a(e);t&&o.push(t)}}),o}let I=m(()=>{if(e.multiple){let{value:e}=l;return Array.isArray(e)?F(e):[]}return null}),te=m(()=>{let{value:t}=l;return!e.multiple&&!Array.isArray(t)?t===null?null:F([t])[0]||null:null}),L=re(e,{mergedSize:t=>{let{size:n}=e;if(n)return n;let{mergedSize:r}=t||{};return r?.value?r.value:a?.value?.Select?.size||`medium`}}),{mergedSizeRef:ne,mergedDisabledRef:R,mergedStatusRef:z}=L;function B(t,n){let{onChange:r,"onUpdate:value":i,onUpdateValue:a}=e,{nTriggerFormChange:o,nTriggerFormInput:c}=L;r&&X(r,t,n),a&&X(a,t,n),i&&X(i,t,n),s.value=t,o(),c()}function V(t){let{onBlur:n}=e,{nTriggerFormBlur:r}=L;n&&X(n,t),r()}function H(){let{onClear:t}=e;t&&X(t)}function oe(t){let{onFocus:n,showOnFocus:r}=e,{nTriggerFormFocus:i}=L;n&&X(n,t),i(),r&&K()}function U(t){let{onSearch:n}=e;n&&X(n,t)}function W(t){let{onScroll:n}=e;n&&X(n,t)}function G(){var t;let{remote:n,multiple:r}=e;if(n){let{value:n}=N;if(r){let{valueField:r}=e;(t=I.value)==null||t.forEach(e=>{n.set(e[r],e)})}else{let t=te.value;t&&n.set(t[e.valueField],t)}}}function se(t){let{onUpdateShow:n,"onUpdate:show":r}=e;n&&X(n,t),r&&X(r,t),T.value=t}function K(){R.value||(se(!0),T.value=!0,e.filterable&&je())}function q(){se(!1)}function le(){f.value=``,_.value=M}let J=h(!1);function de(){e.filterable&&(J.value=!0)}function Y(){e.filterable&&(J.value=!1,E.value||le())}function he(){R.value||(E.value?e.filterable?je():q():K())}function ge(e){(k.value?.selfRef)?.contains(e.relatedTarget)||(d.value=!1,V(e),q())}function Z(e){oe(e),d.value=!0}function ve(){d.value=!0}function ye(e){D.value?.$el.contains(e.relatedTarget)||(d.value=!1,V(e),q())}function be(){var e;(e=D.value)==null||e.focus(),q()}function xe(e){E.value&&(D.value?.$el.contains(fe(e))||q())}function Se(t){if(!Array.isArray(t))return[];if(P.value)return Array.from(t);{let{remote:n}=e,{value:r}=w;if(n){let{value:e}=N;return t.filter(t=>r.has(t)||e.has(t))}else return t.filter(e=>r.has(e))}}function Ce(e){we(e.rawNode)}function we(t){if(R.value)return;let{tag:n,remote:r,clearFilterAfterSelect:i,valueField:a}=e;if(n&&!r){let{value:e}=_,t=e[0]||null;if(t){let e=g.value;e.length?e.push(t):g.value=[t],_.value=M}}if(r&&N.value.set(t[a],t),e.multiple){let e=Se(l.value),o=e.findIndex(e=>e===t[a]);if(~o){if(e.splice(o,1),n&&!r){let e=Te(t[a]);~e&&(g.value.splice(e,1),i&&(f.value=``))}}else e.push(t[a]),i&&(f.value=``);B(e,F(e))}else{if(n&&!r){let e=Te(t[a]);~e?g.value=[g.value[e]]:g.value=M}Ae(),q(),B(t[a],t)}}function Te(t){return g.value.findIndex(n=>n[e.valueField]===t)}function Ee(t){E.value||K();let{value:n}=t.target;f.value=n;let{tag:r,remote:i}=e;if(U(n),r&&!i){if(!n){_.value=M;return}let{onCreate:t}=e,r=t?t(n):{[e.labelField]:n,[e.valueField]:n},{valueField:i,labelField:a}=e;p.value.some(e=>e[i]===r[i]||e[a]===r[a])||g.value.some(e=>e[i]===r[i]||e[a]===r[a])?_.value=M:_.value=[r]}}function De(t){t.stopPropagation();let{multiple:n,tag:r,remote:i,clearCreatedOptionsOnClear:a}=e;!n&&e.filterable&&q(),r&&!i&&a&&(g.value=M),H(),n?B([],[]):B(null,null)}function Oe(e){!Q(e,`action`)&&!Q(e,`empty`)&&!Q(e,`header`)&&e.preventDefault()}function $(e){W(e)}function ke(t){var n,r,i;if(!e.keyboard){t.preventDefault();return}switch(t.key){case` `:if(e.filterable)break;t.preventDefault();case`Enter`:if(!D.value?.isComposing){if(E.value){let t=k.value?.getPendingTmNode();t?Ce(t):e.filterable||(q(),Ae())}else if(K(),e.tag&&J.value){let t=_.value[0];if(t){let n=t[e.valueField],{value:r}=l;e.multiple&&Array.isArray(r)&&r.includes(n)||we(t)}}}t.preventDefault();break;case`ArrowUp`:if(t.preventDefault(),e.loading)return;E.value&&((n=k.value)==null||n.prev());break;case`ArrowDown`:if(t.preventDefault(),e.loading)return;E.value?(r=k.value)==null||r.next():K();break;case`Escape`:E.value&&(ce(t),q()),(i=D.value)==null||i.focus();break}}function Ae(){var e;(e=D.value)==null||e.focus()}function je(){var e;(e=D.value)==null||e.focusInput()}function Me(){var e;E.value&&((e=O.value)==null||e.syncPosition())}G(),c(u(e,`options`),G);let Ne={focus:()=>{var e;(e=D.value)==null||e.focus()},focusInput:()=>{var e;(e=D.value)==null||e.focusInput()},blur:()=>{var e;(e=D.value)==null||e.blur()},blurInput:()=>{var e;(e=D.value)==null||e.blurInput()}},Pe=m(()=>{let{self:{menuBoxShadow:e}}=o.value;return{"--n-menu-box-shadow":e}}),Fe=i?ie(`select`,void 0,Pe,e):void 0;return Object.assign(Object.assign({},Ne),{mergedStatus:z,mergedClsPrefix:t,mergedBordered:n,namespace:r,treeMate:x,isMounted:me(),triggerRef:D,menuRef:k,pattern:f,uncontrolledShow:T,mergedShow:E,adjustedTo:S(e),uncontrolledValue:s,mergedValue:l,followerRef:O,localizedPlaceholder:ee,selectedOption:te,selectedOptions:I,mergedSize:ne,mergedDisabled:R,focused:d,activeWithoutMenuOpen:J,inlineThemeDisabled:i,onTriggerInputFocus:de,onTriggerInputBlur:Y,handleTriggerOrMenuResize:Me,handleMenuFocus:ve,handleMenuBlur:ye,handleMenuTabOut:be,handleTriggerClick:he,handleToggle:Ce,handleDeleteOption:we,handlePatternInput:Ee,handleClear:De,handleTriggerBlur:ge,handleTriggerFocus:Z,handleKeydown:ke,handleMenuAfterLeave:le,handleMenuClickOutside:xe,handleMenuScroll:$,handleMenuKeydown:ke,handleMenuMousedown:Oe,mergedTheme:o,cssVars:i?void 0:Pe,themeClass:Fe?.themeClass,onRender:Fe?.onRender})},render(){return _(`div`,{class:`${this.mergedClsPrefix}-select`},_(x,null,{default:()=>[_(A,null,{default:()=>_(Ct,{ref:`triggerRef`,inlineThemeDisabled:this.inlineThemeDisabled,status:this.mergedStatus,inputProps:this.inputProps,clsPrefix:this.mergedClsPrefix,showArrow:this.showArrow,maxTagCount:this.maxTagCount,ellipsisTagPopoverProps:this.ellipsisTagPopoverProps,bordered:this.mergedBordered,active:this.activeWithoutMenuOpen||this.mergedShow,pattern:this.pattern,placeholder:this.localizedPlaceholder,selectedOption:this.selectedOption,selectedOptions:this.selectedOptions,multiple:this.multiple,renderTag:this.renderTag,renderLabel:this.renderLabel,filterable:this.filterable,clearable:this.clearable,disabled:this.mergedDisabled,size:this.mergedSize,theme:this.mergedTheme.peers.InternalSelection,labelField:this.labelField,valueField:this.valueField,themeOverrides:this.mergedTheme.peerOverrides.InternalSelection,loading:this.loading,focused:this.focused,onClick:this.handleTriggerClick,onDeleteOption:this.handleDeleteOption,onPatternInput:this.handlePatternInput,onClear:this.handleClear,onBlur:this.handleTriggerBlur,onFocus:this.handleTriggerFocus,onKeydown:this.handleKeydown,onPatternBlur:this.onTriggerInputBlur,onPatternFocus:this.onTriggerInputFocus,onResize:this.handleTriggerOrMenuResize,ignoreComposition:this.ignoreComposition},{arrow:()=>{var e;return[(e=this.$slots).arrow?.call(e)]}})}),_(O,{ref:`followerRef`,show:this.mergedShow,to:this.adjustedTo,teleportDisabled:this.adjustedTo===S.tdkey,containerClass:this.namespace,width:this.consistentMenuWidth?`target`:void 0,minWidth:`target`,placement:this.placement},{default:()=>_(G,{name:`fade-in-scale-up-transition`,appear:this.isMounted,onAfterLeave:this.handleMenuAfterLeave},{default:()=>{var e;return this.mergedShow||this.displayDirective===`show`?((e=this.onRender)==null||e.call(this),a(_(xt,Object.assign({},this.menuProps,{ref:`menuRef`,onResize:this.handleTriggerOrMenuResize,inlineThemeDisabled:this.inlineThemeDisabled,virtualScroll:this.consistentMenuWidth&&this.virtualScroll,class:[`${this.mergedClsPrefix}-select-menu`,this.themeClass,this.menuProps?.class],clsPrefix:this.mergedClsPrefix,focusable:!0,labelField:this.labelField,valueField:this.valueField,autoPending:!0,nodeProps:this.nodeProps,theme:this.mergedTheme.peers.InternalSelectMenu,themeOverrides:this.mergedTheme.peerOverrides.InternalSelectMenu,treeMate:this.treeMate,multiple:this.multiple,size:this.menuSize,renderOption:this.renderOption,renderLabel:this.renderLabel,value:this.mergedValue,style:[this.menuProps?.style,this.cssVars],onToggle:this.handleToggle,onScroll:this.handleMenuScroll,onFocus:this.handleMenuFocus,onBlur:this.handleMenuBlur,onKeydown:this.handleMenuKeydown,onTabOut:this.handleMenuTabOut,onMousedown:this.handleMenuMousedown,show:this.mergedShow,showCheckmark:this.showCheckmark,resetMenuOnOptionsChange:this.resetMenuOnOptionsChange,scrollbarProps:this.scrollbarProps}),{empty:()=>{var e;return[(e=this.$slots).empty?.call(e)]},header:()=>{var e;return[(e=this.$slots).header?.call(e)]},action:()=>{var e;return[(e=this.$slots).action?.call(e)]}}),this.displayDirective===`show`?[[te,this.mergedShow],[le,this.handleMenuClickOutside,void 0,{capture:!0}]]:[[le,this.handleMenuClickOutside,void 0,{capture:!0}]])):null}})})]}))}});export{gt as n,Q as r,jt as t};