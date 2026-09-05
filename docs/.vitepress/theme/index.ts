import DefaultTheme from 'vitepress/theme'
import { defineComponent, h } from 'vue'
import { useRoute } from 'vitepress'
import SocRagHighlight from './SocRagHighlight.vue'
import './custom.css'

const Layout = defineComponent({
  name: 'InterviewHandbookLayout',
  setup() {
    const route = useRoute()

    return () => h(DefaultTheme.Layout, null, {
      'doc-before': () => {
        const path = route.path
        const isSocAgent =
          path.endsWith('/system-design/soc-agent.html') ||
          path.endsWith('/system-design/soc-agent') ||
          path.endsWith('/system-design/soc-agent.md')

        return isSocAgent ? h(SocRagHighlight) : null
      }
    })
  }
})

export default {
  extends: DefaultTheme,
  Layout
}
