import { doctors, patients, appointments } from "../mockData";

function delay(ms){ return new Promise(res => setTimeout(res, ms)); }

const mockApi = {
  get: async (path) => {
    await delay(200);
    if (path.includes("/doctors")) return { data: doctors };
    if (path.includes("/patients")) return { data: patients };
    if (path.includes("/appointments")) return { data: appointments };
    return { data: {} };
  },
  post: async (path, payload) => {
    await delay(200);
    if (path.includes("/doctors")) {
      const id = doctors.length + 1; const obj = { id, ...payload }; doctors.push(obj); return { data: obj };
    }
    if (path.includes("/patients")) {
      const id = patients.length + 1; const obj = { id, ...payload }; patients.push(obj); return { data: obj };
    }
    if (path.includes("/appointments")) {
      const id = appointments.length + 1; const obj = { id, ...payload }; appointments.push(obj); return { data: obj };
    }
    return { data: payload };
  },
  put: async (path, payload) => {
    await delay(150);
    const parts = path.split("/").filter(Boolean);
    const id = parseInt(parts[parts.length - 1]);
    if (path.includes("/doctors")) {
      const idx = doctors.findIndex(d => d.id === id);
      if (idx >= 0) { doctors[idx] = { ...doctors[idx], ...payload }; return { data: doctors[idx] }; }
    }
    if (path.includes("/patients")) {
      const idx = patients.findIndex(p => p.id === id);
      if (idx >= 0) { patients[idx] = { ...patients[idx], ...payload }; return { data: patients[idx] }; }
    }
    return { data: payload };
  },
  delete: async (path) => {
    await delay(150);
    const parts = path.split("/").filter(Boolean);
    const id = parseInt(parts[parts.length - 1]);
    if (path.includes("/appointments")) {
      const idx = appointments.findIndex(a => a.id === id);
      if (idx >= 0) { const removed = appointments.splice(idx, 1); return { data: removed[0] }; }
    }
    return { data: {} };
  }
};

export default mockApi;