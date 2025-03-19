import { Navigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';

import { useAuth } from '../helpers/auth';
import { EmptyState } from '../components/ui/EmptyState';
import { useRegister } from '../helpers/queries';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Banner } from '../components/ui/Banner';
import { Input, TextArea } from '../components/ui/Input';
import { CircleX, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import clsx from 'clsx';

// ⇩ schema used for validation
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/.*[0-9].*/, 'Password must contain at least one number')
      .regex(
        /.*[!@#$%^&*].*/,
        'Password must contain at least one special character',
      ),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    bio: z.string().max(200, 'Bio must be less than 200 characters').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function Register() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const submit = handleSubmit((data) => {
    registerUser.mutate(data);
  });

  if (isAuthenticated) {
    const redirect = searchParams.get('redirect') ?? '/';
    return <Navigate to={redirect} replace />;
  }

  return (
    <div className="container">
      <h1>Register</h1>
      <p>Register your account</p>

      {registerUser.error && (
        <Banner variant="error" role="alert">
          <strong>Could not log in:</strong> {registerUser.error.message}
        </Banner>
      )}

      {registerUser.isSuccess && (
        <Banner variant="success" role="alert">
          Success: You have successfully registered
        </Banner>
      )}

      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="usernameId">Username</label>
          <Input
            {...register('username')}
            placeholder="Manon"
            id="usernameId"
            autoComplete="username"
            aria-required="true"
            aria-invalid={!!errors?.username?.message}
            aria-describedby={clsx(
              errors?.username?.message && 'usernameId-error',
              'usernameId-caption',
            )}
          />
          {errors?.username?.message && (
            <p className="error" role="alert" id="usernameId-error">
              <CircleX aria-hidden /> {errors?.username?.message}
            </p>
          )}
          <p className="caption" id="usernameId-caption">
            <Info aria-hidden />
            Use the same username as on your GitHub account
          </p>
        </div>

        <div className="field">
          <label htmlFor="passwordId">Password</label>
          <Input
            {...register('password')}
            placeholder="isecretlylove50cent"
            type="password"
            id="passwordId"
            autoComplete="password"
            aria-required="true"
            aria-invalid={!!errors?.password?.message}
            aria-describedby={clsx(
              errors?.password?.message && 'passwordId-error',
              'passwordId-caption',
            )}
          />
          {errors?.password?.message && (
            <p className="error" role="alert" id="passwordId-error">
              <CircleX aria-hidden /> {errors?.password?.message}
            </p>
          )}
          <p className="caption" id="passwordId-caption">
            <Info aria-hidden />
            Use a password that is at least 8 characters long and contains at
            least one number and one special character
          </p>
        </div>

        <div className="field">
          <label htmlFor="confirmPasswordId">Confirm password</label>
          <Input
            {...register('confirmPassword')}
            placeholder="isecretlylove50cent"
            type="password"
            id="confirmPasswordId"
            autoComplete="confirm-password"
            aria-required="true"
            aria-invalid={!!errors?.confirmPassword?.message}
            aria-describedby="confirmPasswordId-error"
          />
          {errors?.confirmPassword?.message && (
            <p className="error" role="alert" id="confirmPasswordId-error">
              <CircleX aria-hidden /> {errors?.confirmPassword?.message}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="bioId">Bio (optional)</label>
          <TextArea
            {...register('bio')}
            placeholder="I love to code"
            id="bioId"
            autoComplete="bio"
            aria-invalid={!!errors?.bio?.message}
            aria-describedby={clsx(
              errors?.bio?.message && 'bioId-error',
              'bioId-caption',
            )}
          />
          {errors?.bio?.message && (
            <p className="error" role="alert" id="bioId-error">
              <CircleX aria-hidden /> {errors?.bio?.message}
            </p>
          )}
          <p className="caption" id="bioId-caption">
            <Info aria-hidden /> 200 characters max
          </p>
        </div>

        <Button>Register</Button>
      </form>
    </div>
  );
}
