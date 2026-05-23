import { render, screen } from '@testing-library/react';
import App from './App';

test('redirects unauthenticated users to login page', () => {
  localStorage.clear();
  window.history.pushState({}, '', '/courses');

  render(<App />);

  expect(screen.getByRole('heading', { name: /вход/i })).toBeInTheDocument();
});