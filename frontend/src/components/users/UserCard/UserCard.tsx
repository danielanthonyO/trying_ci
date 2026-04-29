import { useState } from "react";
import styles from "./UserCard.module.css";
import { motion } from "motion/react";
import { deleteUser, type User } from "../../../API/users/usersApi.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Avatar from "../Avatar/Avatar.tsx";
import Button from "../../common/Button/Button.tsx";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";
import Modal from "../../common/Modal/Modal.tsx";
import { FiUnlock } from "react-icons/fi";
import { MdCall } from "react-icons/md";
import { MdOutlineEmail } from "react-icons/md";
import toast from "react-hot-toast";
import EditUserForm from "./EditUserForm.tsx";
import ResetPasswordForm from "./ResetPasswordForm/ResetPasswordForm.tsx";
import { useTranslation } from "react-i18next";

interface UserCardProps {
  user: User;
  isExpanded: boolean;
  onExpand: () => void;
  isEditing: boolean;
  onEdit: () => void;
  onCloseEdit: () => void;
}

function UserCard({
  user,
  isExpanded,
  onExpand,
  isEditing,
  onEdit,
  onCloseEdit,
}: UserCardProps) {
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isPwModalOpen, setIsPwModalOpen] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteModalOpen(false);
      toast.success(t("toast.userDeleted"));
    },
    onError: (err) => {
      const message = err?.response?.data?.message || err?.message;
      toast.error(message);
    },
  });

  const handleDelete = () => {
    deleteUserMutation.mutate(user.id);
  };

  return (
    <>
      {!isEditing && (
        <div className={styles.userCard}>
          <div className={styles.cardHeader} onClick={onExpand}>
            <Avatar src={user.avatar} name={user.name} />
            <div className={styles.cardHeaderContent}>
              <p className={styles.name}>{user.name}</p>

              <p
                className={`${styles.role} ${styles[user.role.toLowerCase()]}`}
              >
                {t(`user.${user.role.toLowerCase()}`).toUpperCase()}
              </p>
            </div>
          </div>

          {/*------User detail and buttons------- */}
          {isExpanded && (
            <motion.div layout>
              <div className={styles.extraInfo}>
                <div className={styles.formRow}>
                  <label htmlFor="phone" className={styles.label}>
                    <MdCall />
                  </label>
                  <p>{user.phone}</p>
                </div>
                <div className={styles.formRow}>
                  <label htmlFor="email" className={styles.label}>
                    <MdOutlineEmail />
                  </label>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className={styles.actions}>
                <Button
                  label={t("user.resetPassword")}
                  icon={<FiUnlock />}
                  onClick={() => setIsPwModalOpen(true)}
                />
                <Button
                  label={t("common.edit")}
                  icon={<FaRegEdit />}
                  onClick={onEdit}
                />

                <Button
                  label={t("common.delete")}
                  icon={<FaRegTrashAlt />}
                  onClick={() => setIsDeleteModalOpen(true)}
                />
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* -------------Edit user form-------------*/}
      {isEditing && <EditUserForm user={user} onClose={onCloseEdit} />}

      {/* -------------Delete modal------------- */}

      <Modal title={t("modals.deleteUserTitle")} isOpen={isDeleteModalOpen}>
        <p>{t("modals.deleteUserConfirm")}</p>
        <div className={styles.deleteActions}>
          <Button
            label={t("common.cancel")}
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <Button
            label={t("common.delete")}
            onClick={handleDelete}
            isDisabled={deleteUserMutation.isPending}
          />
        </div>
      </Modal>

      {/* ------Reset password form------- */}
      <ResetPasswordForm
        isOpen={isPwModalOpen}
        userId={user.id}
        onClose={() => setIsPwModalOpen(false)}
      />
    </>
  );
}

export default UserCard;
