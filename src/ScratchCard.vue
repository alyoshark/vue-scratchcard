<template>
  <div class="card" :style="`width:${cardWidth}px; height:${cardHeight}px`">
    <canvas @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp"
            @touchstart="handleMouseDown" @touchmove="handleMouseMove" @touchend="handleMouseUp"
            ref="canvas" class="card-overlay"></canvas>
    <div v-if="overlayLoaded" class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
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
  return {
    x: (e.pageX || e.touches[0].clientX) - left,
    y: (e.pageY || e.touches[0].clientY) - top,
  };
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
    cardWidth: Number,
    cardHeight: Number,
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
      brush: new Image(),
    };
  },

  methods: {
    initCanvas() {
      this.canvas = this.$refs.canvas;
      this.canvas.width = this.cardWidth;
      this.canvas.height = this.cardHeight;
      this.ctx = this.canvas.getContext('2d');
    },

    drawImage() {
      const image = new Image();
      image.crossOrigin = 'Anonymous';
      image.src = this.imageUrl;
      image.onload = () => {
        this.ctx.drawImage(image, 0, 0, this.cardWidth, this.cardHeight);
        this.overlayLoaded = true;
      };
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
    this.initCanvas();
    this.drawImage();
    this.prepBrush();
  },
};
</script>

<style scoped>
.card {
  position: relative;
  display: block;
}

.card > * {
  position: absolute;
  width: 100%;
  height: 100%;
  display: block;
}

.card-overlay {
  z-index: 1;
}
</style>
