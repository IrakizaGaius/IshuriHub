const API_URL = 'https://ishurihub.onrender.com';

const getToken = () => {
  return localStorage.getItem('token');
};
console.log(getToken());
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try{
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  
    // Handle cases with no content (e.g., 204 No Content)
    if (response.status === 204) {
      return null; // No content to return
    }

  if (!response.ok) {
    const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
  
  return response.json();
}catch(error){
  throw error;
}
};


export const getParentsMetrics = (data) => apiRequest('/api/parents/parents-metrics/', 'POST', data);
export const getParents = () => apiRequest('/api/parents/');
export const addParent = (data) => apiRequest('/api/parents/', 'POST', data);
export const updateParent = (id, data) => apiRequest(`/api/parents/${id}`, 'PUT', data);
export const deleteParent = (id) => apiRequest(`/api/parents/${id}`, 'DELETE');
export const getStudentsMetrics = (data) => apiRequest('/api/students/students-metrics/', 'POST', data);
export const getStudents = () => apiRequest('/api/students/');
export const getStudent = (id) => apiRequest(`/api/students/${id}`);
export const addStudent = (data) => apiRequest('/api/students/', 'POST', data);
export const updateStudent = (id, data) => apiRequest(`/api/students/${id}`, 'PUT', data);
export const deleteStudent = (id) => apiRequest(`/api/students/${id}`, 'DELETE');
export const getEventsMetrics = (data) => apiRequest('/api/events/metrics/', 'POST', data);
export const getEvents = () => apiRequest('/api/events/');
export const addEvent = (data) => apiRequest('/api/events/', 'POST', data);
export const updateEvent = (id, data) => apiRequest(`/api/events/${id}`, 'PUT', data);
export const deleteEvent = (id) => apiRequest(`/api/events/${id}`, 'DELETE');
export const getSubjects = () => apiRequest('/api/subjects/');
export const addSubject = (data) => apiRequest('/api/subjects/', 'POST', data);
export const updateSubject = (id, data) => apiRequest(`/api/subjects/${id}`, 'PUT', data);
export const deleteSubject = (id) => apiRequest(`/api/subjects/${id}`, 'DELETE');
export const getTerms = () => apiRequest('/api/terms/');
export const addTerm = (data) => apiRequest('/api/terms/', 'POST', data);
export const updateTerm = (id, data) => apiRequest(`/api/terms/${id}`, 'PUT', data);
export const deleteTerm = (id) => apiRequest(`/api/terms/${id}`, 'DELETE');
export const getMarks = () => apiRequest('/api/grades/');
export const addMarks = (data) => apiRequest('/api/grades/', 'POST', data);
export const updateMarks = (id, data) => apiRequest(`/api/grades/${id}`, 'PUT', data);
export const deleteMarks = (id) => apiRequest(`/api/grades/${id}`, 'DELETE');
export const getAttendance = () => apiRequest('/api/attendances/');
export const addAttendance = (data) => apiRequest('/api/attendances/', 'POST', data);
export const updateAttendance = (id, data) => apiRequest(`/api/attendances/${id}`, 'PUT', data);
export const deleteAttendance = (id) => apiRequest(`/api/attendances/${id}`, 'DELETE');
export const login = (data) => apiRequest('/api/users/login', 'POST', data);
export const logout = () => apiRequest('/api/users/logout');