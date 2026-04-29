import React, { useRef, useState } from "react";
import styles from "./UserCard.module.css";
import { FaRegUser } from "react-icons/fa";
import { MdCall } from "react-icons/md";
import Avatar from "../Avatar/Avatar";
import { MdOutlineEmail } from "react-icons/md";
import Button from "../../common/Button/Button";
import {
  updateUser,
  updateUserAvatar,
  type UpdateUser,
  type User,
} from "../../../API/users/usersApi";
import _ from "lodash";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AiFillPlusCircle } from "react-icons/ai";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface EditUserFormProps {
  user: User;
  onClose: () => void;
}

function EditUserForm({ user, onClose }: EditUserFormProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedUser, setEditedUser] = useState<UpdateUser>({
    ...user,
    phone: user.phone ?? "",
    name: user.name ?? "",
    avatar: user.avatar ?? "",
  });

  const [preview, setPreview] = useState<string>("");
  const queryClient = useQueryClient();
  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
      toast.success(t("toast.updateSaved"));
    },
    onError: (err) => {
      const message = err?.response?.data?.message || err?.message;
      toast.error(message);
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: updateUserAvatar,
    onSuccess: (data) => {
      setEditedUser((prev) => ({ ...prev, avatar: data.avatar }));
    },
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setEditedUser(user);
    onClose();
  };
  const isSaveDisable = _.isEqual(editedUser, user) || !editedUser.name;

  const handleSave = () => {
    updateUserMutation.mutate(editedUser);
  };

  // Handle changing avatar

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setEditedUser((prev) => ({ ...prev, avatar: preview }));
    updateAvatarMutation.mutate({ id: user.id, file: file });
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.editMode}
    >
      <div
        className={styles.avatarWrapper}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar
          src={preview || editedUser.avatar}
          name={editedUser.name}
          size="4rem"
        />
        <div className={styles.plusIcon}>
          <AiFillPlusCircle />
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <div className={styles.formWrapper}>
        <div className={styles.formRow}>
          <label htmlFor="name" className={styles.label}>
            <FaRegUser />
          </label>
          <input
            value={editedUser.name}
            name="name"
            onChange={handleChange}
            className={styles.input}
          />{" "}
          <select
            name="role"
            value={editedUser.role}
            id="role"
            onChange={handleChange}
            className={styles.roleInput}
          >
            <option value="admin">{t("user.admin")}</option>
            <option value="worker">{t("user.worker")}</option>
            <option value="trainee">{t("user.trainee")}</option>
          </select>
        </div>

        <div className={styles.formRow}>
          <label htmlFor="phone" className={styles.label}>
            <MdCall />
          </label>
          <input
            value={editedUser.phone}
            name="phone"
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="email" className={styles.label}>
            <MdOutlineEmail />
          </label>
          <input
            value={editedUser.email}
            name="email"
            onChange={handleChange}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.editActions}>
        <Button label={t("common.cancel")} onClick={handleCancel} />
        <Button
          label={t("common.save")}
          onClick={handleSave}
          isDisabled={isSaveDisable || updateUserMutation.isPending}
        />
      </div>
    </motion.div>
  );
}

export default EditUserForm;
