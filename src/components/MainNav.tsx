import { ComponentProps } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { ExternalLink, LogOut, Newspaper, Users } from 'lucide-react';
import clsx from 'clsx';

import { Button, IconButton } from './ui/Button';
import { useAuth } from '../helpers/auth';
import { useLogout } from '../helpers/queries';
import { Avatar } from './ui/Avatar';

import styles from './MainNav.module.css';

/**
 * Main navigation component with links and authentication buttons
 */
export function MainNav({ className, ...props }: ComponentProps<'div'>) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const logout = useLogout();

  return (
    <header className={clsx(styles.nav, className)} {...props}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <nav className={styles.container}>
        <ul className={styles.links}>
          <li>
            <Button asChild variant="ghost">
              <NavLink to="/home">
                <Newspaper aria-hidden />
                TILs
              </NavLink>
            </Button>
          </li>
          <li>
            <Button asChild variant="ghost">
              <NavLink to="/users">
                <Users aria-hidden />
                Users
              </NavLink>
            </Button>
          </li>
          <li>
            <Button asChild variant="ghost">
              <NavLink
                to="https://github.com/krambertech/a11y-workshop"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink aria-hidden />
                GitHub
              </NavLink>
            </Button>
          </li>
        </ul>

        <div className={styles.auth}>
          {isAuthenticated && user ? (
            <>
              <IconButton
                variant="ghost"
                onClick={() => logout.mutate()}
                label="Log out"
              >
                <LogOut />
              </IconButton>

              <IconButton asChild variant="ghost" label="Your profile">
                <Link to={`/users/${user.id}`}>
                  <Avatar
                    name={user.displayName || ''}
                    src={user.avatarUrl || ''}
                    size="small"
                  />
                </Link>
              </IconButton>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                onClick={() => navigate('/login')}
              >
                <Link to="/login">Log in</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                onClick={() => navigate('/register')}
              >
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

MainNav.displayName = 'MainNav';
