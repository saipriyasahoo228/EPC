import api from '../api'; // your configured axios instance

//Get all projects
export const getProjectsAccept = async () => {
  const response = await api.get('/tender/projects/accepted');
  return response.data;
};
