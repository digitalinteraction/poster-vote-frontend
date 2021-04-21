<template lang="pug">
footer.footer
  .content.has-text-centered
    p 
      span Made by 
      a(href="https://openlab.ncl.ac.uk", target="_blank") Open Lab
    p.links
      a(href="https://github.com/digitalinteraction/poster-vote", target="_blank") Getting Devices
      a(href="https://github.com/digitalinteraction/poster-vote", target="_blank") Open Source
      span.version  version {{appVersion}}
</template>

<script>
import { ROUTE_ABOUT } from '@/const'

export default {
  computed: {
    aboutRoute() {
      return { name: ROUTE_ABOUT }
    },
    appVersion() {
      return process.env.VUE_APP_VERSION
    }
  }
}
</script>

<style lang="sass">
.footer
  padding: 2rem 1rem 4rem
  a
    color: $black
    text-decoration: underline $grey-light
  .links
    *:not(:last-child):after
      content: '|'
      padding: 0 0.5em
  .version
    user-select: all
    color: $grey
</style>
