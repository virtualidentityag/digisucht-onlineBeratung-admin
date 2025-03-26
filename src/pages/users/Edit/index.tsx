import { message, Space } from 'antd';
import { useForm, useWatch } from 'antd/lib/form/Form';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { FETCH_ERRORS, X_REASON } from '../../../api/fetchData';
import { CardEditable } from '../../../components/CardEditable';
import { Button, BUTTON_TYPES } from '../../../components/button/Button';
import { FormInputField } from '../../../components/FormInputField';
import { FormTextAreaField } from '../../../components/FormTextAreaField';
import { Page } from '../../../components/Page';
import { SelectFormField } from '../../../components/SelectFormField';
import { PermissionAction } from '../../../enums/PermissionAction';
import { Resource } from '../../../enums/Resource';
import { TypeOfUser } from '../../../enums/TypeOfUser';
import { useAddOrUpdateConsultantOrAdmin } from '../../../hooks/useAddOrUpdateConsultantOrAgencyAdmin';
import { useAgenciesData } from '../../../hooks/useAgencysData';
import { useConsultantsOrAdminsData } from '../../../hooks/useConsultantsOrAdminsData';
import { useUserPermissions } from '../../../hooks/useUserPermission';
import { convertToOptions } from '../../../utils/convertToOptions';
import { decodeUsername } from '../../../utils/encryptionHelpers';
import { FormSwitchField } from '../../../components/FormSwitchField';
import { useFeatureContext } from '../../../context/FeatureContext';
import { FeatureFlag } from '../../../enums/FeatureFlag';
import { Reset2FAModal } from '../../../components/Reset2FAModal';

export const UserEditOrAdd = () => {
    const navigate = useNavigate();
    const [form] = useForm();
    const { can } = useUserPermissions();
    const { t } = useTranslation();
    const { isEnabled } = useFeatureContext();
    const { typeOfUsers, id } = useParams<{ id: string; typeOfUsers: TypeOfUser }>();
    const [showReset2FAModal, setShowReset2FAModal] = useState(false);
    const { data: consultantsResponse, isLoading: isLoadingConsultants } = useConsultantsOrAdminsData({
        search: id,
        typeOfUser: typeOfUsers,
        enabled: !!id,
    });
    const { data: agenciesData, isLoading } = useAgenciesData({ pageSize: 10000 });
    const isEditing = id !== 'add';
    const singleData = consultantsResponse?.data.find((c) => c.id === id);

    const { mutate } = useAddOrUpdateConsultantOrAdmin({
        id: isEditing ? id : null,
        typeOfUser: typeOfUsers,
        onSuccess: (response) => {
            message.success({
                content: t(`message.counselor.${isEditing ? 'update' : 'add'}`),
                duration: 3,
            });
            navigate(`/admin/users/${typeOfUsers}/${response.id}`);
        },
        onError: (error: Error | Response) => {
            if (error instanceof Response) {
                switch (error.headers.get(FETCH_ERRORS.X_REASON)) {
                    case X_REASON.EMAIL_NOT_AVAILABLE: {
                        const isAllowed =
                            can(PermissionAction.Delete, Resource.Consultant) && typeOfUsers === TypeOfUser.Consultants;
                        message.error({
                            content: t(
                                `${isAllowed ? '' : 'notAllowed.'}message.error.${error.headers.get(
                                    FETCH_ERRORS.X_REASON,
                                )}`,
                            ),
                            duration: 3,
                        });
                        break;
                    }
                    case X_REASON.NUMBER_OF_LICENSES_EXCEEDED:
                        message.error({
                            content: t('message.error.NUMBER_OF_LICENSES_EXCEEDED'),
                            duration: 3,
                        });
                        break;
                    default:
                        message.error({
                            content: t('message.error.default'),
                            duration: 3,
                        });
                        break;
                }
            }
        },
    });

    const onSave = useCallback((data) => mutate(data), []);
    const onCancel = useCallback(() => navigate(`/admin/users/${typeOfUsers}`), []);
    const isAbsentEnabled = useWatch('absent', form);

    return (
        <Page isLoading={isLoadingConsultants || isLoading}>
            <Page.Back path={`/admin/users/${typeOfUsers}`} titleKey="agency.add.general.headline" />

            {isEditing && typeOfUsers === 'consultants' && can(PermissionAction.Update, Resource.Consultant) && (
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        item={{
                            label: t('counselor.reset2fa'),
                            type: BUTTON_TYPES.SECONDARY,
                        }}
                        buttonHandle={() => setShowReset2FAModal(true)}
                    />
                </div>
            )}

            <CardEditable
                isLoading={isLoading}
                initialValues={{
                    ...(singleData || {
                        formalLanguage: true,
                        isGroupchatConsultant: isEnabled(FeatureFlag.GroupChatV2),
                    }),
                    username: decodeUsername(singleData?.username || ''),
                    agencies: convertToOptions(singleData?.agencies || [], ['postcode', 'name', 'city'], 'id'),
                }}
                titleKey="agency.edit.general.general_information"
                onSave={onSave}
                editMode={!isEditing}
                hideCancelButton={!isEditing}
                hideSaveButton={!isEditing}
                formProp={form}
            >
                <FormInputField name="firstname" labelKey="firstname" placeholderKey="placeholder.firstname" required />
                <FormInputField name="lastname" labelKey="lastname" placeholderKey="placeholder.lastname" required />
                <FormInputField
                    name="email"
                    labelKey="email"
                    placeholderKey="placeholder.email"
                    rules={[
                        {
                            required: true,
                            type: 'email',
                            message: t('message.error.email.incorrect'),
                        },
                    ]}
                />

                <SelectFormField
                    name="agencies"
                    label="agency"
                    labelInValue
                    isMulti
                    placeholder="plsSelect"
                    options={convertToOptions(
                        agenciesData?.data?.filter((agency) => agency.deleteDate === 'null') || [],
                        ['postcode', 'name', 'city'],
                        'id',
                    )}
                />

                <FormInputField
                    name="username"
                    labelKey="counselor.username"
                    placeholderKey="placeholder.username"
                    required
                    disabled={isEditing}
                />

                {typeOfUsers === 'consultants' && (
                    <>
                        <Space align="center">
                            <FormSwitchField labelKey="counselor.formalLanguage" name="formalLanguage" />
                            {isEditing && <FormSwitchField labelKey="counselor.absent" name="absent" />}
                            {isEnabled(FeatureFlag.GroupChatV2) && (
                                <FormSwitchField
                                    labelKey="counselor.isGroupChatConsultant"
                                    name="isGroupchatConsultant"
                                />
                            )}
                        </Space>
                        {isAbsentEnabled && (
                            <FormTextAreaField labelKey="counselor.absenceMessage" name="absenceMessage" />
                        )}
                    </>
                )}
            </CardEditable>

            {!isEditing && (
                <div className="agencyAdd_actions agencyAdd_actions--sticky">
                    <Button
                        item={{ label: t('agency.add.general.cancel'), type: BUTTON_TYPES.SECONDARY }}
                        buttonHandle={onCancel}
                    />
                    <Button
                        item={{ label: t('agency.add.general.save'), type: BUTTON_TYPES.PRIMARY }}
                        buttonHandle={() => form.submit()}
                    />
                </div>
            )}

            {showReset2FAModal && (
                <Reset2FAModal
                    consultantId={id}
                    consultantName={`${singleData?.firstname} ${singleData?.lastname}`}
                    onClose={() => setShowReset2FAModal(false)}
                />
            )}
        </Page>
    );
};
