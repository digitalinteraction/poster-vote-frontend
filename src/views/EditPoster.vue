<template lang="pug">
.add-poster.page
  .hero.is-primary
    .hero-head
      site-nav
    .hero-body
      .container
        h1.title Edit Poster
        h2.subtitle Tweak your poster and fix mistakes
  
  section.toolbar
    .container
      .level
        .level-left
          .level-item
            nav.breadcrumb
              ul
                li: router-link(to="/") Home
                li: router-link(to="/posters") Posters
                li: router-link(:to="posterRoute") {{ posterName }}
                li.is-active: router-link(to="#") Edit Poster
  
  section.section(v-if="messages.length > 0")
    .container
      .message.is-danger
        .message-header Something went wrong
          button.delete(@click="resetMessages")
        .message-body
          ul
            li(v-for="message in messages") {{message}}
  
  .page-expand
    poster-form(
      v-if="posterEdit && optionsEdit",
      :poster="posterEdit",
      :options="optionsEdit",
      :question-length="questionLength"
      :option-length="optionLength"
    )
    
    section.section
      .container
        .buttons.is-centered
          router-link.button.is-text(:to="posterRoute") Cancel
          button.button.is-success.is-medium(
            @click="savePoster",
            :disabled="!canSubmit"
          ) Save
  site-footer
</template>

<script>
import { sharedClient } from '@/services/ApiService'
import {
  ROUTE_SHOW_POSTER,
  ROUTE_LIST_POSTERS,
  MUTATION_POSTERS,
} from '@/const'
import { SplashMessageBus } from '@/busses'

import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import PosterForm from '@/components/PosterForm'

const questionLength = 120
const optionLength = 30

export default {
  components: { SiteNav, SiteFooter, PosterForm },
  data() {
    return {
      messages: [],
      state: 'input',
      options: null,
      posterEdit: null,
      optionsEdit: null,
      questionLength,
      optionLength,
    }
  },
  computed: {
    posterId() {
      return parseInt(this.$route.params.id, 10)
    },
    posterURI() {
      return `/posters/${this.posterId}`
    },
    poster() {
      return this.$store.getters.posterById(this.posterId)
    },
    posterName() {
      return this.poster ? this.poster.name : 'Poster ~'
    },
    canSubmit() {
      if (!this.posterEdit || !this.optionsEdit) return false
      const hasOptions = this.optionsEdit.filter((o) => o !== '').length > 1
      const validOptions = this.optionsEdit.every(
        (o) => o.length <= optionLength
      )

      return (
        this.posterEdit.name &&
        this.posterEdit.question &&
        this.posterEdit.colour &&
        hasOptions &&
        validOptions &&
        this.posterEdit.question.length <= questionLength
      )
    },
    posterRoute() {
      return { name: ROUTE_SHOW_POSTER, params: { id: this.posterId } }
    },
  },
  mounted() {
    this.fetchPoster()
  },
  methods: {
    resetMessages() {
      this.messages = []
    },
    async fetchPoster() {
      let { meta, data } = await sharedClient.get(this.posterURI)
      if (meta.success) {
        data.colour = `#${data.colour}`

        this.$store.commit(MUTATION_POSTERS, [data])
        this.options = data.options.map((o) => o.text)

        this.posterEdit = { ...data }
        this.optionsEdit = Array.from(this.options)
      } else {
        SplashMessageBus.$emit('message', {
          type: 'danger',
          body: `Couldn't find that poster`,
        })
        this.$router.replace({ name: ROUTE_LIST_POSTERS })
      }
    },
    async savePoster() {
      if (!this.canSubmit) return
      this.state = 'working'

      let options = this.optionsEdit.map((text, i) => ({
        value: i + 1,
        text,
      }))

      let { meta, data } = await sharedClient.put(this.posterURI, {
        ...this.posterEdit,
        options: options,
      })

      if (meta.success) {
        this.$store.commit(MUTATION_POSTERS, [data])
        SplashMessageBus.$emit('message', 'Poster updated')
        this.$router.push(this.posterRoute)
      } else {
        this.state = 'input'
        this.messages = meta.messages
      }
    },
  },
}
</script>

<style lang="sass"></style>
