<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { Form } from 'vee-validate';
import { ref } from 'vue';
const checkbox = ref(false);
const show1 = ref(false);
const password = ref('');
const email = ref('');
// const Regform = ref();
// const firstname = ref('');
// const lastname = ref('');
const passwordRules = ref([(v: string) => !!v || 'Password is required']);
const emailRules = ref([(v: string) => !!v || 'Field is required']);

function validate(values: any, { setErrors }: any) {
  // Regform.value.validate();
  const authStore = useAuthStore();
  return authStore
    .register(email.value, password.value)
    .catch((error: any) => setErrors({ apiError: error }));
}
</script>

<template>
  <div class="campus-register">
    <!-- <v-btn
    block
    color="primary"
    variant="outlined"
    class="text-lightText googleBtn"
  >
    <img :src="Google" alt="google" />
    <span class="ml-2">Sign up with Google</span></v-btn
  > -->
    <v-row>
      <v-col class="d-flex align-center">
        <v-divider class="custom-devider" />
        <!-- <v-btn variant="outlined" class="orbtn" rounded="md" size="small"
        >OR</v-btn
      > -->
        <v-divider class="custom-devider" />
      </v-col>
    </v-row>
    <h5 class="text-h5 text-center my-4 mb-8">Sign up with Email address</h5>
    <Form
      @submit="validate"
      class="mt-7 loginForm"
      v-slot="{ errors, isSubmitting }"
    >
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            disabled
            density="comfortable"
            hide-details="auto"
            variant="outlined"
            color="primary"
            label="Firstname"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            disabled
            density="comfortable"
            hide-details="auto"
            variant="outlined"
            color="primary"
            label="Lastname"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-text-field
        v-model="email"
        :rules="emailRules"
        label="Email Address / Username"
        class="mt-4 mb-4"
        required
        density="comfortable"
        hide-details="auto"
        variant="outlined"
        color="primary"
      ></v-text-field>
      <v-text-field
        v-model="password"
        :rules="passwordRules"
        label="Password"
        required
        density="comfortable"
        variant="outlined"
        color="primary"
        hide-details="auto"
        :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
        :type="show1 ? 'text' : 'password'"
        @click:append="show1 = !show1"
        class="pwdInput"
      ></v-text-field>

      <div
        class="d-sm-inline-flex align-center mt-2 mb-7 mb-sm-0 font-weight-bold"
      >
        <v-checkbox
          :model-value="true"
          disabled
          :rules="[(v: any) => !!v || 'You must agree to continue!']"
          label="Agree with?"
          required
          color="primary"
          class="ms-n2"
          hide-details
        ></v-checkbox>
        <a href="#" class="ml-1 text-lightText">Terms and Condition</a>
      </div>
      <v-btn
        color="secondary"
        block
        class="mt-2"
        variant="flat"
        size="large"
        :loading="isSubmitting"
        type="submit"
        >Sign Up</v-btn
      >
      <div v-if="errors.apiError" class="mt-2">
        <v-alert color="error">{{ errors.apiError }}</v-alert>
      </div>
    </Form>
    <div class="mt-5 text-right">
      <v-divider />
      <v-btn variant="plain" to="/auth/login" class="mt-2 text-capitalize mr-n2"
        >Already have an account?</v-btn
      >
    </div>
  </div>
</template>
<style lang="scss">
.campus-register {
  .custom-devider {
    border-color: rgba(0, 0, 0, 0.08) !important;
  }
  .googleBtn {
    border-color: rgba(0, 0, 0, 0.08);
    margin: 30px 0 20px 0;
  }
  .outlinedInput .v-field {
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: none;
  }
  .orbtn {
    padding: 2px 40px;
    border-color: rgba(0, 0, 0, 0.08);
    margin: 20px 15px;
  }
  .pwdInput {
    position: relative;
    .v-input__append {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
