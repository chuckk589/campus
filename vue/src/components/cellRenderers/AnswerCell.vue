<template>
  <v-card class="question">
    <!-- <div ref="question" v-html="params.data.html" class="ma-3"></div> -->
    <HTMLAnswer
      :html="params.data.html"
      :jsonAnswer="params.data.jsonAnswer"
      :questionType="params.data.question_type"
      ref="question"
    ></HTMLAnswer>
    <v-card-actions>
      <v-btn
        class="ml-auto"
        :variant="history ? 'tonal' : 'outlined'"
        density="compact"
        small
        :disabled="!store.canViewHistory"
        @click="toggleHistory"
      >
        {{ 'История (' + params.data.states.length + ')' }}
      </v-btn>
      <v-btn
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
    <div class="overflow-auto" v-if="history">
      <v-card
        v-for="item in params.data.states"
        :key="item"
        variant="outlined"
        class="mb-1"
      >
        <v-card-title>{{
          new Date(item.updatedAt).toLocaleString()
        }}</v-card-title>
        <HTMLAnswer
          :html="params.data.html"
          :jsonAnswer="item.jsonAnswer"
          :questionType="params.data.question_type"
          :locked="true"
        ></HTMLAnswer>
      </v-card>
    </div>
  </v-card>
</template>

<script>
import HTMLAnswer from '../../components/HTMLAnswer.vue';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'AnswerCell',
  components: {
    HTMLAnswer,
  },
  data() {
    return {
      loading: false,
      states: [],
      history: false,
    };
  },
  methods: {
    ai() {
      this.loading = true;
      this.$http({
        method: 'GET',
        url: `${this.params.url}${this.params.data.id}/ai`,
      })
        .then((res) => {
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
    toggleHistory() {
      this.history = !this.history;
    },
    save() {
      this.$http({
        method: 'PUT',
        url: `${this.params.url}${this.params.data.id}`,
        data: {
          json: this.$refs.question.bakeAnswer(),
        },
      }).then((res) => {
        this.$emitter.emit('edit-answer', res.data);
      });
    },
  },
  computed: {
    store: () => useAuthStore(),
  },
};
</script>
