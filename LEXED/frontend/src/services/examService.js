import axios from "./axiosInstance";

const API_URL = "http://localhost:8080/examBank";

export const getExams = async () => {
    const response = await axios.get(`${API_URL}/exams`);
    return response.data;
};

export const getExam = async (examId, questionSet) => {
    const response = await axios.get(`${API_URL}/exams/${examId}/sets/${questionSet}`);
    return response.data;
};

export const getQuestions = async (examId, questionSet) => {
    const response = await axios.get(`${API_URL}/exams/${examId}/sets/${questionSet}/questions`);
    return response.data;
};

export const createExam = async (payload) => {
    const response = await axios.post(`${API_URL}/exams`, payload);
    return response.data;
};
