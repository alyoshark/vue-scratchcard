import { defineComponent, computed, ref, onMounted, watch, h } from "vue";
const calcCoverPercent = (ctx, width, height, stride) => {
  if (!stride || stride < 1)
    stride = 1;
  const pixels = ctx.getImageData(0, 0, width, height);
  const total = pixels.data.length / stride;
  let count = 0;
  for (let i = 0; i < pixels.data.length; i += stride) {
    if (Number(pixels.data[i]) === 0)
      count++;
  }
  return Math.round(count / total * 100);
};
const getCoord = (canvas, e) => {
  const { left, top } = canvas.getBoundingClientRect();
  const touch = e.touches && e.touches[0];
  if (touch)
    return { x: touch.clientX - left, y: touch.clientY - top };
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  return { x: e.pageX - left - scrollLeft, y: e.pageY - top - scrollTop };
};
const distanceBetween = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
const angleBetween = (p1, p2) => Math.atan2(p2.x - p1.x, p2.y - p1.y);
const scratchAt = (ctx, p, brush) => {
  const { x, y } = p;
  if (brush) {
    return ctx.drawImage(brush, x - brush.width / 2, y - brush.height / 2);
  }
  ctx.beginPath();
  ctx.arc(x, y, 25, 0, 2 * Math.PI, false);
  ctx.fill();
};
const drawLine = (ctx, lp, cp, brush) => {
  const distance = distanceBetween(lp, cp);
  const angle = angleBetween(lp, cp);
  let { x, y } = lp;
  for (let i = 0; i < distance; i++) {
    x = lp.x + Math.sin(angle) * i;
    y = lp.y + Math.cos(angle) * i;
    ctx.globalCompositeOperation = "destination-out";
    scratchAt(ctx, { x, y }, brush);
  }
};
const styleConcat = (style) => Object.keys(style).map((k) => `${k}:${style[k]}`).concat(";");
const styleBlockFiller = {
  position: "absolute",
  width: "100%",
  height: "100%",
  display: "block"
};
const emptyCanvas = document.createElement("canvas");
const emptyContext = emptyCanvas.getContext("2d");
var ScratchCard = defineComponent({
  emits: ["complete"],
  props: {
    imageUrl: { type: String, required: true },
    cardWidth: { type: Number, required: true },
    cardHeight: { type: Number, required: true },
    finishPercent: { type: Number, required: true },
    forceReveal: { type: Boolean, default: false },
    brushUrl: String
  },
  setup(props, { slots, emit }) {
    const styleSize = computed(() => ({
      position: "relative",
      display: "block",
      width: `${props.cardWidth}px`,
      height: `${props.cardHeight}px`
    }));
    const overlayLoaded = ref(false);
    const isDrawing = ref(false);
    const isFinished = ref(false);
    const canvas = ref(emptyCanvas);
    const ctx = ref(emptyContext);
    const lastPoint = ref({ x: 0, y: 0 });
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = props.imageUrl;
    const overlayLoadedCb = () => {
      var _a;
      (_a = ctx.value) == null ? void 0 : _a.drawImage(image, 0, 0, props.cardWidth, props.cardHeight);
      overlayLoaded.value = true;
    };
    const brush = new Image();
    if (props.brushUrl) {
      brush.crossOrigin = "Anonymous";
      brush.src = props.brushUrl;
    }
    const reveal = () => {
      var _a;
      const cv = canvas.value;
      if (!isFinished.value) {
        (_a = cv == null ? void 0 : cv.parentNode) == null ? void 0 : _a.removeChild(cv);
        emit("complete");
      }
      isFinished.value = true;
    };
    const onMousedown = (e) => {
      isDrawing.value = true;
      lastPoint.value = getCoord(canvas.value, e);
    };
    const onMouseup = () => {
      isDrawing.value = false;
    };
    const onMousemove = (e) => {
      if (!isDrawing.value)
        return;
      e.preventDefault();
      const cp = getCoord(canvas.value, e);
      const lp = lastPoint.value;
      const c = ctx.value;
      if (!c)
        return;
      drawLine(c, lp, cp, brush);
      lastPoint.value = cp;
      const pct = calcCoverPercent(c, props.cardWidth, props.cardHeight, 32);
      if (pct > props.finishPercent)
        reveal();
    };
    onMounted(() => {
      var _a;
      const c = (_a = canvas.value) == null ? void 0 : _a.getContext("2d");
      if (!c)
        throw Error(`can't start a CanvasRenderingContext2D from ${canvas.value}`);
      ctx.value = c;
      image.onload = overlayLoadedCb;
    });
    watch(() => props.forceReveal, (val) => val && reveal());
    return () => {
      const defaultSlot = slots.default;
      if (!defaultSlot)
        throw Error("please pass a default content slot");
      const renderContent = h("div", { style: styleConcat(styleBlockFiller) }, defaultSlot());
      const renderCanvas = h("canvas", {
        style: styleConcat(styleBlockFiller),
        onMousedown,
        onMousemove,
        onMouseup,
        onTouchstart: onMousedown,
        onTouchmove: onMousemove,
        onTouchend: onMouseup,
        width: props.cardWidth,
        height: props.cardHeight,
        ref: canvas
      });
      const children = [renderCanvas];
      if (overlayLoaded.value)
        children.unshift(renderContent);
      return h("div", { style: styleConcat(styleSize.value) }, children);
    };
  }
});
var index = {
  install(app) {
    app.component("vue-scratchcard", ScratchCard);
  }
};
export { index as default };
