// Assuming roles are defined as constants
const ROLES = {
    STUDENT: 'Student',
    STAFF: 'Staff',
    LECTURER: 'Lecturer'
};

// Function to check if a user has the specified role
const hasAuthority = (userRole, requiredRole) => {
    switch (requiredRole) {
        case ROLES.STUDENT:
            return userRole === ROLES.STUDENT;
        case ROLES.STAFF:
            return userRole === ROLES.STAFF || userRole === ROLES.LECTURER;
        case ROLES.LECTURER:
            return userRole === ROLES.LECTURER;
        default:
            return false; // Invalid role, return false
    }
};

module.exports = { hasAuthority };
