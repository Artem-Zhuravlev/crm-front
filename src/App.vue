<template>
  <v-app>
    <base-header v-if="!hideLayout" />

    <v-main>
      <div class="content-container" :class="{ 'content-container--spaced': !hideLayout }" fluid>
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseHeader from './layouts/BaseHeader.vue'

const route = useRoute()
const hideLayout = computed(() => Boolean(route.meta.hideLayout))
</script>

<style scoped>
.app-main {
  padding: 16px;
}
.content-container {
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.content-container--spaced {
  margin-top: 28px;
}
</style>
