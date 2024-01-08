<template>
  <div>
    <router-view />
    <Alert></Alert>
    <ConfirmDialog />
  </div>
</template>

<script>
import app from './main';
import Alert from './components/Alert.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
export default {
  name: 'App',
  data() {
    return {};
  },
  mounted() {
    this.$http({ method: 'GET', url: `/v1/status/` }).then((e) => {
      app.config.globalProperties.$ctable = e.data;
      console.log(e.data);
    });
  },
  components: { Alert, ConfirmDialog },
};
</script>
<style lang="scss">
@import 'ag-grid-community/dist/styles/ag-grid.css';
@import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
</style>
<style>
.ag-theme-alpine .ag-details-row {
  padding: 10px;
}

.question .qtext {
  margin-bottom: 1.5em;
}

.question p {
  text-wrap: pretty;
}
.question table {
  border-collapse: collapse;
  width: 100%;
}
.question {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
}
.question .accesshide {
  margin-bottom: 5px;
}
.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #74b5eb;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(28, 119, 195, 0.25);
}
.control {
  margin-left: auto;
}
.question input[type='text'],
.question input[type='password'],
.question input[type='search'],
.question input[type='number'],
.question input[type='url'],
.question textarea,
.question select {
  background-color: #fff;
  border: solid 1px rgba(0, 0, 0, 0.3);
  font-weight: inherit;
  padding: 0 0.6rem;
  height: 30px;
  max-width: 100%;
  border-radius: 0.15rem;
}
.accesshide {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
