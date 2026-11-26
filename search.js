/* Top Manage search: reads stored xlsx/csv inside the browser. Nothing leaves the device. */
(function () {
  "use strict";
  var AR_DIG = "٠١٢٣٤٥٦٧٨٩";
  function norm(s) {
    s = String(s == null ? "" : s).toLowerCase();
    s = s.replace(/[\u064B-\u065F\u0670\u0640]/g, "")
      .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
      .replace(/[٠-٩]/g, function (c) { return AR_DIG.indexOf(c); });
    return s;
  }
  function u16(d, o) { return d[o] | (d[o + 1] << 8); }
  function u32(d, o) { return (d[o] | (d[o + 1] << 8) | (d[o + 2] << 16) | (d[o + 3] << 24)) >>> 0; }
  function inflate(bytes) {
    var ds = new DecompressionStream("deflate-raw");
    var st = new Blob([bytes]).stream().pipeThrough(ds);
    return new Response(st).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }
  function unzip(buf) {
    var d = new Uint8Array(buf), n = d.length, e = -1, i;
    for (i = n - 22; i >= Math.max(0, n - 65558); i--) if (u32(d, i) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error("zip");
    var cnt = u16(d, e + 10), off = u32(d, e + 16), files = {};
    for (i = 0; i < cnt; i++) {
      if (u32(d, off) !== 0x02014b50) break;
      var meth = u16(d, off + 10), csz = u32(d, off + 20), nl = u16(d, off + 28), el = u16(d, off + 30), cl = u16(d, off + 32), lh = u32(d, off + 42);
      var name = new TextDecoder().decode(d.subarray(off + 46, off + 46 + nl));
      files[name] = { meth: meth, csz: csz, lh: lh };
      off += 46 + nl + el + cl;
    }
    function get(name) {
      var f = files[name]; if (!f) return Promise.resolve(null);
      var p = f.lh, dataStart = p + 30 + u16(d, p + 26) + u16(d, p + 28), raw = d.subarray(dataStart, dataStart + f.csz);
      var pr = f.meth === 0 ? Promise.resolve(raw) : inflate(raw);
      return pr.then(function (b) { return new TextDecoder("utf-8").decode(b); });
    }
    return { has: function (n) { return !!files[n]; }, get: get };
  }
  function decodeXml(s) {
    return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, function (m, c) { return String.fromCharCode(+c); })
      .replace(/&#x([0-9a-f]+);/gi, function (m, c) { return String.fromCharCode(parseInt(c, 16)); })
      .replace(/&amp;/g, "&");
  }
  function texts(x) {
    var out = "", re = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g, m;
    while ((m = re.exec(x))) out += m[1];
    return decodeXml(out);
  }
  function colIdx(ref) {
    var m = /^([A-Z]+)/.exec(ref), c = 0, i;
    if (!m) return 0;
    for (i = 0; i < m[1].length; i++) c = c * 26 + (m[1].charCodeAt(i) - 64);
    return c - 1;
  }
  function parseSheet(xml, sst) {
    var rows = [], rre = /<row\b[^>]*>([\s\S]*?)<\/row>/g, rm;
    while ((rm = rre.exec(xml))) {
      var cre = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, cm, row = [], any = false;
      while ((cm = cre.exec(rm[1]))) {
        var at = cm[1], body = cm[2] || "", ref = /\br="([A-Z]+\d+)"/.exec(at), t = /\bt="(\w+)"/.exec(at), v = "";
        if (t && t[1] === "s") { var vv = /<v>(\d+)<\/v>/.exec(body); v = vv ? (sst[+vv[1]] || "") : ""; }
        else if (t && t[1] === "inlineStr") v = texts(body);
        else { var v2 = /<v>([\s\S]*?)<\/v>/.exec(body); v = v2 ? decodeXml(v2[1]) : ""; }
        if (v !== "") { row[ref ? colIdx(ref[1]) : row.length] = v; any = true; }
      }
      if (any) { for (var k = 0; k < row.length; k++) if (row[k] === undefined) row[k] = ""; rows.push(row); }
      if (rows.length > 300000) break;
    }
    return rows;
  }
  function readXlsx(buf) {
    var z = unzip(buf), sst = [], names = [], targets = {};
    return z.get("xl/sharedStrings.xml").then(function (x) {
      if (x) { var re = /<si\b[^>]*>([\s\S]*?)<\/si>/g, m; while ((m = re.exec(x))) sst.push(texts(m[1])); }
      return z.get("xl/_rels/workbook.xml.rels");
    }).then(function (x) {
      if (x) { var re = /<Relationship\b[^>]*>/g, m; while ((m = re.exec(x))) { var id = /\bId="([^"]+)"/.exec(m[0]), tg = /\bTarget="([^"]+)"/.exec(m[0]); if (id && tg) targets[id[1]] = tg[1]; } }
      return z.get("xl/workbook.xml");
    }).then(function (x) {
      var re = /<sheet\b[^>]*>/g, m;
      while (x && (m = re.exec(x))) {
        var nm = /\bname="([^"]*)"/.exec(m[0]), id = /\br:id="([^"]+)"/.exec(m[0]);
        if (nm && id && targets[id[1]]) { var t = targets[id[1]].replace(/^\//, ""); names.push({ name: decodeXml(nm[1]), path: t.indexOf("xl/") === 0 ? t : "xl/" + t }); }
      }
      var out = [], p = Promise.resolve();
      names.forEach(function (s) { p = p.then(function () { return z.get(s.path); }).then(function (sx) { if (sx) out.push({ name: s.name, rows: parseSheet(sx, sst) }); }); });
      return p.then(function () { return out; });
    });
  }
  function parseCsv(text) {
    var rows = [], row = [], cur = "", q = false, i, c;
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    var delim = (text.split("\n")[0].split(";").length > text.split("\n")[0].split(",").length) ? ";" : ",";
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === delim) { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); if (row.some(function (x) { return x !== ""; })) rows.push(row); row = []; cur = ""; }
      else if (c !== "\r") cur += c;
    }
    row.push(cur); if (row.some(function (x) { return x !== ""; })) rows.push(row);
    return rows;
  }
  var cache = {};
  function load(file) {
    var key = file.name + "|" + file.size + "|" + file.lastModified;
    if (cache[key]) return cache[key];
    var low = file.name.toLowerCase(), p;
    if (/\.xlsx$|\.xlsm$/.test(low)) p = file.arrayBuffer().then(readXlsx);
    else if (/\.csv$|\.txt$/.test(low)) p = file.text().then(function (t) { return [{ name: "", rows: parseCsv(t) }]; });
    else p = Promise.resolve(null);
    p = p.then(function (sheets) {
      if (!sheets) return null;
      sheets.forEach(function (s) { s.norm = null; });
      return sheets;
    }).catch(function () { return null; });
    cache[key] = p;
    return p;
  }
  function search(query, files, shown) {
    var toks = norm(query).trim().split(/\s+/).filter(Boolean);
    if (!toks.length) return Promise.resolve({ groups: [], unread: [] });
    var groups = [], unread = [], p = Promise.resolve();
    files.forEach(function (f) {
      p = p.then(function () { return load(f); }).then(function (sheets) {
        if (!sheets) { unread.push(f.name); return; }
        sheets.forEach(function (s) {
          if (!s.norm) { var hd = (s.rows[0] || []).join(" "); s.norm = s.rows.map(function (r, ri) { return norm((ri ? hd + " " : "") + r.join(" \u0001 ")); }); }
          var hits = [], total = 0, head = s.rows[0] || [];
          for (var i = 1; i < s.rows.length; i++) {
            var t = s.norm[i], ok = true;
            for (var k = 0; k < toks.length; k++) if (t.indexOf(toks[k]) < 0) { ok = false; break; }
            if (!ok) continue;
            total++;
            if (hits.length < (shown || 8)) {
              var cells = [];
              s.rows[i].forEach(function (v, c) {
                if (v === "" || v == null) return;
                var nv = norm(v), hit = toks.some(function (tk) { return nv.indexOf(tk) >= 0; });
                cells.push({ h: head[c] || "", v: String(v), hit: hit });
              });
              hits.push({ row: i + 1, cells: cells });
            }
          }
          if (total) groups.push({ file: f.name, sheet: s.name, total: total, hits: hits });
        });
      });
    });
    return p.then(function () { return { groups: groups, unread: unread }; });
  }
  window.TMS = { norm: norm, search: search, load: load };
})();
