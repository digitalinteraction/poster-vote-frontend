<template lang="pug">
.home.page
  .hero.is-primary
    .hero-head
      site-nav
    .hero-body
      centered-box.has-text-centered(v-if="user")
        h2.title.is-5.has-text-dark Welcome back!
        .buttons.is-centered
          router-link.button.is-link.is-medium(to="/posters") My posters →
      
      centered-box(v-else-if="!checkedLogin")
        .control.is-loading
          p.is-size-4.has-text-grey-light Checking login
      
      centered-box(v-else-if="state === 'sent'")
        .notification.is-success
          button.delete(@click="state = 'input'")
          | We've sent an email to #[strong {{email}}],
          | check your email for a login link
      
      centered-box(v-else)
        label.label(for="emailInput") Login using your email
        .field.has-addons.is-marginless
          .control.is-expanded
            input.input#emailInput(
              type="email",
              v-model="email",
              :disabled="isWorking",
              @keyup.enter="submitLogin"
              placeholder="rob@example.com",
              autofocus
            )
          .control
            button.button.is-success(
              :disabled="!canSubmit",
              @click="submitLogin"
            ) Login!
        p.help We'll send you a login code and store a cookie so we can remember it
  
  section.section
    .container.has-text-centered
      h1.title.is-1 PosterVote
      h2.subtitle Digital posters that track engagement and give you live results.
  
  section.section.onboarding.page-expand
    .container
      .columns
        .column.is-two-fifths
          .image.is-16by9
            img(src="../assets/img/onboard/01.svg")
        .column.has-vertical-content
          p.is-size-4 Quickly create and print posters that ask your questions
      
      .columns.is-reversed-desktop
        .column.is-two-fifths
          .image.is-16by9
            img(src="../assets/img/onboard/02.svg")
        .column.has-vertical-content
          p.is-size-4 Attach a PosterVote device so people can press the buttons on the poster
      
      .columns
        .column.is-two-fifths
          .image.is-16by9 
            img(src="../assets/img/onboard/03.svg")
        .column.has-vertical-content
          p.is-size-4 Upload votes by playing the poster down the phone and receive them as an SMS
      
      .columns.is-reversed-desktop
        .column.is-two-fifths
          .image.is-16by9 
            img(src="../assets/img/onboard/04.svg")
        .column.has-vertical-content
          p.is-size-4 See the votes appear on the website so you can review your engagement
  site-footer
</template>

<script>
import { sharedClient } from '@/services/ApiService'
import { isEmail } from '@/utils'
import SiteNav from '@/components/SiteNav'
import CenteredBox from '@/components/CenteredBox'
import SiteFooter from '@/components/SiteFooter'
import { SplashMessageBus } from '@/busses'

const State = {
  input: 'input',
  working: 'working',
  sent: 'sent',
}

export default {
  components: {
    SiteNav,
    CenteredBox,
    SiteFooter,
  },
  data: () => ({
    state: State.input,
    email: '',
  }),
  computed: {
    user() {
      return this.$store.state.currentUser
    },
    isWorking() {
      return this.state === State.working
    },
    canSubmit() {
      return isEmail(this.email) && this.state === State.input
    },
    checkedLogin() {
      return this.$store.state.checkedLogin
    },
  },
  methods: {
    async submitLogin() {
      this.state = State.working

      let { meta } = await sharedClient.get('auth/email/request', {
        params: {
          email: this.email,
          mode: 'cookie',
        },
      })

      this.state = meta.success ? State.sent : State.input

      if (!meta.success) {
        SplashMessageBus.$emit('message', {
          type: 'danger',
          body: 'Bad login, please try again',
        })
      }
    },
    resetForm() {
      this.state = State.input
    },
  },
}
</script>

<style lang="sass">
.home

  +touch
    .onboarding .columns
      padding-bottom: 5em
      text-align: center
</style>
