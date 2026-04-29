import React, { useState } from "react";
import { createUser, type NewUser } from "../../../API/users/usersApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../common/Modal/Modal";
import styles from "./CreateUserModal.module.css";
import Button from "../../common/Button/Button";
import { FaEye, FaEyeSlash, FaRegUser } from "react-icons/fa";
import { MdCall, MdOutlineEmail, MdOutlinePassword } from "react-icons/md";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const initialNewUser = {
  name: "",
  email: "",
  phone: "",
  role: "worker",
  password: "",
};
function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const { t } = useTranslation();
  const [newUser, setNewUser] = useState<NewUser>(initialNewUser);
  const [isShowPw, setIsShowPw] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("modals.userCreated"));
    },
    onError: (err) => {
      const message = err?.response?.data?.message || err?.message;
      toast.error(message);
    },
  });
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: name === "role" ? value.toUpperCase() : value,
    }));
  };
  const handleAddUser = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (newUser.email && !emailRegex.test(newUser.email)) {
      toast.error(t("toast.invalidEmail"));
      return;
    }
    if (newUser.password.length < 8) {
      toast.error(t("toast.passwordMinLength"));
      return;
    }

    createUserMutation.mutate(newUser);
    setNewUser(initialNewUser);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} padding=".5rem">
      <form
        onSubmit={handleAddUser}
        className={styles.createWrapper}
        autoComplete="off"
      >
        <h3>{t("modals.addNewUserTitle")}</h3>
        <div className={styles.formWrapper}>
          <div className={styles.formRow}>
            <label htmlFor="name" className={styles.label}>
              <FaRegUser />
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={newUser.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <select
              name="role"
              value={newUser.role}
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
              type="text"
              name="phone"
              id="phone"
              value={newUser.phone}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="email" className={styles.label}>
              <MdOutlineEmail />
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="email"
              id="email"
              value={newUser.email}
              onChange={handleChange}
              className={styles.input}
              required
              autoComplete="off"
            />
          </div>
          <div className={styles.formRow}>
            <label
              htmlFor="password"
              className={styles.label}
              aria-label="Password"
            >
              <MdOutlinePassword />
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type={isShowPw ? "text" : "password"}
              name="password"
              id="password"
              value={newUser.password}
              onChange={handleChange}
              className={styles.input}
              autoComplete="new-password"
              aria-describedby="password-hint"
              required
            />

            <div className={styles.visible}>
              <Button
                icon={isShowPw ? <FaEyeSlash /> : <FaEye />}
                onClick={() => setIsShowPw(!isShowPw)}
              />{" "}
            </div>
          </div>
          <small id="password-hint"> {t("toast.passwordMinLength")}</small>

          <div className={styles.modalActions}>
            <Button
              label={t("common.cancel")}
              onClick={() => {
                onClose();
                setNewUser(initialNewUser);
              }}
            />
            <Button type="submit" label={t("common.add")} color="#043de7" />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CreateUserModal;
