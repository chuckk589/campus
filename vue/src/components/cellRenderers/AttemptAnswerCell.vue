<template>
  <div class="d-flex justify-center">
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-pencil"
      @click="edit"
    ></v-btn>
  </div>
</template>

<script>
export default {
  name: 'AttemptAnswerCell',
  data() {
    return {};
  },
  methods: {
    edit() {
      console.log(this.params);
      this.$emitter.emit('openModal', {
        url: `/attempt/answer/${this.params.data.id}`,
        method: 'PUT',
        header: `Вопрос #${+this.params.data.nativeId + 1}`,
        eventName: 'edit-attempt-answer',
        fields: [
          {
            key: 'answered',
            label: 'Отвечен',
            type: 'select',
            value: this.params.data.answered,
            options: [
              {
                value: true,
                title: 'Да',
              },
              {
                value: false,
                title: 'Нет',
              },
            ],
          },
        ],
      });
    },
  },
};
</script>
