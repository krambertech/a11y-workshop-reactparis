import styles from "./TilCard.module.css";
import { formatDistanceToNow } from "date-fns";
// ⇩ icons for actions
// import { Bookmark, Edit, Trash } from "lucide-react";

// ⇩ mutations
// import { useSaveTil, useUnsaveTil, useDeleteTil } from "../helpers/queries";
import { Avatar } from "./ui/Avatar";
import { useAuth } from "../helpers/auth";
import { Til } from "../helpers/api";

type TilCardProps = {
  til: Til;
};

export function TilCard({ til }: TilCardProps) {
  const { user } = useAuth();

  const isAuthor = user?.id === til.user.id;

  const formattedDate = formatDistanceToNow(new Date(til.createdAt), {
    addSuffix: true,
  });

  return (
    <div className={styles.card} data-saved={til.saved}>
      <div className="flex gap-sm align-center">
        <Avatar
          src={til.user.avatarUrl || undefined}
          alt={`${til.user.displayName}'s avatar`}
        />
        <div className="flex flex-col gap-sm">
          <span className={styles.subtitle}>Today I Learned...</span>
          <span className={styles.name}>
            {til.user.displayName} {isAuthor && "(You)"}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <p>
          <strong>{til.title}</strong>
        </p>
        <p>{til.content}</p>
      </div>

      <div className="text-secondary text-left">
        <span className={styles.date}>{formattedDate}</span>
        {til.user.location && (
          <>
            <span> ・ </span>
            <span className={styles.location}>{til.user.location}</span>
          </>
        )}
      </div>
    </div>
  );
}
