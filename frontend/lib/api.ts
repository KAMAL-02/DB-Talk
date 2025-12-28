import api from "./axios";

export const login = (data: any) => 
    api.post("/auth/login", data);

export const testConnection = (data: any) => 
    api.post("/database/test-connection", data);

export const saveDatabase = (data: any) => 
    api.post("/database/save-database", data);