import { Modal, message } from 'antd';
import Title from 'antd/lib/typography/Title';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useConsultantTwoFactorDeactivate } from '../../hooks/useConsultantTwoFactorDeactivate';

interface Reset2FAModalProps {
    consultantId: string;
    consultantName: string;
    onClose: () => void;
}

export const Reset2FAModal = ({ consultantId, consultantName, onClose }: Reset2FAModalProps) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const { mutate: deactivate2FA } = useConsultantTwoFactorDeactivate({
        onSuccess: () => {
            message.success({
                content: t('message.counselor.reset2fa.success'),
                duration: 3,
            });
            onClose();
        },
        onError: () => {
            message.error({
                content: t('message.counselor.reset2fa.error'),
                duration: 3,
            });
            setIsLoading(false);
        },
    });

    const handleReset = () => {
        setIsLoading(true);
        deactivate2FA(consultantId);
    };

    return (
        <Modal
            title={<Title level={2}>{t('counselor.modal.headline.reset2fa')}</Title>}
            open
            onOk={handleReset}
            onCancel={onClose}
            cancelText={t('btn.cancel.uppercase')}
            okText={t('btn.reset.uppercase')}
            confirmLoading={isLoading}
            centered
        >
            <p>{t('counselor.modal.text.reset2fa', { name: consultantName })}</p>
        </Modal>
    );
};
