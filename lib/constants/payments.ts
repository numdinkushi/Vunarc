/**
 * Payment-related constants for Vunarc
 */

export const PAYMENT_CONSTANTS = {
    /**
     * Amount of Lisk ZAR tokens allocated to new users upon registration
     */
    ONBOARDING_AMOUNT: 10,

    /**
     * Default notes for onboarding token minting
     */
    ONBOARDING_NOTES: 'Onboarding Token',
} as const;

export default PAYMENT_CONSTANTS; 