import React, { useState } from "react";
import styles from "./ResetPasswordForm.module.css";
import Modal from "../../../common/Modal/Modal";
import Button from "../../../common/Button/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../../../../API/users/usersApi";
import { useTranslation } from "react-i18next";

interface PwData {
  newPw: string;
  confirmedPw: string;
}
interface ResetPasswordFormProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}
function ResetPasswordForm({
  userId,
  isOpen,
  onClose,
}: ResetPasswordFormProps) {
  const [isShowPw, setIsShowPw] = useState<boolean>(false);
  const initialPw: PwData = {
    newPw: "",
    confirmedPw: "",
  };
  const [pwData, setPwData] = useState<PwData>(initialPw);

  const { t } = useTranslation();

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success(t("toast.passwordResetSuccess"));
      onClose();
    },
    onError: () => {
      toast.error(t("toast.passwordResetFailed"));
    },
  });
  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPwData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pwData.newPw || !pwData.confirmedPw) {
      toast.error(t("toast.allFieldsRequired"));
      return;
    }
    if (pwData.newPw.length < 8) {
      toast.error(t("toast.passwordMinLength"));
      return;
    }
    if (pwData.newPw !== pwData.confirmedPw) {
      toast.error(t("toast.passwordMismatch"));
      return;
    }
    resetPasswordMutation.mutate({ id: userId, password: pwData.newPw });
    setPwData(initialPw);
    //will need to add admin token later
  };

  return (
    <Modal
      title={t("modals.resetPasswordTitle")}
      isOpen={isOpen}
      background=" #fff4e1"
    >
      <form onSubmit={handleReset}>
        <div className={styles.resetContent}>
          <label htmlFor="newPw">{t("user.newPassword")}</label>
          <div className={styles.inputWrapper}>
            <input
              type={isShowPw ? "text" : "password"}
              name="newPw"
              value={pwData.newPw}
              onChange={handlePwChange}
              className={styles.input}
              required
            />
            <Button
              icon={isShowPw ? <FaEyeSlash /> : <FaEye />}
              onClick={() => setIsShowPw(!isShowPw)}
            />
          </div>
          <label htmlFor="confirmPw">{t("user.confirmNewPassword")}</label>
          <div className={styles.inputWrapper}>
            <input
              type={isShowPw ? "text" : "password"}
              name="confirmedPw"
              value={pwData.confirmedPw}
              onChange={handlePwChange}
              className={styles.input}
              required
            />
            <Button
              icon={isShowPw ? <FaEyeSlash /> : <FaEye />}
              onClick={() => setIsShowPw(!isShowPw)}
            />
          </div>
        </div>
        <div className={styles.resetActions}>
          <Button
            label={t("common.cancel")}
            onClick={() => {
              onClose();
              setPwData(initialPw);
            }}
          />
          <Button type="submit" label={t("common.reset")} />
        </div>
      </form>
    </Modal>
  );
}

export default ResetPasswordForm;
