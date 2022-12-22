import { Button, Form } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../../../../appConfig';
import { CardEditable } from '../../../../../components/CardEditable';
import { Modal } from '../../../../../components/Modal';
import { SelectFormField } from '../../../../../components/SelectFormField';
import { useTenantAdminData } from '../../../../../hooks/useTenantAdminData.hook';
import { useTenantAdminDataMutation } from '../../../../../hooks/useTenantAdminDataMutation.hook';

export const Languages = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [modal, setModal] = useState(false);
    const { data, isLoading } = useTenantAdminData();

    const { mutate } = useTenantAdminDataMutation({
        onSuccess: () => setModal(true),
    });
    const options = supportedLanguages.map((language) => ({ value: language, label: t(`language.${language}`) }));

    return (
        <>
            <CardEditable
                isLoading={isLoading}
                initialValues={{ ...data }}
                titleKey="organisations.language"
                subTitle={t('organisations.languageSubtitle')}
                onSave={mutate}
                formProp={form}
            >
                <SelectFormField isMulti name={['settings', 'activeLanguages']} options={options} required />
            </CardEditable>
            {modal && (
                <Modal
                    titleKey="organisations.languageModalTitle"
                    contentKey="organisations.languageModalContent"
                    onClose={() => setModal(false)}
                    footer={
                        <>
                            <span />
                            <Button type="primary" onClick={() => setModal(false)}>
                                {t('organisations.languageModalConfirm')}
                            </Button>
                        </>
                    }
                />
            )}
        </>
    );
};
