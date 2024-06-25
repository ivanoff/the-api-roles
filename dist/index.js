// src/index.ts
class Roles {
  rolePermissionMapping = {};
  routePermissions = {};
  constructor() {
  }
  init(rolePermissionMapping) {
    const result = {};
    for (const [key, arr] of Object.entries(rolePermissionMapping)) {
      result[`${key}`] = arr.reduce((acc, cur) => ({ [`${cur}`]: 1, ...acc }), {});
    }
    for (const role of Object.keys(result)) {
      for (const permission of Object.keys(result[`${role}`])) {
        let m;
        if (m = permission.match(/^_\.(.*)/)) {
          result[`${role}`] = { ...result[`${role}`], ...result[`${m[1]}`] };
          delete result[`${role}`][`${permission}`];
        }
      }
    }
    this.rolePermissionMapping = result;
  }
  addRoutePermissions(obj) {
    for (const [key, arr] of Object.entries(obj)) {
      if (!this.routePermissions[`${key}`])
        this.routePermissions[`${key}`] = [];
      this.routePermissions[`${key}`] = this.routePermissions[`${key}`].concat(arr);
    }
  }
  checkAccess({ permissions: p, user, objectToCheck, objectToCheckUserKey = "userId" }) {
    const permissions = p.flat(2).filter(Boolean);
    if (!permissions?.length)
      return true;
    const userPermissions = this.getPermissions(user?.roles);
    if (userPermissions["*"])
      return true;
    if (permissions.find((p2) => userPermissions[`${p2}`]))
      return true;
    if (permissions?.map((p2) => p2.replace(/\..*/, ".*")).find((p2) => userPermissions[`${p2}`]))
      return true;
    return false;
  }
  getPermissions(roles) {
    if (!Array.isArray(roles))
      return {};
    return roles.reduce((acc, cur) => ({ ...acc, ...this.rolePermissionMapping[cur] }), {});
  }
  checkWildcardPermissions({ key, permissions }) {
    if (!key || !permissions)
      return false;
    return !!(permissions["*"] || permissions[`${key}`] || permissions[`${key.replace(/\..*/, ".*")}`]);
  }
  async rolesMiddleware(c, n) {
    const endpoints = c.req.matchedRoutes.map((item) => item.path).filter((item) => item !== "/*").map((item) => `${c.req.raw.method} ${item}`);
    const permissions = endpoints.map((item) => roles.routePermissions[`${item}`]);
    const { user } = c.var;
    if (!roles.checkAccess({ permissions, user }))
      throw new Error("ACCESS_DENIED");
    await n();
  }
}
var roles = new Roles;
export {
  roles
};
