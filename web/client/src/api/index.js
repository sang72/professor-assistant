const API_BASE = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const courseApi = {
  listCourses: () => request('/courses'),
  getCourse: (folder) => request(`/courses/${folder}`),
  createCourse: (data) => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourseConfig: (folder, updates) =>
    request(`/courses/${folder}/config`, { method: 'PUT', body: JSON.stringify(updates) }),
  getFiles: (folder) => request(`/courses/${folder}/files`),
  downloadFile: (folder, filePath) => {
    window.open(`${API_BASE}/courses/${folder}/download?path=${encodeURIComponent(filePath)}`, '_blank');
  },
  uploadTextbook: (folder, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/courses/${folder}/upload-textbook`, {
      method: 'POST',
      body: formData,
    }).then(r => r.json());
  },
  getPrompt: (folder, task) => request(`/courses/${folder}/prompt/${task}`),

  // New endpoints for textbook and exam
  uploadTOC: (folder, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/courses/${folder}/upload-toc`, {
      method: 'POST',
      body: formData,
    }).then(r => r.json());
  },
  getTOC: (folder) => request(`/courses/${folder}/toc`),
  uploadChapter: (folder, key, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/courses/${folder}/chapters/${key}`, {
      method: 'POST',
      body: formData,
    }).then(r => r.json());
  },
  getChapters: (folder) => request(`/courses/${folder}/chapters`),
  saveExamConfig: (folder, type, config) =>
    request(`/courses/${folder}/exam-config`, {
      method: 'POST',
      body: JSON.stringify({ type, ...config })
    }),
  getExamConfig: (folder, type) => request(`/courses/${folder}/exam-config/${type}`),
  downloadDocx: (folder, type) => {
    window.open(`${API_BASE}/courses/${folder}/docx/${type}`, '_blank');
  },
  downloadPptx: (folder, type) => {
    window.open(`${API_BASE}/courses/${folder}/pptx/${type}`, '_blank');
  },
  initializeLecture: (folder, week, session, force = false) =>
    request(`/courses/${folder}/lectures/${week}/${session}/init`, { method: 'POST', body: JSON.stringify({ force }) }),
  initializeExam: (folder, type, force = false) =>
    request(`/courses/${folder}/exams/${type}/init`, { method: 'POST', body: JSON.stringify({ force }) }),
  initializeAssignment: (folder, num, force = false) =>
    request(`/courses/${folder}/assignments/${num}/init`, { method: 'POST', body: JSON.stringify({ force }) }),
  deleteCourse: (folder) =>
    request(`/courses/${folder}`, { method: 'DELETE' }),
  uploadLectureMaterial: (folder, week, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/courses/${folder}/lectures/${week}/upload`, {
      method: 'POST',
      body: formData,
    }).then(r => r.json());
  },
  getLectureMaterials: (folder, week) =>
    request(`/courses/${folder}/lectures/${week}/files`),
};

export const health = {
  check: async () => {
    try {
      const response = await fetch(`${API_BASE.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};
