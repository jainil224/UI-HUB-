/**
 * Sanitizes and formats Firebase auth error messages to match the UI Hub branding.
 * Especially useful for replacing "Firebase:" with "UI Hub:" in standard error strings.
 */
export const formatAuthError = (errorMessage: string): string => {
    if (!errorMessage) return '';

    // Handle specific error codes with helpful instructions
    if (errorMessage.includes('auth/operation-not-allowed')) {
        return 'UI Hub: Email/Password login is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.';
    }

    if (errorMessage.includes('auth/email-already-in-use')) {
        return 'UI Hub: This email is already registered. Please login instead.';
    }

    if (errorMessage.includes('auth/invalid-credential') || errorMessage.includes('auth/wrong-password')) {
        return 'UI Hub: Invalid identifier or access key. Please check your credentials.';
    }

    // Replace "Firebase:" with "UI Hub:" for all other standard messages
    return errorMessage.replace(/^Firebase: Error \(auth\//, 'UI Hub: Error (').replace(/^Firebase:/, 'UI Hub:');
};
