import React, { useState } from "react";
import styles from "../PartCard/PartCard.module.css";
import { MdCall } from "react-icons/md";
import { MdOutlineEmail } from "react-icons/md";
import Button from "../../common/Button/Button";

import _ from "lodash";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { FaRegUser } from "react-icons/fa";
import { editPart, type Part } from "../../../store/slices/parts/partsSlice";
import { useAppDispatch } from "../../../store/hook";
import { useTranslation } from "react-i18next";
import { useCategories } from "../../../hooks/useCategories";

interface EditPartFormProps {
  part: Part;
  onClose: () => void;
}

function EditPartForm({ part, onClose }: EditPartFormProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [editedPart, setEditedPart] = useState<Part>(part);

  const categories = useCategories();
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedPart((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? Number(value)
          : name === "unit_price"
            ? Number(value).toFixed(2)
            : value,
    }));
  };

  const handleCancel = () => {
    setEditedPart(part);
    onClose();
  };
  const isSaveDisable = _.isEqual(editedPart, part) || !editedPart.name;

  const handleSave = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const savedPart = {
      ...editedPart,
      category: editedPart.category || null,
    };
    dispatch(editPart(savedPart));
    toast.success(t("toast.partUpdated"));
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.editMode}
    >
      <form onSubmit={handleSave} className={styles.formWrapper}>
        <div className={styles.formRow}>
          <label htmlFor="name" className={styles.label}>
            {t("part.model")}
          </label>
          <input
            value={editedPart.name}
            name="name"
            onChange={handleChange}
            className={styles.input}
          />{" "}
        </div>

        <div className={styles.formRow}>
          <label htmlFor="quantity" className={styles.label}>
            {t("part.quantity")}
          </label>
          <input
            type="number"
            value={editedPart.quantity ?? ""}
            name="quantity"
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="unit_price" className={styles.label}>
            {t("part.priceBeforeTax")}
          </label>
          <input
            type="number"
            value={editedPart.unit_price ?? ""}
            name="unit_price"
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="category" className={styles.label}>
            {t("part.category")}
          </label>

          <div className={styles.catInput}>
            <select
              name="category"
              value={isCustomCategory ? "custom" : (editedPart.category ?? "")}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setIsCustomCategory(true);
                  setEditedPart((prev) => ({ ...prev, category: "" }));
                } else {
                  setIsCustomCategory(false);
                  setEditedPart((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }));
                }
              }}
              style={isCustomCategory ? {} : { width: "100%" }}
            >
              <option value="">{t("part.allCategories")}</option>

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
                placeholder="✍️ ..."
                value={editedPart.category ?? ""}
                onChange={(e) =>
                  setEditedPart((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
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
            value={editedPart.manufacturer ?? ""}
            name="manufacturer"
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="link" className={styles.label}>
            {t("part.link")}
          </label>
          <input
            type="text"
            value={editedPart.link ?? ""}
            name="link"
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.editActions}>
          <Button label={t("common.cancel")} onClick={handleCancel} />
          <Button
            label={t("common.save")}
            type="submit"
            isDisabled={isSaveDisable}
          />
        </div>
      </form>
    </motion.div>
  );
}

export default EditPartForm;
