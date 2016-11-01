<script>
import {components, directives} from '..'

const STEP = 50

export default {
  data () {
    const start = 0
    return {
      // create a dense array
      listData: Array
        .apply(null, {length: 10000})
        .map((val, index) => {
          const height = `${Math.random() * 30 + 20}px`
          return {
            content: index,
            style: {
              background: index % 2 === 0 ? 'cyan' : 'yellow',
              height,
              lineHeight: height,
            }
          }
        }),
      renderingRange: {
        start,
        length: start + STEP,
      }
    }
  },
  computed: {},
  mounted () {},
  methods: {},
  components: {...components},
  directives: {...directives},
}
</script>

<template lang="html">
  <div v-long-list="renderingRange">
    <div></div>
    <!-- <long-list-preposition-holder></long-list-preposition-holder> -->
    <long-list-item
      v-for="itemData in listData | limitBy renderingRange.length renderingRange.start"
      track-by="$index"
    >
      <div :style="itemData.style">
        {{itemData.content}}
      </div>
    </long-list-item>
    <div></div>
    <!-- <long-list-postposition-holder></long-list-postposition-holder> -->
  </div>
</template>
