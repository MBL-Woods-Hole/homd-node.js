require = (function r(a, s, o) {
    function d(n, e) {
        if (!s[n]) {
            if (!a[n]) {
                var t = "function" == typeof require && require;
                if (!e && t) return t(n, !0);
                if (p) return p(n, !0);
                var l = new Error("Cannot find module '" + n + "'");
                throw ((l.code = "MODULE_NOT_FOUND"), l);
            }
            var i = (s[n] = { exports: {} });
            a[n][0].call(
                i.exports,
                function (e) {
                    var t = a[n][1][e];
                    return d(t || e);
                },
                i,
                i.exports,
                r,
                a,
                s,
                o
            );
        }
        return s[n].exports;
    }
    for (var p = "function" == typeof require && require, e = 0; e < o.length; e++) d(o[e]);
    return d;
})(
    {
        1: [
            function (e, l, t) {
                (function (e) {
                    function t(n, l, e) {
                        for (
                            ;
                            l &&
                            l !== Object.prototype &&
                            (Object.getOwnPropertyNames(l).forEach(function (e) {
                                if (".class" != e && !n.hasOwnProperty(e)) {
                                    var t = Object.getOwnPropertyDescriptor(l, e);
                                    Object.defineProperty(n, e, t);
                                }
                            }),
                            !e);

                        )
                            l = l.__proto__;
                        return n;
                    }
                    var a = function (e, t, n) {
                        "function" != typeof e && ((n = t), (t = e), (e = Object)), (t = t || {});
                        var l = { name: (n = n || {}).name, base: e, implements: [] },
                            i = a.clone(t);
                        n.implements &&
                            (Array.isArray(n.implements) ? n.implements : [n.implements]).forEach(function (e) {
                                "function" == typeof e && e.prototype && (l.implements.push(e), a.extend(i, e.prototype));
                            }),
                            (i.__proto__ = e.prototype);
                        function r() {
                            "function" == typeof this.constructor && this.constructor.apply(this, arguments);
                        }
                        return (
                            ((l.type = r).prototype = i),
                            Object.defineProperty(r, ".class.meta", { value: l, enumerable: !1, configurable: !1, writable: !1 }),
                            Object.defineProperty(i, ".class", { value: r, enumerable: !1, configurable: !1, writable: !1 }),
                            n.statics && a.extend(r, n.statics),
                            r
                        );
                    };
                    (a.extend = t),
                        (a.clone = function (e) {
                            return t({}, e);
                        });
                    var n = a({
                        constructor: function (e) {
                            this.object = e;
                        },
                        typeOf: function (e) {
                            if (this.object instanceof e) return !0;
                            var t = a.typeInfo(this.object);
                            return (
                                t &&
                                (function e(t, n) {
                                    for (; t; ) {
                                        if (t.type.prototype === n.prototype) return !0;
                                        for (var l in t.implements) {
                                            var i = t.implements[l],
                                                r = i[".class.meta"];
                                            if (r) {
                                                if (e(r, n)) return !0;
                                            } else for (var a = i.prototype; a; a = a.__proto__) if (a === n.prototype) return !0;
                                        }
                                        t = t.base ? t.base[".class.meta"] : void 0;
                                    }
                                    return !1;
                                })(t, e)
                            );
                        },
                    });
                    (n.prototype.a = n.prototype.typeOf),
                        (n.prototype.an = n.prototype.typeOf),
                        (a.is = function (e) {
                            return new n(e);
                        }),
                        (a.typeInfo = function (e) {
                            var t = e.__proto__[".class"];
                            return t ? t[".class.meta"] : void 0;
                        }),
                        (a.VERSION = [0, 0, 2]),
                        l ? (l.exports = a) : (e.Class = a);
                }.call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}));
            },
            {},
        ],
        2: [
            function (e, t, n) {
                (function () {
                    var t = Array.prototype.slice,
                        l = Array.prototype.forEach,
                        i = function (n) {
                            if ("object" != typeof n) throw n + " is not an object";
                            var e = t.call(arguments, 1);
                            return (
                                l.call(e, function (e) {
                                    if (e) for (var t in e) "object" == typeof e[t] && n[t] ? i.call(n, n[t], e[t]) : (n[t] = e[t]);
                                }),
                                n
                            );
                        };
                    this.extend = i;
                }.call(this));
            },
            {},
        ],
        "biojs-vis-blasterjs": [
            function (r, e, t) {
                var n = r("js-class");
                e.exports = n({
                    constructor: function (e) {
                        var t = this;
                        r("js-extend").extend(this.opt, e);
                        var n = "table tbody tr td button:hover{ text-decoration: underline;}",
                            l = document.createElement("style");
                        if ((l.styleSheet ? (l.styleSheet.cssText = n) : l.appendChild(document.createTextNode(n)), document.getElementsByTagName("head")[0].appendChild(l), t.opt.string)) {
                            var i = { target: { files: [new Blob([t.opt.string], { type: "text/plain" })] } };
                            t._displayAlignments(i, t);
                        } else
                            document.getElementById(t.opt.input).addEventListener(
                                "change",
                                function (e) {
                                    t._displayAlignments(e, t);
                                },
                                !1
                            );
                    },
                    opt: { input: "blastinput", multipleAlignments: "blast-multiple-alignments", alignmentsTable: "blast-alignments-table", singleAlignment: "blast-single-alignment" },
                    _displayAlignments: function (e, o) {
                        if (window.File && window.FileReader && window.FileList && window.Blob) {
                            var t = e.target.files[0];
                            if (t) {
                                var n = new FileReader();
                                (n.onload = function (e) {
                                    try {
                                        var t = (function (e) {
                                                return e.split("\n")[2].startsWith("<BlastOutput>")
                                                    ? (function (e) {
                                                          for (var t = [], n = e.split("\n"), l = 0, i = 0; i < n.length; i++) n[i].startsWith("<Iteration>") && l++;
                                                          if (1 == l) t.push(e);
                                                          else {
                                                              var r = 0,
                                                                  a = "";
                                                              for (i = 0; i < n.length && !n[(r = i)].startsWith("<Iteration>"); i++) a = a + n[i] + "\n";
                                                              for (var s = 0; s < l; s++) {
                                                                  var o = a + n[r] + "\n";
                                                                  for (r++; void 0 !== n[r] && !n[r].startsWith("<Iteration>"); ) (o = o + n[r] + "\n"), r++;
                                                                  t.push(o);
                                                              }
                                                          }
                                                          return t;
                                                      })(e)
                                                    : (function (e) {
                                                          for (var t = [], n = e.split("\n"), l = 0, i = 0; i < n.length; i++) n[i].startsWith("Query=") && l++;
                                                          if (1 == l) t.push(e);
                                                          else {
                                                              var r = 0,
                                                                  a = "";
                                                              for (i = 0; i < n.length && !n[(r = i)].startsWith("Query="); i++) a = a + n[i] + "\n";
                                                              for (var s = 0; s < l; s++) {
                                                                  var o = a + n[r] + "\n";
                                                                  for (r++; void 0 !== n[r] && !n[r].startsWith("Query="); ) (o = o + n[r] + "\n"), r++;
                                                                  (o += "\nend\n"), t.push(o);
                                                              }
                                                          }
                                                          return t;
                                                      })(e);
                                            })(e.target.result),
                                            n = c(t[0]),
                                            l = k(t[0]);
                                        if (0 == n.length) f(t, [], 0, l, !0, !0, o);
                                        else {
                                            var i = n[0].hsp.length;
                                            g(t, i, 0, n, l, !0, !0, o), v(n, o), w(n[0], o, i, 0);
                                        }
                                    } catch (e) {
                                        for (var r = ["blast-multiple-alignments", "blast-alignments-table", "blast-single-alignment"], a = 0; a < r.length; a++)
                                            for (var s = document.getElementById(r[a]); s.firstChild; ) s.removeChild(s.firstChild);
                                        alert("ERROR WHILE UPLOADING DATA: You have uploaded an invalid BLAST output file.");
                                    }
                                }),
                                    n.readAsText(t);
                            } else alert("ERROR WHILE UPLOADING DATA: Failed to load file.");
                        } else alert("The File APIs are not fully supported by your browser.");
                        function D(e, t, n, l, i) {
                            (this.description = e), (this.length = t), (this.totalScore = n), (this.queryCover = l), (this.hsp = i);
                        }
                        function N(e, t, n, l, i, r, a, s, o, d, p, c) {
                            (this.score = e),
                                (this.eValue = t),
                                (this.identities = n),
                                (this.positives = l),
                                (this.gaps = i),
                                (this.queryStart = r),
                                (this.query = a),
                                (this.queryEnd = s),
                                (this.comparison = o),
                                (this.subjectStart = d),
                                (this.subject = p),
                                (this.subjectEnd = c);
                        }
                        function k(e) {
                            return e.split("\n")[2].startsWith("<BlastOutput>")
                                ? (function (e) {
                                      for (var t = e.split("\n"), n = 0, l = 0; l < t.length; l++)
                                          if (t[l].includes("<Iteration_query-len>")) {
                                              n = t[l].split(">")[1].split("</")[0];
                                              break;
                                          }
                                      return n;
                                  })(e)
                                : (function (e) {
                                      for (var t = e.split("\n"), n = 0, l = 0; l < t.length; l++)
                                          if (t[l].startsWith("Length=")) {
                                              n = t[l].split("=")[1];
                                              break;
                                          }
                                      return n;
                                  })(e);
                        }
                        function c(e) {
                            return e.split("\n")[2].startsWith("<BlastOutput>")
                                ? (function (e) {
                                      for (var t = e.split("\n"), n = [], l = 0; l < t.length; l++)
                                          if (t[l].startsWith("<Hit>")) {
                                              for (var i = "", r = l; r < t.length && ((i += t[r]), !t[r].includes("</Hit>")); r++);
                                              for (
                                                  var a = i.split("<Hit_id>")[1].split("</")[0],
                                                      s = i.split("<Hit_def>")[1].split("</")[0],
                                                      o = a.concat(" ").concat(s),
                                                      d = i.split("<Hit_len>")[1].split("</")[0],
                                                      p = [],
                                                      c = i.split("<Hit_hsps>")[1].split("</Hit_hsps>")[0].split("</Hsp>"),
                                                      u = 0;
                                                  u < c.length - 1;
                                                  u++
                                              ) {
                                                  var m = c[u].split("<Hsp_bit-score>")[1].split("</")[0],
                                                      h = c[u].split("<Hsp_evalue>")[1].split("</")[0],
                                                      f = c[u].split("<Hsp_identity>")[1].split("</")[0],
                                                      g = c[u].split("<Hsp_align-len>")[1].split("</")[0],
                                                      y = (f / g) * 100;
                                                  if (t[3].includes("<BlastOutput_program>blastn</BlastOutput_program>"))
                                                      var v = "N/A",
                                                          b = (c[u].split("<Hsp_gaps>")[1].split("</")[0] / g) * 100;
                                                  else {
                                                      var C = c[u].split("<Hsp_positive>")[1].split("</")[0];
                                                      (v = parseFloat((C / g) * 100).toFixed(0)), (b = (c[u].split("<Hsp_gaps>")[1].split("</")[0] / g) * 100);
                                                  }
                                                  var E = c[u].split("<Hsp_query-from>")[1].split("</")[0],
                                                      x = c[u].split("<Hsp_qseq>")[1].split("</")[0],
                                                      T = c[u].split("<Hsp_query-to>")[1].split("</")[0],
                                                      H = c[u].split("<Hsp_midline>")[1].split("</")[0],
                                                      F = c[u].split("<Hsp_hit-from>")[1].split("</")[0],
                                                      w = c[u].split("<Hsp_hseq>")[1].split("</")[0],
                                                      L = c[u].split("<Hsp_hit-to>")[1].split("</")[0],
                                                      A = new N(m, h, parseFloat(y).toFixed(0), v, parseFloat(b).toFixed(0), E, x, T, H, F, w, L);
                                                  p.push(A);
                                              }
                                              for (var I = parseFloat(p[0].score), B = 1; B < p.length; B++) I += parseFloat(p[B].score);
                                              var M = new D(o, d, I.toFixed(1), _(p, k(e)), p);
                                              n.push(M);
                                          }
                                      return n;
                                  })(e)
                                : (function (e) {
                                      for (var t = e.split("\n"), n = [], l = 0; l < t.length; l++)
                                          if (t[l].startsWith(">")) {
                                              for (var i = t[l].split(">")[1], r = "", a = l; "" == r; ) t[(a += 1)].startsWith("Length=") ? (r = t[a]) : (i += t[a]);
                                              var s = i,
                                                  o = r.split("=")[1],
                                                  d = [],
                                                  p = !1;
                                              do {
                                                  if ((p && (a -= 1), t[a + 2].startsWith(" Features in this part of subject sequence:"))) for (a += 3; !t[a + 2].startsWith(" Score ="); ) a++;
                                                  var c = t[a + 2].split(",")[0].replace(/\s\s+/g, " ").split(" ")[3],
                                                      u = t[a + 2].split(",")[1].split(" ")[4],
                                                      m = t[a + 3]
                                                          .split(",")[0]
                                                          .split("(")[1]
                                                          .substr(0, t[a + 3].split(",")[0].split("(")[1].length - 2);
                                                  if (t[0].startsWith("BLASTN"))
                                                      var h = "N/A",
                                                          f = t[a + 3]
                                                              .split(",")[1]
                                                              .split("(")[1]
                                                              .substr(0, t[a + 3].split(",")[1].split("(")[1].length - 2);
                                                  else
                                                      (h = t[a + 3]
                                                          .split(",")[1]
                                                          .split("(")[1]
                                                          .substr(0, t[a + 3].split(",")[1].split("(")[1].length - 2)),
                                                          (f = t[a + 3]
                                                              .split(",")[2]
                                                              .split("(")[1]
                                                              .substr(0, t[a + 3].split(",")[2].split("(")[1].length - 2));
                                                  ("Frame" != t[a + 4].split(",")[0].split(" ")[1] && !t[a + 4].startsWith(" Strand")) || (a += 1);
                                                  var g = t[a + 5].substring(5).replace(/^\s+/g, "").split(" ")[0],
                                                      y = t[a + 5].substring(5).replace(/\s+/g, "").replace(/[0-9]/g, ""),
                                                      v = t[a + 5].substring(5).replace(/^\s+/g, "").split(" ")[t[a + 5].substring(5).replace(/^\s+/g, "").split(" ").length - 1],
                                                      b = t[a + 6].replace(/^\s+/g, ""),
                                                      C = t[a + 7].substring(5).replace(/^\s+/g, "").split(" ")[0],
                                                      E = t[a + 7].substring(5).replace(/\s+/g, "").replace(/[0-9]/g, ""),
                                                      x = t[a + 7].substring(5).replace(/^\s+/g, "").split(" ")[t[a + 7].substring(5).replace(/^\s+/g, "").split(" ").length - 1];
                                                  for (a += 9; t[a].startsWith("Query"); ) {
                                                      var T = t[a].substring(5).replace(/\s+/g, "").replace(/[0-9]/g, "");
                                                      (y += T),
                                                          (v = t[a].substring(5).replace(/^\s+/g, "").split(" ")[t[a].substring(5).replace(/^\s+/g, "").split(" ").length - 1]),
                                                          (E += t[a + 2].substring(5).replace(/\s+/g, "").replace(/[0-9]/g, "")),
                                                          (x = t[a + 2].substring(5).replace(/^\s+/g, "").split(" ")[t[a + 2].substring(5).replace(/^\s+/g, "").split(" ").length - 1]);
                                                      var H = t[a + 1].replace(/^\s+/g, "");
                                                      if (T.length > H.length) for (var F = T.length - H.length, w = 0; w < F; w++) H = " " + H;
                                                      (b += H), (a += 4);
                                                  }
                                                  var L = new N(c, u, m, h, f, g, y, v, b, C, E, x);
                                                  d.push(L), (p = !0);
                                              } while (t[a + 1].startsWith(" Score"));
                                              for (var A = parseFloat(d[0].score), I = 1; I < d.length; I++) A += parseFloat(d[I].score);
                                              var B = new D(s, o, A.toFixed(1), _(d, k(e)), d);
                                              n.push(B);
                                          }
                                      return n;
                                  })(e);
                        }
                        function _(e, t) {
                            for (var n = 0, l = u(e), i = 0; i < l.length; i++) n += parseInt((100 * (l[i].end - l[i].start + 1)) / t);
                            return n;
                        }
                        function u(e) {
                            for (var t = [], n = 0; n < e.length; n++)
                                parseInt(e[n].queryStart) > parseInt(e[n].queryEnd) ? t.push({ start: parseInt(e[n].queryEnd), end: parseInt(e[n].queryStart) }) : t.push({ start: parseInt(e[n].queryStart), end: parseInt(e[n].queryEnd) });
                            return (function (e) {
                                for (var t = [], n = 0; n < e.length; n++) {
                                    for (var l = e[n][0].start, i = e[n][0].end, r = 0; r < e[n].length; r++) e[n][r].start < l && (l = e[n][r].start), e[n][r].end > i && (i = e[n][r].end);
                                    t.push({ start: l, end: i });
                                }
                                return t;
                            })(
                                (function (e) {
                                    e.sort(function (e, t) {
                                        return e.start < t.start ? -1 : e.start > t.start ? 1 : 0;
                                    });
                                    var t = [],
                                        n = 0;
                                    t[n] = [e[0]];
                                    for (var l = 1, i = e.length; l < i; l++)
                                        e[l].start >= e[l - 1].start &&
                                        e[l].start <
                                            (0 != (r = t[n]).length &&
                                                (r.sort(function (e, t) {
                                                    return e.end < t.end ? 1 : e.end > t.end ? -1 : 0;
                                                }),
                                                r[0].end))
                                            ? t[n].push(e[l])
                                            : (t[++n] = [e[l]]);
                                    var r;
                                    return t;
                                })(t)
                            );
                        }
                        function d(e, t) {
                            if (e)
                                switch (t) {
                                    case 1:
                                        return "<40";
                                    case 2:
                                        return "40-50";
                                    case 3:
                                        return "50-80";
                                    case 4:
                                        return "80-200";
                                    case 5:
                                        return ">=200";
                                    default:
                                        return "0";
                                }
                            else
                                switch (t) {
                                    case 1:
                                        return ">100";
                                    case 2:
                                        return "100-1";
                                    case 3:
                                        return "1-1e<sup>-2</sup>";
                                    case 4:
                                        return "1e<sup>-2</sup>-1e<sup>-5</sup>";
                                    case 5:
                                        return "<1e<sup>-5</sup>";
                                    default:
                                        return "0";
                                }
                        }
                        function b(e, t) {
                            if (e)
                                switch (t) {
                                    case 1:
                                        return "#5C6D7E";
                                    case 2:
                                        return "#9B59B6";
                                    case 3:
                                        return "#5CACE2";
                                    case 4:
                                        return "#57D68D";
                                    case 5:
                                        return "#C0392B";
                                    default:
                                        return "#FFF";
                                }
                            else
                                switch (t) {
                                    case 1:
                                        return "#BCBCBC";
                                    case 2:
                                        return "#989898";
                                    case 3:
                                        return "#747474";
                                    case 4:
                                        return "#565656";
                                    case 5:
                                        return "#343434";
                                    default:
                                        return "#FFF";
                                }
                        }
                        function m(e) {
                            var t,
                                n = document.getElementById(e).parentElement.parentElement,
                                l = document.getElementsByClassName("alignment-table-description");
                            for (t = 0; t < l.length; t++) (l[t].style.fontWeight = "normal"), (l[t].parentElement.parentElement.style.fontWeight = "normal");
                            (n.style.fontWeight = "bold"), (document.getElementById(e).style.fontWeight = "bold");
                        }
                        function p(e) {
                            var t = document.createElement("div"),
                                n = document.createElement("div"),
                                l = document.createElement("div"),
                                i = document.createElement("div");
                            return (
                                (t.style.marginBottom = "5px"),
                                (t.style.fontSize = "11px"),
                                (n.style.minWidth = "50px"),
                                (n.style.minHeight = "10px"),
                                (n.style.float = "left"),
                                (l.style.float = "left"),
                                (i.style.clear = "both"),
                                (l = (function (e, t) {
                                    var n = document.createElement("div");
                                    if (4 < t)
                                        if (t % 5 == 0) e = a(e, 5, t / 5, 100);
                                        else {
                                            var l = 500 / (5 + (t % 5) / 5);
                                            e = a(e, 5, parseInt(t / 5), parseInt(l));
                                            var i = parseInt(500 - 5 * l),
                                                r = document.createElement("div");
                                            (r.style.float = "left"), (r.style.width = i + "px"), (r.style.textAlign = "right"), (r.innerHTML = t), e.appendChild(r);
                                        }
                                    else e = a(e, t, 1, parseInt(500 / t));
                                    return (n.style.clear = "both"), e.appendChild(n), e;
                                })(l, e)),
                                t.appendChild(n),
                                t.appendChild(l),
                                t.appendChild(i),
                                t
                            );
                        }
                        function a(e, t, n, l) {
                            for (var i = 0; i < t; i++)
                                if (0 == i) {
                                    var r = l / 2,
                                        a = document.createElement("div"),
                                        s = document.createElement("div");
                                    (a.style.float = "left"),
                                        (a.style.width = r + "px"),
                                        (a.style.textAlign = "left"),
                                        (a.innerHTML = "0"),
                                        (s.style.float = "left"),
                                        (s.style.width = r + "px"),
                                        (s.style.textAlign = "right"),
                                        (s.innerHTML = n * (i + 1)),
                                        e.appendChild(a),
                                        e.appendChild(s);
                                } else {
                                    var o = document.createElement("div");
                                    (o.style.float = "left"), (o.style.width = l + "px"), (o.style.textAlign = "right"), (o.innerHTML = n * (i + 1)), e.appendChild(o);
                                }
                            return e;
                        }
                        function C(e, t, n, l) {
                            var i = document.createElement("div"),
                                r = (function (e, t) {
                                    var n = document.createElement("div"),
                                        l = document.createElement("div"),
                                        i = document.createElement("div");
                                    (n.style.color = "#EEE"), (l.style.minWidth = "50px"), (l.style.minHeight = "10px"), (l.style.float = "left"), n.appendChild(l);
                                    for (var r = 1; r <= 5; r++) {
                                        var a = document.createElement("div");
                                        (a.style.minWidth = "100px"), (a.style.textAlign = "center"), (a.style.float = "left"), (a.innerHTML = d(t, r).bold()), (a.style.backgroundColor = b(e, r)), n.appendChild(a);
                                    }
                                    return (i.style.clear = "both"), n.appendChild(i), n;
                                })(t, n),
                                a = (function (e) {
                                    var t = document.createElement("div"),
                                        n = document.createElement("div"),
                                        l = document.createElement("div"),
                                        i = document.createElement("div");
                                    return (
                                        (t.style.marginTop = "3px"),
                                        (t.style.color = "#5C6D7E"),
                                        (t.style.fontSize = "10px"),
                                        (n.style.width = "50px"),
                                        (n.innerHTML = "QUERY".bold()),
                                        (n.style.float = "left"),
                                        (l.style.width = "500px"),
                                        (l.style.height = "10px"),
                                        (l.style.float = "left"),
                                        (l.style.marginTop = "2px"),
                                        (i.style.clear = "both"),
                                        (l.style.backgroundColor = e ? "#C0392B" : "#343434"),
                                        t.appendChild(n),
                                        t.appendChild(l),
                                        t.appendChild(i),
                                        t
                                    );
                                })(t),
                                s = p(l);
                            return (
                                (i.style.color = "#5C6D7E"),
                                (i.style.textAlign = "center"),
                                (i.style.paddingBottom = "5px"),
                                (i.innerHTML = "COLOR KEY FOR ALIGNMENT SCORES".bold()),
                                e.appendChild(i),
                                e.appendChild(r),
                                e.appendChild(a),
                                e.appendChild(s),
                                e
                            );
                        }
                        function E(e, t, n) {
                            var l = u(t.hsp),
                                i = document.createElement("div"),
                                r = document.createElement("div");
                            i.style.minHeight = "12px";
                            for (var a = 0; a < l.length; a++) {
                                var s = document.createElement("div"),
                                    o = document.createElement("div"),
                                    d = document.createElement("a");
                                if (0 == a) {
                                    if (1 == l[0].start) var p = parseInt(50 + (500 * (l[0].start - 1)) / n);
                                    else p = parseInt(50 + (500 * l[0].start) / n);
                                    var c = parseInt(550 - p - (500 * (n - l[0].end)) / n);
                                } else (p = parseInt((500 * (l[a].start - l[a - 1].end)) / n)), (c = parseInt((500 * (l[a].end - l[a].start)) / n));
                                (s.style.width = p + "px"),
                                    (s.style.minHeight = "4px"),
                                    (s.style.float = "left"),
                                    (o.style.width = c + "px"),
                                    (o.style.minHeight = "12px"),
                                    (o.style.float = "left"),
                                    (o.style.backgroundColor = e),
                                    (o.onmouseout = function () {
                                        document.getElementById("defline").value = " Mouse over to show defline and scores, click to show alignments";
                                    }),
                                    (o.onmouseover = function () {
                                        document.getElementById("defline").value = " " + t.description + ". S=" + t.hsp[0].score + " E=" + t.hsp[0].eValue;
                                    }),
                                    (d.href = "#" + t.description.split(" ")[0]),
                                    (d.onclick = function () {
                                        m(t.description.split(" ")[0]);
                                    }),
                                    d.appendChild(o),
                                    i.appendChild(s),
                                    i.appendChild(d);
                            }
                            return (r.style.clear = "both"), i.appendChild(r), i;
                        }
                        function x(e, t, n, l, i, r, a, s) {
                            var o = document.createElement("button");
                            if (((o.id = "changeScore"), (o.className = "btn"), (o.style.marginRight = "10px"), (o.style.marginTop = "5px"), 1 == a)) var d = document.createTextNode("Change scoring to E value");
                            else d = document.createTextNode("Change scoring to Max score");
                            return (
                                o.appendChild(d),
                                (o.onclick = function () {
                                    !(function (e, t, n, l, i, r, a, s, o) {
                                        s = 1 != s;
                                        r.removeChild(r.childNodes[0]);
                                        var d = document.getElementById(o.opt.multipleAlignments);
                                        for (; d.firstChild; ) d.removeChild(d.firstChild);
                                        g(e, t, n, l, i, a, s, o);
                                    })(e, t, n, l, i, o, r, a, s);
                                }),
                                o
                            );
                        }
                        function T(e, t, n, l, i, r, a, s) {
                            var o = document.createElement("button");
                            if (((o.id = "changeColors"), (o.className = "btn"), (o.style.marginRight = "10px"), (o.style.marginTop = "5px"), 1 == r)) var d = document.createTextNode("Change colours to grayscale");
                            else d = document.createTextNode("Change colours to full colored");
                            return (
                                o.appendChild(d),
                                (o.onclick = function () {
                                    !(function (e, t, n, l, i, r, a, s, o) {
                                        a = 1 != a;
                                        r.removeChild(r.childNodes[0]);
                                        var d = document.getElementById(o.opt.multipleAlignments);
                                        for (; d.firstChild; ) d.removeChild(d.firstChild);
                                        g(e, t, n, l, i, a, s, o);
                                    })(e, t, n, l, i, o, r, a, s);
                                }),
                                o
                            );
                        }
                        function H(e) {
                            var t = document.createElement("button");
                            (t.id = "downloadAlignments" + e), (t.className = "btn"), (t.style.marginRight = "10px"), (t.style.marginTop = "5px");
                            var n = document.createTextNode("Download as " + e);
                            return (
                                t.appendChild(n),
                                t.addEventListener(
                                    "click",
                                    function () {
                                        !(function (n) {
                                            var l = document.getElementById("blast-multiple-alignments-buttons"),
                                                i = document.getElementById("defline"),
                                                r = document.getElementById("alignments-container");
                                            r.removeChild(l),
                                                r.removeChild(i),
                                                html2canvas(r, {
                                                    onrendered: function (e) {
                                                        document.body.appendChild(e);
                                                        var t = document.createElement("a");
                                                        document.body.appendChild(t),
                                                            (t.href = "JPEG" == n ? e.toDataURL("image/jpeg") : e.toDataURL("img/png")),
                                                            (t.download = "alignments." + n.toLowerCase()),
                                                            t.click(),
                                                            document.body.removeChild(e),
                                                            document.body.removeChild(t),
                                                            r.appendChild(i),
                                                            r.appendChild(l),
                                                            (t = document.createElement("a")),
                                                            document.body.appendChild(t),
                                                            (t.href = "#blast-multiple-alignments"),
                                                            t.click(),
                                                            document.body.removeChild(t);
                                                    },
                                                });
                                        })(e);
                                    },
                                    !1
                                ),
                                t
                            );
                        }
                        function h(e) {
                            return e.split("\n")[2].startsWith("<BlastOutput>")
                                ? (function (e) {
                                      for (var t = e.split("\n"), n = 0; n < t.length; n++) if (t[n].includes("<Iteration_query-def>")) return t[n].split(">")[1].split("</")[0];
                                  })(e)
                                : (function (e) {
                                      for (var t = e.split("\n"), n = "", l = 0; l < t.length; l++)
                                          if (t[l].startsWith("Query=")) {
                                              for (n = t[l].split("=")[1], l++; !t[l].startsWith("Length="); ) (n = n + " " + t[l]), l++;
                                              break;
                                          }
                                      return n;
                                  })(e);
                        }
                        function F(e, t, n, l, i, r, a) {
                            var s = document.createElement("select");
                            (s.style.width = "430px"), (s.style.marginBottom = "20px"), (s.style.color = "#5C6D7E"), (s.style.float = "right");
                            for (var o = 0; o < e.length; o++) {
                                var d = document.createElement("option");
                                (d.value = o), (d.text = h(e[o])), o == n && (d.selected = "selected"), s.appendChild(d);
                            }
                            return (
                                (s.onchange = function () {
                                    !(function (e, t, n, l, i, r, a) {
                                        var s = c(e[n]);
                                        if (((l = k(e[n])), 0 == s.length)) {
                                            for (var o = ["blast-alignments-table", "blast-single-alignment"], d = 0; d < o.length; d++) for (var p = document.getElementById(o[d]); p.firstChild; ) p.removeChild(p.firstChild);
                                            f(e, [], n, l, !0, !0, a);
                                        } else {
                                            g(e, t, n, s, l, i, r, a), v(s, a);
                                            t = s[0].hsp.length;
                                            w(s[0], a, t, 0);
                                        }
                                    })(e, t, s.value, l, i, r, a);
                                }),
                                s
                            );
                        }
                        function f(e, t, n, l, i, r, a) {
                            for (var s = document.getElementById(a.opt.multipleAlignments); s.hasChildNodes(); ) s.removeChild(s.firstChild);
                            var o = document.createElement("div"),
                                d = document.createElement("div"),
                                p = document.createElement("div");
                            if (
                                ((s.style.paddingTop = "20px"),
                                (o.id = "alignments-container"),
                                (o.style.border = "thin solid #DDD"),
                                (o.style.margin = "0 auto"),
                                (o.style.padding = "10px"),
                                (o.style.maxWidth = "580px"),
                                (o.style.backgroundColor = "#FFF"),
                                (p.innerHTML = "***NO HITS FOUND***"),
                                (p.style.fontWeight = "bold"),
                                (p.style.paddingTop = "30px"),
                                (p.style.paddingBottom = "50px"),
                                (p.style.textAlign = "center"),
                                1 < e.length)
                            ) {
                                var c = F(e, t, n, l, i, r, a),
                                    u = document.createElement("div"),
                                    m = document.createElement("div");
                                (m.style.clear = "both"), (u.innerHTML = "RESULTS FOR:".bold()), (u.style.marginBottom = "5px"), (u.style.color = "#5C6D7E"), (u.style.float = "left"), o.appendChild(u), o.appendChild(c), o.appendChild(m);
                            }
                            (o = C(o, i, r, l)).appendChild(p), (s.style.minWidth = "580px"), o.appendChild(d), s.appendChild(o);
                        }
                        function g(e, t, n, l, i, r, a, s) {
                            for (var o = document.getElementById(s.opt.multipleAlignments); o.hasChildNodes(); ) o.removeChild(o.firstChild);
                            var d = document.createElement("div"),
                                p = document.createElement("div"),
                                c = document.createElement("input"),
                                u = T(e, t, n, l, i, r, a, s),
                                m = x(e, t, n, l, i, r, a, s),
                                h = H("PNG"),
                                f = H("JPEG");
                            if (
                                ((o.style.paddingTop = "20px"),
                                (c.id = "defline"),
                                (c.name = "defline"),
                                (c.type = "text"),
                                (c.value = " Mouse over to show defline and scores, click to show alignments"),
                                (c.style.width = "556px"),
                                (c.style.padding = "1px"),
                                (c.style.border = 0),
                                (c.style.cursos = "auto"),
                                (d.id = "alignments-container"),
                                (d.style.border = "thin solid #DDD"),
                                (d.style.margin = "0 auto"),
                                (d.style.padding = "10px"),
                                (d.style.maxWidth = "580px"),
                                (d.style.backgroundColor = "#FFF"),
                                1 < e.length)
                            ) {
                                var g = F(e, t, n, i, r, a, s),
                                    y = document.createElement("div"),
                                    v = document.createElement("div");
                                (v.style.clear = "both"), (y.innerHTML = "RESULTS FOR:".bold()), (y.style.marginBottom = "5px"), (y.style.color = "#5C6D7E"), (y.style.float = "left"), d.appendChild(y), d.appendChild(g), d.appendChild(v);
                            }
                            (d = (function (e, t, n, l, i) {
                                var r,
                                    a,
                                    s,
                                    o,
                                    d = document.createElement("div");
                                d.style.paddingBottom = "10px";
                                for (var p = 0; p < e.length; p++) {
                                    var c = E(
                                        ((r = l),
                                        (a = i),
                                        (s = e[p].hsp[0].score),
                                        (o = e[p].hsp[0].eValue),
                                        b(r, a ? (s < 40 ? 1 : 40 <= s && s < 50 ? 2 : 50 <= s && s < 80 ? 3 : 80 <= s && s < 200 ? 4 : 5) : 100 < o ? 1 : o <= 100 && 1 < o ? 2 : o <= 1 && 0.01 < o ? 3 : o <= 0.01 && 1e-5 < o ? 4 : 5)),
                                        e[p],
                                        t
                                    );
                                    (c.style.marginBottom = "4px"), d.appendChild(c);
                                }
                                return n.appendChild(d), n;
                            })(l, i, (d = C(d, r, a, i)), r, a)).appendChild(c),
                                (p.style.textAlign = "right"),
                                (p.id = "blast-multiple-alignments-buttons"),
                                (o.style.minWidth = "580px"),
                                p.appendChild(m),
                                p.appendChild(u),
                                p.appendChild(document.createElement("br")),
                                p.appendChild(h),
                                p.appendChild(f),
                                d.appendChild(p),
                                o.appendChild(d);
                        }
                        function y(e) {
                            var t = document.createElement("div"),
                                n = document.createElement("button"),
                                l = document.createElement("button"),
                                i = document.createElement("button");
                            return (
                                (t.style.textAlign = "right"),
                                (n.style.marginRight = "10px"),
                                (n.className = "btn"),
                                (n.innerHTML = "Download as CSV"),
                                (n.onclick = function () {
                                    !(function (e) {
                                        var t = "data:text/csv;charset=utf-8,";
                                        t += "Description; Score; eValue; Identities; Positives; Gaps\n";
                                        for (var n = 0; n < e.length; n++)
                                            (t += e[n].description),
                                                (t += "; "),
                                                (t += e[n].hsp[0].score),
                                                (t += "; "),
                                                (t += e[n].hsp[0].eValue),
                                                (t += "; "),
                                                (t += e[n].hsp[0].identities),
                                                (t += "; "),
                                                (t += e[n].hsp[0].positives),
                                                (t += "; "),
                                                (t += e[n].hsp[0].gaps),
                                                (t += "\n");
                                        var l = encodeURI(t),
                                            i = document.createElement("a");
                                        i.setAttribute("href", l), i.setAttribute("download", "alignments-table.csv"), i.click();
                                    })(e);
                                }),
                                (i.className = "btn"),
                                (i.innerHTML = "Download as PNG"),
                                (i.onclick = function () {
                                    r("PNG");
                                }),
                                (i.style.marginRight = "10px"),
                                (l.className = "btn"),
                                (l.innerHTML = "Download as JPEG"),
                                (l.onclick = function () {
                                    r("JPEG");
                                }),
                                t.appendChild(n),
                                t.appendChild(i),
                                t.appendChild(l),
                                t
                            );
                        }
                        function v(e, t) {
                            for (var n = document.getElementById(t.opt.alignmentsTable); n.hasChildNodes(); ) n.removeChild(n.firstChild);
                            var l = document.createElement("div"),
                                i = y(e),
                                r = (function () {
                                    var e = document.createElement("table"),
                                        t = document.createElement("thead"),
                                        n = document.createElement("tr"),
                                        l = document.createElement("th"),
                                        i = document.createElement("th"),
                                        r = document.createElement("th"),
                                        a = document.createElement("th"),
                                        s = document.createElement("th"),
                                        o = document.createElement("th");
                                    return (
                                        (e.className = "table table-striped"),
                                        (l.innerHTML = "Description".bold()),
                                        (i.innerHTML = "Max score".bold()),
                                        (r.innerHTML = "Total score".bold()),
                                        (a.innerHTML = "Query cover".bold()),
                                        (s.innerHTML = "E value".bold()),
                                        (o.innerHTML = "Identities".bold()),
                                        n.appendChild(l),
                                        n.appendChild(i),
                                        n.appendChild(r),
                                        n.appendChild(a),
                                        n.appendChild(s),
                                        n.appendChild(o),
                                        t.appendChild(n),
                                        e.appendChild(t),
                                        e
                                    );
                                })(),
                                a = document.createElement("tbody");
                            (n.style.paddingTop = "50px"), (l.style.backgroundColor = "#FFF"), (l.id = "blast-alignments-table-img");
                            for (var s = 0; s < e.length; s++) {
                                var o = document.createElement("tr"),
                                    d = document.createElement("td"),
                                    p = document.createElement("button");
                                (p.alignment = e[s]),
                                    (p.onclick = function () {
                                        t.opt.callback ? t.opt.callback(this.alignment) : ((location.href = "#" + t.opt.singleAlignment), w(this.alignment, t, this.alignment.hsp.length, 0));
                                    }),
                                    (p.id = e[s].description.split(" ")[0]),
                                    (p.innerHTML = e[s].description),
                                    (p.style.border = 0),
                                    (p.style.padding = 0),
                                    (p.style.display = "inline"),
                                    (p.style.background = "none"),
                                    (p.className = "alignment-table-description"),
                                    d.appendChild(p);
                                var c = document.createElement("td");
                                c.innerHTML = e[s].hsp[0].score;
                                var u = document.createElement("td");
                                u.innerHTML = e[s].totalScore;
                                var m = document.createElement("td");
                                m.innerHTML = e[s].queryCover + "%";
                                var h = document.createElement("td");
                                h.innerHTML = e[s].hsp[0].eValue;
                                var f = document.createElement("td");
                                (f.innerHTML = e[s].hsp[0].identities + "%"), o.appendChild(d), o.appendChild(c), o.appendChild(u), o.appendChild(m), o.appendChild(h), o.appendChild(f), a.appendChild(o);
                            }
                            r.appendChild(a), l.appendChild(r), n.appendChild(l), n.appendChild(i);
                        }
                        function r(n) {
                            var e,
                                t = document.getElementsByClassName("alignment-table-description");
                            for (e = 0; e < t.length; e++) (t[e].style.fontWeight = "normal"), (t[e].parentElement.parentElement.style.fontWeight = "normal");
                            var l = document.getElementById("blast-alignments-table-img");
                            html2canvas(l, {
                                onrendered: function (e) {
                                    document.body.appendChild(e);
                                    var t = document.createElement("a");
                                    document.body.appendChild(t),
                                        (t.href = "JPEG" == n ? e.toDataURL("image/jpeg") : e.toDataURL("img/png")),
                                        (t.download = "alignments-table." + n.toLowerCase()),
                                        t.click(),
                                        document.body.removeChild(e),
                                        document.body.removeChild(t),
                                        (t = document.createElement("a")),
                                        document.body.appendChild(t),
                                        (t.href = "#blast-alignments-table"),
                                        t.click(),
                                        document.body.removeChild(t);
                                },
                            });
                        }
                        function w(e, t, n, l) {
                            for (var i = document.getElementById(t.opt.singleAlignment); i.hasChildNodes(); ) i.removeChild(i.firstChild);
                            var r = document.createElement("pre"),
                                a = document.createElement("div"),
                                s = document.createElement("button"),
                                o = document.createElement("button"),
                                d = document.createElement("span"),
                                p = document.createElement("div"),
                                c = document.createElement("div"),
                                u = document.createElement("div"),
                                m = document.createElement("div"),
                                h = document.createElement("div"),
                                f = document.createElement("div"),
                                g = document.createElement("div"),
                                y = (function (e, t, n) {
                                    var l = document.createElement("div"),
                                        i = document.createElement("div"),
                                        r = document.createElement("div"),
                                        a = document.createElement("div");
                                    (l.innerHTML = "Query".bold()),
                                        (l.style.display = "inline-block"),
                                        (l.style.marginRight = "20px"),
                                        (l.style.textAlign = "right"),
                                        (l.style.width = "55px"),
                                        (i.innerHTML = String(t).bold()),
                                        (i.style.display = "inline-block"),
                                        (i.style.marginRight = "20px"),
                                        (i.style.width = "25px"),
                                        (r.innerHTML = String(n).bold()),
                                        (r.style.display = "inline-block"),
                                        (r.style.marginLeft = "20px"),
                                        (r.style.marginRight = "70px"),
                                        a.appendChild(l),
                                        a.appendChild(i);
                                    for (var s = 0; s < e.length; s++) {
                                        var o = document.createElement("div");
                                        (o.style.backgroundColor = A(e.charAt(s))), (o.innerHTML = e.charAt(s).bold()), (o.style.width = "18px"), (o.style.textAlign = "center"), (o.style.display = "inline-block"), a.appendChild(o);
                                    }
                                    return a.appendChild(r), a;
                                })(e.hsp[l].query, e.hsp[l].queryStart, e.hsp[l].queryEnd),
                                v = (function (e) {
                                    var t = document.createElement("div"),
                                        n = document.createElement("div");
                                    (n.style.minWidth = "120px"), (n.style.minHeight = "1px"), (n.style.display = "inline-block"), t.appendChild(n);
                                    for (var l = 0; l < e.length; l++) {
                                        var i = document.createElement("div");
                                        (i.style.backgroundColor = A(e.charAt(l))), (i.innerHTML = e.charAt(l).bold()), (i.style.width = "18px"), (i.style.textAlign = "center"), (i.style.display = "inline-block"), t.appendChild(i);
                                    }
                                    return t;
                                })(e.hsp[l].comparison),
                                b = (function (e, t, n) {
                                    var l = document.createElement("div"),
                                        i = document.createElement("div"),
                                        r = document.createElement("div"),
                                        a = document.createElement("div");
                                    (l.innerHTML = "Subject".bold()),
                                        (l.style.display = "inline-block"),
                                        (l.style.textAlign = "right"),
                                        (l.style.marginRight = "20px"),
                                        (l.style.width = "55px"),
                                        (i.style.width = "25px"),
                                        (i.innerHTML = String(t).bold()),
                                        (i.style.display = "inline-block"),
                                        (i.style.marginRight = "20px"),
                                        (r.innerHTML = String(n).bold()),
                                        (r.style.display = "inline-block"),
                                        (r.style.marginLeft = "20px"),
                                        (r.style.marginRight = "70px"),
                                        a.appendChild(l),
                                        a.appendChild(i);
                                    for (var s = 0; s < e.length; s++) {
                                        var o = document.createElement("div");
                                        (o.style.backgroundColor = A(e.charAt(s))), (o.innerHTML = e.charAt(s).bold()), (o.style.width = "18px"), (o.style.textAlign = "center"), (o.style.display = "inline-block"), a.appendChild(o);
                                    }
                                    return a.appendChild(r), a;
                                })(e.hsp[l].subject, e.hsp[l].subjectStart, e.hsp[l].subjectEnd);
                            if (
                                ((r.style.color = "#2c3e50"),
                                (r.style.paddingTop = "25px"),
                                (r.style.paddingBottom = "40px"),
                                (r.style.textAlign = "left"),
                                (r.style.fontFamily = "Helvetica,Arial,sans-serif"),
                                (r.id = "blast-single-alignment-pre"),
                                (a.style.margin = "0 auto"),
                                (a.style.display = "table"),
                                (a.style.paddingTop = "30px"),
                                (i.style.textAlign = "right"),
                                (i.style.paddingTop = "50px"),
                                (o.className = "btn"),
                                (o.innerHTML = "Download as PNG"),
                                (o.style.marginRight = "10px"),
                                (o.onclick = function () {
                                    L(e, "PNG");
                                }),
                                (s.className = "btn"),
                                (s.innerHTML = "Download as JPEG"),
                                (s.onclick = function () {
                                    L(e, "JPEG");
                                }),
                                (d.innerHTML = e.description),
                                (d.style.paddingLeft = "15px"),
                                (d.style.fontWeight = "bold"),
                                (d.style.fontSize = "15px"),
                                (d.style.fontFamily = "Helvetica,Arial,sans-serif"),
                                (p.style.paddingTop = "20px"),
                                (p.style.fontSize = "14px"),
                                (p.style.textAlign = "center"),
                                (p.style.fontFamily = "Helvetica,Arial,sans-serif"),
                                (p.style.display = "table"),
                                (p.style.margin = "0px auto"),
                                (p.style.width = "100%"),
                                (c.innerHTML = "<b>Score:</b></br>" + e.hsp[l].score),
                                (c.style.float = "left"),
                                (c.style.width = "20%"),
                                (u.innerHTML = "<b>Expect:</b></br>" + e.hsp[l].eValue),
                                (u.style.float = "left"),
                                (u.style.width = "20%"),
                                (m.innerHTML = "<b>Identities:</b></br>" + e.hsp[l].identities + "%"),
                                (m.style.float = "left"),
                                (m.style.width = "20%"),
                                (h.innerHTML = "<b>Positives:</b></br>" + e.hsp[l].positives + "%"),
                                (h.style.float = "left"),
                                (h.style.width = "20%"),
                                (f.innerHTML = "<b>Gaps:</b></br>" + e.hsp[l].gaps + "%"),
                                (f.style.float = "left"),
                                (f.style.width = "20%"),
                                (g.style.clear = "both"),
                                p.appendChild(c),
                                p.appendChild(u),
                                p.appendChild(m),
                                p.appendChild(h),
                                p.appendChild(f),
                                p.appendChild(g),
                                a.appendChild(y),
                                a.appendChild(v),
                                a.appendChild(b),
                                r.appendChild(d),
                                r.appendChild(p),
                                r.appendChild(a),
                                i.appendChild(r),
                                1 < n)
                            ) {
                                var C = document.createElement("button");
                                if (((C.className = "btn"), (C.id = "blast-single-alignment-next"), (C.innerHTML = "Next HSP"), (C.style.marginTop = "5px"), (C.style.marginRight = "15px"), (C.style.float = "right"), l == n - 1)) var E = 0;
                                else E = l + 1;
                                (C.onclick = function () {
                                    w(e, t, n, E);
                                }),
                                    r.appendChild(C);
                            }
                            i.appendChild(o), i.appendChild(s);
                        }
                        function L(n, l) {
                            var i = document.getElementById("blast-single-alignment-pre"),
                                r = document.getElementById("blast-single-alignment-next");
                            void 0 !== r && null != r && i.removeChild(r),
                                html2canvas(i, {
                                    onrendered: function (e) {
                                        document.body.appendChild(e);
                                        var t = document.createElement("a");
                                        document.body.appendChild(t),
                                            (t.href = "JPEG" == l ? e.toDataURL("image/jpeg") : e.toDataURL("img/png")),
                                            (t.download = n.description + "-alignment." + l.toLowerCase()),
                                            t.click(),
                                            document.body.removeChild(e),
                                            document.body.removeChild(t),
                                            void 0 !== r && null != r && i.appendChild(r),
                                            (t = document.createElement("a")),
                                            document.body.appendChild(t),
                                            (t.href = "#blast-single-alignment"),
                                            t.click(),
                                            document.body.removeChild(t);
                                    },
                                });
                        }
                        function A(e) {
                            switch (e) {
                                case "A":
                                    return "#DBFA60";
                                case "C":
                                    return "#F9FA60";
                                case "D":
                                    return "#F9605F";
                                case "E":
                                    return "#F9609C";
                                case "F":
                                    return "#5FF99D";
                                case "G":
                                    return "#F9BC5F";
                                case "H":
                                    return "#609DF9";
                                case "I":
                                    return "#99F95A";
                                case "K":
                                    return "#A062FF";
                                case "L":
                                    return "#7EF960";
                                case "M":
                                    return "#63FF63";
                                case "N":
                                    return "#D95DF9";
                                case "P":
                                    return "#F9DA60";
                                case "Q":
                                    return "#F955D8";
                                case "R":
                                    return "#5360FB";
                                case "S":
                                    return "#F97E60";
                                case "T":
                                    return "#FFA563";
                                case "V":
                                    return "#C0F86B";
                                case "W":
                                    return "#FDD9F9";
                                case "Y":
                                    return "#60F9DA";
                                default:
                                    return "#FFFFFF";
                            }
                        }
                        String.prototype.startsWith = function (e) {
                            return 0 === this.indexOf(e);
                        };
                    },
                });
            },
            { "js-class": 1, "js-extend": 2 },
        ],
    },
    {},
    []
);