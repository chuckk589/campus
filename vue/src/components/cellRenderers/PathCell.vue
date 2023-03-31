<template>
  <v-menu :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn size="small" variant="plain" color="default" v-bind="props">
        просмотр
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(item, index) in params.data.path"
        :key="index"
        :value="index"
      >
        <v-list-item-title>{{ item }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: 'PathCell',
  data() {
    return {};
  },
};
</script>
