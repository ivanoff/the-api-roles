type rolePermissionType = Record<string, string[]>;
type rolePermissionMappingType = Record<string, rolePermissionType>;
declare class Roles {
    rolePermissionMapping: rolePermissionMappingType;
    routePermissions: rolePermissionType;
    constructor();
    init(rolePermissionMapping: rolePermissionType): void;
    addRoutePermissions(obj: rolePermissionType): void;
    checkAccess({ permissions: p, user, objectToCheck, objectToCheckUserKey }: any): boolean;
    getPermissions(roles: string[]): any;
    checkWildcardPermissions({ key, permissions }: {
        key: string;
        permissions: rolePermissionType;
    }): boolean;
    rolesMiddleware(c: any, n: any): Promise<void>;
}
declare const roles: Roles;
export { roles };
export type { Roles, rolePermissionMappingType };
//# sourceMappingURL=index.d.ts.map