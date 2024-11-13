import { render, screen } from '@testing-library/react';
import PageStructure from './PageStructure';

test('renders learn react link', () => {
  render(<PageStructure />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
