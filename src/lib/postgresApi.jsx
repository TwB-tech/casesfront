import axios from 'axios';

const axiosInstance = axios.create({ baseURL: '' });

const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

const postgresBase = '/api/postgres-proxy';

const postgresRequest = async ({ path, method = 'GET', payload, params, user }) => {
  await delay();
  const requestConfig = {
    method: 'POST',
    url: postgresBase,
    data: {
      path,
      method,
      payload,
      params,
      query: params || {},
    },
  };

  if (user) {
    requestConfig.data.user = user;
  }

  const response = await axiosInstance(requestConfig);
  return response.data;
};

const success = async (data, status = 200) => ({ data, status });
const failure = async (message, status = 400, errors) => {
  const error = new Error(message);
  error.response = { status, data: errors || { message } };
  throw error;
};

const ensureOrgFields = async (queries = []) => {
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  if (!user) return queries;
  if (['admin', 'administrator'].includes(user.role)) return queries;

  const orgId = user.organization_id || user.id;
  if (!orgId) return queries;

  return [...queries, { organization_id: orgId }];
};

export const postgresApi = {
  async get(path, options = {}) {
    const data = await postgresRequest({ path, method: 'GET', payload: options, user: options.user });
    return data;
  },

  async post(path, payload = {}, options = {}) {
    const data = await postgresRequest({ path, method: 'POST', payload, user: options.user });
    return data;
  },

  async put(path, payload = {}, options = {}) {
    const data = await postgresRequest({ path, method: 'PUT', payload, user: options.user });
    return data;
  },

  async delete(path, options = {}) {
    const data = await postgresRequest({ path, method: 'DELETE', payload: options, user: options.user });
    return data;
  },

  async list(collection, queries = []) {
    const filtered = await ensureOrgFields(queries);
    const data = await postgresRequest({
      path: `/${collection}`,
      method: 'GET',
      payload: { query: filtered },
    });
    return { data: data.results || data.data || [] };
  },

  async getDocument(collection, docId) {
    const data = await postgresRequest({
      path: `/${collection}/${docId}`,
      method: 'GET',
    });
    return { data };
  },

  async createDocument(collection, data, documentId) {
    const payload = { ...data, id: documentId };
    const result = await postgresRequest({
      path: `/${collection}`,
      method: 'POST',
      payload,
    });
    return { data: result };
  },

  async updateDocument(collection, docId, data) {
    const payload = { ...data, id: docId };
    const result = await postgresRequest({
      path: `/${collection}/${docId}`,
      method: 'PUT',
      payload,
    });
    return { data: result };
  },

  async deleteDocument(collection, docId) {
    await postgresRequest({
      path: `/${collection}/${docId}`,
      method: 'DELETE',
    });
    return { data: { success: true } };
  },

  // Auth helpers
  async authLogin(email, password) {
    return postgresRequest({
      path: '/auth/login',
      method: 'POST',
      payload: { email, password },
    });
  },

  async authRegister(payload) {
    return postgresRequest({
      path: '/auth/register',
      method: 'POST',
      payload,
    });
  },

  async authVerifyEmail(token) {
    return postgresRequest({
      path: '/auth/verify-email',
      method: 'POST',
      payload: { token },
    });
  },

  async authRequestReset(email) {
    return postgresRequest({
      path: '/auth/request-reset-email',
      method: 'POST',
      payload: { email },
    });
  },

  async authAcceptInvite(payload) {
    return postgresRequest({
      path: '/auth/accept-invite',
      method: 'POST',
      payload,
    });
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}');
    } catch {
      return {};
    }
  },
};

export default postgresApi;
