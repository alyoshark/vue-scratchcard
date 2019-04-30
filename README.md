# Vue Scratch Card

*With majority of the code shamelessly stolen from [a codepen by Andre Ruffert](https://codepen.io/andreruffert/pen/pvqly) and [React ScratchCard](https://github.com/aleksik/react-scratchcard)*

## Installation

```
$ npm install vue-scratchcard
```

## Example Usage

```html
<template>
  <div id="app">
    <scratch-card :key="renderCount"
                  :cardWidth="cardWidth"
                  :cardHeight="cardHeight"
                  :finishPercent="finishPercent"
                  imageUrl="https://avatars2.githubusercontent.com/u/1077546?s=460&v=4"
                  :brushUrl="brushUrl"
                  :forceReveal="forceReveal">
      <h2 class="card-content">This is a highly secretive message!!!</h2>
    </scratch-card>
    <button @click="forceReveal = true">Force Reveal!</button>
    <button @click="renderCount++">Force Reset</button>
  </div>
</template>

<script>
import ScratchCard from '../src/ScratchCard.vue';
import BRUSH from './brush.png';

export default {
  name: 'app',
  components: {
    ScratchCard,
  },

  data() {
    return {
      renderCount: 0,
      cardWidth: 300,
      cardHeight: 300,
      finishPercent: 70,
      brushUrl: BRUSH,
      forceReveal: false,
    };
  },
};
</script>

<style scoped>
.card-content {
  color: red;
}
</style>
```

## Parameters:

| Parameter     | Type     | Description
|---------------|----------|------------
| imageUrl      | String   | cover image url
| brushUrl      | String   | brush image url
| cardWidth     | Number   | card width
| cardHeight    | Number   | card height
| finishPercent | Number   | revelation percentage until removing cover
| forceReveal   | Boolean  | remove cover when changed from false -> true
| onComplete    | Function | callback on cover revelation

As a Vue practice, to force reset a scratchcard, provide a `key` attribute and change its value.
Just as explained in [this post](http://michaelnthiessen.com/force-re-render/).