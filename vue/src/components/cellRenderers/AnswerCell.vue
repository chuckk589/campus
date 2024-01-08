<template>
  <v-card class="question">
    <div ref="question" v-html="params.data.html" class="ma-3"></div>
    <v-card-actions>
      <v-btn
        class="ml-auto"
        variant="outlined"
        density="compact"
        color="success"
        @click="save"
      >
        Сохранить
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { HTMLCampusParser } from '../../plugins/htmlparser';
export default {
  name: 'AnswerCell',
  data() {
    return {};
  },
  mounted() {
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
  },
  methods: {
    save() {
      this.$http({
        method: 'PUT',
        url: `${this.params.url}${this.params.data.id}`,
        data: {
          json: HTMLCampusParser.bde_mainfunc(this.params.data.question_type),
        },
      }).then((res) => {
        this.$emitter.emit('edit-answer', res.data);
      });
    },
  },
};
</script>
