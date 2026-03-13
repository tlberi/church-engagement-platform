import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing page heading', async () => {
  render(<App />);
  const heading = await screen.findByText(/Church Engagement/i);
  expect(heading).toBeInTheDocument();
});
