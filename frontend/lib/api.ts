import api from "./axios";

export const login = (data: any) => 
    api.post("/auth/login", data);

export const testConnection = (data: any) => 
    api.post("/database/test-connection", data);

export const saveDatabase = (data: any) => 
    api.post("/database/save-database", data);

export const listDatabase = () => 
    api.get("/database/list-database");

export const connectDatabase = (data: any) => 
    api.post("/database/connect-database", data);

export const deleteDatabase = (data: any) => 
    api.post("/database/delete-database", data);

export const getActiveDatabase = () =>
    api.get("/database/get-active-database");

export const ask = (data: any) => 
    api.post("/chat/ask", data);