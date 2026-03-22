import { describe, it, expect, vi } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { i18n } from '../i18n'

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/appointments',
  }),
}))

const passthroughStub = {
  template: '<div><slot /><slot name="activator" :props="{}" /></div>',
}

describe('App', () => {
  it('mounts renders properly', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [i18n],
        stubs: {
          'router-view': {
            template: '<div>Appointments page</div>',
          },
          'v-app': passthroughStub,
          'v-main': passthroughStub,
          'v-app-bar': passthroughStub,
          'v-btn': passthroughStub,
          'v-icon': passthroughStub,
          'v-toolbar-title': passthroughStub,
          'v-spacer': passthroughStub,
          'v-menu': passthroughStub,
          'v-list': passthroughStub,
          'v-list-item': passthroughStub,
          'v-list-item-title': passthroughStub,
          'v-navigation-drawer': passthroughStub,
          'v-select': passthroughStub,
        },
      },
    })

    expect(wrapper.text()).toContain('Jelly CRM')
    expect(wrapper.text()).toContain('Appointments page')
  })
})
