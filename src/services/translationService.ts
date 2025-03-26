import i18n from '../i18n';

/**
 * Translation service for handling translations throughout the application
 * This allows utility functions to access translations without needing to pass the t function
 */
export const translationService = {
    /**
     * Translate a key with optional parameters
     * @param key - The translation key
     * @param params - Optional parameters for interpolation
     * @returns The translated string
     */
    translate: (key: string, params?: Record<string, any>): string => {
        return i18n.t(key, params);
    },
};
