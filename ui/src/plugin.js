import Poll from './Poll.vue';

const VuePoll = {
  install: function (Vue, options) {
    Vue.component('vue-poll', Poll);
  }
};

module.exports = VuePoll;

console.log("test");
Vue.use(VuePoll);

new Vue({
  el: '#app',
  data: function () {
    return {
      options: {
        question: 'What\'s your favourite <strong>JS</strong> framework?',
        answers: [{
            value: 1,
            text: 'Vue'
          },
          {
            value: 2,
            text: 'React'
          },
          {
            value: 3,
            text: 'Angular'
          },
          {
            value: 4,
            text: 'Other'
          }
        ],
        finalResults: false,
        showResults: false,
        multiple: false,
        customId: 1
      }
    }
  },
  methods: {
    addVote: function (obj) {
      console.log('You voted ' + obj.value + '!');
    }
  }
});