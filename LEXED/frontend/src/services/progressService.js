import axios from "./axiosInstance";

const API_URL = "http://localhost:8080/progress";

export const getSummary = async () => {
    const response = await axios.get(`${API_URL}/summary`);
    return response.data;
};

export const getStats = async () => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
};

export const getDailyChallenge = async () => {
    const response = await axios.get(`${API_URL}/daily-challenge`);
    return response.data;
};

export const recordAttempt = async (questionId, isCorrect) => {
    const response = await axios.post(`${API_URL}/attempts`, {
        question_id: questionId,
        is_correct: isCorrect
    });
    return response.data;
};
