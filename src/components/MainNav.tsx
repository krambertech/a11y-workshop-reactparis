import { ComponentProps } from "react";
import { useNavigate } from "react-router";
import { ExternalLink, LogOut, Newspaper, Users } from "lucide-react";
import clsx from "clsx";

import { Button, IconButton } from "./ui/Button";
import { useAuth } from "../helpers/auth";
import { useLogout } from "../helpers/queries";
import { Avatar } from "./ui/Avatar";

import styles from "./MainNav.module.css";

/**
 * Main navigation component with links and authentication buttons
 */
export function MainNav({ className, ...props }: ComponentProps<"div">) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const logout = useLogout();

  return (
    <div className={clsx(styles.nav, className)} {...props}>
      <div className={styles.container}>
        <div className={styles.links}>
          <Button variant="ghost" onClick={() => navigate("/home")}>
            <Newspaper />
            TILs
          </Button>
          <Button variant="ghost" onClick={() => navigate("/users")}>
            <Users />
            Users
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              window.open(
                "https://github.com/krambertech/a11y-workshop",
                "_blank"
              )
            }
          >
            <ExternalLink />
            GitHub
          </Button>
        </div>

        <div className={styles.auth}>
          {isAuthenticated && user ? (
            <>
              <IconButton variant="ghost" onClick={() => logout.mutate()}>
                <LogOut />
              </IconButton>

              <IconButton
                variant="ghost"
                onClick={() => navigate(`/users/${user.id}`)}
              >
                <Avatar
                  name={user.displayName || ""}
                  src={user.avatarUrl || ""}
                  size="small"
                />
              </IconButton>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button variant="secondary" onClick={() => navigate("/register")}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

MainNav.displayName = "MainNav";
