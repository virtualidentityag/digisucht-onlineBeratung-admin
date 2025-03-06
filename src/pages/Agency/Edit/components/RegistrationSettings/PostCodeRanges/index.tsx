import { useContext } from 'react';
import DisabledContext from 'antd/es/config-provider/DisabledContext';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { FormTextAreaField } from '../../../../../../components/FormTextAreaField';
import { validatePostcodeRanges } from '../../../../../../utils/validatePostcodeRanges';
import styles from './styles.module.scss';

export const PostCodeRanges = () => {
    const { t } = useTranslation();
    const contextDisabled = useContext(DisabledContext);

    const validatePostcodes = async (_: any, value: string) => {
        try {
            validatePostcodeRanges(value);
            return await Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    };

    return (
        <div className={styles.postCodeRangesContainer}>
            <Typography.Paragraph>{t('agency.form.registrationSettings.newPostCodeLabel')}</Typography.Paragraph>
            <FormTextAreaField
                name="postCodes"
                disabled={contextDisabled}
                placeholderKey="agency.form.registrationSettings.postCodePlaceholder"
                labelKey="agency.form.registrationSettings.newPostCodeLabel"
                rows={8}
                rules={[
                    {
                        validator: validatePostcodes,
                    },
                ]}
            />
        </div>
    );
};
