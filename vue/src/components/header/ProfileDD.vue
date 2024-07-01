<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <!-- ---------------------------------------------- -->
  <!-- profile DD -->
  <!-- ---------------------------------------------- -->
  <div class="pa-4 d-flex flex-column campus-profile" style="height: 80vh">
    <h4 class="mb-n1">
      Good Morning,
      <span class="font-weight-regular"> {{ authStore.user.username }}</span>
    </h4>
    <span class="text-subtitle-2 text-medium-emphasis">{{
      authStore.user.role
    }}</span>

    <div style="margin-top: auto">
      <v-list>
        <v-list-item color="secondary" rounded="md">
          <template v-slot:prepend>
            <VIcon icon="mdi-account" size="20" />
          </template>

          <v-list-item-title class="text-subtitle-2"
            >Account Settings</v-list-item-title
          >
        </v-list-item>

        <v-list-item @click="authStore.logout()" color="secondary" rounded="md">
          <template v-slot:prepend>
            <VIcon icon="mdi-logout" size="20" />
          </template>

          <v-list-item-title class="text-subtitle-2"> Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>
<style>
.campus-profile {
  .v-list-item__prepend {
    display: block !important;
  }
  .v-list-item__content {
    margin-top: 0.3rem;
  }
}
</style>
