import { render, screen } from '@testing-library/react';
import App from './App';

function renderAt(path) {
  window.history.pushState({}, 'Test', path);
  return render(<App />);
}

test('landing route renders', async () => {
  renderAt('/');
  expect(await screen.findByText(/Church Engagement/i)).toBeInTheDocument();
});

test('login route renders', async () => {
  renderAt('/login');
  expect(await screen.findByText(/Church Engagement Platform/i)).toBeInTheDocument();
});

test('protected routes redirect to login', async () => {
  renderAt('/dashboard');
  expect(await screen.findByText(/Welcome back!/i)).toBeInTheDocument();
});

test('check-in route renders', async () => {
  renderAt('/checkin/demo-org/demo-service');
  expect(await screen.findByText(/Check-In/i)).toBeInTheDocument();
});
