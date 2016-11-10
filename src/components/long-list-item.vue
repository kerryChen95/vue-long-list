<template lang="html">
  <slot></slot>
</template>

<script>
export default {
  created () {
    this.cache = {}
  },
  methods: {
    getChildEl () {
      let {childEl} = this.cache
      if (childEl) return childEl

      childEl = this.$el
      // `this` maybe fragment instance
      // http://v1.vuejs.org/guide/components.html#Fragment-Instance
      while (childEl.nodeType !== Node.ELEMENT_NODE) {
        childEl = childEl.nextElementSibling
      }
      return this.cache.childEl = childEl
    },
  },
}

// @param {String} partialHeight May be empty string if element has not mounted
// on DOM.
const reduceSizeParts = (outerHeight, partialHeight) => {
  partialHeight = parseFloat(partialHeight)
  partialHeight = partialHeight ? partialHeight : 0
  return outerHeight + partialHeight
}

</script>
