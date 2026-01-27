import { ref } from "vue";
import { defineStore } from "pinia";
import ApiService from "@/core/services/ApiService";
import JwtService from "@/core/services/JwtService";

export interface User {
  name: string;
  surname: string;
  email: string;
  password: string;
  api_token: string;
}

export const useAuthStore = defineStore("auth", () => {
  const errors = ref({});
  const user = ref<User>({} as User);
  const isAuthenticated = ref(!!JwtService.getToken());

  function setAuth(data) {
    isAuthenticated.value = true;
    user.value = data.user as User;
    errors.value = {};
    JwtService.saveToken(data.refreshToken);
  }

  function setError(error: any) {
    errors.value = { ...error };
  }

  function purgeAuth() {
    isAuthenticated.value = false;
    user.value = {} as User;
    errors.value = [];
    JwtService.destroyToken();
  }

  async function login(credentials: User) {

    try {
      const { data } = await ApiService.post("auth/login", credentials);
      setAuth(data.data);
    } catch ({ response }) {
      setError([response?.data?.message]);
    }
  }

  async function logout() {
    try {
      const { data } = await ApiService.post("auth/logout", {});
      console.log(`Logged out. ${data}`);
      purgeAuth();
    } catch ({ response }) {
      setError([response.data.message]);
    }

  }

  async function register(credentials: User) {
    try {
      const { data } = await ApiService.post("auth/register", credentials);
      setAuth(data);
    } catch ({ response }) {
      setError([response.data.message]);
    }
  }

  async function forgotPassword(email: string) {
    try {
      await ApiService.post("forgot_password", email);
      setError({});
    } catch ({ response }) {
      setError([response.data.message]);
    }
  }

  function verifyAuth() {
    if (JwtService.getToken()) {
      ApiService.setHeader();
      ApiService.post("auth/refresh-token", {
        refreshToken: JwtService.getToken(),
      })
        .then(({ data }) => {
          setAuth(data.data);
        })
        .catch(({ response }) => {
          setError([response.data.message]);
          purgeAuth();
        });
    } else {
      purgeAuth();
    }
  }

  return {
    errors,
    user,
    isAuthenticated,
    login,
    logout,
    register,
    forgotPassword,
    verifyAuth,
  };
});
