<template lang="pug">
.splash-messages(v-show="messages.length > 0")
  p.splash-item(
    v-for="message, index in messages",
    :class="messageClasses(message)"
  )
    span.type
    span.text(v-text="message.body")
</template>

<script>
import { SplashMessageBus } from '@/busses'

let allMessages = []

SplashMessageBus.$on('message', (message) => {
  if (typeof message === 'string') message = { body: message }
  const { body, type = 'success', duration = 4000 } = message
  const expiry = new Date().getTime() + duration
  allMessages.push({ body, type, expiry })
})

export default {
  data: () => ({
    timerId: null,
    messages: [],
  }),
  mounted() {
    this.timerId = setInterval(() => this.tickMessage(), 1000)
    this.messages = allMessages
  },
  destroyed() {
    clearInterval(this.timerId)
  },
  methods: {
    messageClasses(message) {
      return [`is-${message.type}`]
    },
    tickMessage() {
      const now = new Date().getTime()
      this.messages = allMessages.filter((m) => m.expiry > now)
    },
  },
}
</script>

<style lang="sass">
.splash-messages
  position: fixed
  background: white
  padding: 0.5rem 1rem
  border-radius: 5px
  border: 1px solid $white-ter
  box-shadow: 0px 0px 1em rgba(0,0,0,0.2)
  font-size: 1.4em
  +tablet
    top: 1rem
    right: 1rem
    width: 320px
  +desktop
    width: 440px
  +mobile
    bottom: 0.5em
    left: 0.5em
    right: 0.5em
  .splash-item
    .type
      display: inline-block
      width: 0.5em
      height: 0.5em
      border-radius: 1em
      margin-right: 0.3em
    .text
      vertical-align: middle
    @each $name, $pair in $colors
      &.is-#{$name} .type
        background-color: nth($pair, 1)
    &:not(:last-child)
      margin-bottom: 0.2em
      border-bottom: 1px dashed $border
      padding-bottom: 0.2em
</style>
