<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>
        <span class="text-h6">{{ client.id ? 'Редагувати клієнта' : 'Новий клієнт' }}</span>
      </v-card-title>

      <v-card-text>
        <v-text-field v-model="localClient.name" label="Ім'я" />
        <v-text-field v-model="localClient.email" label="Email" />
        <v-text-field v-model="localClient.phone" label="Телефон" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Скасувати</v-btn>
        <v-btn color="primary" @click="save">Зберегти</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { Client } from '../types'

const props = defineProps<{
  open: boolean
  client: Client
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'update:client', v: Client): void
  (e: 'save', v: Client): void
}>()

const dialog = computed({
  get: () => props.open,
  set: (val: boolean) => emit('update:open', val),
})

const localClient = reactive({ ...props.client })

watch(
  () => props.client,
  (val) => Object.assign(localClient, val),
  { immediate: true },
)

watch(localClient, (val) => emit('update:client', val), { deep: true })

const close = () => (dialog.value = false)
const save = () => emit('save', { ...localClient })
</script>
