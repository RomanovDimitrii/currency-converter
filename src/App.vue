<template>
  <div id="app" class="app-container">
    <header class="header">
      <h1 class="header-title">Конвертер валют</h1>
    </header>
    <CurrencyConverter />
  </div>
</template>

<script setup lang="ts">
import CurrencyConverter from './CurrencyConverter.vue';
</script>

<style scoped>
.app-container {
  font-family: 'Fira Sans', sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  background-image: linear-gradient(188.85deg, #656b7a -0.4%, #07122d 41.58%);
  border-radius: 30px;
}

.header {
  margin-bottom: 40px;
}

.header-title {
  color: #ffffff;
  font-weight: 400;
}
</style>
