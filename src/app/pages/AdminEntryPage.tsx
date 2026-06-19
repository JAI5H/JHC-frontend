import { useEffect } from "react";
import { Navigate } from "react-router";
import { getAdminSession } from "../components/admin/adminSession";

export default function AdminEntryPage() {
  useEffect(() => {
    const existingRobotsMeta = document.head.querySelector('meta[name="robots"]');
    const previousRobotsContent = existingRobotsMeta?.getAttribute("content");
    const robotsMeta = existingRobotsMeta ?? document.createElement("meta");

    if (!existingRobotsMeta) {
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
    }

    robotsMeta.setAttribute("content", "noindex, nofollow");

    return () => {
      if (previousRobotsContent) {
        robotsMeta.setAttribute("content", previousRobotsContent);
        return;
      }

      if (!existingRobotsMeta) {
        robotsMeta.remove();
      }
    };
  }, []);

  return <Navigate replace to={getAdminSession() ? "/admin/overview" : "/admin/login"} />;
}
