<template>
  <div ref="question" v-html="lockedHtml" :class="lockedClass"></div>
</template>

<script>
import { HTMLCampusParser } from '../plugins/htmlparser';

export default {
  name: 'HTMLAnswer',
  props: {
    locked: {
      type: Boolean,
      required: false,
      default: false,
    },
    html: {
      type: String,
      required: true,
    },
    jsonAnswer: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    lockedClass() {
      return 'ma-3 question' + (this.locked ? ' locked' : '');
    },
    lockedHtml() {
      return this.locked ? this.html.replace(/(name=.*?") /g, '') : this.html;
    },
  },
  mounted() {
    if (!this.locked) {
      this.$refs.question
        .querySelectorAll('[data-region=answer-label]')
        .forEach((answerLabel) => {
          answerLabel.addEventListener('click', (e) => {
            const labelId = e.currentTarget.id;
            this.$refs.question
              .querySelector('[aria-labelledby="'.concat(labelId, '"]'))
              .click();
          });
        });
    }

    //fill inputs
    if (this.jsonAnswer) {
      HTMLCampusParser.bde_mainfunc(
        this.jsonAnswer,
        this.questionType,
        this.$refs.question,
      );
    }
  },
  methods: {
    bakeAnswer() {
      return HTMLCampusParser.bde_get_answer(
        this.questionType,
        this.$refs.question,
      );
    },
  },
};
</script>
<style>
.locked input,
.locked select {
  accent-color: #ff0000;
  color: #ff0000;
}
.locked input:checked + div {
  color: #ff0000;
}
.locked {
  pointer-events: none;
  opacity: 0.75;
  user-select: none;
}
</style>
