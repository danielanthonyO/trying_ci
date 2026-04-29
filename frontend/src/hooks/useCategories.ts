import React, { useMemo } from "react";
import { useAppSelector } from "../store/hook";
import type { Part } from "../store/slices/parts/partsSlice";

export function useCategories() {
  const parts = useAppSelector((state) => state.parts.parts);
  const categories = useMemo(() => {
    return [...new Set(parts.map((p: Part) => p.category))].filter(
      (c): c is string => !!c,
    );
  }, [parts]);
  return categories;
}
