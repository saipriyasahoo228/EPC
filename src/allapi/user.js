import api from "../api";

export const createUser = async (payload) => {
    const response = await api.post("/user/register/", payload);
    return response.data;
};

export const getUser = async () => {
    const response = await api.get("/user/get/");
    return response.data;
};

export const getUserById = async (userId) => {
    const response = await api.get(`/user/get/${userId}/`);
    return response.data;
};

export const updateUser = async (userId, payload) => {
    const response = await api.put(`/user/update/${userId}/`, payload);
    return response.data;
};

export const getGroups = async () => {
    const response = await api.get("/user/get-groups/");
    return response.data;
};