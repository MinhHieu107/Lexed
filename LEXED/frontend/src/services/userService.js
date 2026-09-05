import axios from "./axiosInstance";

const API_URL = "http://localhost:8080/auth";

export const getCurrentUser = async () => {

    const response = await axios.get(`${API_URL}/current`);

    return response.data;
};