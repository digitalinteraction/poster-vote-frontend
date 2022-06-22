<template lang="pug">
.add-poster.page
  .hero.is-primary
    .hero-head
      site-nav
    .hero-body
      .container
        h1.title New Poster
        h2.subtitle Create a new poster on PosterVote
  
  section.toolbar
    .container
      .level
        .level-left
          .level-item
            nav.breadcrumb
              ul
                li: router-link(to="/") Home
                li: router-link(to="/posters") Posters
                li.is-active: router-link(to="#") Add Poster
  
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
      :poster="poster",
      :options="options",
      :question-length="questionLength"
      :option-length="optionLength"
    )
    
    section.section
      .container
        .buttons.is-centered
          router-link.button.is-text(to="/posters") Cancel
          button.button.is-success.is-medium(
            @click="submitPoster",
            :disabled="!canSubmit"
          ) Create
  site-footer
</template>

<script>
import { sharedClient } from '@/services/ApiService'
import { MUTATION_POSTERS, ROUTE_SHOW_POSTER } from '@/const'
import { randomColour } from '@/utils'
import { SplashMessageBus } from '@/busses'

import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import PosterForm from '@/components/PosterForm'

const optionLength = 30
const questionLength = 120

export default {
  components: { SiteNav, SiteFooter, PosterForm },
  data() {
    return {
      messages: [],
      state: 'input',
      poster: {
        name: '',
        question: '',
        colour: randomColour(),
        owner: '',
        contact: '',
      },
      options: ['', '', '', '', ''],
      hasSubmitted: false,
      questionLength,
      optionLength,
    }
  },
  computed: {
    canSubmit() {
      const hasOptions = this.options.filter((o) => o !== '').length > 1
      const validOptions = this.options.every((o) => o.length <= optionLength)

      return (
        this.poster.name &&
        this.poster.question &&
        this.poster.colour &&
        hasOptions &&
        validOptions &&
        this.poster.question.length <= questionLength
      )
    },
    hasChanges() {
      return (
        this.poster.name ||
        this.poster.question ||
        this.poster.owner ||
        this.poster.contact ||
        this.options.some((o) => o)
      )
    },
  },
  beforeRouteLeave(to, from, next) {
    if (!this.hasChanges || this.hasSubmitted) return next()
    let confirmed = confirm(
      'You have unsaved changes, are you sure you want to leave?'
    )
    return next(confirmed)
  },
  methods: {
    resetMessages() {
      this.messages = []
    },
    async submitPoster() {
      this.state = 'working'
      let { meta, data } = await sharedClient.post('posters', {
        ...this.poster,
        options: this.options,
      })
      if (meta.success) {
        this.$store.commit(MUTATION_POSTERS, [data])
        const params = { id: data.id }
        SplashMessageBus.$emit('message', 'Poster created')
        this.hasSubmitted = true
        this.$router.push({ name: ROUTE_SHOW_POSTER, params })
      } else {
        this.state = 'input'
        this.messages = meta.messages
      }
    },
  },
}
</script>

<style lang="sass"></style>
