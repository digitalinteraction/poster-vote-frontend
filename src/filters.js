import Vue from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

Vue.filter('percentage', (v) => (v * 100).toFixed(1) + '%')

Vue.filter('dateAgo', (v) => dayjs(v).fromNow())
