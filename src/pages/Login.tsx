import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useSearchParams } from "react-router";

import { useAuth } from "../helpers/auth";
import { useLogin } from "../helpers/queries";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useId } from "react";
import { CircleX } from "lucide-react";
import { Banner } from "../components/ui/Banner";

// schema used for validation
const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function Login() {
  const usernameId = useId();
  const passwordId = useId();

  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    // ⇩ to access validation errors
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const submit = handleSubmit((data) => {
    login.mutate(data);
  });

  if (isAuthenticated) {
    return <Navigate to={searchParams.get("redirect") || "/home"} replace />;
  }

  return (
    <div className="container">
      <h1>Log in</h1>
      <p>Log in to your account to continue</p>

      {login.error && (
        <Banner variant="error" role="alert">
          <strong>Could not login:</strong> {login.error.message}
        </Banner>
      )}

      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor={usernameId}>Username</label>
          <Input
            {...register("username")}
            placeholder="Manon"
            id={usernameId}
            autoComplete="username"
            aria-required="true"
            aria-invalid={!!errors?.username?.message}
            aria-describedby={`${usernameId}-error`}
          />
          {errors?.username?.message && (
            <p className="error" role="alert" id={`${usernameId}-error`}>
              <CircleX aria-hidden></CircleX> {errors?.username?.message}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor={passwordId}>Password</label>
          <Input
            {...register("password")}
            placeholder="isecretlylove50cent"
            type="password"
            id={passwordId}
            autoComplete="password"
            aria-required="true"
            aria-invalid={!!errors?.password?.message}
            aria-describedby={`${passwordId}-error`}
          />
          {errors?.password?.message && (
            <p className="error" role="alert" id={`${passwordId}-error`}>
              <CircleX aria-hidden></CircleX> {errors?.password?.message}
            </p>
          )}
        </div>

        <Button>Log in</Button>
      </form>
    </div>
  );
}
