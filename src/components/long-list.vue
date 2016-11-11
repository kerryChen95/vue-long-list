<template lang="html">
  <div :style="upholderStyle" v-el:upholder>
    <div :class="itemsCtnClass" :style="slidingBlockStyle" v-el:sliding-block>
      <slot></slot>
    </div>
  </div>
</template>

<script>
const SCROLL_START_MAP = {x: 'scrollLeft', y: 'scrollTop'}
const SCROLL_SIZE_MAP = {x: 'scrollWidth', y: 'scrollHeight'}
// offset start is relative to offset parent node
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop
const OFFSET_START_MAP = {x: 'offsetLeft', y: 'offsetTop'}
// offset size includes border, padding, and scrollbar
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
const OFFSET_SIZE_MAP = {x: 'offsetWidth', y: 'offsetHeight'}
// client size is including CSS padding, CSS width/height, but not scrollbar
// https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight
const CLIENT_SIZE_MAP = {x: 'clientWidth', y: 'clientHeight'}
// inner size only exist on `window` object,
// `window.innerHeight` = height of window viewport + horizontal scrollbar
// https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight
const INNER_SIZE_MAP = {x: 'innerWidth', y: 'innerHeight'}
const OVERFLOW_MAP = {x: 'overflowX', y: 'overflowY'}
const DEFAULT_ITEMS_PER_ROW = 1
const DEFAULT_UNIFORM_SIZE_PER_ROW = 0

