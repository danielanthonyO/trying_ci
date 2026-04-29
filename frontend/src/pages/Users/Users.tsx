import React, { useMemo, useState } from "react";
import styles from "./Users.module.css";
import Spinner from "../../components/common/Spinner/Spinner";
import { useQuery } from "@tanstack/react-query";
import { usersQueryOptions } from "../../API/users/usersQueries";
import UserCard from "../../components/users/UserCard/UserCard";
import Button from "../../components/common/Button/Button";
import CreateUserModal from "../../components/users/CreateUserModal/CreateUserModal";
import { useTranslation } from "react-i18next";

function Users() {
  const { data: users, error, isPending } = useQuery(usersQueryOptions());
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { t } = useTranslation();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    const search = searchText.trim().toLowerCase();

    const matched = users.filter((user) => {
      const matchedSearch =
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.includes(search);

      const matchedRole =
        !roleFilter || user.role?.toLowerCase() === roleFilter.toLowerCase();

      return matchedSearch && matchedRole;
    });
    
    return matched.sort((a, b) => {
      const idA = Number(a.id);
      const idB = Number(b.id);
      //sort by id if ids are numbers
      if (!isNaN(idA) && !isNaN(idB)) return idA - idB;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }, [users, searchText, roleFilter]);

  if (isPending) return <Spinner />;
  if (error) return <p>{error.message}</p>;
  return (
    <div className={styles.usersContainer}>
      <h3>{t("user.title")}</h3>
      <div className={styles.searchAndActions}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            value={searchText}
            placeholder={t("user.searchPlaceholder")}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          <select
            aria-label={t("user.filterByRole")}
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className={styles.roleFilter}
          >
            <option value="">{t("user.allRoles")}</option>
            <option value="admin">{t("user.admin")}</option>
            <option value="worker">{t("user.worker")}</option>
            <option value="trainee">{t("user.trainee")}</option>
          </select>
        </div>
        <div className={styles.createBtn}>
          <Button
            label={t("user.createNewUser")}
            onClick={() => {
              setIsCreateModalOpen(true);
              setEditingId(null);
              setExpandedUserId(null);
            }}
          />
        </div>
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
      {/* -------User list------ */}
      {filteredUsers.length == 0 && <p>{t("user.noUsersFound")}</p>}
      {filteredUsers.length !== 0 &&
        filteredUsers.map((user) => (
          <UserCard
            user={user}
            key={user.id}
            isExpanded={expandedUserId === user.id}
            onExpand={() => {
              setExpandedUserId((prev) => (prev === user.id ? null : user.id));
              setEditingId(null);
            }} //allow only one card expand at a time
            isEditing={editingId === user.id}
            onEdit={() => {
              setEditingId(user.id);
            }}
            onCloseEdit={() => setEditingId(null)}
          />
        ))}
    </div>
  );
}

export default Users;
