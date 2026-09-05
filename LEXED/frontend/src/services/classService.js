import axios from "./axiosInstance";

const API_URL = "http://localhost:8080";

export const getMyClasses = async () => {
    const response = await axios.get(`${API_URL}/classes/mine`);
    return response.data;
};

export const createClass = async (name) => {
    const response = await axios.post(`${API_URL}/classes`, { name });
    return response.data;
};

export const joinClassByCode = async (classCode) => {
    const response = await axios.post(`${API_URL}/classes/join`, { class_code: classCode });
    return response.data;
};

export const getClassMembers = async (classId) => {
    const response = await axios.get(`${API_URL}/classes/${classId}/members`);
    return response.data;
};

export const addMemberByEmail = async (classId, email) => {
    const response = await axios.post(`${API_URL}/classes/${classId}/members`, { email });
    return response.data;
};

export const deleteClass = async (classId) => {
    const response = await axios.delete(`${API_URL}/classes/${classId}`);
    return response.data;
};

export const getClassSets = async (classId) => {
    const response = await axios.get(`${API_URL}/classes/${classId}/sets`);
    return response.data;
};

export const removeMember = async (classId, memberId) => {
    const response = await axios.delete(`${API_URL}/classes/${classId}/members/${memberId}`);
    return response.data;
};
