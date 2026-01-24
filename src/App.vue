<template>
  <v-app>
    <base-header />

    <v-main>
      <div class="content-container mt-7" fluid>
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import BaseHeader from './layouts/BaseHeader.vue'
</script>

<style scoped>
.app-main {
  padding: 16px;
}
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>
