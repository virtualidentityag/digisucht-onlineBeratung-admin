import { getValueFromCookie } from '../api/auth/accessSessionCookie';
import { UserRole } from '../enums/UserRole';
import parseJwt from '../utils/parseJWT';

export const useUserRoles = (): { roles: UserRole[]; hasRole: (role: UserRole | UserRole[]) => boolean } => {
    const accessToken = getValueFromCookie('keycloak');
    let roles: UserRole[] = [];
    if (accessToken) {
        const access = parseJwt(accessToken || '');
        roles = access?.realm_access.roles || [];
    }

    const hasRole = (userRole: UserRole | UserRole[]) => {
        const userRoles = userRole instanceof Array ? userRole : [userRole];
        return roles.some((role: UserRole) => userRoles.includes(role));
    };

    return { roles, hasRole };
};
