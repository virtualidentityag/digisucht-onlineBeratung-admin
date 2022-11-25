import { Form, FormInstance, Spin } from 'antd';
import Title from 'antd/lib/typography/Title';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '../../../../box/Box';
import { Button, ButtonItem, BUTTON_TYPES } from '../../../../button/Button';
import Pencil from '../../../../CustomIcons/Pencil';

interface CardEditableProps {
    isLoading?: boolean;
    initialValues: Record<string, unknown>;
    titleKey: string;
    children:
        | React.ReactElement
        | React.ReactElement[]
        | ((form: FormInstance<any>) => React.ReactElement | React.ReactElement[]);
    onSave: <T>(formData: T) => void;
    formProp?: FormInstance;
    onAddMode?: boolean;
}

export const CardEditable = ({
    isLoading,
    initialValues,
    titleKey,
    children,
    onAddMode,
    onSave,
    formProp,
}: CardEditableProps) => {
    const [form] = Form.useForm(formProp);
    const { t } = useTranslation();
    const [editing, setEditing] = useState(onAddMode);
    const cancelEditButton: ButtonItem = {
        label: t('agency.edit.general.general_information.cancel'),
        type: BUTTON_TYPES.LINK,
    };

    const saveEditButton: ButtonItem = {
        label: t('agency.edit.general.general_information.save'),
        type: BUTTON_TYPES.LINK,
    };

    const onFormSubmit = useCallback(
        (formData) => {
            onSave(formData);
            setEditing(false);
        },
        [onSave],
    );
    return (
        <Box>
            <div className="agencyEdit__headline">
                <Title className="formHeadline mb-m" level={4}>
                    {t(titleKey)}
                </Title>
                {!onAddMode && <Pencil className="agencyEdit__pointer" onClick={() => setEditing(true)} />}
            </div>
            {isLoading && <Spin />}
            {!isLoading && (
                <div>
                    <Form
                        size="small"
                        labelAlign="left"
                        labelWrap
                        layout="vertical"
                        form={form}
                        onFinish={onFormSubmit}
                        disabled={!editing}
                        initialValues={initialValues}
                    >
                        {typeof children === 'function' ? children(form) : children}
                    </Form>
                </div>
            )}

            {editing && !onAddMode && (
                <div className="agencyEdit__editableButtons">
                    <Button
                        item={cancelEditButton}
                        buttonHandle={() => {
                            form.resetFields();
                            setEditing(false);
                        }}
                    />
                    <Button item={saveEditButton} buttonHandle={() => form.submit()} />
                </div>
            )}
        </Box>
    );
};
