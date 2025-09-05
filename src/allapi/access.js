import api from "../api";

export const getModules = async () => {
    const response = await api.get("/user/modules/");
    return response.data;
};
export const createModules = async (payload) => {
    const response = await api.post("/user/modules/", payload);
    return response.data;
};

export const getEffectiveUserPermissions = async (userId) => {
    const response = await api.get(`/user/users/${userId}/permissions/`);
    return response.data;
};

export const getUserModulePermissions = async (userId, moduleId) => {
    const response = await api.get(`/user/users/${userId}/module/${moduleId}/`);
    return response.data;
};

export const updateUserModulePermissions = async (userId, moduleId, payload) => {
    const response = await api.patch(`/user/users/${userId}/module/${moduleId}/`, payload);
    return response.data;
};