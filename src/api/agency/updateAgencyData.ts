import { FETCH_ERRORS, FETCH_METHODS, fetchData } from '../fetchData';
import { agencyEndpointBase } from '../../appConfig';
import { AgencyData } from '../../types/agency';
import updateAgencyType from './updateAgencyType';
import getConsultingType4Tenant from '../consultingtype/getConsultingType4Tenant';

/**
 * update agency
 * @param agencyModel - agency data from backend
 * @param formInput - input data from form
 * @return data
 */
export const updateAgencyData = async (agencyModel: AgencyData, formInput: AgencyData) => {
    const agencyId = agencyModel.id;
    if (agencyId == null) {
        throw Error('agency id must be set');
    }

    await updateAgencyType(agencyModel, formInput);

    const consultingTypeId = await getConsultingType4Tenant();

    const topicIds = formInput?.topicIds
        ?.map((topic) => (typeof topic === 'string' ? topic : topic?.value))
        .filter(Boolean);

    const agencyDataRequestBody = {
        dioceseId: 0,
        name: formInput.name,
        description: formInput.description,
        topicIds,
        postcode: formInput.postcode,
        city: formInput.city,
        consultingType: consultingTypeId,
        offline: !formInput.online,
        external: false,
        demographics: formInput.demographics,
    };
    return fetchData({
        url: `${agencyEndpointBase}/${agencyModel.id}`,
        method: FETCH_METHODS.PUT,
        skipAuth: false,
        responseHandling: [FETCH_ERRORS.CATCH_ALL],
        bodyData: JSON.stringify(agencyDataRequestBody),
    });
};
