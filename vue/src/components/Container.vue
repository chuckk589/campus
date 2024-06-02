<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <div class="d-flex justify-center">
        <v-btn @click="search">Поиск</v-btn>
      </div>
    </v-app-bar>
    <v-navigation-drawer permanent v-model="drawer">
      <v-list>
        <v-list-item
          to="/main/owners"
          value="8"
          color="#1867C0"
          v-if="store.user.role == 'admin'"
        >
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-security "></v-icon>
          </template>

          <v-list-item-title>Администрация</v-list-item-title>
        </v-list-item>
        <v-list-item to="/main/users" value="1" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-account"></v-icon>
          </template>

          <v-list-item-title>Пользователи</v-list-item-title>
        </v-list-item>
        <v-list-item to="/main/codes" value="2" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-qrcode-scan"></v-icon>
          </template>

          <v-list-item-title>Коды</v-list-item-title>
        </v-list-item>
        <v-list-item
          to="/main/answers"
          value="3"
          color="#1867C0"
          v-if="store.user.role == 'admin'"
        >
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-chat-question"></v-icon>
          </template>

          <v-list-item-title>Шаблоны</v-list-item-title>
        </v-list-item>
        <v-list-item to="/main/attempts" value="4" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-clipboard-list"></v-icon>
          </template>

          <v-list-item-title>Тестирования</v-list-item-title>
        </v-list-item>
        <v-list-item to="/main/results" value="5" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-trophy"></v-icon>
          </template>

          <v-list-item-title>Результаты</v-list-item-title>
        </v-list-item>
        <v-list-item
          to="/main/settings"
          value="6"
          color="#1867C0"
          v-if="store.user.role == 'admin'"
        >
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-cog"></v-icon>
          </template>

          <v-list-item-title>Конфиги</v-list-item-title>
        </v-list-item>
        <v-list-item to="/main/banned" value="7" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-account-cancel"></v-icon>
          </template>

          <v-list-item-title>Блокировки</v-list-item-title>
        </v-list-item>
      </v-list>
      <template v-slot:append>
        <div class="pa-2">
          <v-btn @click="logout" block> Выйти </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    <v-main>
      <v-container
        fluid
        style="display: flex; flex-direction: column; height: 100%"
      >
        <router-view />
      </v-container>
    </v-main>
    <edit-component />
  </v-app>
</template>

<script>
import EditComponent from './EditComponent.vue';
import { useAuthStore } from '../stores/auth';
import app from '../main';

export default {
  name: 'ContainerView',
  components: {
    EditComponent,
  },
  data() {
    return {
      drawer: false,
      searchQuery: '',
    };
  },
  computed: {
    store: () => useAuthStore(),
  },
  mounted() {
    if (!this.store?.user) {
      return this.store?.logout();
    }
    this.$http({ method: 'GET', url: `/v1/status/` }).then((e) => {
      app.config.globalProperties.$ctable = e.data;
      console.log(e.data);
    });
  },
  methods: {
    search() {
      this.$router.push({ name: 'search' });
    },
    logout() {
      const { logout } = useAuthStore();
      logout();
    },
  },
};
</script>
