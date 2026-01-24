<template>
  <v-app-bar color="primary" elevate-on-scroll flat class="px-4">
    <v-toolbar-title class="text-h6 font-weight-bold"> Jelly CRM </v-toolbar-title>

    <v-spacer></v-spacer>

    <v-menu
      v-model="menu"
      offset-y
      location="bottom"
      origin="auto"
      transition="scale-transition"
      close-on-content-click
    >
      <template #activator="{ props }">
        <v-btn v-bind="props" icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item @click="handleCommand('settings')">
          <v-list-item-title>Налаштування</v-list-item-title>
        </v-list-item>
        <v-list-item @click="handleCommand('logout')">
          <v-list-item-title>Вийти</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const menu = ref(false)

const handleCommand = (command: string) => {
  if (command === 'logout') {
    console.log('Logout')
  } else if (command === 'settings') {
    console.log('Settings')
  }
}
</script>

<style scoped>
.v-avatar img {
  object-fit: cover;
}
</style>
