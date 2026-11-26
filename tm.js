/* Top Manage shared runtime: theme (Dark/Light, remembered) + shared data store (IndexedDB, stays on this device). */
(function(){
var root=document.documentElement,TH="tm-theme";
function getTheme(){var t=null;try{t=localStorage.getItem(TH)}catch(e){}return t==="light"?"light":"dark"}
function fav(t){var l=document.getElementById('tm-fav');if(!l){l=document.createElement('link');l.id='tm-fav';l.rel='icon';l.type='image/svg+xml';(document.head||root).appendChild(l)}l.href=t==='light'?'favicon-light.svg':'favicon-dark.svg'}
function setTheme(t){fav(t);root.setAttribute("data-theme",t);try{localStorage.setItem(TH,t)}catch(e){}var m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==="light"?"#f6f1e7":"#0f1a16";var b=document.getElementById("tm-theme-btn");if(b)b.innerHTML=icon(t)}
function icon(t){return t==="light"
 ?'<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
 :'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'}
root.setAttribute("data-theme",getTheme());fav(getTheme());
var LOGO='<img class="tm-mk tm-mk-d" src="logo-dark.svg" alt="" width="36" height="36"><img class="tm-mk tm-mk-l" src="logo-light.svg" alt="" width="36" height="36">Top Manage';
function bar(opts){
 if(document.getElementById("tm-bar"))return document.getElementById("tm-bar");
 var d=document.createElement("div");d.id="tm-bar";d.className="tm-bar";
 d.innerHTML='<div class="tm-bar-in"><a class="tm-logo" href="'+(opts&&opts.home||"index.html")+'">'+LOGO+'</a><div class="tm-slot" id="tm-slot"></div><button class="tm-btn" id="tm-theme-btn" type="button" aria-label="Theme"></button></div>';
 document.body.insertBefore(d,document.body.firstChild);
 var b=d.querySelector("#tm-theme-btn");b.innerHTML=icon(getTheme());
 b.addEventListener("click",function(){setTheme(getTheme()==="dark"?"light":"dark")});
 window.addEventListener("storage",function(e){if(e.key===TH){root.setAttribute("data-theme",getTheme());fav(getTheme())}});
 return d}
/* ---- shared store ---- */
var DB="top-manage",ST="files";
function open(){return new Promise(function(res,rej){var r=indexedDB.open(DB,1);r.onupgradeneeded=function(){r.result.createObjectStore(ST,{keyPath:"name"})};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}})}
function tx(mode,fn){return open().then(function(db){return new Promise(function(res,rej){var t=db.transaction(ST,mode),s=t.objectStore(ST),out=fn(s);t.oncomplete=function(){res(out&&out.result!==undefined?out.result:out)};t.onerror=function(){rej(t.error)};t.onabort=function(){rej(t.error)}})})}
var bc=null;try{bc=new BroadcastChannel("tm-store")}catch(e){}
var listeners=[];
function changed(){listeners.forEach(function(f){try{f()}catch(e){}});if(bc)try{bc.postMessage(1)}catch(e){}}
if(bc)bc.onmessage=function(){listeners.forEach(function(f){try{f()}catch(e){}})};
function readBuf(file){if(file.arrayBuffer)return file.arrayBuffer().catch(fr);return fr();function fr(){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result)};r.onerror=function(){rej(r.error||new Error("read"))};r.readAsArrayBuffer(file)})}}
function toFile(x){var parts=x.buf?[x.buf]:[x.blob];return new File(parts,x.name,{type:x.type,lastModified:x.lastModified})}
var store={
 onchange:function(f){listeners.push(f)},
 /* metadata only: name,size,type,added,lastModified */
 list:function(){return tx("readonly",function(s){return s.getAll()}).then(function(a){return a.map(function(x){var sz=x.buf?x.buf.byteLength:(x.blob?x.blob.size:x.size);return{name:x.name,size:sz,type:x.type,added:x.added,lastModified:x.lastModified}}).sort(function(a,b){return b.added-a.added})})},
 /* bytes are copied into an ArrayBuffer (not a Blob reference), then read back and verified, so an old phone browser can't silently lose the file */
 put:function(file){return readBuf(file).then(function(buf){var rec={name:file.name,size:buf.byteLength,type:file.type||"",lastModified:file.lastModified||Date.now(),added:Date.now(),buf:buf};return tx("readwrite",function(s){return s.put(rec)}).then(function(){return tx("readonly",function(s){return s.get(file.name)})}).then(function(back){if(!back||!back.buf||back.buf.byteLength!==buf.byteLength)throw new Error("verify");try{store.persist()}catch(e){}changed()})})},
 get:function(name){return tx("readonly",function(s){return s.get(name)}).then(function(x){return x?toFile(x):null})},
 files:function(){return tx("readonly",function(s){return s.getAll()}).then(function(a){return a.map(toFile)})},
 remove:function(name){return tx("readwrite",function(s){return s.delete(name)}).then(function(){changed()})},
 clear:function(){return tx("readwrite",function(s){return s.clear()}).then(function(){changed()})},
 persist:function(){try{return navigator.storage&&navigator.storage.persist?navigator.storage.persist():Promise.resolve(false)}catch(e){return Promise.resolve(false)}},
 usage:function(){try{return navigator.storage&&navigator.storage.estimate?navigator.storage.estimate():Promise.resolve(null)}catch(e){return Promise.resolve(null)}}
};
window.TM={getTheme:getTheme,setTheme:setTheme,bar:bar,store:store};
})();
