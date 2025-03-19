import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  api,
  TilInput,
  TilFilterOptions,
  LoginCredentials,
  RegisterCredentials,
  Til,
  User,
} from "./api";

/**
 * Hook to fetch all TILs
 * @param options Optional filter options
 */
export function useTils(options?: TilFilterOptions) {
  return useQuery({
    queryKey: ["tils", options],
    queryFn: () => api.tils.list(options),
  });
}

/**
 * Hook to fetch a single TIL by ID
 */
export function useTil(id: string) {
  return useQuery({
    queryKey: ["tils", id],
    queryFn: () => api.tils.getById(id),
    enabled: !!id,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => api.users.getById(id),
    enabled: !!id,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.users.list(),
  });
}

/**
 * Hook to create a new TIL
 */
export function useCreateTil(
  options?: UseMutationOptions<Til, Error, TilInput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (data: TilInput) => api.tils.create(data),
    onSuccess: (...args) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["tils"] });
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Hook to update a TIL
 */
export function useUpdateTil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TilInput }) =>
      api.tils.update(id, data),
    onSuccess: (updatedTil) => {
      // Update the cache for this specific TIL
      queryClient.setQueryData(["tils", updatedTil.id], updatedTil);

      // Invalidate lists that might contain this TIL
      queryClient.invalidateQueries({ queryKey: ["tils"] });
    },
  });
}

/**
 * Hook to delete a TIL
 */
export function useDeleteTil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.tils.delete(id),
    onSuccess: (_, id) => {
      // Remove the TIL from the cache
      queryClient.removeQueries({ queryKey: ["tils", id] });

      // Invalidate lists that might contain this TIL
      queryClient.invalidateQueries({ queryKey: ["tils"] });
    },
  });
}

/**
 * Hook to save a TIL
 */
export function useSaveTil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.tils.save(id),
    onSuccess: (_, id) => {
      // Update the saved status in the cache
      const til = queryClient.getQueryData<Til>(["tils", id]);
      if (til) {
        queryClient.setQueryData(["tils", id], {
          ...til,
          saved: true,
        });
      }

      // Invalidate lists that might be affected
      queryClient.invalidateQueries({ queryKey: ["tils"] });
      queryClient.invalidateQueries({ queryKey: ["tils", "saved"] });
    },
  });
}

/**
 * Hook to unsave a TIL
 */
export function useUnsaveTil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.tils.unsave(id),
    onSuccess: (_, id) => {
      // Update the saved status in the cache
      const til = queryClient.getQueryData<Til>(["tils", id]);
      if (til) {
        queryClient.setQueryData(["tils", id], {
          ...til,
          saved: false,
        });
      }

      // Invalidate lists that might be affected
      queryClient.invalidateQueries({ queryKey: ["tils"] });
      queryClient.invalidateQueries({ queryKey: ["tils", "saved"] });
    },
  });
}

/**
 * Hook for user login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<User> => {
      const response = await api.auth.login(credentials);
      localStorage.setItem("token", response.token);
      return response.user;
    },
    onSuccess: (data) => {
      // Update the current user query data
      queryClient.setQueryData(["auth", "currentUser"], data);
    },
  });
}

/**
 * Hook for user registration mutation
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials): Promise<User> => {
      return await api.auth.register(credentials);
    },
    onSuccess: (data) => {
      // Update the current user query data
      queryClient.setQueryData(["auth", "currentUser"], data);
    },
  });
}

/**
 * Hook for user logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.auth.logout();
      localStorage.removeItem("token");
    },
    onSuccess: () => {
      // Clear the current user data
      queryClient.setQueryData(["auth", "currentUser"], null);
      // Invalidate all queries to refresh data after logout
      queryClient.invalidateQueries();
    },
  });
}

/**
 * Hook for fetching current user
 */
export function useCurrentUser() {
  return useQuery({
    retry: 1,
    queryKey: ["auth", "currentUser"],
    queryFn: async () => {
      try {
        return await api.auth.me();
      } catch (error) {
        localStorage.removeItem("token");
        throw error;
      }
    },
  });
}
