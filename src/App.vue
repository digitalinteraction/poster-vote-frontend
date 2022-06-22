<template lang="pug">
#app
  router-view
  splash-messages
</template>

<script>
import { sharedClient } from '@/services/ApiService'
import { MUTATION_CURRENT_USER } from '@/const'
import { SplashMessageBus } from '@/busses'
import SplashMessages from '@/components/SplashMessages'

export default {
  components: { SplashMessages },
  mounted() {
    this.checkLogin()
  },
  methods: {
    async checkLogin() {
      if (this.$store.state.currentUser) {
        return SplashMessageBus.$emit('message', 'Logged in')
      }
      try {
        let { data } = await sharedClient.get('auth/me')
        this.$store.commit(MUTATION_CURRENT_USER, data.usr || null)
        if (data.usr) {
          SplashMessageBus.$emit('message', 'Logged in')
        }
      } catch (error) {
        SplashMessageBus.$emit('message', {
          type: 'danger',
          body: `Can't connect to PosterVote, please try again later`,
        })
      }
    },
  },
}
</script>

<style lang="sass">
//
// Import the bits of bulma we want to use
//

@import "~bulma/sass/base/_all"
@import "~bulma/sass/helpers/_all"


// @import "~bulma/sass/elements/_all"
@import "~bulma/sass/elements/box"
@import "~bulma/sass/elements/button"
@import "~bulma/sass/elements/container"
@import "~bulma/sass/elements/content"
@import "~bulma/sass/elements/image"
@import "~bulma/sass/elements/notification"
@import "~bulma/sass/elements/other"
@import "~bulma/sass/elements/progress"
@import "~bulma/sass/elements/title"

@import "~bulma/sass/form/_all"

// @import "~bulma/sass/components/_all"
@import "~bulma/sass/components/breadcrumb"
@import "~bulma/sass/components/level"
@import "~bulma/sass/components/message"
@import "~bulma/sass/components/navbar"

// @import "~bulma/sass/grid/_all"
@import "~bulma/sass/grid/columns"

@import "~bulma/sass/layout/_all"

//
// Import common styles for the whole app
//
@import "~@/assets/sass/styles"
</style>
