import React, { useState } from "react";
import Modal from "../../common/Modal/Modal";
import styles from "./CreatePartModal.module.css";
import Button from "../../common/Button/Button";
import { useAppDispatch } from "../../../store/hook";
import { addPart, type NewPart } from "../../../store/slices/parts/partsSlice";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useCategories } from "../../../hooks/useCategories";

interface CreatePartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialNewPart = {
  name: "",
  category: "",
  manufacturer: "",
  link: "",
  quantity: 0,
  unit_price: 0,
};
function CreatePartModal({ isOpen, onClose }: CreatePartModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [newPart, setNewPart] = useState<NewPart>(initialNewPart);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const categories = useCategories();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setNewPart((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "unit_price" ? Number(value) : value,
    }));
  };

  const handleAdd = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const addNewPart = {
      ...newPart,
      category: newPart.category || null,
    };

    dispatch(addPart(addNewPart));
    toast.success(t("toast.partCreated"));
    setNewPart(initialNewPart);
    onClose();
  };
  return (
    <Modal isOpen={isOpen} padding=".5rem">
      <form onSubmit={handleAdd} className={styles.createWrapper}>
        <h3>{t("modals.addNewPartTitle")}</h3>
        <div className={styles.formWrapper}>
          <div className={styles.formRow}>
            <label htmlFor="name" className={styles.label}>
              {t("part.model")}
            </label>
            <input
              type="text"
              name="name"
              value={newPart.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="quantity" className={styles.label}>
              {t("part.quantity")}
            </label>
            <input
              type="number"
              min="0"
              name="quantity"
              value={newPart.quantity}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="unit_price" className={styles.label}>
              {t("part.priceBeforeTax")}
            </label>
            <input
              type="number"
              min="0"
              step=".01"
              name="unit_price"
              value={newPart.unit_price}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="category" className={styles.label}>
              {t("part.category")}
            </label>
            <div className={styles.catInput}>
              <select
                name="category"
                value={isCustomCategory ? "custom" : newPart.category}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setIsCustomCategory(true);
                    setNewPart((prev) => ({ ...prev, category: "" }));
                  } else {
                    setIsCustomCategory(false);
                    setNewPart((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }));
                  }
                }}
                style={isCustomCategory ? {} : { width: "100%" }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="custom">{t("part.custom")}</option>
              </select>
              {isCustomCategory && (
                <input
                  type="text"
                  name="category"
                  value={newPart.category || ""}
                  onChange={handleChange}
                  placeholder="✍️ ..."
                />
              )}
            </div>
          </div>
          <div className={styles.formRow}>
            <label htmlFor="manufacturer" className={styles.label}>
              {t("part.manufacturer")}
            </label>
            <input
              type="text"
              name="manufacturer"
              value={newPart.manufacturer}
              onChange={handleChange}
              className={styles.input}
            />
          </div>{" "}
          <div className={styles.formRow}>
            <label htmlFor="link" className={styles.label}>
              {t("part.link")}
            </label>
            <input
              type="text"
              name="link"
              value={newPart.link}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.modalActions}>
            <Button
              label={t("common.cancel")}
              onClick={() => {
                onClose();
                setNewPart(initialNewPart);
              }}
            />
            <Button type="submit" label={t("common.add")} color="#043de7" />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CreatePartModal;
