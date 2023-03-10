<template>
  <div>
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
            type: 'textarea',
            value: this.params.data.value,
          },
          {
            key: 'category',
            label: 'Категория',
            value: this.params.data.category,
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
