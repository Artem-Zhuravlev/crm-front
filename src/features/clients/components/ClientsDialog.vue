<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>
        <span class="text-h6">{{ client.id ? t('clients.edit') : t('clients.new') }}</span>
      </v-card-title>

      <v-card-text>
        <v-text-field v-model="localClient.name" :label="t('clients.name')" />
        <v-text-field v-model="localClient.email" label="Email" />
        <v-text-field v-model="localClient.phone" :label="t('clients.phone')" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">{{ t('common.cancel') }}</v-btn>
        <v-btn color="primary" @click="save">{{ t('common.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Client } from '../types'

const { t } = useI18n()

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
