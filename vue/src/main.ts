import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router/index';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';
import emitter from './eventBus';
import 'ag-grid-enterprise';
import { LicenseManager } from 'ag-grid-enterprise';
import { createPinia } from 'pinia';
import axiosInstance from './utils/axios';
LicenseManager.setLicenseKey(
  // '[v228]__MTUwNDA0NzYwMDAwMA==b6ad7a19dbec1f3b7ba7f0245269f807',
  '[v228]__MTk1NjUyODAwMDAwMA==8e4a7798ecd2eddcdfed53ddafa55324',
);
loadFonts();

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.use(vuetify);
app.config.globalProperties.$http = axiosInstance;
app.config.globalProperties.$emitter = emitter;

app.mount('#app');

export default app;
