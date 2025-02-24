import { FETCH_ERRORS, fetchData } from '../fetchData';
import { agencyPostcodeRangeEndpointBase } from '../../appConfig';
import { PostCodeRange } from './getAgencyPostCodeRange';
import { validatePostcodeRanges } from '../../utils/validatePostcodeRanges';

/**
 * add new agency postcode range
 * @param agencyData
 * @return data
 */
const updateAgencyPostCodeRange = (id: string, postCodesForm: PostCodeRange, method: string) => {
    // Validate and transform the postcode ranges before sending
    const validatedRanges = validatePostcodeRanges(postCodesForm.range);

    if (method === 'POST') {
        return fetchData({
            url: `${agencyPostcodeRangeEndpointBase}/${id}`,
            method: 'POST',
            skipAuth: false,
            responseHandling: [FETCH_ERRORS.CATCH_ALL],
            bodyData: JSON.stringify({ postcodeRanges: validatedRanges }),
        }).then(() => id);
    }
    return fetchData({
        url: `${agencyPostcodeRangeEndpointBase}/${id}`,
        method: 'DELETE',
        skipAuth: false,
        responseHandling: [FETCH_ERRORS.CATCH_ALL],
    })
        .catch(() => null)
        .then(() => {
            return fetchData({
                url: `${agencyPostcodeRangeEndpointBase}/${id}`,
                method: 'POST',
                skipAuth: false,
                responseHandling: [FETCH_ERRORS.CATCH_ALL],
                bodyData: JSON.stringify({ postcodeRanges: validatedRanges }),
            });
        });
};

export default updateAgencyPostCodeRange;
