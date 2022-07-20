import { CounselorData } from "../../types/counselor";
import { FETCH_ERRORS, FETCH_METHODS, fetchData } from "../fetchData";
import { counselorEndpoint } from "../../appConfig";
import { encodeUsername } from "../../utils/encryptionHelpers";
import putAgenciesForCounselor from "../agency/putAgenciesForCounselor";

/**
 * edit counselor
 * @param counselorData - newly fetched consultant data from backend
 * @param formData - input data from form
 * @return data
 */
const editCounselorData = async (
  counselorData: CounselorData,
  formData: CounselorData
) => {
  const {
    firstname,
    lastname,
    formalLanguage,
    email,
    absent,
    username,
    absenceMessage,
    id,
    twoFactorAuth,
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
  };

  if (
    counselorData.agencyIds.length > 0 &&
    formData.agencyIds.length > 0 &&
    counselorData.agencyIds !== formData.agencyIds
  ) {
    await putAgenciesForCounselor(counselorData.id, formData.agencyIds);
  }

  return fetchData({
    url: `${counselorEndpoint}/${id}`,
    method: FETCH_METHODS.PUT,
    skipAuth: false,
    responseHandling: [FETCH_ERRORS.CATCH_ALL],
    bodyData: JSON.stringify(strippedCounselor),
  });
};

export default editCounselorData;
