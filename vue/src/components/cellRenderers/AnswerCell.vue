<template>
  <v-card class="question">
    <div ref="question" v-html="params.data.html" class="ma-3"></div>
    <v-card-actions>
      <v-btn
        class="ml-auto"
        variant="outlined"
        density="compact"
        small
        :loading="loading"
        @click="ai"
      >
        chatgpt
      </v-btn>
      <v-btn variant="outlined" density="compact" color="success" @click="save">
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
    return {
      loading: false,
    };
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
    //fill inputs
    if (this.params.data.jsonAnswer) {
      HTMLCampusParser.bde_mainfunc(
        this.params.data.jsonAnswer,
        this.params.data.question_type,
        this.$refs.question,
      );
    }
  },
  methods: {
    ai() {
      this.loading = true;
      this.$http({
        method: 'GET',
        url: `${this.params.url}${this.params.data.id}/ai`,
      })
        .then((res) => {
          console.log(res.data);
          const qtype = this.params.data.question_type;
          if (qtype == 3) {
            this.$refs.question.querySelector('input[type=text]').value =
              res.data;
          } else if (qtype == 0) {
            //checkboxes
            this.$refs.question
              .querySelectorAll('.answer input[type="checkbox"]')
              .forEach((el, index) => {
                if (res.data.includes(index)) {
                  el.checked = true;
                } else {
                  el.checked = false;
                }
              });
          } else if (qtype == 1) {
            //several dropdowns
            //make array
            const arr = res.data;
            this.$refs.question
              .querySelectorAll('select')
              .forEach((el, index) => {
                //set option by index
                el.selectedIndex = arr[index];
              });
          } else if (qtype == 2) {
            const answer = parseInt(res.data);
            //radio
            this.$refs.question
              .querySelectorAll('.answer input[type="radio"]')
              .forEach((el, index) => {
                if (answer == index) {
                  el.checked = true;
                } else {
                  el.checked = false;
                }
              });
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    save() {
      this.$http({
        method: 'PUT',
        url: `${this.params.url}${this.params.data.id}`,
        data: {
          json: HTMLCampusParser.bde_get_answer(
            this.params.data.question_type,
            this.$refs.question,
          ),
        },
      }).then((res) => {
        this.$emitter.emit('edit-answer', res.data);
      });
    },
  },
};
</script>
