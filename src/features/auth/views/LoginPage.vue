<template>
  <section class="login-page">
    <article class="login-card">
      <p class="login-kicker">Jelly CRM</p>
      <h1>{{ t('auth.title') }}</h1>
      <p>{{ t('auth.subtitle') }}</p>

      <div id="google-login-button" class="google-button-wrapper" />

      <p v-if="errorMessage" class="login-error">{{ errorMessage }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const GOOGLE_SCRIPT_ID = 'google-identity-script'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const errorMessage = ref('')

const getGoogleClientId = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is not configured')
  }

  return clientId
}

const loadGoogleScript = async () => {
  if (window.google?.accounts?.id) {
    return
  }

  const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null

  if (existing) {
    await new Promise<void>((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve()
        return
      }

      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')), {
        once: true,
      })
    })
    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google script'))
    document.head.appendChild(script)
  })
}

const renderGoogleButton = async () => {
  await loadGoogleScript()

  const clientId = getGoogleClientId()
  const container = document.getElementById('google-login-button')

  if (!container || !window.google?.accounts?.id) {
    throw new Error('Google login is unavailable')
  }

  container.innerHTML = ''

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: async (response) => {
      errorMessage.value = ''

      try {
        await authStore.loginWithGoogle(response.credential)
        await router.replace('/appointments')
      } catch {
        errorMessage.value = t('auth.errors.failed')
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  })

  window.google.accounts.id.renderButton(container, {
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    width: 320,
  })
}

onMounted(async () => {
  if (authStore.isAuthenticated()) {
    await router.replace('/appointments')
    return
  }

  try {
    await renderGoogleButton()
  } catch {
    errorMessage.value = t('auth.errors.unavailable')
  }
})
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 96px);
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 10% 10%, rgba(37, 99, 235, 0.2), transparent 35%),
    radial-gradient(circle at 80% 20%, rgba(14, 116, 144, 0.16), transparent 35%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.login-card {
  width: min(460px, 100%);
  padding: 28px;
  border-radius: 22px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.login-kicker {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
}

.login-card h1 {
  margin: 0;
  color: #0f172a;
}

.login-card p {
  margin-top: 10px;
  color: #475569;
}

.google-button-wrapper {
  margin-top: 18px;
  min-height: 44px;
}

.login-error {
  margin-top: 14px;
  color: #b91c1c;
  font-weight: 600;
}
</style>
