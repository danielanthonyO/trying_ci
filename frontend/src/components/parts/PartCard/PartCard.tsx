import { useState } from "react";
import styles from "./PartCard.module.css";
import { motion } from "motion/react";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";
import Modal from "../../common/Modal/Modal.tsx";
import Button from "../../common/Button/Button.tsx";
import {
  deletePart,
  type Part,
} from "../../../store/slices/parts/partsSlice.ts";
import { useAppDispatch } from "../../../store/hook.ts";
import EditPartForm from "./EditPartForm.tsx";
import { useTranslation } from "react-i18next";

interface PartCardProps {
  part: Part;
  isExpanded: boolean;
  onExpand: () => void;
  isEditing: boolean;
  onEdit: () => void;
  onCloseEdit: () => void;
}

function PartCard({
  part,
  isExpanded,
  onExpand,
  isEditing,
  onEdit,
  onCloseEdit,
}: PartCardProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const handleDelete = () => {
    dispatch(deletePart(part.id));
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      {!isEditing && (
        <div className={styles.partCard}>
          <div className={styles.cardHeader} onClick={onExpand}>
            <p className={styles.model}>{part.name}</p>
            <p className={styles.quantity}>{part.quantity}</p>
            <p className={styles.price}>{Number(part.unit_price).toFixed(2)}</p>
            <p className={styles.price}>
              {(Number(part.unit_price) * 1.255).toFixed(2)}
            </p>
          </div>
          {/* Part detail and buttons */}
          {isExpanded && (
            <motion.div layout>
              <div className={styles.extraInfo}>
                <div className={styles.formRow}>
                  <label htmlFor="category" className={styles.label}>
                    {t("part.category")}
                  </label>
                  <p>
                    {part.category === "Others" || part.category === ""
                      ? t("part.othersCategory")
                      : part.category}
                  </p>
                </div>
                <div className={styles.formRow}>
                  <label htmlFor="manufacturer" className={styles.label}>
                    {t("part.manufacturer")}
                  </label>
                  <p>{part.manufacturer}</p>
                </div>
                <div className={styles.formRow}>
                  <label htmlFor="link" className={styles.label}>
                    {t("part.link")}
                  </label>
                  <p>{part.link}</p>
                </div>
              </div>

              <div className={styles.actions}>
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

      {/* Edit part form*/}
      {isEditing && <EditPartForm part={part} onClose={onCloseEdit} />}

      {/* Delete modal */}

      <Modal title="Delete Part" isOpen={isDeleteModalOpen}>
        <p>Delete this part from the system?</p>
        <div className={styles.deleteActions}>
          <Button
            label={t("common.cancel")}
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <Button label={t("common.delete")} onClick={handleDelete} />
        </div>
      </Modal>
    </>
  );
}

export default PartCard;
