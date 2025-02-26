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

    const validatePostcodes = (_: any, value: string) => {
        if (!value) {
            return Promise.reject(new Error(t('agency.postcode.required')));
        }

        try {
            validatePostcodeRanges(value);
            return Promise.resolve();
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
                placeholder={t('agency.form.registrationSettings.postCodePlaceholder')}
                rows={8}
                rules={[
                    {
                        required: true,
                        message: t('agency.postcode.required'),
                    },
                    {
                        validator: validatePostcodes,
                    },
                ]}
            />
        </div>
    );
};
