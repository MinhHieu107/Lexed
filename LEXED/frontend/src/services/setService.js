import axios from "./axiosInstance";

const API_URL = "http://localhost:8080/flashcardSets";

export const getMySets = async () => {
    const response = await axios.get(`${API_URL}/sets/mine`);
    return response.data;
};

export const getSet = async (setId) => {
    const response = await axios.get(`${API_URL}/sets/${setId}`);
    return response.data;
};

export const getSetQuestions = async (setId) => {
    const response = await axios.get(`${API_URL}/sets/${setId}/questions`);
    return response.data;
};

export const createSet = async (payload) => {
    const response = await axios.post(`${API_URL}/sets`, payload);
    return response.data;
};

export const updateSet = async (setId, payload) => {
    const response = await axios.put(`${API_URL}/sets/${setId}`, payload);
    return response.data;
};

export const getSetProgress = async (setId) => {
    const response = await axios.get(`${API_URL}/sets/${setId}/progress`);
    return response.data;
};

export const deleteSet = async (setId) => {
    const response = await axios.delete(`${API_URL}/sets/${setId}`);
    return response.data;
};
