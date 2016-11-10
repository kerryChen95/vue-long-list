<script>
import {LongList, LongListItem} from '..'

export default {
  data () {
    const listRenderStart = 0
    const bufferZone = 100
    return {
      bufferZone,
      listStyle: {
        margin: `${bufferZone}px 0`,
      },
      itemsCtnStyle: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      // create a dense array
      listData: Array
        .apply(null, {length: 1000})
        .map((val, index) => index),
      listRenderStart,
      listRenderLength: listRenderStart + 100,
    }
  },
  components: {
    LongList,
    LongListItem,
  },
}
</script>

<template lang="html">
  <div class="buffer-zone">
    <div class="list" :style="listStyle">
      <long-list
        mode="uniform"
        :length="listData.length"
        :render-start.sync="listRenderStart"
        :render-length.sync="listRenderLength"
        :items-ctn-style.once="itemsCtnStyle"
        :buffer-zone="bufferZone"
      >
        <long-list-item
          v-for="itemData in listData | limitBy listRenderLength listRenderStart"
          :track-by="listRenderStart + $index"
        >
          <div class="item">
            {{itemData}}, {{listRenderStart + $index}}
          </div>
        </long-list-item>
      </long-list>
    </div>
  </div>
</template>

<style>
.buffer-zone {
  border: 1px solid green;
}

.list {
  border: 1px solid red;
  height: 350px;
  overflow: auto;
}

.item {
  flex-basis: 33.3333%;
  height: 30px;
  line-height: 30px;

  &:nth-child(2n+1) {
    background: linear-gradient(#fff, #eee);
  }

  &:nth-child(2n) {
    background: linear-gradient(#ddd, #ccc);
  }
}
</style>
