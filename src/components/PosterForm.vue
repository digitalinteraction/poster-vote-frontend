<template lang="pug">
section.section.poster-form: .container: .columns
  .column
    .field
      label.label Name
      .control
        input.input(
          type="text",
          v-model="poster.name",
          placeholder="e.g. Lunch survey"
        )
    .field
      label.label Question ({{poster.question.length}}/{{questionLength}})
      .control
        textarea.textarea(
          :class="questionClasses",
          rows="3",
          type="text",
          v-model="poster.question",
          placeholder="e.g. What did you have for lunch today?"
        )
    .field
      label.label Colour
      .field.has-addons
        .control.is-expanded
          input.input(
            type="color",
            v-model="poster.colour"
          )
        .control
          button.button.is-link(@click="shuffleColour") Generate
    .field
      label.label Creator (optional)
      .control
        input.input(
          type="text",
          v-model="poster.owner",
          placeholder="e.g. Geoff Testington"
        )
    .field
      label.label Contact (optional)
      .control
        input.input(
          type="text",
          v-model="poster.contact",
          placeholder="e.g. geoff@newcastle.ac.uk"
        )
  .column
    label.label Options
    div
      .field.has-addons(v-for="option, i in options")
        .control
          button.button.is-static(tabindex="-1") {{i + 1}}.
        .control.is-expanded
          input.input(
            type="text",
            :class="optionClasses(options[i])"
            v-model="options[i]",
            :placeholder="optionPlaceholder(i)"
          )
        .control
          button.button.is-static(tabindex="-1") {{options[i].length}} / {{optionLength}}
    p.help These are the options people viewing your poster will have to pick from, you can leave some blank.
</template>

<script>
import Vue from 'vue'
import { randomColour } from '@/utils'

const letters = ['A', 'B', 'C', 'D', 'E']

export default {
  props: {
    poster: { type: Object, required: true },
    options: { type: Array, required: true },
    optionLength: { type: Number, required: true },
    questionLength: { type: Number, required: true },
  },
  data: () => ({}),
  computed: {
    questionClasses() {
      return {
        'is-danger': this.poster.question.length > this.questionLength,
      }
    },
  },
  methods: {
    optionClasses(o) {
      return {
        'is-danger': o.length > this.optionLength,
      }
    },
    onOptionChange(i, e) {
      Vue.set(this.options, i, e.target.value.slice(0, 30))
    },
    optionPlaceholder(i) {
      return `e.g. Option ${letters[i % letters.length]}`
    },
    shuffleColour() {
      // eslint-disable-next-line vue/no-mutating-props
      this.poster.colour = randomColour()
    },
  },
}
</script>

<style lang="sass" scoped></style>
