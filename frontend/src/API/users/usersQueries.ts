import { queryOptions } from "@tanstack/react-query";
import { fetchUser, fetchUsers } from "./usersApi";

export const usersQueryOptions = () => {
  return queryOptions({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
};

export const userQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
  });
};
