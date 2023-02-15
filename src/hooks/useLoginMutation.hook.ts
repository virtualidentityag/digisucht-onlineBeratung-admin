import { useMutation } from 'react-query';
import { setTokens } from '../api/auth/auth';
import getAccessToken from '../api/auth/getAccessToken';
import { fetchData, FETCH_ERRORS, FETCH_METHODS } from '../api/fetchData';
import { tenantAccessEndpoint } from '../appConfig';
import { TwoFactorType } from '../enums/TwoFactorType';
import { LoginData } from '../types/loginData';

interface LoginParams {
    username: string;
    password: string;
    otp: string;
}

interface ErrorLogin {
    message: string;
    options: {
        data: { otpType: TwoFactorType };
    };
}

export const useLoginMutation = (tenantId: string) => {
    return useMutation<LoginData, ErrorLogin, LoginParams>(
        ['login', 'user-data', tenantId],
        async ({ username, password, otp }: any) => {
            return getAccessToken({ username, password, otp }).then((data) => {
                // We'll check in the server if we're allowed to access the app
                return fetchData({
                    url: tenantAccessEndpoint,
                    method: FETCH_METHODS.GET,
                    headersData: {
                        Authorization: `Bearer ${data.access_token}`,
                    },
                })
                    .then(() => data)
                    .catch(() => Promise.reject(new Error(FETCH_ERRORS.UNAUTHORIZED)));
            });
        },
        {
            onSuccess: (data) => {
                setTokens(data.access_token, data.expires_in, data.refresh_token, data.refresh_expires_in);
            },
        },
    );
};
