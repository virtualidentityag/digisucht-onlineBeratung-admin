import { useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import updateAgencyPostCodeRange from '../api/agency/updateAgencyPostCodeRange';
import { validatePostcodeRanges } from '../utils/validatePostcodeRanges';

export const useAgencyPostCodesUpdate = (id: string) => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation(
        (postCodes: string) => {
            // Validate postcodes first
            validatePostcodeRanges(postCodes);
            // If validation passes, update the postcodes
            return updateAgencyPostCodeRange(id, postCodes, '');
        },
        {
            onSuccess: () => {
                queryClient.removeQueries(['AGENCY_POST_CODES']);
            },
        },
    );
};
