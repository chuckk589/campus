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
  name: 'ConfigCell',
  data() {
    return {};
  },
  methods: {
    fieldTypeResolver(field) {
      if (field === 'OPENAI_MODEL') {
        return 'select';
      }
      return 'textarea';
    },
    optionsResolver(field) {
      if (field === 'OPENAI_MODEL') {
        return this.$ctable.models;
      }
      return undefined;
    },
    edit() {
      this.$emitter.emit('openModal', {
        url: `/status/configs/${this.params.data.id}`,
        method: 'PUT',
        header: this.params.data.name,
        eventName: 'edit-config',
        fields: [
          {
            key: 'value',
            label: 'Значение',
            type: this.fieldTypeResolver(this.params.data.name),
            value: this.params.data.value,
            options: this.optionsResolver(this.params.data.name),
          },
          {
            key: 'description',
            label: 'Описание',
            type: 'textarea',
            value: this.params.data.description,
          },
        ],
      });
    },
  },
};
</script>
