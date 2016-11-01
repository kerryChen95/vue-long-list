export default {
  twoWay: true,
  bind: function () {
    this.handleScroll = this.handleScroll.bind(this)
    this.el.addEventListener('scroll', this.handleScroll)
    this.handleScroll()
  },
  handleScroll () {

  },
}
