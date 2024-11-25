<script lang="ts">
import { initScene } from "./webgl.ts";

export default {
  mounted() {
    initScene(this.$el as HTMLCanvasElement);
  },
};
</script>

<template>
  <canvas id="webgl"></canvas>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: none;
}
</style>
