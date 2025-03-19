// ⇩ queries
// import { useUsers } from "../helpers/queries";

import { EmptyState } from "../components/ui/EmptyState";

// import styles from "./Users.module.css";

export function Users() {
  // const { data: users, status } = useUsers();

  return (
    <div className="container flex flex-col gap-md">
      <h1>Users</h1>
      <EmptyState>This page is under construction.</EmptyState>
    </div>
  );
}
