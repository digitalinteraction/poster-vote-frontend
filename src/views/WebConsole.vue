<template lang="pug">
.console.page
  .hero.is-dark
    .hero-head
      site-nav
    .hero-body
      .container
        h1.title Web console
        p.subtitle Inspect PosterVote devices via WebUSB
  
  section.toolbar
    .container
      .level
        .level-left
          .level-item
            .nav.breadcrumb
              ul
                li: router-link(to="/") Home
                li.is-active: router-link(to="#") Web console
        .level-right
          .level-item(v-if="!port")
            button.button.is-link(@click="pickPort") Connect
          .level-item(v-if="port")
            button.button.is-danger(@click="disconnect") Disconnect
          .level-item(v-if="port")
            button.button.is-danger(@click="reset") Reset
  
  section.section.page-expand
    .container
      .message.is-warning(v-if="!isAvailable")
        .message-header Unavailable
        .message-body
          p
            | You browser does not support 
            a(href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API") Web Serial API
            |  which is required for the console. 
            a(href="https://caniuse.com/web-serial") More info
            | .
  
      .content
        details
          summary Instructions
          .content
            p You will need the special PosterVote USB cable to use this console. 
              |  Plug in the USB cable into your computer, press "Connect" above and choose the device like 
              code TTL232RG...
            blockquote The special USB cable is a 
              a(href="https://ftdichip.com/products/ttl-232rg-vsw3v3-we/" target="_blank") TTL-232RG-VSW3V3-WE
              |  device which you may need to download the 
              a(href="https://ftdichip.com/drivers/d2xx-drivers/" target="_blank") drivers
              |  to get your computer to connect to it.
            p Take the pins and place them against the pads on the PosterVote device you want to read. 
              |  The pads are numbered 1, 2, 3, 4, 5 where MCLR is 1. 
              |  The pins should be yellow=4, black=3 &amp; red=2
            p With the pins attached to the pads, hold down the 1 and 3 buttons on the device until it beeps then release them to start the export.
              |  The export is quite slow and is relative to the number of votes that have been captured.
              |  Hold everything in place until the device stops flashing.
        details(v-if="port")
          summary Port info
          pre {{ port.getInfo() }}
        details(v-if="port")
          summary Raw ({{ rawLines }})
          pre {{ raw }}
      
      hr
      
      .columns(v-if="port")
        .column.content
          p Devices ({{ devices.length }})
          pre(v-for="device in devices") {{ device }}
        .column.content
          p Documents ({{ documents.length }})
          pre(v-for="document in documents") {{ document }}
  
  section.section.page-expand(v-if="!port")
    .container
      
  
  section.toolbar.is-sticky-bottom
    .container
      .level
        .level-left
          .level-item(v-if="devices.length > 0")
            button.button.is-link(@click="saveDevices") Download devices
          .level-item(v-if="documents.length > 0")
            button.button.is-link(@click="saveDocuments") Download documents

</template>

<script>
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

class SerialParser {
  constructor(onLine) {
    this.decoder = new TextDecoder()
    this.idx = -1
    this.buffer = ''
    this.onLine = onLine
  }

  /** @param {Readable} stream */
  async start(stream) {
    this.idx = -1
    this.buffer = ''

    const reader = stream.getReader()

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read()
        if (done) break // 'reader' has been canceled.

        this.buffer += this.decoder.decode(value)

        const lines = this.buffer.split(/\r?\n/)
        this.buffer = lines.pop()
        for (const line of lines) this.onLine(line + '\n')
      }
    } catch (error) {
      console.error(error)
    } finally {
      reader.releaseLock()
    }
  }
}

class DeviceParser {
  constructor(onDevice) {
    this.onDevice = onDevice
    this.current = {}
  }

  reset() {
    this.current = {}
  }

  append(line) {
    // Check for terms
    console.debug('found line %o', line)
    const match = /(\w+)\s*:\s*,?(.*)/.exec(line)
    if (!match) return
    const [term, value] = match.slice(1)

    if (term === 'Device') {
      if (this.current.device !== undefined) this.reset()
      this.current.device = parseInt(value, 10)
      console.debug('  device=%o', this.current.device)
    } else if (term === 'Epoch') {
      if (this.current.epoch !== undefined) this.reset()
      this.current.epoch = parseInt(value, 10)
      console.debug('  epoch=%o', this.current.epoch)
    } else if (term === 'Votes') {
      if (this.current.votes !== undefined) this.reset()
      this.current.votes = value.split(',').map((n) => parseInt(n, 10))
      console.debug('  votes=%o', this.current.votes)
    } else {
      console.error('Unknown term %s=%o', term, value)
    }

    if (
      this.current.device !== undefined &&
      this.current.epoch !== undefined &&
      this.current.votes !== undefined
    ) {
      console.debug('Found poster %O', this.current)
      this.onDevice({ ...this.current, poster: null })
      this.current = {}
    }
  }
}

class DocumentParser {
  constructor(onDocument) {
    this.onDocument = onDocument
    this.current = ''
    this.timeout = null
  }
  reset() {
    this.timeout = null
    this.current = ''
  }
  append(line) {
    if (this.timeout) clearTimeout(this.timeout)

    this.current += line

    this.timeout = setTimeout(() => {
      this.onDocument(this.current.trim())
      this.reset()
    }, 2000)
  }
}

export default {
  components: { SiteNav, SiteFooter },
  data() {
    const handlers = [
      new DeviceParser((device) => this.devices.push(device)),
      new DocumentParser((document) => this.documents.push(document)),
    ]
    const parser = new SerialParser((line) => {
      console.log('line', line)
      handlers.forEach((h) => h.append(line))
      this.raw += line
    })

    return {
      port: null,
      raw: '',
      devices: [],
      documents: [],
      parser,
      handlers,
      workState: null,
    }
  },
  computed: {
    isAvailable() {
      return 'serial' in navigator
    },
    rawLines() {
      return this.raw.match(/\r?\n/g)?.length || 0
    },
  },
  methods: {
    async pickPort() {
      try {
        this.port = await navigator.serial.requestPort({ filters: [] })
        await this.port.open({ baudRate: 2400 })

        this.readPort(this.port)
      } catch (error) {
        console.error('USB error', error)
      }
    },
    async disconnect() {
      await this.port?.close().catch(() => {})
      this.port = null
    },
    reset() {
      this.raw = ''
      this.devices = []
      this.documents = []
      this.handlers.forEach((h) => h.reset())
    },
    async readPort(port) {
      while (port.readable) {
        await this.parser.start(port.readable)
      }
    },
    saveDevices() {
      const ndjson = this.devices.map((item) => JSON.stringify(item)).join('\n')
      const blob = new Blob([ndjson], { type: 'application/x-ndjson' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'devices.ndjson'
      a.click()
      URL.revokeObjectURL(a.href)
    },
    saveDocuments() {
      for (let [index, doc] of this.documents.entries()) {
        const blob = new Blob([doc], { type: 'text/csv' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `export-${++index}.csv`
        a.click()
        URL.revokeObjectURL(a.href)
      }
    },
  },
  destroyed() {
    console.log('close')
    this.disconnect()
  },
}
</script>

<style lang="sass">
details > :not(summary)
  border-left: 5px solid black
  padding-left: 1em
</style>
