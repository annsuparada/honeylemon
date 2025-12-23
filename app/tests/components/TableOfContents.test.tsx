import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TableOfContents from '@/app/components/TableOfContents';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

beforeAll(() => {
  global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
    mockIntersectionObserver.mockImplementation(callback);
    return {
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    };
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  // Mock getElementById
  document.getElementById = jest.fn((id: string) => {
    const element = document.createElement('div');
    element.id = id;
    return element;
  });
  // Mock window.scrollTo
  window.scrollTo = jest.fn();
});

describe('TableOfContents Component', () => {
  const mockHeadings = [
    { id: 'heading-1', text: 'First Heading', level: 2 },
    { id: 'heading-2', text: 'Second Heading', level: 2 },
    { id: 'heading-3', text: 'Nested Heading', level: 3 },
    { id: 'heading-4', text: 'Deep Nested', level: 4 },
  ];

  it('returns null when headings array is empty', () => {
    const { container } = render(<TableOfContents headings={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders desktop sidebar version on large screens', () => {
    render(<TableOfContents headings={mockHeadings} />);

    const desktopToc = screen.getByText('Table of Contents');
    expect(desktopToc).toBeInTheDocument();
    expect(desktopToc.closest('.hidden.lg\\:block')).toBeInTheDocument();
  });

  it('renders all headings in the list', () => {
    render(<TableOfContents headings={mockHeadings} />);

    expect(screen.getByText('First Heading')).toBeInTheDocument();
    expect(screen.getByText('Second Heading')).toBeInTheDocument();
    expect(screen.getByText('Nested Heading')).toBeInTheDocument();
    expect(screen.getByText('Deep Nested')).toBeInTheDocument();
  });

  it('renders mobile floating button', () => {
    render(<TableOfContents headings={mockHeadings} />);

    const mobileButton = screen.getByLabelText('Toggle Table of Contents');
    expect(mobileButton).toBeInTheDocument();
    expect(mobileButton.closest('.lg\\:hidden')).toBeInTheDocument();
  });

  it('opens mobile drawer when button is clicked', () => {
    render(<TableOfContents headings={mockHeadings} />);

    const mobileButton = screen.getByLabelText('Toggle Table of Contents');
    fireEvent.click(mobileButton);

    // Check that mobile drawer is visible
    const drawer = document.querySelector('.fixed.bottom-0');
    expect(drawer).toBeInTheDocument();
    expect(drawer?.querySelector('h3')?.textContent).toBe('Table of Contents');
  });

  it('closes mobile drawer when close button is clicked', async () => {
    render(<TableOfContents headings={mockHeadings} />);

    const mobileButton = screen.getByLabelText('Toggle Table of Contents');
    fireEvent.click(mobileButton);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      const drawer = document.querySelector('.fixed.bottom-0');
      expect(drawer).not.toBeInTheDocument();
    });
  });

  it('closes mobile drawer when backdrop is clicked', async () => {
    render(<TableOfContents headings={mockHeadings} />);

    const mobileButton = screen.getByLabelText('Toggle Table of Contents');
    fireEvent.click(mobileButton);

    const backdrop = document.querySelector('.fixed.inset-0.bg-black');
    expect(backdrop).toBeInTheDocument();

    if (backdrop) {
      fireEvent.click(backdrop);
    }

    await waitFor(() => {
      const drawer = document.querySelector('.fixed.bottom-0');
      expect(drawer).not.toBeInTheDocument();
    });
  });

  it('closes mobile drawer when a heading link is clicked', async () => {
    render(<TableOfContents headings={mockHeadings} />);

    const mobileButton = screen.getByLabelText('Toggle Table of Contents');
    fireEvent.click(mobileButton);

    // Get the link from within the mobile drawer
    const drawer = document.querySelector('.fixed.bottom-0');
    const firstHeadingLink = drawer?.querySelector('a[href="#heading-1"]');
    
    if (firstHeadingLink) {
      fireEvent.click(firstHeadingLink);
    }

    await waitFor(() => {
      const closedDrawer = document.querySelector('.fixed.bottom-0');
      expect(closedDrawer).not.toBeInTheDocument();
    });
  });

  it('calls scrollTo when heading link is clicked', () => {
    render(<TableOfContents headings={mockHeadings} />);

    const firstHeadingLink = screen.getByText('First Heading');
    fireEvent.click(firstHeadingLink);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: 'smooth',
    });
  });

  it('prevents default anchor behavior when link is clicked', () => {
    render(<TableOfContents headings={mockHeadings} />);

    const firstHeadingLink = screen.getByText('First Heading');
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

    fireEvent(firstHeadingLink, clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('applies correct styling for different heading levels', () => {
    render(<TableOfContents headings={mockHeadings} />);

    const h2Link = screen.getByText('First Heading');
    const h3Link = screen.getByText('Nested Heading');
    const h4Link = screen.getByText('Deep Nested');

    expect(h2Link.className).toContain('font-medium');
    expect(h3Link.className).toContain('ml-4');
    expect(h4Link.className).toContain('ml-8');
  });

  it('sets up IntersectionObserver for active section tracking', () => {
    render(<TableOfContents headings={mockHeadings} />);

    expect(global.IntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledTimes(mockHeadings.length);
  });

  it('cleans up IntersectionObserver on unmount', () => {
    const { unmount } = render(<TableOfContents headings={mockHeadings} />);

    unmount();

    expect(mockUnobserve).toHaveBeenCalledTimes(mockHeadings.length);
  });

  it('handles headings with special characters', () => {
    const specialHeadings = [
      { id: 'heading-special', text: 'Heading & More', level: 2 },
    ];

    render(<TableOfContents headings={specialHeadings} />);

    expect(screen.getByText('Heading & More')).toBeInTheDocument();
  });

  it('renders correct href attributes for anchor links', () => {
    render(<TableOfContents headings={mockHeadings} />);

    const links = screen.getAllByText('First Heading');
    // Check both desktop and mobile versions
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '#heading-1');
    });
  });
});

