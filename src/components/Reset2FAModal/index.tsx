import { Modal, message, Alert, Space } from 'antd';
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
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { mutate: deactivate2FA } = useConsultantTwoFactorDeactivate({
        onSuccess: () => {
            setIsLoading(false);
            setSuccess(true);
            message.success({
                content: t('message.counselor.reset2fa.success'),
                duration: 3,
            });
            // Delay closing the modal to allow the user to see the success state
            setTimeout(() => {
                onClose();
            }, 1500);
        },
        onError: () => {
            setIsLoading(false);
            setError(t('message.counselor.reset2fa.error'));
            message.error({
                content: t('message.counselor.reset2fa.error'),
                duration: 3,
            });
        },
    });

    const handleReset = () => {
        setIsLoading(true);
        setError(null);
        deactivate2FA(consultantId);
    };

    const handleCancel = () => {
        // If we're in a loading state, don't allow closing
        if (isLoading) return;
        onClose();
    };

    return (
        <Modal
            title={<Title level={2}>{t('counselor.modal.headline.reset2fa')}</Title>}
            open
            onOk={handleReset}
            onCancel={handleCancel}
            cancelText={t('btn.cancel.uppercase')}
            okText={success ? t('btn.close.uppercase') : t('btn.reset.uppercase')}
            okButtonProps={{
                danger: !success,
                type: success ? 'default' : 'primary',
                disabled: success,
            }}
            confirmLoading={isLoading}
            centered
            closable={!isLoading}
            maskClosable={!isLoading}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                {error && <Alert message={t('error.title')} description={error} type="error" showIcon />}
                {success ? (
                    <Alert
                        message={t('success.title')}
                        description={t('message.counselor.reset2fa.success')}
                        type="success"
                        showIcon
                    />
                ) : (
                    <p>{t('counselor.modal.text.reset2fa', { name: consultantName })}</p>
                )}
            </Space>
        </Modal>
    );
};
