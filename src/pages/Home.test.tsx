import { test, expect } from 'vitest';
import { HttpResponse, http } from 'msw';

import { render, screen, waitForElementToBeRemoved } from '../test/utils';
import { mockTil } from '../test/mocks';
import { server } from '../test/setup';

import { Home } from './Home';

test.todo('should render empty state when no TILs');

test('should render loading state when fetching tils', async () => {
  server.use(
    http.get('/api/tils', async () => {
      return HttpResponse.json([]);
    }),
  );

  const { user } = render(<Home />);

  const loadingState = screen.getByText(/Loading/i);
  expect(loadingState).toBeInTheDocument();
  screen.debug();
});

test.todo('should render error state when fetching tils fails');

test.todo('should display a list of loaded tils');
