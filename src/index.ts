type rolePermissionType = Record<string, string[]>;
type rolePermissionMappingType = Record<string, rolePermissionType>;

class Roles {
  rolePermissionMapping: rolePermissionMappingType = {};
  routePermissions: rolePermissionType = {};

  constructor() {}

  init(rolePermissionMapping: rolePermissionType) {
    const result: Record<string, rolePermissionType> = {};
    for (const [key, arr] of Object.entries(rolePermissionMapping)) {
      result[`${key}`] = arr.reduce((acc, cur) => ({ [`${cur}`]: 1, ...acc}), {})
    }
    for (const role of Object.keys(result)) {
      for (const permission of Object.keys(result[`${role}`])) {
        let m;
        if (m = permission.match(/^_\.(.*)/)) {
          result[`${role}`] = {...result[`${role}`], ...result[`${m[1]}`]};
          delete result[`${role}`][`${permission}`];
        }
      }
    }

    this.rolePermissionMapping = result;
  }

  addRoutePermissions(obj: rolePermissionType) {
    for(const [key, arr] of Object.entries(obj)) {
      if (!this.routePermissions[`${key}`]) this.routePermissions[`${key}`] = [];
      this.routePermissions[`${key}`] = this.routePermissions[`${key}`].concat(arr as never);
    }
  }

  checkAccess({ permissions: p, user, objectToCheck, objectToCheckUserKey = 'userId' }: any) {
    const permissions = p.flat(2).filter(Boolean);
    if (!permissions?.length) return true;

    const userPermissions = this.getPermissions(user?.roles);

    if (userPermissions['*']) return true;

    if (permissions.find((p: string) => userPermissions[`${p}`])) return true;
    
    if (permissions?.map((p: string) => p.replace(/\..*/, '.*')).find((p: string) => userPermissions[`${p}`])) return true;

    return false;
  }

  getPermissions(roles: string[]) {
    if (!Array.isArray(roles)) return {};

    return roles.reduce((acc: any, cur: string) => ({...acc, ...this.rolePermissionMapping[cur]}), {});
  }

  checkWildcardPermissions({key, permissions}: {key: string, permissions: rolePermissionType}) {
    if (!key || !permissions) return false;
    return !!(permissions['*'] || permissions[`${key}`] || permissions[`${key.replace(/\..*/, '.*')}`]);
  }

  async rolesMiddleware(c: any, n: any) {
    const endpoints = c.req.matchedRoutes.map((item: { path: string }) => item.path)
      .filter((item: string) => item !== '/*')
      .map((item: string) => `${c.req.raw.method} ${item}`);

    const permissions = endpoints.map((item: string) => roles.routePermissions[`${item}`]);

    const { user } = c.var;

    if (!roles.checkAccess({ permissions, user })) throw new Error('ACCESS_DENIED');

    await n();
  }
}

const roles = new Roles();

export { roles };

export type { Roles, rolePermissionMappingType };
