export const useCurrentUserPermissionStore = defineStore("current-user-permissions", () => {
    const authenticationStore = useAuthenticationStore();
    const { user } = storeToRefs(authenticationStore);

    const permissions = computed(() => {
        if (!user.value) {
            return [];
        }

        return user.value.roles?.map(role => role.permissions?.map(permission => permission.name) || []).flat() || [];
    });

    const roles = computed(() => {
        if (!user.value) {
            return [];
        }

        return user.value.roles?.map(role => role.name) || [];
    });

    const hasRole = (roleName: string) => {
        return roles.value.includes(roleName);
    };

    const hasPermission = (permissionName: string) => {
        return permissions.value.includes(permissionName);
    };

    const isAdmin = () => {
        return hasRole(UserRole.SuperAdmin);
    };

    return {
        roles,
        permissions,
        hasRole,
        hasPermission,
        isAdmin,
    };
});
