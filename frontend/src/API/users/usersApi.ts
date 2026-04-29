import axios from "axios";
import { API } from "../api";

const userApi = API.users;

export interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  email?: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}
export type NewUser = Omit<
  User,
  "id" | "avatar" | "password" | "createdAt" | "updatedAt"
> & { password: string };

export type UpdateUser = Omit<User, "password" | "createdAt" | "updatedAt"> & {
  password?: string;
};

// get admin token
const getAdminToken = async () => {
  const res = await axios.post("http://localhost:3000/auth/login", {
    email: "admin@test.com",
    password: "123456",
  });
  return res.data.access_token;
};

export const fetchUsers = async (): Promise<User[]> => {
  const token = await getAdminToken();
  const res = await axios.get(userApi, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const fetchUser = async (id: string): Promise<User> => {
  const res = await axios.get(`${userApi}/${id}`);
  return res.data;
};

export const createUser = async (newUser: NewUser): Promise<User> => {
  const token = await getAdminToken();
  const res = await axios
    .post(userApi, newUser, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((err) => {
      console.error("POST error response:", err.response?.data);
      throw err;
    });
  return res.data;
};

export const updateUser = async (updatedUser: UpdateUser): Promise<User> => {
  const token = await getAdminToken();
  // console.log(updatedUser);
  const { id, createdAt, updatedAt, ...body } = updatedUser;
  // console.log("PATCH body:", body);

  const res = await axios
    .patch(`${userApi}/${id}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((err) => {
      console.error("POST error response:", err.response?.data);
      throw err;
    });
  return res.data;
};
export const resetPassword = async ({
  id,
  password,
}: {
  id: string;
  password: string;
}) => {
  const token = await getAdminToken();
  const res = await axios
    .patch(
      `${userApi}/${id}/reset-password`,
      { newPassword: password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    .catch((err) => {
      console.error("POST error response:", err.response?.data);
      throw err;
    });
  return res.data;
};
export const updateUserAvatar = async ({
  id,
  file,
}: {
  id: string;
  file: File;
}): Promise<User> => {
  const token = await getAdminToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios
    .post(`${userApi}/me/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((err) => {
      console.log("POST error response:", err.response?.data);
      throw err;
    });
  return res.data;
};

export const deleteUser = async (id: string): Promise<string> => {
  const token = await getAdminToken();

  await axios
    .delete(`${userApi}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((err) => {
      console.log("POST error response:", err.response?.data);
      throw err;
    });
  return id;
};
