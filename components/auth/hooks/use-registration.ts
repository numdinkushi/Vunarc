import { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { RegistrationFormData } from '../types';
import { SouthAfricanAddressData } from '../../ui/south-african-address';
import { toast } from 'sonner';

export function useRegistration() {
    const { user } = useUser();
    const createUserWithStablecoinIntegration = useMutation(api.users.createUserWithStablecoinIntegration);

    const [formData, setFormData] = useState<RegistrationFormData>({
        role: 'buyer',
        firstName: '',
        lastName: '',
        phone: '',
        address: {
            province: '',
            city: '',
            streetAddress: '',
            postalCode: '',
            coordinates: null,
            fullAddress: ''
        },
        location: '',
        businessName: '',
        businessLicense: '',
        bio: '',
        farmSize: '',
        experience: '',
        specialties: [],
        isOrganicCertified: false,
        profilePicture: user?.imageUrl || '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);

    const handleInputChange = (field: keyof RegistrationFormData, value: string | SouthAfricanAddressData) => {
        setFormData(prev => {
            let parsedValue: string | string[] | boolean | { lat: number; lng: number; } | SouthAfricanAddressData | undefined = value;

            // Handle special field types
            if (field === 'specialties') {
                // Handle specialties as JSON array of category IDs
                try {
                    parsedValue = JSON.parse(value as string);
                } catch {
                    // Fallback to empty array if parsing fails
                    parsedValue = [];
                }
            } else if (field === 'isOrganicCertified') {
                parsedValue = value === 'true';
            } else if (field === 'coordinates') {
                try {
                    parsedValue = JSON.parse(value as string) as { lat: number; lng: number; };
                } catch {
                    parsedValue = undefined;
                }
            } else if (field === 'address') {
                // Handle address as SouthAfricanAddressData object
                parsedValue = value as SouthAfricanAddressData;
            }

            return {
                ...prev,
                [field]: parsedValue
            };
        });
    };

    const handleRoleSelect = (role: 'farmer' | 'dispatcher' | 'buyer') => {
        setFormData(prev => ({ ...prev, role }));
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        coordinates: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        }
                    }));
                    toast.success('Location captured successfully!');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast.error('Location access denied. Please enter your location manually.');
                }
            );
        }
    };

    const validateForm = () => {
        const requiredFields = ['firstName', 'lastName', 'phone'];
        const basicValidation = requiredFields.every(field => formData[field as keyof RegistrationFormData]);

        // Validate address structure
        const addressValidation = formData.address.province &&
            formData.address.city &&
            formData.address.streetAddress;

        return basicValidation && addressValidation;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!user) {
            toast.error('Please sign in first');
            return;
        }

        setIsSubmitting(true);

        try {
            const coordinates = formData.address.coordinates || formData.coordinates;

            await createUserWithStablecoinIntegration({
                clerkUserId: user.id,
                email: user.email,
                role: formData.role,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                address: formData.address.fullAddress || formData.address.streetAddress,
                addressProvince: formData.address.province,
                addressCity: formData.address.city,
                addressStreet: formData.address.streetAddress,
                addressPostalCode: formData.address.postalCode,
                addressFull: formData.address.fullAddress,
                location: formData.address.city || formData.location,
                businessName: formData.businessName,
                businessLicense: formData.businessLicense,
                bio: formData.bio,
                farmSize: formData.farmSize,
                experience: formData.experience,
                specialties: formData.specialties,
                isOrganicCertified: formData.isOrganicCertified,
                profilePicture: formData.profilePicture,
                coordinates: coordinates,
            });

            toast.success('Profile created. Connect a wallet on Arc to pay and receive USDC.');
            window.location.href = '/dashboard';
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast.error(`Failed to complete profile registration: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        isSubmitting,
        step,
        setStep,
        handleInputChange,
        handleRoleSelect,
        getCurrentLocation,
        validateForm,
        handleSubmit,
    };
} 