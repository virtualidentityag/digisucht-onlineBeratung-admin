import { message } from 'antd';
import mergeWith from 'lodash.mergewith';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, UseMutationOptions } from 'react-query';
import { fetchData, FETCH_METHODS } from '../api/fetchData';
import { tenantAdminEndpoint } from '../appConfig';
import { TenantAdminData } from '../types/TenantAdminData';
import { TENANT_ADMIN_DATA_KEY, useTenantAdminData } from './useTenantAdminData.hook';
import { useTenantData } from './useTenantData.hook';

const mergeData = (currentTenantData: TenantAdminData, formData) => {
    const tmp = Object.assign(currentTenantData);
    // Remove the triggers of the booleans (confirmTermsAndConditions, confirmPrivacy)
    Object.keys(tmp.content).forEach((key) => {
        if (typeof tmp.content[key] === 'boolean') {
            delete tmp.content[key];
        }
    });

    const finalData = mergeWith(tmp, formData, (objValue, srcValue) => {
        return objValue instanceof Array ? srcValue : undefined;
    }) as TenantAdminData;

    Object.keys(finalData.content).forEach((key) => {
        delete finalData.content[key]?.translate;
    });

    return finalData;
};

export const useTenantAdminDataMutation = (
    options?: UseMutationOptions<Partial<TenantAdminData>, unknown, Partial<TenantAdminData>>,
) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { data: tenantData } = useTenantData();
    const { data: tenantAdminData } = useTenantAdminData();

    return useMutation(
        (data: Partial<TenantAdminData>) => {
            return fetchData({
                url: `${tenantAdminEndpoint}${tenantData.id}`,
                method: FETCH_METHODS.PUT,
                skipAuth: false,
                bodyData: JSON.stringify(mergeData(tenantAdminData, data)),
                responseHandling: [],
            });
        },
        {
            ...options,
            onSuccess: (responseData, updatedData) => {
                queryClient.setQueryData(TENANT_ADMIN_DATA_KEY, mergeData(tenantAdminData, updatedData));
                message.success({
                    content: t('message.success.setting.update'),
                    duration: 3,
                });
                options?.onSuccess?.(responseData, updatedData, null);
            },
        },
    );
};
