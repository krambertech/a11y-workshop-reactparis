import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useSearchParams } from "react-router";

import { useAuth } from "../helpers/auth";
import { useLogin } from "../helpers/queries";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

// schema used for validation
const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function Login() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    // ⇩ to access validation errors
    // formState: { errors },
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

      <div className="flex flex-col gap-md align-start">
        <Input {...register("username")} placeholder="Username" />
        <Input {...register("password")} placeholder="Password" />

        <Button onClick={submit}>Log in</Button>
      </div>
    </div>
  );
}
