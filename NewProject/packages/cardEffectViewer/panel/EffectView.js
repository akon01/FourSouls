import Vue from "vue";
module.exports = Vue.component('EffectView', {
  data: function () {
    return {
      name: "",
      id: "",
    }
  },
  template: `
  <div>
  <div>Name:{{ name }}</div>
  <div>id:{{ id }}</div>
</div>
  `
})