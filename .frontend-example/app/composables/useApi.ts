import type { ApiClient } from "~/utils/classes/ApiClient";

export const useApi = (): ApiClient => useNuxtApp().$apiClient;
