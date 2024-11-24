import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

export interface TokyeConfig {
  serverURL: string;
  loadDefaultAxiosConfig: boolean;
}

export class TokyeState {
  config: TokyeConfig;
  axios: AxiosInstance;

  constructor(config: TokyeConfig) {
    this.config = config;
    this.axios = axios.create({
      baseURL: config.serverURL,
    });
  }

  loadDefaultAxiosConfig(tokye: Tokye) {
    this.axios.interceptors.request.use(async function (config) {
      if (!tokye.isAccessTokenValid() && config.url != "/token") {
        const err = await tokye.refreshToken();
        if (err != null) {
          console.timeLog(err.message);
          return config;
        }
      }
      config.headers.set("Authorization", tokye.getAccessToken());

      return config;
    });
  }
}

export class Tokye {
  state: TokyeState | undefined;

  load(config: TokyeConfig) {
    this.state = new TokyeState(config);

    if (this.state.config.loadDefaultAxiosConfig) {
      this.state.loadDefaultAxiosConfig(this);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem("tokye_access_token");
  }

  getEmail(): string | null {
    return localStorage.getItem("tokye_email");
  }

  setEmail(email: string) {
    return localStorage.setItem("tokye_email", email);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem("tokye_refresh_token");
  }

  isAuthenticated(): boolean {
    return this.isRefreshTokenVaild();
  }

  isTokenValid(token: string | null): boolean {
    if (token == null) {
      return false;
    }

    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp > currentTime;
  }

  isAccessTokenValid(): boolean {
    return this.isTokenValid(this.getAccessToken());
  }

  isRefreshTokenVaild(): boolean {
    return this.isTokenValid(this.getRefreshToken());
  }

  async logout(): Promise<Error | undefined> {
    const { error } = await this.baseRequest("/logout", undefined, {
      refresh_token: this.getRefreshToken(),
    });

    return error;
  }

  async requestOTP(): Promise<{ error: Error | undefined; time: number }> {
    const { response, error } = await this.baseRequest(
      "/otp",
      { email: this.getEmail() },
      undefined,
    );

    return { time: response?.data.time, error: error };
  }

  async register(code: string): Promise<Error | undefined> {
    return await this.handleTokens(
      "/register",
      { email: this.getEmail(), code: code },
      undefined,
    );
  }

  async login(code: string): Promise<Error | undefined> {
    return await this.handleTokens(
      "/login",
      { email: this.getEmail(), code: code },
      undefined,
    );
  }

  async refreshToken(): Promise<Error | undefined> {
    if (!this.isRefreshTokenVaild()) {
      return new Error("RefreshToken is expired please login again");
    }

    return await this.handleTokens("/token", undefined, {
      refresh_token: this.getRefreshToken(),
    });
  }

  async loginPassKey(): Promise<Error | undefined> {
    const { response, error } = await this.baseRequest(
      "/passkey/loginStart",
      { email: this.getEmail() },
      undefined,
    );
    if (error != undefined) {
      return error;
    }

    if (response?.data == undefined) {
      return new Error("response data is empty");
    }
    const attestationResponse = await startAuthentication({
      optionsJSON: response.data.publicKey,
    });

    return await this.handleTokens(
      "/passkey/loginFinish",
      attestationResponse,
      undefined,
    );
  }
  async registerPasskey(): Promise<Error | undefined> {
    const { response, error } = await this.baseRequest(
      "/passkey/registerStart",
      { email: this.getEmail() },
      undefined,
    );
    if (error != undefined) {
      return error;
    }

    if (response?.data == undefined) {
      return new Error("response data is empty");
    }

    const attestationResponse = await startRegistration({
      optionsJSON: response.data.publicKey,
    });

    this.logout();

    return await this.handleTokens(
      "/passkey/registerFinish",
      attestationResponse,
      undefined,
    );
  }

  private async saveTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<Error | undefined> {
    localStorage.setItem("tokye_access_token", accessToken);
    localStorage.setItem("tokye_refresh_token", refreshToken);

    return undefined;
  }

  private async handleTokens(
    url: string,
    data: object | undefined,
    params: object | undefined,
  ): Promise<Error | undefined> {
    const { response, error } = await this.baseRequest(url, data, params);

    if (error != undefined || response == undefined) {
      if (error?.message == "Request failed with status code 401") {
        return new Error("Wrong code");
      }
      return error;
    }

    if (response.data == undefined) {
      return new Error("response data is undefined");
    }

    const accessToken = response.data["access_token"] || "";
    const refreshToken = response.data["refresh_token"] || "";

    return await this.saveTokens(accessToken, refreshToken);
  }

  private async baseRequest(
    url: string,
    data: object | undefined,
    params: object | undefined,
  ): Promise<{
    response: AxiosResponse | undefined;
    error: Error | undefined;
  }> {
    if (this.state == undefined) {
      return { response: undefined, error: Tokye.notLoadedError };
    }

    try {
      const response = await this.state.axios.post(url, data, {
        params: params,
        withCredentials: true,
      });

      if (response.status > 299) {
        return { response: response, error: new Error(response.statusText) };
      } else {
        return { response: response, error: undefined };
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { response: undefined, error: error };
      } else {
        return {
          response: undefined,
          error: new Error("An unknown error occurred"),
        };
      }
    }
  }

  private static notLoadedError: Error = new Error(
    "Tokye was not loaded. Please load it with Tokye.load({serverURL : 'example.com'})",
  );
}
