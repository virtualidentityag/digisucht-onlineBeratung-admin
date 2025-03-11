import { useMutation, useQueryClient } from 'react-query';
import updateAgencyPostCodeRange from '../api/agency/updateAgencyPostCodeRange';
import { validatePostcodeRanges } from '../utils/validatePostcodeRanges';

export const useAgencyPostCodesUpdate = (id: string) => {
    const queryClient = useQueryClient();

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
