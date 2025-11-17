'use client';

import { useAppContext } from '@/providers/AppProvider';
import { RegistrationModal } from './RegistrationModal';

export const RegistrationCheck = () => {
    const { connected, user, isCheckingProfile } = useAppContext();


    return (
        <RegistrationModal
            isOpen={connected && !isCheckingProfile && !user?.username}
            canClose={false}
        />
    );
};
