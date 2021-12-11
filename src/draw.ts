import { PointerEvent, Point } from "./type";

export const calcCoverPercent = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stride: number
): number => {
  if (!stride || stride < 1) stride = 1;
  const pixels = ctx.getImageData(0, 0, width, height);
  const total = pixels.data.length / stride;
  let count = 0;
  for (let i = 0; i < pixels.data.length; i += stride) {
    if (Number(pixels.data[i]) === 0) count++;
  }
  return Math.round((count / total) * 100);
};

export const getCoord = (canvas: HTMLCanvasElement, e: PointerEvent): Point => {
  const { left, top } = canvas.getBoundingClientRect();
  const touch = e.touches && e.touches[0];
  if (touch) return { x: touch.clientX - left, y: touch.clientY - top };
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  return { x: e.pageX - left - scrollLeft, y: e.pageY - top - scrollTop };
};

const distanceBetween = (p1: Point, p2: Point): number =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
const angleBetween = (p1: Point, p2: Point): number =>
  Math.atan2(p2.x - p1.x, p2.y - p1.y);

const scratchAt = (
  ctx: CanvasRenderingContext2D,
  p: Point,
  brush?: HTMLImageElement
) => {
  const { x, y } = p;
  if (brush) {
    return ctx.drawImage(brush, x - brush.width / 2, y - brush.height / 2);
  }
  ctx.beginPath();
  ctx.arc(x, y, 25, 0, 2 * Math.PI, false);
  ctx.fill();
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  lp: Point,
  cp: Point,
  brush?: HTMLImageElement
) => {
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
