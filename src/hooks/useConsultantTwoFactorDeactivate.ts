import { useMutation } from 'react-query';
import { apiDeactivateConsultantTwoFactorAuth } from '../api/user/apiTwoFactorAuth';

interface ConsultantTwoFactorDeactivateProps {
    onSuccess?: () => void;
    onError?: (error: Error | Response) => void;
}

export const useConsultantTwoFactorDeactivate = ({ onSuccess, onError }: ConsultantTwoFactorDeactivateProps = {}) => {
    return useMutation<unknown, Error | Response, string>(
        (consultantId: string) => apiDeactivateConsultantTwoFactorAuth(consultantId),
        {
            onSuccess,
            onError,
        },
    );
};
