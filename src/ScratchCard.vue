<template>
  <div class="scratchcard" :style="`height:${cardHeight}px`">
    <canvas @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp"
            @touchstart="handleMouseDown" @touchmove="handleMouseMove" @touchend="handleMouseUp"
            ref="canvas" class="scratchcard-overlay"></canvas>
    <div ref="content" class="scratchcard-content" :style="{visibility:overlayLoaded ? 'visible' : 'hidden' }">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import DrawImageCover from "canvas-image-cover";

function getFilledPercent(ctx, width, height, stride) {
  if (!stride || stride < 1) stride = 1;
  const pixels = ctx.getImageData(0, 0, width, height);
  const total = pixels.data.length / stride;

  let count = 0;
  for (let i = 0; i < pixels.data.length; i += stride) {
    if (parseInt(pixels.data[i], 10) === 0) count++;
  }
  return Math.round(count / total * 100);
}

function getMouse(e, canvas) {
  const { left, top } = canvas.getBoundingClientRect();
  const touch = e.touches && e.touches[0];
  if (touch) {
    return { x: touch.clientX - left, y: touch.clientY - top };
  } else {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    return { x: e.pageX - left - scrollLeft, y: e.pageY - top - scrollTop };
  }
}

function distanceBetween(point1, point2) {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2),
  );
}

function angleBetween(point1, point2) {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y);
}

export default {
  name: 'ScratchCard',

  props: {
    imageUrl: String,
    brushUrl: String,
    finishPercent: Number,
    forceReveal: Boolean,
    onComplete: Function,
  },
  data() {
    return {
      overlayLoaded: false,
      isDrawing: false,
      isFinished: false,
      canvas: undefined,
      ctx: undefined,
      lastPoint: undefined,
      cardWidth: undefined,
      cardHeight: undefined,
      brush: new Image(),
      image: new Image()
    };
  },

  methods: {
    setSize(e) {
      const rect = this.$refs.content.getBoundingClientRect();
      if (this.cardWidth !== rect.width) {
        this.cardWidth = this.canvas.width = rect.width;
        this.cardHeight = this.canvas.height = rect.height;
        this.drawOverlay();
      }
    },
    initCanvas() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext("2d");
    },

    drawOverlay() {
      if(this.image.src) {
        DrawImageCover(this.image, 0, 0, this.cardWidth, this.cardHeight).render(this.ctx);
      } else {
          this.image.crossOrigin = 'Anonymous';
          this.image.src = this.imageUrl;
          this.image.onload = () => {
            DrawImageCover(this.image, 0, 0, this.cardWidth, this.cardHeight).render(this.ctx);
            this.overlayLoaded = true;
          };
        }
    },
    prepBrush() {
      if (this.brushUrl) {
        this.brush.crossOrigin = 'Anonymous';
        this.brush.src = this.brushUrl;
      }
    },

    scratchAt(x, y) {
      if (this.brushUrl) {
        this.ctx.drawImage(
          this.brush,
          x - this.brush.width / 2,
          y - this.brush.height / 2,
        );
      } else {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25, 0, 2 * Math.PI, false);
        this.ctx.fill();
      }
    },

    handleMouseDown(e) {
      this.isDrawing = true;
      this.lastPoint = getMouse(e, this.canvas);
    },

    handleMouseUp() {
      this.isDrawing = false;
    },

    handleMouseMove(e) {
      if (!this.isDrawing) return;

      e.preventDefault();
      const currentPoint = getMouse(e, this.canvas);
      const distance = distanceBetween(this.lastPoint, currentPoint);
      const angle = angleBetween(this.lastPoint, currentPoint);

      let x, y;
      for (let i = 0; i < distance; i++) {
        x = this.lastPoint.x + Math.sin(angle) * i;
        y = this.lastPoint.y + Math.cos(angle) * i;
        this.ctx.globalCompositeOperation = 'destination-out';
        this.scratchAt(x, y);
      }
      this.lastPoint = currentPoint;
      this.handlePercentage(
        getFilledPercent(this.ctx, this.cardWidth, this.cardHeight, 32),
      );
    },

    handlePercentage(filledInPixels = 0) {
      if (filledInPixels > this.finishPercent) this.reveal();
    },

    reveal() {
      if (!this.isFinished) {
        this.canvas.parentNode.removeChild(this.canvas);
        this.$emit("complete");
        if (this.onComplete) this.onComplete();
      }
      this.isFinished = true;
    },
  },

  watch: {
    forceReveal(val) {
      if (val) this.reveal();
    },
  },

  mounted() {
    window.addEventListener("resize", this.setSize);
    this.initCanvas();
    this.setSize();
    this.drawOverlay();
    this.prepBrush();
    if (typeof this.onComplete !== 'undefined') {
      // eslint-disable-next-line
      console.warn('[vue-scratchcard] - `onComplete` call is deprecated in favor of `complete` event');
    }
  },
  beforeDestroy: function() {
    window.removeEventListener("resize", this.setSize);
  }
};
</script>

<style scoped>
.scratchcard {
  position: relative;
  display: block;
  overflow: hidden;
}

.scratchcard-content {
  display: inline-block;
  max-width: 100%;
}

.scratchcard-overlay {
  position: absolute;
  z-index: 1;
}
</style>
