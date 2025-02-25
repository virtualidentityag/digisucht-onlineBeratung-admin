import { FETCH_ERRORS, FETCH_METHODS, fetchData } from '../fetchData';
import { agencyPostcodeRangeEndpointBase } from '../../appConfig';
import { transformPostcodeRanges } from '../../utils/transformPostcodeRanges';

export interface PostCodeRange {
    range: string;
}

/**
 * get postcode ranges of an agency
 * @param id - agency id
 * @return data
 */
const getAgencyPostCodeRange = (id: string) => {
    return fetchData({
        url: `${agencyPostcodeRangeEndpointBase}/${id}`,
        method: FETCH_METHODS.GET,
        skipAuth: false,
        responseHandling: [FETCH_ERRORS.CATCH_ALL],
    }).then((data) => {
        return {
            range: transformPostcodeRanges(data),
        };
    });
};

export default getAgencyPostCodeRange;
