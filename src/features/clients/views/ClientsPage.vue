<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold">Клієнти</h2>
      <v-btn color="primary" @click="openCreate"> Додати клієнта </v-btn>
    </div>

    <ClientsFilters v-model:filters="filters" />

    <ClientsTable :items="filteredClients" @edit="editClient" @delete="deleteClient" />

    <ClientsDialog
      v-model:open="dialog"
      :client="form"
      @save="saveClient"
      @update:client="form = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Client } from '../types'
import ClientsFilters from '../components/ClientsFilters.vue'
import ClientsTable from '../components/ClientsTable.vue'
import ClientsDialog from '../components/ClientsDialog.vue'

const dialog = ref(false)

const filters = ref({
  search: '',
  email: '',
})

const clients = ref<Client[]>([
  { id: 1, name: 'Іван Петренко', email: 'ivan@mail.com', phone: '0991234567' },
  { id: 2, name: 'Олена Коваль', email: 'olena@mail.com', phone: '0669876543' },
])

const form = ref<Client>({
  id: 0,
  name: '',
  email: '',
  phone: '',
})

const filteredClients = computed(() => {
  return clients.value.filter((c) => {
    const matchSearch = filters.value.search
      ? c.name.toLowerCase().includes(filters.value.search.toLowerCase())
      : true
    const matchEmail = filters.value.email
      ? c.email.toLowerCase().includes(filters.value.email.toLowerCase())
      : true
    return matchSearch && matchEmail
  })
})

const openCreate = () => {
  form.value = { id: 0, name: '', email: '', phone: '' }
  dialog.value = true
}

const saveClient = (client: Client) => {
  if (client.id) {
    const idx = clients.value.findIndex((c) => c.id === client.id)
    if (idx !== -1) clients.value[idx] = { ...client }
  } else {
    clients.value.push({ ...client, id: Date.now() })
  }
  dialog.value = false
}

const editClient = (client: Client) => {
  form.value = { ...client }
  dialog.value = true
}

const deleteClient = (id: number) => {
  clients.value = clients.value.filter((c) => c.id !== id)
}
</script>
