<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold">Клієнти</h2>
      <v-btn color="primary" @click="openCreate">Додати клієнта</v-btn>
    </div>

    <ClientsFilters v-model:filters="filters" />

    <ClientsTable :items="filteredClients" @edit="editClient" @delete="deleteClient" />

    <ClientsDialog v-model:open="dialog" :client="form" @save="saveClient" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Client } from '../types'
import ClientsFilters from '../components/ClientsFilters.vue'
import ClientsTable from '../components/ClientsTable.vue'
import ClientsDialog from '../components/ClientsDialog.vue'
import { ClientsAPI } from '../service'

const dialog = ref(false)
const filters = ref({ search: '', email: '' })
const clients = ref<Client[]>([])

const form = ref<Client>({ id: 0, name: '', email: '', phone: '' })

const filteredClients = computed(() =>
  (clients.value || []).filter((c) => {
    const matchSearch = filters.value.search
      ? c.name.toLowerCase().includes(filters.value.search.toLowerCase())
      : true
    const matchEmail = filters.value.email
      ? c.email.toLowerCase().includes(filters.value.email.toLowerCase())
      : true
    return matchSearch && matchEmail
  }),
)

const fetchClients = async () => {
  try {
    const res = await ClientsAPI.getAll()
    clients.value = res
  } catch (err) {
    console.error('Не удалось загрузить клиентов', err)
  }
}

const deleteClient = async (id: number) => {
  try {
    await ClientsAPI.remove(id)
    clients.value = clients.value.filter((c) => c.id !== id)
  } catch (err) {
    console.error('Ошибка при удалении клиента', err)
  }
}

const openCreate = () => {
  form.value = { name: '', email: '', phone: '' }
  dialog.value = true
}

const editClient = (client: Client) => {
  form.value = { ...client }
  dialog.value = true
}

const saveClient = async (client: Client) => {
  try {
    if (typeof client.id === 'number' && client.id > 0) {
      const res = await ClientsAPI.update(client.id, client)
      const idx = clients.value.findIndex((c) => c.id === client.id)
      if (idx !== -1) clients.value[idx] = res
    } else {
      const { id, ...data } = client
      const res = await ClientsAPI.create(data)
      clients.value.push(res)
    }
    dialog.value = false
  } catch (err) {
    console.error('Ошибка при сохранении клиента:', err)
  }
}

onMounted(fetchClients)
</script>
