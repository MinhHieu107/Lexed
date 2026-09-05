import axios from "./axiosInstance";

const API_URL = "http://localhost:8080/auth";

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, {
        email,
        password
    });

    return response.data;
};

export const register = async (username, email, password) => {
    const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password
    });

    return response.data;
};

export const logout = async (refreshToken) => {

    const response = await axios.post(
        `${API_URL}/logout`,
        {
            refreshToken
        }
    );

    return response.data;

};

export const verifyEmail = async (email, code) => {
    const response = await axios.post(`${API_URL}/verify-email`, {
        email,
        code
    });

    return response.data;
};

export const resendCode = async (email) => {
    const response = await axios.post(`${API_URL}/resend-code`, {
        email
    });

    return response.data;
};