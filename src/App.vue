<template>
  <v-app>
    <base-header />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import BaseHeader from './layouts/BaseHeader.vue'
</script>
