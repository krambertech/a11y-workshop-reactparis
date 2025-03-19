// ⇩ queries
// import { useTils, useUser } from "../helpers/queries";
import { useParams } from "react-router";
import clsx from "clsx";

import { EmptyState } from "../components/ui/EmptyState";

import styles from "./User.module.css";

export function User() {
  const { id } = useParams();
  // const { data: user, status } = useUser(id!);

  return (
    <div className="container flex flex-col gap-lg">
      <div className={clsx("flex gap-sm justify-between", styles.hero)}>
        <div className="flex flex-col">
          <h1>Name</h1>
          <p className="text-secondary">{id}</p>
        </div>
      </div>

      <EmptyState>This page is under construction.</EmptyState>
    </div>
  );
}
