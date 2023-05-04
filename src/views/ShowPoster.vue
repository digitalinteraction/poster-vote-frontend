<template lang="pug">
.show-poster.page
  .hero.is-primary
    .hero-head
      site-nav
    .hero-body
      .container
        h1.title {{posterName}}
        h2.subtitle Question: {{posterQuestion}}
  
  section.toolbar
    .container
      .level
        .level-left
          .level-item
            nav.breadcrumb
              ul
                li: router-link(to="/") Home
                li(v-if="currentUser"): router-link(to="/posters") Posters
                li.is-active: a(href="#") {{posterName}}
  
  section.section.page-expand(v-if="poster && options && votes")
    .container
      .columns
        .column
          .field
            div: h4.title.is-4 Question
            p.is-size-5 {{posterQuestion}}
          
          .field
            div: h4.title.is-4 Answers
            ul.is-size-5
              li(v-for="option, index in filteredOptions")
                strong {{filteredOptions.length - index}}.
                span  {{option.text}}
          
          .field.actions(v-if="isOwner")
            div: h4.title.is-4 Actions
            .buttons
              router-link.button.is-link(:to="editRoute")
                | Edit Poster
              button.button.is-primary(@click="printPoster")
                | Preview &amp; Print
              button.button.is-danger(@click="destroyPoster")
                | Archive
        .column
          .poster-result
            h2.result-title
              span Poster results
            .field.has-addons
                .control
                  label.button.is-static(for="deviceFilter") Device
                .control
                  .select
                    select(v-model="deviceFilter", id="deviceFilter")
                      option(:value="null") All
                      option(
                        v-for="device in devices",
                        :key="device.id",
                        :value="device.id"
                      ) {{ device.uuid }}
            hr
            template(v-if="hasVotes")
              .option(v-for="option, index in filteredOptions")
                label
                  span.name {{option.text}}
                  span.vote {{votesForOption(index)}}
                    |  – {{votesForOption(index) / totalVotes | percentage}}
                progress.progress.is-large(
                  :value="votesForOption(index)",
                  :max="totalVotes",
                  :style="{ '--theme': '#' + poster.colour }"
                )
              p.has-text-right(v-if="lastUpdate") Last scanned {{ lastUpdate | dateAgo }}
            .message.is-warning.votes(v-else)
              .message-header
                p No votes ... yet
              .message-body
                p This poster's votes haven't been recorded yet.
                p To record votes, go up to a poster, dial the number on it and hold your phone up against the speaker.
                p Make sure you have registered your poster using the instructions on the back.
  site-footer
</template>

<script>
import { sharedClient } from '@/services/ApiService'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import { SplashMessageBus } from '@/busses'
import {
  ROUTE_HOME,
  ROUTE_LIST_POSTERS,
  ROUTE_EDIT_POSTER,
  MUTATION_POSTERS,
  MUTATION_DELETE_POSTER,
} from '@/const'

export default {
  components: { SiteNav, SiteFooter },
  data: () => ({
    votes: null,
    options: null,
    deviceVotes: null,
    devices: null,
    lastUpdate: null,
    deviceFilter: null,
  }),
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
    posterQuestion() {
      return this.poster ? this.poster.question : '~'
    },
    filteredOptions() {
      return !this.options ? [] : this.options.filter((o) => o.text)
    },
    filteredVotes() {
      return this.deviceFilter !== null
        ? this.deviceVotes[this.deviceFilter]
        : this.votes
    },
    totalVotes() {
      if (!this.hasVotes) return 0
      let sumVotes = (sum, option, index) => {
        let value = this.filteredVotes[index] || { vote: 0 }
        return sum + value.vote
      }
      return this.filteredOptions.reduce(sumVotes, 0)
    },
    hasVotes() {
      const validVotes = this.filteredVotes.length === this.options.length
      const hasValues = this.filteredVotes.some((v) => v.vote > 0)
      return this.filteredVotes && this.options && validVotes && hasValues
    },
    currentUser() {
      return this.$store.state.currentUser
    },
    isOwner() {
      return this.poster && this.poster.creator_hash === this.currentUser
    },
    editRoute() {
      return { name: ROUTE_EDIT_POSTER, params: { id: this.posterId } }
    },
  },
  watch: {
    deviceFilter(newValue) {
      console.log(newValue)
    },
  },
  mounted() {
    this.fetchPoster()
    this.fetchVotes()
  },
  methods: {
    async fetchPoster() {
      let { meta, data } = await sharedClient.get(this.posterURI)
      if (meta.success) {
        this.$store.commit(MUTATION_POSTERS, [data])
        this.options = data.options
      } else {
        SplashMessageBus.$emit('message', {
          type: 'danger',
          body: `Couldn't find poster`,
        })
        this.$router.replace({
          name: this.currentUser ? ROUTE_LIST_POSTERS : ROUTE_HOME,
        })
      }
    },
    async fetchVotes() {
      let { meta, data } = await sharedClient.get(`${this.posterURI}/votes`)
      if (meta.success) {
        this.votes = data.votes
        this.devices = data.devices
        this.deviceVotes = data.deviceVotes
        this.lastUpdate = data.lastUpdate
      }
    },
    votesForOption(index) {
      return this.filteredVotes && this.filteredVotes[index]
        ? this.filteredVotes[index].vote
        : '~'
    },
    printPoster() {
      // Open the poster pdf in a new tab
      let pdfWindow = window.open(this.poster.pdf_url)
      pdfWindow.focus()
    },
    async destroyPoster() {
      let msg = `Are you sure you want to delete this poster?`
      if (!confirm(msg)) return
      let { meta } = await sharedClient.delete(this.posterURI)
      if (meta.success) {
        SplashMessageBus.$emit('message', 'Poster removed')
        this.$store.commit(MUTATION_DELETE_POSTER, this.posterId)
        this.$router.push({ name: ROUTE_LIST_POSTERS })
      }
    },
  },
}
</script>

<style lang="sass">
.poster-result
  margin-top: 1em
  padding: 1em 2em 2em
  border: 2px dashed #dbdbdb
  border-radius: 1em
  position: relative
  .result-title
    text-align: center
    font-weight: 700
    position: relative
    top: -2.5em
    span
      font-size: 1.8rem
      background: #fff
      padding: 0 1rem
      max-width: 75%
  .option
    border-radius: 4px
    &:not(:last-child)
      margin-bottom: 1em
    label
      display: flex
      justify-content: space-between
      font-size: 1.2em
    .name
      font-weight: 700
    progress::-webkit-progress-value
      background-color: var(--theme)
    progress::-moz-progress-bar
      background-color: var(--theme)

.actions
  .buttons
    margin-top: 0.2em
</style>
