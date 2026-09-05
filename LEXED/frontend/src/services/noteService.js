import axios from "./axiosInstance";

const API_URL = "http://localhost:8080/notes";

export const getNotes = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createNote = async (note) => {
    const response = await axios.post(API_URL, note);
    return response.data;
};

export const updateNote = async (id, note) => {
    const response = await axios.put(`${API_URL}/${id}`, note);
    return response.data;
};

export const deleteNote = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