export default {
  props: {
    mode: {
      type: String,
      default: 'uniform',
      // currently only support mode uniform
      validator: mode => mode === 'uniform',
    },
    length: {
      required: true,
      type: Number,
    },
    renderStart: {
      required: true,
      type: Number,
      twoWay: true,
      validator: renderStart => renderStart >= 0,
    },
    renderLength: {
      required: true,
      type: Number,
      twoWay: true,
      validator: renderLength => renderLength >= 0,
    },
    // the number of pixels to buffer at both beginning and end of rendered
    // items
    bufferZone: {
      type: Number,
      default: 200,
    },
    axis: {
      type: String,
      default: 'y',
      // currently only support y axis
      validator: axis => axis === 'y',
    },
    scrollParentProvider: {
      type: Function,
    },
    itemsCtnStyle: {
      type: Object,
    },
    itemsCtnClass: {
      type: Object,
    },
  },

  data () {
    return {
      itemsPerRow: DEFAULT_ITEMS_PER_ROW,
      uniformSizePerRow: DEFAULT_UNIFORM_SIZE_PER_ROW,
    }
  },

  computed: {
    upholderStyle () {
      const {mode, length} = this
      let height = 'auto'

      if (mode === 'uniform') {
        const {itemsPerRow, uniformSizePerRow} = this
        if (itemsPerRow >= 1 && uniformSizePerRow > 0) {
          height = Math.ceil(length / itemsPerRow) * uniformSizePerRow
          height = `${height}px`
        }
      }

      return {
        height,
        // make upholder as offset parent of item elements.
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLelement/offsetParent
        position: 'relative',
      }
    },

    slidingBlockStyle () {
      const {axis, slidingBlockOffset: offset, itemsCtnStyle} = this
      const x = axis === 'x' ? offset : 0
      const y = axis === 'y' ? offset : 0
      const transform = `translate(${x}px, ${y}px)`
      let slidingBlockStyle = {
        msTransform: transform,
        WebkitTransform: transform,
        transform,
      }
      return itemsCtnStyle ?
        Object.assign(slidingBlockStyle, itemsCtnStyle) :
        slidingBlockStyle
    },

    slidingBlockOffset () {
      const {mode} = this
      let offset = 0
      if (mode === 'uniform') {
        const {renderStart, itemsPerRow, uniformSizePerRow} = this
        if (itemsPerRow >= 1 && uniformSizePerRow > 0) {
          offset = Math.floor(renderStart / itemsPerRow) * uniformSizePerRow
        }
      }
      return offset
    },
  },

  created () {
    const {axis} = this
    this.OFFSET_START = OFFSET_START_MAP[axis]
    this.OFFSET_SIZE = OFFSET_SIZE_MAP[axis]
    this.SCROLL_START = SCROLL_START_MAP[axis]
    this.SCROLL_SIZE = SCROLL_SIZE_MAP[axis]
    this.CLIENT_SIZE = CLIENT_SIZE_MAP[axis]
    this.INNER_SIZE = INNER_SIZE_MAP[axis]
    this.OVERFLOW = OVERFLOW_MAP[axis]
  },

  ready () {
    this.itemsPerRow = this.calcItemsPerRow()
    this.uniformSizePerRow = this.calcUniformSizePerRow()
    // TODO: calc again when `this.length` changes
    // for the case that `this.length` changes from 0 to a positive number

    this.updateFrame()
    this.getScrollParent()
      .addEventListener('scroll', this.updateFrame, false)
  },

  methods: {
    // @return {Number}
    // we assume that every row has the same count of items,
    // call this method after component DOM ready.
    calcItemsPerRow () {
      const firstItemEl = this.getItemEl(0)
      if (!firstItemEl) return DEFAULT_ITEMS_PER_ROW
      const {OFFSET_START} = this
      const firstItemOffsetStart = firstItemEl[OFFSET_START]
      if (!isNumber(firstItemOffsetStart)) return DEFAULT_ITEMS_PER_ROW

      let i = 1
      let itemEl
      while ((itemEl = this.getItemEl(i)) &&
        itemEl[OFFSET_START] === firstItemOffsetStart
      ) {
        i++
      }
      return i
    },

    // @return {Number}
    // call this method after component DOM ready.
    calcUniformSizePerRow () {
      const firstItemEl = this.getItemEl(0)
      if (!firstItemEl) return DEFAULT_UNIFORM_SIZE_PER_ROW
      const {OFFSET_SIZE} = this
      const firstItemOffsetSize = firstItemEl[OFFSET_SIZE]
      return isNumber(firstItemOffsetSize) ?
        firstItemOffsetSize :
        DEFAULT_UNIFORM_SIZE_PER_ROW
    },

    getItemEl (i) {
      const item = this.$children[i]
      if (!item) return null
      return item.getChildEl()
    },

    updateFrame (...args) {
      switch (this.mode) {
        case 'uniform':
          return this.updateUniformFrame(...args)
      }
    },

    updateUniformFrame () {
      const {
        OFFSET_START, OFFSET_SIZE, SCROLL_START, SCROLL_SIZE,
        length, bufferZone,
        itemsPerRow, uniformSizePerRow, slidingBlockOffset,
      } = this
      if (uniformSizePerRow <= 0) return

      let {renderStart, renderLength} = this
      let renderEnd = renderStart + renderLength - 1

      const {slidingBlock} = this.$els
      const scrollParent = this.getScrollParent()
      const scrollParentScrollStart = scrollParent[SCROLL_START]
      const scrollParentScrollEnd =
        // always re-calc size for the case of resize scroll parent
        scrollParentScrollStart + this.calcScrollParentSize()

      const secondRowOffsetStart = slidingBlockOffset + uniformSizePerRow
      const lastSecondRowOffsetEnd =
        slidingBlockOffset + slidingBlock[OFFSET_SIZE] - uniformSizePerRow

      // change `renderStart` to make second row offset start always locating
      // at start buffer zone
      if (scrollParentScrollStart - bufferZone > secondRowOffsetStart) {
        // it's likely moving content upwarding, so remove items as many as
        // possible from head buffer zone.
        renderStart += Math.floor(
          (scrollParentScrollStart - secondRowOffsetStart) / uniformSizePerRow
        ) * itemsPerRow
      }
      else if (scrollParentScrollStart < secondRowOffsetStart) {
        // it's linkly moving content downwarding, so fill items as many as
        // possible into head buffer zone.
        renderStart -= Math.floor(
          (secondRowOffsetStart - scrollParentScrollStart + bufferZone) / uniformSizePerRow
        ) * itemsPerRow
      }

      // change `renderEnd` to make last second row offset end always locating
      // at start buffer zone
      if (scrollParentScrollEnd > lastSecondRowOffsetEnd) {
        // it's likely moving content upwarding, so fill items as many as
        // possible into head buffer zone.
        renderEnd += Math.floor(
          (scrollParentScrollEnd + bufferZone - lastSecondRowOffsetEnd) / uniformSizePerRow
        ) * itemsPerRow
      }
      else if (scrollParentScrollEnd + bufferZone < lastSecondRowOffsetEnd) {
        // it's likely moving content downwarding, so remove items as many as
        // possible from tail buffer zone.
        renderEnd -= Math.floor(
          (lastSecondRowOffsetEnd - scrollParentScrollEnd) / uniformSizePerRow
        ) * itemsPerRow
      }

      this.safeUpdateRenderRange(renderStart, renderEnd)
    },

    safeUpdateRenderRange (renderStart, renderEnd) {
      const {length, itemsPerRow} = this
      const FIX_LENGTH = itemsPerRow * 10

      if (renderStart >= length) renderStart = length - FIX_LENGTH
      let mode = renderStart % itemsPerRow
      // fix `renderStart` to the first item of one row
      if (mode !== 0) renderStart -= mode
      if (renderStart < 0) renderStart = 0

      if (renderEnd < renderStart) renderEnd = renderStart + FIX_LENGTH - 1
      // fix `renderEnd` to the last item of one row
      mode = renderEnd % itemsPerRow
      if (mode !== itemsPerRow - 1) renderEnd += (itemsPerRow - mode - 1)
      if (renderEnd >= length) renderEnd = length - 1
      this.renderStart = renderStart
      this.renderLength = renderEnd - renderStart + 1
    },

    getScrollParent () {
      const {axis, scrollParentProvider} = this
      if (scrollParentProvider) return scrollParentProvider()
      const {OVERFLOW} = this
      let el = this.$el
      while (el = el.parentElement) {
        switch (getComputedStyle(el)[OVERFLOW]) {
          case 'auto':
          case 'scroll':
          case 'overlay':
            return el
        }
      }
      return window
    },

    calcScrollParentSize () {
      const {INNER_SIZE, CLIENT_SIZE} = this
      const scrollParent = this.getScrollParent()
      return scrollParent[scrollParent === window ? INNER_SIZE : CLIENT_SIZE]
    },
  },
}

function isNumber (val) {
  return typeof val === 'number'
}

function isPositiveNumber (val) {
  return isNumber(val) && val > 0
}
</script>
