import { useEffect, useMemo, useState } from "react";
import { getAdminUpdateEventName, getApprovedProductEntries } from "./adminStore";
import { fetchAllProductsApi, fetchApprovedProductsApi } from "./adminApi";

function mergeProducts(baseProducts, approvedProducts) {
  const approvedMap = new Map(approvedProducts.map((item) => [item.id, item]));
  const seen = new Set();
  const merged = baseProducts.map((item) => {
    if (approvedMap.has(item.id)) {
      seen.add(item.id);
      return approvedMap.get(item.id);
    }
    return item;
  });
  approvedProducts.forEach((item) => {
    if (!seen.has(item.id) && !baseProducts.some((base) => base.id === item.id)) {
      merged.push(item);
    }
  });
  return merged;
}

export function useUnifiedProductData() {
  const [baseProducts, setBaseProducts] = useState([]);
  const [approvedProducts, setApprovedProducts] = useState([]);
  const [remoteAll, setRemoteAll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/cpcd-data.json").then((r) => r.json()).catch(() => []),
      fetchAllProductsApi().catch(() => null),
    ]).then(([localData, remoteData]) => {
      if (cancelled) return;
      setBaseProducts(Array.isArray(localData) ? localData : []);
      setRemoteAll(Array.isArray(remoteData) ? remoteData : null);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const refresh = async () => {
      try {
        const remoteAllItems = await fetchAllProductsApi();
        if (Array.isArray(remoteAllItems)) {
          setRemoteAll(remoteAllItems);
          return;
        }
        const remoteItems = await fetchApprovedProductsApi();
        setApprovedProducts(remoteItems);
      } catch {
        setApprovedProducts(getApprovedProductEntries());
      }
    };
    refresh();
    const eventName = getAdminUpdateEventName();
    window.addEventListener(eventName, refresh);
    return () => window.removeEventListener(eventName, refresh);
  }, []);

  const allData = useMemo(() => {
    if (Array.isArray(remoteAll) && remoteAll.length > 0) return remoteAll;
    return mergeProducts(baseProducts, approvedProducts);
  }, [baseProducts, approvedProducts, remoteAll]);
  return { allData, loading };
}
