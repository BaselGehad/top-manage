/* Top Manage: PDF text -> table rows, and a small .xlsx writer. Runs in the browser, nothing leaves the device. */
(function(){"use strict";
function median(a){a=a.slice().sort(function(x,y){return x-y});return a.length?a[a.length>>1]:0}
/* items: [{s,x,y,w,h}] for one page -> array of rows (arrays of cell strings) */
function tableFromItems(items){
 items=items.filter(function(i){return i.s.trim()!==""});
 if(!items.length)return [];
 var hs=median(items.map(function(i){return i.h||10}))||10;
 items.sort(function(a,b){return b.y-a.y||a.x-b.x});
 var lines=[],tol=hs*0.55;
 items.forEach(function(it){var L=lines[lines.length-1];if(L&&Math.abs(L.y-it.y)<=tol){L.it.push(it)}else lines.push({y:it.y,it:[it]})});
 /* cells: merge neighbours closer than a word gap */
 var gap=hs*0.9,rows=lines.map(function(L){L.it.sort(function(a,b){return a.x-b.x});var c=[];L.it.forEach(function(it){var p=c[c.length-1];if(p&&it.x-(p.x+p.w)<=gap){p.s+=(it.x-(p.x+p.w)>hs*0.12&&!/\s$/.test(p.s)?" ":"")+it.s;p.w=it.x+it.w-p.x}else c.push({s:it.s,x:it.x,w:it.w})});return c});
 /* column anchors: left edges that repeat on several rows */
 var multi=rows.filter(function(r){return r.length>1}),xs=[];
 multi.forEach(function(r){r.forEach(function(c){xs.push(c.x)})});
 xs.sort(function(a,b){return a-b});
 var anchors=[],ctol=hs*0.8,cl=[];
 xs.forEach(function(x){var l=cl[cl.length-1];if(l&&x-l[l.length-1]<=ctol)l.push(x);else cl.push([x])});
 var need=Math.max(2,Math.round(multi.length*0.25));
 cl.forEach(function(l){if(l.length>=need)anchors.push(median(l))});
 if(!anchors.length){var x0=Math.min.apply(null,items.map(function(i){return i.x}));anchors=[x0]}
 anchors.sort(function(a,b){return a-b});
 return rows.map(function(r){var out=[];var multiRow=r.length>1;
  r.forEach(function(c){var k=0;for(var i=0;i<anchors.length;i++)if(anchors[i]<=c.x+ctol)k=i;if(!multiRow&&r.length===1)k=0;
   while(k<out.length&&out[k]!==undefined&&out[k]!=="")k++;
   while(out.length<k)out.push("");out[k]=c.s});
  return out.map(function(v){return v===undefined?"":v})})}
function isNum(v){return /^-?\d{1,15}(\.\d+)?$/.test(v)&&!/^0\d/.test(v)}
/* ---- xlsx writer (stored zip) ---- */
var CT=null;function crc(b){if(!CT){CT=[];for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;CT[n]=c>>>0}}var c2=0xFFFFFFFF;for(var i=0;i<b.length;i++)c2=CT[(c2^b[i])&255]^(c2>>>8);return (c2^0xFFFFFFFF)>>>0}
function utf8(s){return new TextEncoder().encode(s)}
function xe(s){return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function col(i){var s="";i++;while(i>0){var m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s}
function sheetXml(rows){var x='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
 rows.forEach(function(r,ri){x+='<row r="'+(ri+1)+'">';r.forEach(function(v,ci){if(v===""||v==null)return;var ref=col(ci)+(ri+1);if(isNum(String(v)))x+='<c r="'+ref+'"><v>'+v+'</v></c>';else x+='<c r="'+ref+'" t="inlineStr"><is><t xml:space="preserve">'+xe(v)+'</t></is></c>'});x+='</row>'});
 return x+'</sheetData></worksheet>'}
function writeXlsx(sheets){
 var files=[],names=sheets.map(function(s,i){var n=String(s.name||("Sheet"+(i+1))).replace(/[\\\/\?\*\[\]:]/g,"").slice(0,31)||("Sheet"+(i+1));return n});
 var ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+sheets.map(function(s,i){return '<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'}).join("")+'</Types>';
 files.push(["[Content_Types].xml",ct]);
 files.push(["_rels/.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>']);
 files.push(["xl/workbook.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+names.map(function(n,i){return '<sheet name="'+xe(n)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>'}).join("")+'</sheets></workbook>']);
 files.push(["xl/_rels/workbook.xml.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+sheets.map(function(s,i){return '<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>'}).join("")+'</Relationships>']);
 sheets.forEach(function(s,i){files.push(["xl/worksheets/sheet"+(i+1)+".xml",sheetXml(s.rows)])});
 var parts=[],cen=[],off=0;
 files.forEach(function(f){var nb=utf8(f[0]),d=utf8(f[1]),c=crc(d);
  var lh=new Uint8Array(30+nb.length),v=new DataView(lh.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(8,0,true);v.setUint32(14,c,true);v.setUint32(18,d.length,true);v.setUint32(22,d.length,true);v.setUint16(26,nb.length,true);lh.set(nb,30);
  parts.push(lh,d);
  var ce=new Uint8Array(46+nb.length),w=new DataView(ce.buffer);w.setUint32(0,0x02014b50,true);w.setUint16(4,20,true);w.setUint16(6,20,true);w.setUint16(8,0x0800,true);w.setUint32(16,c,true);w.setUint32(20,d.length,true);w.setUint32(24,d.length,true);w.setUint16(28,nb.length,true);w.setUint32(42,off,true);ce.set(nb,46);cen.push(ce);
  off+=lh.length+d.length});
 var cs=cen.reduce(function(a,b){return a+b.length},0),end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
 return new Blob(parts.concat(cen,[end]),{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})}
/* ---- pdf reading ---- */
function loadLib(){return new Promise(function(res,rej){if(window.pdfjsLib)return res(window.pdfjsLib);var s=document.createElement("script");s.src="lib/pdf.min.js?v=1";s.onload=function(){try{pdfjsLib.GlobalWorkerOptions.workerSrc="lib/pdf.worker.min.js?v=1"}catch(e){}res(window.pdfjsLib)};s.onerror=function(){rej(new Error("lib"))};document.head.appendChild(s)})}
function openPdf(buf){return loadLib().then(function(L){return L.getDocument({data:buf,disableFontFace:true}).promise})}
function pageItems(doc,n){return doc.getPage(n).then(function(p){return p.getTextContent().then(function(tc){return tc.items.map(function(i){return{s:i.str,x:i.transform[4],y:i.transform[5],w:i.width||0,h:Math.abs(i.transform[3])||i.height||10}})})})}
window.PDFX={tableFromItems:tableFromItems,writeXlsx:writeXlsx,openPdf:openPdf,pageItems:pageItems};
})();
