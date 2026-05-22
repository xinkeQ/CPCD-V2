import { useEffect, useState } from "react";
import CPCDWebsitePrototype from "./CPCDWebsite";
import AdminConsole from "./AdminConsole";
import ProductChainModelingWebsite from "./ProductChainModelingWebsite";

function isAdminRoute() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin") || window.location.hash.startsWith("#/admin");
}

function isHubPublishRoute() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/hub/publish");
}

export default function App() {
  const [admin, setAdmin] = useState(isAdminRoute());
  const [hubPublish, setHubPublish] = useState(isHubPublishRoute());

  useEffect(() => {
    const refresh = () => {
      setAdmin(isAdminRoute());
      setHubPublish(isHubPublishRoute());
    };
    window.addEventListener("popstate", refresh);
    window.addEventListener("hashchange", refresh);
    return () => {
      window.removeEventListener("popstate", refresh);
      window.removeEventListener("hashchange", refresh);
    };
  }, []);

  if (hubPublish) return <ProductChainModelingWebsite />;
  return admin ? <AdminConsole /> : <CPCDWebsitePrototype />;
}
