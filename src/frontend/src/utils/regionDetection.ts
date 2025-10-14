/**
 * Region Detection Utilities
 * Automatically detects user's region and suggests appropriate currency
 */

export type Region = 'africa' | 'americas' | 'europe' | 'other';
export type SupportedCurrency = 'KES' | 'NGN';

interface RegionInfo {
    region: Region;
    defaultCurrency: SupportedCurrency;
    currencyName: string;
    paymentMethods: string;
}

/**
 * Detect user's region based on timezone
 */
export const detectRegion = (): Region => {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log('Detected timezone:', timezone);
        
        // Africa timezones
        if (timezone.startsWith('Africa/')) {
            return 'africa';
        }
        
        // Americas timezones
        if (
            timezone.startsWith('America/') || 
            timezone.startsWith('US/') ||
            timezone.startsWith('Canada/') ||
            timezone.startsWith('Brazil/')
        ) {
            return 'americas';
        }
        
        // Europe timezones
        if (timezone.startsWith('Europe/')) {
            return 'europe';
        }
        
        return 'other';
    } catch (error) {
        console.error('Error detecting timezone:', error);
        return 'other';
    }
};

/**
 * Get more specific country/region info from timezone
 */
export const detectCountry = (): string | null => {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Extract country from timezone (e.g., "Africa/Nairobi" -> "Kenya")
        if (timezone.includes('Nairobi') || timezone.includes('Mombasa')) {
            return 'Kenya';
        }
        if (timezone.includes('Lagos') || timezone.includes('Abuja')) {
            return 'Nigeria';
        }
        
        // Add more countries as needed
        return null;
    } catch (error) {
        return null;
    }
};

/**
 * Get region information including recommended currency
 */
export const getRegionInfo = (): RegionInfo => {
    const region = detectRegion();
    const country = detectCountry();
    
    switch (region) {
        case 'africa':
            // Prioritize based on specific country detection
            if (country === 'Kenya') {
                return {
                    region: 'africa',
                    defaultCurrency: 'KES',
                    currencyName: 'Kenyan Shilling',
                    paymentMethods: 'M-Pesa & Card',
                };
            }
            // Default to NGN for other African countries (broader coverage)
            return {
                region: 'africa',
                defaultCurrency: 'NGN',
                currencyName: 'Nigerian Naira',
                paymentMethods: 'Card',
            };
            
        case 'americas':
            // Default to NGN for Americas (Paystack supports this widely)
            return {
                region: 'americas',
                defaultCurrency: 'NGN',
                currencyName: 'Nigerian Naira',
                paymentMethods: 'Card',
            };
            
        case 'europe':
            // Default to NGN for Europe (Paystack international)
            return {
                region: 'europe',
                defaultCurrency: 'NGN',
                currencyName: 'Nigerian Naira',
                paymentMethods: 'Card',
            };
            
        default:
            // Default fallback
            return {
                region: 'other',
                defaultCurrency: 'NGN',
                currencyName: 'Nigerian Naira',
                paymentMethods: 'Card',
            };
    }
};

/**
 * Format currency display
 */
export const formatCurrency = (amount: string, currency: SupportedCurrency): string => {
    const symbol = currency === 'KES' ? 'KES' : '₦';
    return `${symbol} ${amount}`;
};

/**
 * Get user-friendly region name
 */
export const getRegionName = (region: Region): string => {
    const names: Record<Region, string> = {
        africa: 'Africa',
        americas: 'Americas',
        europe: 'Europe',
        other: 'International',
    };
    return names[region];
};

/**
 * Check if M-Pesa should be enabled for this region/currency
 */
export const shouldEnableMPesa = (currency: SupportedCurrency, region?: Region): boolean => {
    return currency === 'KES' && (region === 'africa' || region === undefined);
};

