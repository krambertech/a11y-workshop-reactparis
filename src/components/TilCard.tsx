import styles from './TilCard.module.css';
import { formatDistanceToNow } from 'date-fns';
// ⇩ icons for actions
// import { Bookmark, Edit, Trash } from "lucide-react";

// ⇩ mutations
import { useSaveTil, useUnsaveTil, useDeleteTil } from '../helpers/queries';
import { Avatar } from './ui/Avatar';
import { useAuth } from '../helpers/auth';
import { Til } from '../helpers/api';
import { Button, IconButton } from './ui/Button';
import { Bookmark, Trash } from 'lucide-react';
import { AlertDialog } from './ui/Dialog';
import { useToast } from '../helpers/useToast';

type TilCardProps = {
  til: Til;
};

export function TilCard({ til }: TilCardProps) {
  const { user } = useAuth();
  const saveTil = useSaveTil();
  const unsaveTil = useUnsaveTil();
  const deleteTil = useDeleteTil();

  const createToast = useToast();

  const onSave = async () => {
    if (til.saved) {
      await unsaveTil.mutateAsync(til.id);
      createToast('TIL unsaved');
    } else {
      await saveTil.mutateAsync(til.id);
      createToast('TIL saved');
    }
  };

  const isAuthor = user?.id === til.user.id;

  const formattedDate = formatDistanceToNow(new Date(til.createdAt), {
    addSuffix: true,
  });

  const onDelete = async () => {
    try {
      await deleteTil.mutateAsync(til.id);
      createToast('TIL deleted');
    } catch (error) {
      console.log('error', error);
      createToast('TIL could not be deleted');
    }
  };

  return (
    <article className={styles.card} data-saved={til.saved}>
      <header className="flex gap-sm align-center">
        <Avatar
          src={til.user.avatarUrl || undefined}
          alt={`${til.user.displayName}'s avatar`}
        />
        <div className="flex flex-col gap-sm">
          <span className={styles.subtitle}>Today I Learned...</span>
          <span className={styles.name}>
            {til.user.displayName} {isAuthor && '(You)'}
          </span>
        </div>

        <IconButton
          className={styles.savedButton}
          aria-pressed={til.saved}
          label={'Save'}
          variant="highlight"
          onClick={onSave}
        >
          <Bookmark aria-hidden fill={til.saved ? 'currentColor' : 'none'} />
        </IconButton>
      </header>

      <section className="flex flex-col">
        <h3>{til.title}</h3>
        <p>{til.content}</p>
      </section>

      <footer className="text-secondary text-left">
        <time dateTime={til.createdAt} className={styles.date}>
          {formattedDate}
        </time>
        {til.user.location && (
          <>
            <span aria-hidden> ・ </span>
            <span className={styles.location}>{til.user.location}</span>
          </>
        )}
        {isAuthor && (
          <div className={styles.actions}>
            <AlertDialog>
              <AlertDialog.Trigger>
                <IconButton label="Delete" variant="destructive">
                  <Trash aria-hidden />
                </IconButton>
              </AlertDialog.Trigger>

              <AlertDialog.Content>
                <AlertDialog.Title>Delete this item?</AlertDialog.Title>
                <AlertDialog.Description>
                  Are you sure you want to delete this item? This action cannot
                  be undone.
                </AlertDialog.Description>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel asChild>
                    <Button variant="secondary">Cancel</Button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={onDelete}
                    >
                      Delete
                    </Button>
                  </AlertDialog.Action>
                </AlertDialog.Footer>
              </AlertDialog.Content>
            </AlertDialog>
          </div>
        )}
      </footer>
    </article>
  );
}
