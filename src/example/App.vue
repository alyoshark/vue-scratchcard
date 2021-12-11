<template>
  <div id="app">
    <ScratchCard :key="renderCount"
                  :cardWidth="cardWidth"
                  :cardHeight="cardHeight"
                  :finishPercent="finishPercent"
                  imageUrl="https://avatars2.githubusercontent.com/u/1077546?s=460&v=4"
                  :brushUrl="brushUrl"
                  :forceReveal="forceReveal"
                  @complete="onComplete">
      <h2 class="card-content">This is a highly secretive message!!!</h2>
    </ScratchCard>
    <button @click="forceReveal = true">Force Reveal!</button>
    <button @click="renderCount++">Force Reset</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ScratchCard from '../ScratchCard';
import brushUrl from './brush';

const renderCount = ref(0);
const forceReveal = ref(false)

const cardWidth = 300;
const cardHeight = 300;
const finishPercent = 70;

const onComplete = () => window.alert('Content revealed!');
</script>

<style scoped>
.card-content {
  color: red;
}
</style>
