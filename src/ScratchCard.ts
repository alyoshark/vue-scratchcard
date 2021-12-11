import { defineComponent, h, ref, computed, onMounted, watch } from "vue";
import { getCoord, drawLine, calcCoverPercent } from "./draw";
import { Point, PointerEvent } from "./type";

const styleConcat = (style: Record<string, string>) =>
  Object.keys(style)
    .map((k) => `${k}:${style[k]}`)
    .concat(";");

const styleBlockFiller = {
  position: "absolute",
  width: "100%",
  height: "100%",
  display: "block",
};

const emptyCanvas = document.createElement('canvas');
const emptyContext = emptyCanvas.getContext("2d");

export default defineComponent({
  emits: ["complete"],
  props: {
    imageUrl: { type: String, required: true },
    cardWidth: { type: Number, required: true },
    cardHeight: { type: Number, required: true },
    finishPercent: { type: Number, required: true },
    forceReveal: { type: Boolean, default: false },
    brushUrl: String,
  },

  setup(props, { slots, emit }) {
    const styleSize = computed(() => ({
      position: "relative",
      display: "block",
      width: `${props.cardWidth}px`,
      height: `${props.cardHeight}px`,
    }));

    const overlayLoaded = ref(false);
    const isDrawing = ref(false);
    const isFinished = ref(false);
    const canvas = ref(emptyCanvas);
    const ctx = ref(emptyContext);
    const lastPoint = ref<Point>({ x: 0, y: 0 });

    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = props.imageUrl;
    const overlayLoadedCb = () => {
      ctx.value?.drawImage(image, 0, 0, props.cardWidth, props.cardHeight);
      overlayLoaded.value = true;
    };

    const brush = new Image();
    if (props.brushUrl) {
      brush.crossOrigin = "Anonymous";
      brush.src = props.brushUrl;
    }

    const reveal = () => {
      const cv = canvas.value;
      if (!isFinished.value) {
        cv?.parentNode?.removeChild(cv);
        emit("complete");
      }
      isFinished.value = true;
    };

    const onMousedown = (e: PointerEvent) => {
      isDrawing.value = true;
      lastPoint.value = getCoord(canvas.value, e);
    };

    const onMouseup = () => {
      isDrawing.value = false;
    };

    const onMousemove = (e: PointerEvent) => {
      if (!isDrawing.value) return;
      e.preventDefault();
      const cp = getCoord(canvas.value, e);
      const lp = lastPoint.value;
      const c = ctx.value;
      if (!c) return; // Cannot happen but just to appeace tsc
      drawLine(c, lp, cp, brush);
      lastPoint.value = cp;
      const pct = calcCoverPercent(c, props.cardWidth, props.cardHeight, 32);
      if (pct > props.finishPercent) reveal();
    };

    onMounted(() => {
      const c = canvas.value?.getContext("2d");
      if (!c)
        throw Error(
          `can't start a CanvasRenderingContext2D from ${canvas.value}`
        );
      ctx.value = c;
      image.onload = overlayLoadedCb;
    });
    watch(
      () => props.forceReveal,
      (val) => val && reveal()
    );

    return () => {
      const defaultSlot = slots.default;
      if (!defaultSlot) throw Error("please pass a default content slot");
      const renderContent = h(
        "div",
        { style: styleConcat(styleBlockFiller) },
        defaultSlot()
      );
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
        ref: canvas,
      });
      const children = [renderCanvas];
      if (overlayLoaded.value) children.unshift(renderContent);
      return h("div", { style: styleConcat(styleSize.value) }, children);
    };
  },
});
