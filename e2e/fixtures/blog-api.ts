import { Page } from '@playwright/test';

export interface MockBlog {
  id: number;
  title: string;
  contentPreview: string;
  author: string;
  likes: number;
  comments: number;
  likedByMe: boolean;
  createdByMe: boolean;
  headerImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

function blog(id: number, title: string, author: string, contentPreview: string): MockBlog {
  return {
    id,
    title,
    contentPreview,
    author,
    likes: id,
    comments: 0,
    likedByMe: false,
    createdByMe: false,
    createdAt: '2026-02-15T10:30:00',
    updatedAt: '2026-02-16T08:15:00',
  };
}

export const mockBlogs: MockBlog[] = [
  blog(1, 'Angular Signals verstehen', 'michael-hftm', 'Signals sind der neue Reaktivitaetskern.'),
  blog(2, 'Signal Forms in der Praxis', 'student@hftm.ch', 'Model, Form und Validierung im Griff.'),
  blog(3, 'Responsive Design mit Flexbox', 'michael-hftm', 'Ein Grid, drei Breakpoints.'),
];

export async function stubBlogApi(page: Page, blogs: MockBlog[] = mockBlogs): Promise<void> {
  await page.route('**/auth/me', (route) =>
    route.fulfill({ json: { isAuthenticated: false, user: null } }),
  );

  await page.route('**/entries**', (route) =>
    route.fulfill({
      json: {
        data: blogs,
        pageIndex: 0,
        pageSize: 10,
        totalCount: blogs.length,
        maxPageSize: 100,
      },
    }),
  );
}

export async function stubBlogApiFailure(page: Page): Promise<void> {
  await page.route('**/auth/me', (route) =>
    route.fulfill({ json: { isAuthenticated: false, user: null } }),
  );

  await page.route('**/entries**', (route) => route.fulfill({ status: 500, json: {} }));
}
