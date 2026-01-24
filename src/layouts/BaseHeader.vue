<template>
  <div>
    <v-app-bar color="primary" elevate-on-scroll flat app clipped-left>
      <v-btn icon class="d-md-none" @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-toolbar-title class="text-h6 font-weight-bold d-none d-md-flex">
        Jelly CRM
      </v-toolbar-title>

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

    <v-navigation-drawer
      v-model="drawer"
      class="bg-blue-darken-4"
      app
      clipped
      width="220"
      :mini-variant="mini"
      :floating="isMobile"
    >
      <v-list nav dense>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          link
          :active="isActive(item.to)"
          rounded
        >
          <div class="flex align-center gap-2">
            <v-icon>{{ item.icon }}</v-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const drawer = ref(true)
const mini = ref(false)
const menu = ref(false)

const route = useRoute()
const isMobile = computed(() => window.innerWidth < 768)

const menuItems = [
  { title: 'Записи', icon: 'mdi-calendar', to: '/appointments' },
  { title: 'Клієнти', icon: 'mdi-account-multiple', to: '/clients' },
  { title: 'Платежі', icon: 'mdi-cash', to: '/payments' },
  { title: 'Статистика', icon: 'mdi-chart-line', to: '/stats' },
]

const isActive = (path: string) => route.path.startsWith(path)

const handleCommand = (command: string) => {
  if (command === 'logout') {
    console.log('Logout')
  } else if (command === 'settings') {
    console.log('Settings')
  }
}
</script>

<style scoped>
.v-navigation-drawer {
  background-color: #1e3a8a;
  color: #fff;
}

.v-list-item--active {
  background-color: #3b82f6;
  color: white;
}
</style>
