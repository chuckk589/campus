<template>
  <v-dialog v-model="show" transition="dialog-bottom-transition">
    <v-overlay v-model="imageOverlay" width="100%" height="100vh">
      <v-img :src="imagePath" @click="setImage()"></v-img>
    </v-overlay>
    <v-container class="">
      <v-card
        class="ma-auto d-flex flex-column justify-space-around"
        max-width="500px"
        min-height="300px"
      >
        <v-card-title>{{ payload.header }}</v-card-title>
        <v-card-text>
          <template v-for="(field, index) in payload.fields">
            <v-textarea
              v-if="field.type == 'textarea'"
              :key="'t' + index"
              :label="field.label || field.key"
              density="comfortable"
              :disabled="isFieldActive(field)"
              :hint="field.hint"
              v-model="field.value"
            />
            <v-select
              v-else-if="field.type == 'select'"
              :key="'s' + index"
              :label="field.label || field.key"
              density="comfortable"
              v-model="field.value"
              :hint="field.hint"
              :disabled="isFieldActive(field)"
              :items="field.options"
            />
            <v-text-field
              v-else-if="field.type == 'date'"
              type="date"
              density="comfortable"
              :key="'d' + index"
              :label="field.label || field.key"
              :hint="field.hint"
              :disabled="isFieldActive(field)"
              v-model="field.value"
            />
            <v-img
              v-else-if="field.type == 'img'"
              class="bg-white mb-5"
              :key="'i' + index"
              @click="setImage(field.value)"
              max-width="500px"
              aspect-ratio="1"
              :src="field.value"
            ></v-img>
            <v-text-field
              v-else-if="field.type == 'password'"
              density="comfortable"
              :key="'p' + index"
              :label="field.label || field.key"
              :hint="field.hint"
              :disabled="isFieldActive(field)"
              v-model="field.value"
              :append-inner-icon="field.show ? 'mdi-eye' : 'mdi-eye-off'"
              :type="field.show ? 'text' : 'password'"
              @click:append-inner="field.show = !field.show"
            />
            <v-select
              v-else-if="field.type == 'chips'"
              :key="'c' + index"
              clearable
              chips
              label="Права"
              :items="this.$ctable.permissions"
              multiple
              v-model="field.value"
            ></v-select>
            <v-text-field
              v-else
              density="comfortable"
              :key="'r' + index"
              :label="field.label || field.key"
              :disabled="isFieldActive(field)"
              :hint="field.hint"
              v-model="field.value"
            />
          </template>
        </v-card-text>
        <v-card-actions class="mt-auto">
          <v-btn
            v-if="!payload.noSave"
            color="primary"
            size="small"
            @click="save"
            variant="outlined"
            >Сохранить</v-btn
          >
          <v-btn
            variant="outlined"
            color="primary"
            @click="show = false"
            size="small"
            >Отмена</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-container>
  </v-dialog>
</template>
<script>
export default {
  name: 'EditComponent',
  // props: {
  //   show: {
  //     type: Boolean,
  //     default: false,
  //   },
  //   payload: {
  //     noSave: {
  //       type: Boolean,
  //       default: false,
  //     },
  //     header: String,
  //     url: String,
  //     eventName: String,
  //     method: String,
  //     fields: Array,
  //   },
  // },
  data() {
    return {
      payload: {},
      imageOverlay: false,
      imagePath: '',
      show: false,
    };
  },
  created() {
    this.$emitter.on('openModal', (evt) => {
      this.show = true;
      this.payload = evt;
    });
  },
  methods: {
    setImage(path) {
      this.imagePath = path;
      this.imageOverlay = !this.imageOverlay;
    },
    isFieldActive(field) {
      return (
        field.dependsOn &&
        !field.dependsOn.value ===
          this.payload.fields.find((f) => f.key === field.dependsOn.key).value
      );
    },
    save() {
      this.$http({
        method: this.payload.method,
        url: `/v1${this.payload.url}`,
        data: this.payload.fields.reduce((s, c) => {
          if (c.key) {
            s[c.key] = c.value;
          }
          return s;
        }, {}),
      }).then((res) => {
        this.payload.eventName &&
          this.$emitter.emit(this.payload.eventName, res.data);
        this.show = false;
      });
    },
  },
};
</script>
<style>
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.3s ease-in-out;
}
</style>
