import { Form, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useFeatureContext } from '../../../../../context/FeatureContext';
import { FeatureFlag } from '../../../../../enums/FeatureFlag';
import { Gender } from '../../../../../enums/Gender';
import { convertToOptions } from '../../../../../utils/convertToOptions';
import { Option, SelectFormField } from '../../../../../components/SelectFormField';
import { Card } from '../../../../../components/Card';
import { SliderFormField } from '../../../../../components/SliderFormField';
import { FormSwitchField } from '../../../../../components/FormSwitchField';
import { useTenantTopics } from '../../../../../hooks/useTenantTopics';
import { getDiocesesData } from '../../../../../api/agency/getDiocesesData';
import getConsultingTypes from '../../../../../api/consultingtype/getConsultingTypes';
import styles from './styles.module.scss';

export const AgencySettings = () => {
    const [t] = useTranslation();

    const topicIds = Form.useWatch<Option[]>('topicIds') || [];
    const genders = Form.useWatch<Option[]>(['demographics', 'genders']) || [];

    const [diocesesData, setDiocesesData] = useState([]);
    const [consultingTypes, setConsultingTypes] = useState([]);

    const { isEnabled } = useFeatureContext();
    const { data: topics, isLoading: isLoadingTopics } = useTenantTopics(true);
    const topicsForList = topics?.filter(({ id }) => !topicIds.find(({ value }) => value === `${id}`));
    const gendersForList = Object.values(Gender).filter((name) => !genders.find(({ value }) => value === `${name}`));

    useEffect(() => {
        if (isEnabled(FeatureFlag.ConsultingTypesForAgencies)) {
            getConsultingTypes().then((cTypes) => setConsultingTypes(cTypes));
            getDiocesesData().then((dioceses) => setDiocesesData(dioceses));
        }
    }, []);

    return (
        <Card isLoading={isLoadingTopics} titleKey="agency.edit.settings.title">
            {isEnabled(FeatureFlag.Topics) && topics?.length > 0 && (
                <SelectFormField
                    label="topics.title"
                    name="topicIds"
                    labelInValue
                    isMulti
                    allowClear
                    placeholder="plsSelect"
                    options={convertToOptions(topicsForList, 'name', 'id')}
                />
            )}
            {isEnabled(FeatureFlag.ConsultingTypesForAgencies) && (
                <SelectFormField
                    label="agency.edit.general.more_settings.diocese.title"
                    name="dioceseId"
                    placeholder="plsSelect"
                    options={convertToOptions(diocesesData, ['id', 'name'], 'id')}
                />
            )}
            {isEnabled(FeatureFlag.ConsultingTypesForAgencies) && (
                <SelectFormField
                    label="agency"
                    name="consultingType"
                    placeholder="plsSelect"
                    options={convertToOptions(consultingTypes, ['id', 'titles.default'], 'id')}
                />
            )}
            {isEnabled(FeatureFlag.Demographics) && (
                <>
                    <SliderFormField
                        className={styles.sliderContainer}
                        label="agency.age"
                        name={['demographics', 'age']}
                        min={0}
                        max={100}
                    />
                    <SelectFormField
                        labelInValue
                        label="agency.gender"
                        name={['demographics', 'genders']}
                        isMulti
                        options={gendersForList.map((gender) => ({
                            value: gender,
                            label: t(`agency.gender.option.${gender.toLowerCase()}`),
                        }))}
                    />
                </>
            )}

            <FormSwitchField
                inline
                disableLabels
                labelKey="agency.form.settings.teamAdviceCenter.tittle"
                name="teamAgency"
            />

            <Typography.Paragraph>{t('agency.form.settings.teamAdviceCenter.description')}</Typography.Paragraph>
        </Card>
    );
};
