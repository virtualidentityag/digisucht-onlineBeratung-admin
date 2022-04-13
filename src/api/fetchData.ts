import { message } from "antd";
import i18next from "i18next";
import { getValueFromCookie } from "./auth/accessSessionCookie";
import generateCsrfToken from "../utils/generateCsrfToken";

import logout from "./auth/logout";
import routePathNames, { CSRF_WHITELIST_HEADER } from "../appConfig";

const nodeEnv: string = process.env.NODE_ENV as string;
const isLocalDevelopment = nodeEnv === "development";

export const FETCH_METHODS = {
  DELETE: "DELETE",
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
};

export const FETCH_ERRORS = {
  ABORT: "ABORT",
  BAD_REQUEST: "BAD_REQUEST",
  CATCH_ALL: "CATCH_ALL",
  CONFLICT: "CONFLICT",
  CONFLICT_WITH_RESPONSE: "CONFLICT_WITH_RESPONSE",
  EMPTY: "EMPTY",
  NO_MATCH: "NO_MATCH",
  TIMEOUT: "TIMEOUT",
  UNAUTHORIZED: "UNAUTHORIZED",
  X_REASON: "X-Reason",
};

export const X_REASON = {
  EMAIL_NOT_AVAILABLE: "EMAIL_NOT_AVAILABLE",
};

export const FETCH_SUCCESS = {
  CONTENT: "CONTENT",
};

interface FetchDataProps {
  url: string;
  method: string;
  headersData?: object;
  rcValidation?: boolean;
  bodyData?: string;
  skipAuth?: boolean;
  responseHandling?: string[];
  timeout?: number;
  signal?: AbortSignal;
}

export const fetchData = (props: FetchDataProps): Promise<any> =>
  new Promise((resolve, reject) => {
    const accessToken = getValueFromCookie("keycloak");
    const authorization = !props.skipAuth
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : null;

    const csrfToken = generateCsrfToken();

    const rcHeaders = props.rcValidation
      ? {
          rcToken: getValueFromCookie("rc_token"),
          rcUserId: getValueFromCookie("rc_uid"),
        }
      : null;

    const localDevelopmentHeader = isLocalDevelopment
      ? { [CSRF_WHITELIST_HEADER]: csrfToken }
      : null;

    const controller = new AbortController();
    if (props.timeout) {
      setTimeout(() => controller.abort(), props.timeout);
    }
    if (props.signal) {
      props.signal.addEventListener("abort", () => controller.abort());
    }

    const req = new Request(props.url, {
      method: props.method,
      headers: {
        "Content-Type": "application/json",
        "cache-control": "no-cache",
        ...authorization,
        "X-CSRF-TOKEN": csrfToken,
        ...props.headersData,
        ...rcHeaders,
        ...localDevelopmentHeader,
      },
      credentials: "include",
      body: props.bodyData,
      signal: controller.signal,
    });

    fetch(req)
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          const data =
            props.method === FETCH_METHODS.GET ||
            (props.responseHandling &&
              props.responseHandling.includes(FETCH_SUCCESS.CONTENT))
              ? response.json()
              : response;
          resolve(data);
        } else if (props.responseHandling) {
          if (response.status === 401 || response.status === 403) {
            logout(true, routePathNames.login);
          } else if (props.responseHandling.includes(FETCH_ERRORS.CATCH_ALL)) {
            message.error({
              content: i18next.t([
                `message.error.${response.headers.get("x-reason")}`,
                "message.error.default",
              ]),
              duration: 3,
            });
            reject(new Error(FETCH_ERRORS.CATCH_ALL));
          } else if (
            response.status === 204 &&
            props.responseHandling.includes(FETCH_ERRORS.EMPTY)
          ) {
            reject(new Error(FETCH_ERRORS.EMPTY));
          } else if (
            response.status === 400 &&
            props.responseHandling.includes(FETCH_ERRORS.BAD_REQUEST)
          ) {
            reject(new Error(FETCH_ERRORS.BAD_REQUEST));
          } else if (
            response.status === 404 &&
            props.responseHandling.includes(FETCH_ERRORS.NO_MATCH)
          ) {
            reject(new Error(FETCH_ERRORS.NO_MATCH));
          } else if (
            response.status === 409 &&
            (props.responseHandling.includes(FETCH_ERRORS.CONFLICT) ||
              props.responseHandling.includes(
                FETCH_ERRORS.CONFLICT_WITH_RESPONSE
              ))
          ) {
            reject(
              props.responseHandling.includes(
                FETCH_ERRORS.CONFLICT_WITH_RESPONSE
              )
                ? response
                : new Error(FETCH_ERRORS.CONFLICT)
            );
          }
        } else {
          // logout(true, routePathNames.login);
          reject(new Error("api call error"));
        }
      })
      .catch((error) => {
        if (props.signal?.aborted && error.name === "AbortError") {
          reject(new Error(FETCH_ERRORS.ABORT));
        } else if (error.name === "AbortError") {
          reject(new Error(FETCH_ERRORS.TIMEOUT));
        } else {
          reject(error);
        }
      });
  });
