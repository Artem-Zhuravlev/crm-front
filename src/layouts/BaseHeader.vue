<template>
  <header class="header">
    <div class="header-logo">Jelly CRM</div>
  </header>
</template>

<script setup lang="ts">
const handleCommand = (command: string) => {
  if (command === 'logout') {
    console.log('Logout')
  } else if (command === 'settings') {
    console.log('Settings')
  }
}
</script>
