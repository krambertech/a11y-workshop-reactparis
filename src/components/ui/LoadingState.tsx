import { LoaderCircle } from 'lucide-react';

import styles from './LoadingState.module.css';

/**
 * Loading state component
 * for loading indication
 */
export function LoadingState() {
  return (
    <div className={styles.wrapper} role="status">
      <LoaderCircle /> <span>Loading...</span>
    </div>
  );
}
