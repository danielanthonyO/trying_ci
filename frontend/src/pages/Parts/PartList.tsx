import React, { useEffect, useMemo, useState } from "react";
import styles from "./PartList.module.css";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import Spinner from "../../components/common/Spinner/Spinner";
import { fetchParts, type Part } from "../../store/slices/parts/partsSlice";
import PartCard from "../../components/parts/PartCard/PartCard";
import Button from "../../components/common/Button/Button";

import CreatePartModal from "../../components/parts/CreatePartModal/CreatePartModal";
import { useTranslation } from "react-i18next";
import { useCategories } from "../../hooks/useCategories";

function PartList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { parts, loading, error } = useAppSelector((state) => state.parts);

  const categories = useCategories();
  const [catFilter, setCatFilter] = useState<string>("");

  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (parts.length === 0) {
      dispatch(fetchParts());
    }
  }, [dispatch, parts]);

  const filteredParts = useMemo(() => {
    if (!parts) return [];

    const search = searchText.trim().toLowerCase();
    return parts.filter((part) => {
      const matchedSearch =
        part.id.toLowerCase().includes(search) ||
        part.name.toLowerCase().includes(search) ||
        part.category?.toLowerCase().includes(search);
      part.manufacturer?.toLowerCase().includes(search);

      const matchedCategory =
        catFilter === "" ||
        part.category?.toLowerCase() === catFilter.toLowerCase();
      return matchedSearch && matchedCategory;
    });
  }, [parts, searchText, catFilter]);

  const handleToggleExpand = (part: Part) => {
    setExpandedPartId((prev) => (prev === part.id ? null : part.id));
    setEditingId(null);
  };
  if (loading) return <Spinner />;
  if (error) return <p>{error}</p>;
  return (
    <div className={styles.partsContainer}>
      <h3>{t("part.title")}</h3>
      <div className={styles.searchAndCreate}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder={t("part.searchPlaceholder")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={styles.searchInput}
          />
          <select
            aria-label="Filter by category"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className={styles.catFilter}
          >
            <option value="">{t("part.allCategories")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.createBtn}>
          <Button
            label={t("part.createNewPart")}
            onClick={() => {
              setIsCreateModalOpen(true);
              setEditingId(null);
              setExpandedPartId(null);
            }}
          />
        </div>

        {/* -------Add new part modal----- */}
        <CreatePartModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
      {/* ---------Part list--------- */}
      <div className={styles.listHeader}>
        <p className={styles.model}>{t("part.model")}</p>
        <p className={styles.quantity}>{t("part.quantity")}</p>
        <p className={styles.price}>{t("part.priceEur")}</p>
        <p className={styles.priceTax}>{t("part.pricePlusTax")}</p>
      </div>

      {filteredParts.length !== 0 &&
        filteredParts.map((part) => (
          <PartCard
            key={part.id}
            part={part}
            isExpanded={expandedPartId === part.id}
            onExpand={() => handleToggleExpand(part)}
            isEditing={editingId === part.id}
            onEdit={() => setEditingId(part.id)}
            onCloseEdit={() => setEditingId(null)}
          />
        ))}
      {filteredParts.length === 0 && <p>{t("part.noPartsFound")} </p>}
    </div>
  );
}

export default PartList;
