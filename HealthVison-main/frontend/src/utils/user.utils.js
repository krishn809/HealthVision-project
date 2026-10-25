/**
 * Check if a user profile is complete
 * @param {Object} user - The user object to check
 * @returns {boolean} - True if complete, false otherwise
 */
export const isProfileComplete = (user) => {
    if (!user) return false;

    // Different completion requirements based on role
    if (user.role === 'doctor') {
        // Doctors only require basic personal details in the User model
        const doctorEssentialFields = ['dateOfBirth', 'gender'];
        return doctorEssentialFields.every(field => !!user[field]);
    }

    // Patients require vitals and emergency contact in addition to basic info
    const essentialFields = [
        'bloodGroup',
        'height',
        'weight',
        'location',
        'dateOfBirth',
        'gender'
    ];

    // Check patient-specific essential fields
    for (const field of essentialFields) {
        if (!user[field]) return false;
    }

    // Check emergency contact for patients
    if (!user.emergencyContact ||
        !user.emergencyContact.name ||
        !user.emergencyContact.phone ||
        !user.emergencyContact.relation) {
        return false;
    }

    return true;
};
