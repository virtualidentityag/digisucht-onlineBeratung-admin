import { FileDownloadOutlined } from '@mui/icons-material';
import { Col, Row, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import getRegistrationData from '../api/statistic/getRegistrationData';
import { Page } from '../components/Page';
import { RegistrationData, RegistrationStatistics } from '../types/registrationData';

const isRegistrationDataFetched = false;

export const Statistic = () => {
    const { t } = useTranslation();
    const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
    const [csvData, setCsvData] = useState([]);

    useEffect(() => {
        if (isRegistrationDataFetched) return;
        if (isRequestInProgress) return;

        setIsRequestInProgress(true);
        getRegistrationData()
            .then((response: RegistrationData) => response?.registrationStatistics || [])
            .catch(() => [] as RegistrationStatistics[])
            .then((registrationStatistics: RegistrationStatistics[]) => {
                const data = [];
                data.push([
                    'tenant_name',
                    'agency_name',
                    'user_id',
                    'date_register',
                    'date_last_activity',
                    'date_archive_or_deleted',
                    'user_age',
                    'user_gender',
                    'registration_consulting_reason',
                    'registration_consulting_topic',
                    'registration_consulting_topic_main',
                    'registration_zip',
                    'registration_referer',
                    'activity_appointments',
                    'activity_calls',
                    'activity_messages',
                ]);
                registrationStatistics.forEach(function createCsvLine(entry) {
                    const csvLine: string[] = [];

                    let formattedTopics = '';
                    const topics = entry.topicsInternalAttributes;
                    topics.forEach(function concateTopics(topic) {
                        if (formattedTopics !== '') {
                            formattedTopics += ', ';
                        }
                        formattedTopics += topic;
                    });

                    csvLine.push(entry.tenantName);
                    csvLine.push(entry.agencyName);
                    csvLine.push(entry.userId);
                    csvLine.push(entry.registrationDate);
                    csvLine.push(entry.lastActivityDate);
                    csvLine.push(entry.endDate);
                    csvLine.push(entry.age ? entry.age.toString() : '');
                    csvLine.push(entry.gender || '');
                    csvLine.push(entry.counsellingRelation || '');
                    csvLine.push(formattedTopics);
                    csvLine.push(entry.mainTopicInternalAttribute || '');
                    csvLine.push(entry.postalCode);
                    csvLine.push(entry.referer ? decodeURI(entry.referer) : '');
                    csvLine.push(entry.appointmentsBookedCount ? entry.appointmentsBookedCount.toString() : '');
                    csvLine.push(entry.attendedVideoCallsCount ? entry.attendedVideoCallsCount.toString() : '');
                    csvLine.push(entry.consultantMessagesCount ? entry.consultantMessagesCount.toString() : '');

                    data.push(csvLine);
                });
                setCsvData(data);

                setIsRequestInProgress(false);
            });
    }, []);

    return (
        <Page>
            <Page.Title titleKey="statistic.title" />

            <Row gutter={[24, 24]}>
                <Col span={6}>
                    <div className="statistic">
                        <div className="statistic__headline">{t('statistic.title.text')}</div>
                        <div className="statistic__download">{t('statistic.download.text')}</div>
                        <div className="statistic__download">
                            {isRequestInProgress ? (
                                <Spin />
                            ) : (
                                <CSVLink
                                    separator=";"
                                    data={csvData}
                                    filename={`${t('statistic.download.filename')}.csv`}
                                >
                                    <span className="statistic__icon">
                                        <FileDownloadOutlined />
                                    </span>
                                    <span className="statistic__text">{t('statistic.download.link')}</span>
                                </CSVLink>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </Page>
    );
};
