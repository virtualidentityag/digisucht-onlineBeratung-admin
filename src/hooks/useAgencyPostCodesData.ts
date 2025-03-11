import { useQuery, UseQueryOptions } from 'react-query';
import getAgencyPostCodeRange from '../api/agency/getAgencyPostCodeRange';

interface PostCodeRangeProps extends UseQueryOptions<string> {
    id?: string;
}

export const useAgencyPostCodesData = ({ id, ...options }: PostCodeRangeProps) => {
    return useQuery<string>(['AGENCY_POST_CODES', id], () => getAgencyPostCodeRange(id), {
        enabled: id !== 'add',
        ...options,
    });
};
