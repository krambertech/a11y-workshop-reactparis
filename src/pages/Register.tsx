import { Navigate, useSearchParams } from "react-router";

import { useAuth } from "../helpers/auth";
import { EmptyState } from "../components/ui/EmptyState";

// ⇩ schema used for validation
// const registerSchema = z
//   .object({
//     username: z
//       .string()
//       .min(3, "Username must be at least 3 characters")
//       .max(20, "Username must be less than 20 characters"),
//     password: z
//       .string()
//       .min(8, "Password must be at least 8 characters")
//       .regex(/.*[0-9].*/, "Password must contain at least one number")
//       .regex(
//         /.*[!@#$%^&*].*/,
//         "Password must contain at least one special character"
//       ),
//     confirmPassword: z.string().min(1, "Confirm password is required"),
//     bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

export function Register() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  // const registerUser = useRegister();
  // const {
  //   // register,
  //   handleSubmit,
  // } = useForm({
  //   resolver: zodResolver(registerSchema),
  // });

  // const submit = handleSubmit((data) => {
  //   registerUser.mutate(data);
  // });

  if (isAuthenticated) {
    const redirect = searchParams.get("redirect") ?? "/";
    return <Navigate to={redirect} replace />;
  }

  return (
    <div className="container">
      <EmptyState>Registration isn't implemented yet!</EmptyState>
    </div>
  );
}
