import { expect, test /* expect */ } from 'vitest';
import { http, HttpResponse } from 'msw';

import { screen, render } from '../test/utils';
import { server } from '../test/setup';
import { mockUser } from '../test/mocks';

import { Register } from './Register';

test('should show validation errors on inputs and allow to register', async () => {
  server.use(
    http.post('/api/auth/register', async () => {
      return HttpResponse.json(mockUser({ username: 'username' }));
    }),
  );

  const { user } = render(<Register />);

  const usernameInput = screen.getByLabelText(/username/i);
  expect(usernameInput).toBeInTheDocument();

  await user.type(usernameInput, 'us');
  await user.keyboard('{tab}');

  expect(usernameInput).toBeInvalid();
  expect(usernameInput).toHaveAccessibleDescription(
    /username must be at least 3 characters/i,
  );

  await user.clear(usernameInput);
  await user.type(usernameInput, 'username');
  await user.keyboard('{tab}');

  expect(usernameInput).toBeValid();
  expect(usernameInput).toHaveValue('username');

  const passwordInput = screen.getByLabelText('Password');
  const passwordConfirmationInput = screen.getByLabelText(/confirm password/i);

  await user.type(passwordInput, 'password&1');
  await user.type(passwordConfirmationInput, 'aaaaaaaaaaaaaaaaaaaaaaaa');

  await user.keyboard('{tab}');

  expect(passwordConfirmationInput).toBeInvalid();
  expect(passwordConfirmationInput).toHaveAccessibleDescription(
    /passwords do not match/i,
  );

  await user.clear(passwordConfirmationInput);
  await user.type(passwordConfirmationInput, 'password&1');

  await user.keyboard('{tab}');

  expect(passwordConfirmationInput).toBeValid();

  await user.click(screen.getByRole('button', { name: /register/i }));

  const successAlert = await screen.findByRole('alert');

  expect(successAlert).toBeInTheDocument();
  expect(successAlert).toHaveTextContent(/success/i);
});

test('should show error message when register fails', async () => {
  server.use(
    http.post('/api/auth/register', async () => {
      return HttpResponse.json({ error: 'Not Authorized' }, { status: 400 });
    }),
  );

  const { user } = render(<Register />);

  const usernameInput = screen.getByLabelText(/username/i);
  await user.type(usernameInput, 'Kateryna');

  const passwordInput = screen.getByLabelText('Password');
  await user.type(passwordInput, 'password&1');

  const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
  await user.type(confirmPasswordInput, 'password&1');

  await user.click(screen.getByRole('button', { name: /register/i }));
  const errorAlert = await screen.findByRole('alert');

  expect(errorAlert).toBeInTheDocument();
  expect(errorAlert).toHaveTextContent(/not authorized/i);

  // screen.debug();
});
