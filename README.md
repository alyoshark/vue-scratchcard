# Vue Scratch Card

*With majority of the code shamelessly stolen from [a codepen by Andre Ruffert](https://codepen.io/andreruffert/pen/pvqly) and [React ScratchCard](https://github.com/aleksik/react-scratchcard)*

## Installation

```
$ npm install vue-scratchcard
```

## Example Usage

```
<template>
  <div id="app">
    <scratch-card :cardWidth="cardWidth"
                  :cardHeight="cardWidth"
                  :finishPercent="finishPercent"
                  imageUrl="https://avatars2.githubusercontent.com/u/1077546?s=460&v=4"
                  :brushUrl="brushUrl">
      <h2 class="card-content">This is a highly secretive message!!!</h2>
    </scratch-card>
  </div>
</template>

<script>
import ScratchCard from 'vue-scratchcard';
import BRUSH from './brush.png';

export default {
  name: 'app',
  components: {
    ScratchCard,
  },

  data() {
    return {
      cardWidth: 300,
      cardHeight: 300,
      finishPercent: 70,
      brushUrl: BRUSH,
    };
  },
};
</script>

<<style scoped>
.card-content {
  color: red;
}
</style>
```
