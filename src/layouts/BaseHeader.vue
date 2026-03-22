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

      <v-select
        v-model="selectedLocale"
        class="language-select mr-2"
        :items="languageOptions"
        item-title="title"
        item-value="value"
        :aria-label="t('language.label')"
        density="compact"
        variant="plain"
        menu-icon="mdi-chevron-down"
        hide-selected
        single-line
        hide-details
      />

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
            <v-list-item-title>{{ t('header.settings') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleCommand('logout')">
            <v-list-item-title>{{ t('header.logout') }}</v-list-item-title>
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
          :key="item.to"
          :to="item.to"
          link
          :active="isActive(item.to)"
          rounded
        >
          <div class="d-flex align-center ga-2">
            <v-icon>{{ item.icon }}</v-icon>
            <v-list-item-title>{{ t(item.labelKey) }}</v-list-item-title>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { setAppLocale, supportedLocales, type AppLocale } from '@/i18n'
import { useAuthStore } from '@/stores/auth'

const drawer = ref(true)
const mini = ref(false)
const menu = ref(false)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()
const isMobile = computed(() => window.innerWidth < 768)

const menuItems = [
  { labelKey: 'header.appointments', icon: 'mdi-calendar', to: '/appointments' },
  { labelKey: 'header.clients', icon: 'mdi-account-multiple', to: '/clients' },
  { labelKey: 'header.payments', icon: 'mdi-cash', to: '/payments' },
  { labelKey: 'header.history', icon: 'mdi-history', to: '/history' },
  { labelKey: 'header.stats', icon: 'mdi-chart-line', to: '/stats' },
]

const selectedLocale = computed({
  get: () => locale.value,
  set: (value: string) => {
    if (supportedLocales.includes(value as AppLocale)) {
      setAppLocale(value as AppLocale)
    }
  },
})

const languageOptions = computed(() => {
  return supportedLocales.map((value) => ({
    value,
    title: value.toUpperCase(),
  }))
})

const isActive = (path: string) => route.path.startsWith(path)

const handleCommand = (command: string) => {
  if (command === 'logout') {
    authStore.logout()
    void router.push('/login')
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

.language-select {
  max-width: 106px;
  min-width: 96px;
}

:deep(.language-select .v-field) {
  border-radius: 10px;
  padding-inline: 0;
  color: rgba(255, 255, 255, 0.96);
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
}

:deep(.language-select .v-field__input) {
  min-height: 32px;
  padding-inline-start: 10px;
  padding-inline-end: 10px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
}

:deep(.language-select .v-select__selection-text) {
  color: rgba(255, 255, 255, 0.96);
}

:deep(.language-select .v-field__append-inner) {
  display: flex;
  align-items: center;
  padding-top: 0;
  padding-inline-start: 0;
  padding-inline-end: 10px;
}

:deep(.language-select .v-field__prepend-inner) {
  display: none;
}

@media (max-width: 768px) {
  .language-select {
    max-width: 88px;
    min-width: 84px;
  }
}
</style>
