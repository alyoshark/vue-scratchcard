import { defineComponent as q, computed as B, ref as h, onMounted as E, watch as H, h as m } from "vue";
const L = (e, t, a, r) => {
  const o = e.getImageData(0, 0, t, a), s = o.data.length / r;
  let l = 0;
  for (let c = 0; c < o.data.length; c += r)
    Number(o.data[c]) === 0 && l++;
  return Math.round(l / s * 100);
}, M = (e, t) => {
  const { left: a, top: r } = e.getBoundingClientRect(), o = t.touches && t.touches[0];
  if (o) return { x: o.clientX - a, y: o.clientY - r };
  const s = window.pageYOffset || document.documentElement.scrollTop, l = window.pageXOffset || document.documentElement.scrollLeft;
  return { x: t.pageX - a - l, y: t.pageY - r - s };
}, N = (e, t) => Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2)), S = (e, t) => Math.atan2(t.x - e.x, t.y - e.y), T = (e, t, a) => {
  const { x: r, y: o } = t;
  if (a)
    return e.drawImage(a, r - a.width / 2, o - a.height / 2);
  e.beginPath(), e.arc(r, o, 25, 0, 2 * Math.PI, !1), e.fill();
}, U = (e, t, a, r) => {
  const o = N(t, a), s = S(t, a);
  let { x: l, y: c } = t;
  for (let u = 0; u < o; u++)
    l = t.x + Math.sin(s) * u, c = t.y + Math.cos(s) * u, e.globalCompositeOperation = "destination-out", T(e, { x: l, y: c }, r);
}, y = (e) => Object.keys(e).map((t) => `${t}:${e[t]}`).concat(";"), I = {
  position: "absolute",
  width: "100%",
  height: "100%",
  display: "block"
}, O = document.createElement("canvas"), W = O.getContext("2d"), $ = q({
  emits: ["complete"],
  props: {
    imageUrl: { type: String, required: !0 },
    cardWidth: { type: Number, required: !0 },
    cardHeight: { type: Number, required: !0 },
    finishPercent: { type: Number, required: !0 },
    forceReveal: { type: Boolean, default: !1 },
    brushUrl: String
  },
  setup(e, { slots: t, emit: a }) {
    const r = B(() => ({
      position: "relative",
      display: "block",
      width: `${e.cardWidth}px`,
      height: `${e.cardHeight}px`
    })), o = h(!1), s = h(!1), l = h(!1), c = h(O), u = h(W), g = h({ x: 0, y: 0 }), f = new Image();
    f.crossOrigin = "Anonymous", f.src = e.imageUrl;
    const P = () => {
      var n;
      (n = u.value) == null || n.drawImage(f, 0, 0, e.cardWidth, e.cardHeight), o.value = !0;
    }, v = new Image();
    e.brushUrl && (v.crossOrigin = "Anonymous", v.src = e.brushUrl);
    const w = () => {
      var i;
      const n = c.value;
      l.value || ((i = n == null ? void 0 : n.parentNode) == null || i.removeChild(n), a("complete")), l.value = !0;
    }, C = (n) => {
      s.value = !0, g.value = M(c.value, n);
    }, x = () => {
      s.value = !1;
    }, b = (n) => {
      if (!s.value) return;
      n.preventDefault();
      const i = M(c.value, n), p = g.value, d = u.value;
      if (!d) return;
      U(d, p, i, v), g.value = i, L(d, e.cardWidth, e.cardHeight, 32) > e.finishPercent && w();
    };
    return E(() => {
      var i;
      const n = (i = c.value) == null ? void 0 : i.getContext("2d");
      if (!n)
        throw Error(
          `can't start a CanvasRenderingContext2D from ${c.value}`
        );
      u.value = n, f.onload = P;
    }), H(
      () => e.forceReveal,
      (n) => n && w()
    ), () => {
      const n = t.default;
      if (!n) throw Error("please pass a default content slot");
      const i = m(
        "div",
        { style: y(I) },
        n()
      ), d = [m("canvas", {
        style: y(I),
        onMousedown: C,
        onMousemove: b,
        onMouseup: x,
        onTouchstart: C,
        onTouchmove: b,
        onTouchend: x,
        width: e.cardWidth,
        height: e.cardHeight,
        ref: c
      })];
      return o.value && d.unshift(i), m("div", { style: y(r.value) }, d);
    };
  }
}), k = {
  install(e) {
    e.component("vue-scratchcard", $);
  }
};
export {
  k as default
};
