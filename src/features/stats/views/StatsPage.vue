<template>
  <v-container fluid>
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">Панель статистики</h1>
        <p class="text-subtitle-1 text--secondary">Основні показники роботи вашого MVP</p>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
        <v-card class="pa-4" elevation="2">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-2 text--secondary">{{ stat.title }}</div>
              <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
            </div>
            <v-icon :color="stat.iconColor" size="36">{{ stat.icon }}</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12">
        <v-card class="pa-4" elevation="2">
          <div class="text-subtitle-1 font-weight-bold mb-2">Активнісь користувачів</div>
          <div class="text-center py-12 text--secondary">Графік буде тут (дані заглушки)</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Stat {
  title: string
  value: string | number
  icon: string
  iconColor?: string
}

const stats = ref<Stat[]>([
  { title: 'Кліенти', value: 124, icon: 'mdi-account-group', iconColor: 'blue' },
  { title: 'Записи', value: 56, icon: 'mdi-calendar-check', iconColor: 'green' },
  { title: 'Дохід', value: '$12,345', icon: 'mdi-currency-usd', iconColor: 'teal' },
  { title: 'Відмінено', value: 5, icon: 'mdi-cancel', iconColor: 'red' },
])
</script>
