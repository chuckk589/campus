<script setup lang="ts">
import AuthLogin from '../authForms/AuthLogin.vue';
</script>

<template>
  <v-row class="h-screen" no-gutters>
    <!---Left Part-->
    <v-col cols="12" class="d-flex align-center bg-lightprimary">
      <v-container>
        <div class="pa-7 pa-sm-12">
          <v-row justify="center">
            <v-col cols="12" lg="10" xl="6" md="7">
              <v-card elevation="0" class="loginBox">
                <v-card variant="outlined">
                  <v-card-text class="pa-9">
                    <!---Left Part Logo -->
                    <v-row>
                      <v-col cols="12" class="text-center">
                        <h2 class="text-secondary text-h2 mt-8">
                          Hi, Welcome Back
                        </h2>
                        <h4 class="text-disabled text-h4 mt-3">
                          Enter your credentials to continue
                        </h4>
                      </v-col>
                    </v-row>
                    <!---Left Part Logo -->

                    <!---Left Part Form-->
                    <AuthLogin />
                    <!---Left Part Form-->
                  </v-card-text>
                </v-card>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-col>
    <!---Left Part-->
  </v-row>
</template>
<style scoped lang="scss">
.loginBox {
  max-width: 475px;
  margin: 0 auto;
}
.text-h2 {
  font-size: 1.5rem !important;
  font-weight: 700;
  line-height: 2.5rem;
  letter-spacing: -0.0083333333em !important;
}
.text-h4 {
  font-size: 1rem !important;
  font-weight: 600;
  line-height: 1.5rem;
  letter-spacing: 0.0073529412em !important;
}
.text-h5 {
  font-size: 0.875rem !important;
  font-weight: 500;
  line-height: 1.2rem;
  letter-spacing: normal !important;
}
.v-text-field input {
  font-size: 0.875rem;
}
.v-label {
  font-size: 0.975rem;
}
.v-btn {
  text-transform: capitalize;
  letter-spacing: 0;
}
.v-card--variant-outlined {
  border-color: #d0d0d05c;
}
.bg-lightprimary {
  background-color: rgb(238, 242, 246) !important;
}
.text-secondary {
  color: rgb(94, 53, 177) !important;
}
.bg-secondary {
  background-color: rgb(94, 53, 177) !important;
  color: rgb(238, 242, 246) !important;
}
</style>
