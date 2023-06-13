import { LabeledValue } from 'antd/lib/select';
import { CounselorData } from '../../types/counselor';
import { FETCH_ERRORS, FETCH_METHODS, fetchData } from '../fetchData';
import { counselorEndpoint } from '../../appConfig';
import { encodeUsername } from '../../utils/encryptionHelpers';
import { putAgenciesForCounselor } from '../agency/putAgenciesForCounselor';

/**
 * edit counselor
 * @param counselorData - newly fetched consultant data from backend
 * @param formData - input data from form
 * @return data
 */
export const editCounselorData = async (id: string, formData: CounselorData): Promise<CounselorData> => {
    const {
        firstname,
        lastname,
        formalLanguage,
        email,
        absent,
        username,
        absenceMessage,
        twoFactorAuth,
        isGroupchatConsultant,
    } = formData;

    // just use needed data from whole form data
    const strippedCounselor = {
        firstname,
        lastname,
        formalLanguage,
        email,
        absent,
        username: encodeUsername(username),
        absenceMessage: absent ? absenceMessage : null,
        twoFactorAuth,
        isGroupchatConsultant,
    };

    const ids = ((formData.agencies as LabeledValue[])?.map(({ value }) => value) || []) as string[];
    await putAgenciesForCounselor(id, ids);

    return (
        fetchData({
            url: `${counselorEndpoint}/${id}`,
            method: FETCH_METHODS.PUT,
            skipAuth: false,
            responseHandling: [FETCH_ERRORS.CATCH_ALL],
            bodyData: JSON.stringify(strippedCounselor),
        })
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                return response.json();
            })
            // eslint-disable-next-line no-underscore-dangle
            .then((data: { _embedded: CounselorData }) => data?._embedded)
    );
};
