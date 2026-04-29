import React, { useMemo, useState } from "react";
import styles from "./Customers.module.css";
import Spinner from "../../components/common/Spinner/Spinner";
import { useQuery } from "@tanstack/react-query";

import CustomerCard from "../../components/customers/CustomerCard/CustomerCard";
import Button from "../../components/common/Button/Button";
import CreateCustomerModal from "../../components/customers/CreateCustomerModal/CreateCustomerModal";
import { customersQueryOptions } from "../../API/customers/customersQueries";
import { useTranslation } from "react-i18next";

function Customers() {
  const { t } = useTranslation();
  const {
    data: customers,
    error,
    isPending,
  } = useQuery(customersQueryOptions());
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];

    const search = searchText.trim().toLowerCase(); //put this outside filter so it doesn't run for every customer

    return customers.filter((customer) => {
      const matchedSearch =
        customer.name.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.phone?.includes(search) ||
        customer.type?.toLowerCase().includes(search);

      const matchedType = typeFilter === "" || customer.type === typeFilter;
      return matchedSearch && matchedType;
    });
  }, [customers, searchText, typeFilter]);

  if (isPending) return <Spinner />;
  if (error) return <p>{error.message}</p>;
  return (
    <div className={styles.customersContainer}>
      <h3>{t("customer.title")}</h3>
      <div className={styles.searchAndCreate}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            value={searchText}
            placeholder={t("customer.searchPlaceholder")}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          <select
            aria-label={t("customer.filterByType")}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.typeFilter}
          >
            <option value="">{t("customer.allTypes")}</option>
            <option value="INDIVIDUAL">{t("customer.individual")}</option>
            <option value="COMPANY">{t("customer.company")}</option>
          </select>
        </div>
        <div className={styles.createBtn}>
          <Button
            label={t("customer.createNewCustomer")}
            onClick={() => {
              setIsCreateModalOpen(true);
              setEditingId(null);
              setExpandedCustomerId(null);
            }}
          />
        </div>
        <CreateCustomerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>

      {/* --------Customer list--------- */}
      {filteredCustomers.length == 0 && <p>{t("customer.noCustomersFound")}</p>}
      {filteredCustomers.length !== 0 &&
        filteredCustomers.map((customer) => (
          <CustomerCard
            customer={customer}
            key={customer.id}
            isExpanded={expandedCustomerId === customer.id}
            onExpand={() => {
              setExpandedCustomerId((prev) =>
                prev === customer.id ? null : customer.id,
              );
              setEditingId(null);
            }} //allow only one card expand at a time
            isEditing={editingId === customer.id}
            onEdit={() => {
              setEditingId(customer.id);
            }}
            onCloseEdit={() => setEditingId(null)}
          />
        ))}
    </div>
  );
}

export default Customers;
