import axios from "axios";


const API = import.meta.env.VITE_API_URL;


export const getQuestionsForQuiz = async (quizId, token) => {
const res = await axios.get(`${API}/questions/?quiz=${quizId}`, {
headers: { Authorization: `Bearer ${token}` },
});
return res.data;
};


export const createQuestion = async (data, token) => {
const res = await axios.post(`${API}/questions/`, data, {
headers: { Authorization: `Bearer ${token}` },
});
return res.data;
};


export const updateQuestion = async (id, data, token) => {
const res = await axios.put(`${API}/questions/${id}/`, data, {
headers: { Authorization: `Bearer ${token}` },
});
return res.data;
};


export const deleteQuestion = async (id, token) => {
const res = await axios.delete(`${API}/questions/${id}/`, {
headers: { Authorization: `Bearer ${token}` },
});
return res.data;
};


export const createChoice = async (data, token) => {
const res = await axios.post(`${API}/choices/`, data, {
headers: { Authorization: `Bearer ${token}` },
});
return res.data;
};