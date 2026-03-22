import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AuthAPI, type AuthUser } from '@/features/auth/service'

const TOKEN_STORAGE_KEY = 'crm-auth-token'
const USER_STORAGE_KEY = 'crm-auth-user'

const readStoredToken = () => {
	if (typeof window === 'undefined') {
		return ''
	}

	return window.localStorage.getItem(TOKEN_STORAGE_KEY) || ''
}

const readStoredUser = (): AuthUser | null => {
	if (typeof window === 'undefined') {
		return null
	}

	const value = window.localStorage.getItem(USER_STORAGE_KEY)

	if (!value) {
		return null
	}

	try {
		return JSON.parse(value) as AuthUser
	} catch {
		return null
	}
}

export const useAuthStore = defineStore('auth', () => {
	const accessToken = ref(readStoredToken())
	const user = ref<AuthUser | null>(readStoredUser())
	const isLoading = ref(false)

	const persist = () => {
		if (typeof window === 'undefined') {
			return
		}

		if (accessToken.value) {
			window.localStorage.setItem(TOKEN_STORAGE_KEY, accessToken.value)
		} else {
			window.localStorage.removeItem(TOKEN_STORAGE_KEY)
		}

		if (user.value) {
			window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user.value))
		} else {
			window.localStorage.removeItem(USER_STORAGE_KEY)
		}
	}

	const isAuthenticated = () => Boolean(accessToken.value)

	const loginWithGoogle = async (credential: string) => {
		isLoading.value = true

		try {
			const response = await AuthAPI.loginWithGoogle(credential)
			accessToken.value = response.accessToken
			user.value = response.user
			persist()
		} finally {
			isLoading.value = false
		}
	}

	const fetchCurrentUser = async () => {
		if (!accessToken.value) {
			user.value = null
			persist()
			return
		}

		try {
			user.value = await AuthAPI.getMe(accessToken.value)
			persist()
		} catch {
			logout()
			throw new Error('Unauthorized')
		}
	}

	const logout = () => {
		accessToken.value = ''
		user.value = null
		persist()
	}

	return {
		accessToken,
		user,
		isLoading,
		isAuthenticated,
		loginWithGoogle,
		fetchCurrentUser,
		logout,
	}
})
