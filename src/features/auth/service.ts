import { api } from '@/config/api'

export type AuthUser = {
	id: string
	email: string
	name: string
	picture?: string
}

export type AuthResponse = {
	accessToken: string
	user: AuthUser
}

export const AuthAPI = {
	async loginWithGoogle(credential: string): Promise<AuthResponse> {
		const res = await api.post('/auth/google', { credential })
		return res.data
	},

	async getMe(token: string): Promise<AuthUser> {
		const res = await api.get('/auth/me', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		return res.data
	},
}
