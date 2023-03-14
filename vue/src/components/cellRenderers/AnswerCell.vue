<template>
  <v-card>
    <div v-html="params.data.html" class="ma-3"></div>
    <v-card-actions>
      <v-btn variant="flat" color="success" @click="save"> Сохранить </v-btn>
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
  methods: {
    save() {
      this.$http({
        method: 'PUT',
        url: `${this.params.url}/${this.params.data.id}`,
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
