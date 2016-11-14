# Vue Long List

High performance long list for Vue.js (Currently only Vue.js@1.x).

* Support multiple items per line.
* Support scroll on y/x axis.
* Currently only support all items are at uniform size.

## Example

```javascript
import {LongList, LongListItem} from 'vue-long-list'

export default {
  components: {LongList, LongListItem},
  props: {
    listData: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      listRenderStart: 0,
      listRenderLength: 10,
    }
  },
}
```

```html
<long-list
  mode="uniform"
  :length="listData.length"
  :render-start.sync="listRenderStart"
  :render-length.sync="listRenderLength"
>
  <!--
  For better performance, track by id from item data if exist, otherwise by the
  index of whole list, instead of by the index of `limitBy` filter's iteration
  which always count index from 0 even when `listRenderStart` is not 0.
  -->
  <long-list-item
    v-for="itemData in listData | limitBy listRenderLength listRenderStart"
    :track-by="listRenderStart + $index"
  >
    <!-- render item data as you want -->
    {{itemData}}
  </long-list-item>
</long-list>
```

## Runnable Example

```
git clone git@github.com:kerryChen95/vue-long-list.git
cd vue-long-list
npm run examples
# then open `dist-examples/index.html` by browser
```
