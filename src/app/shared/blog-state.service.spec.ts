import { TestBed } from '@angular/core/testing';
import { Blog } from './blog';
import { ALL_AUTHORS, BlogStateService } from './blog-state.service';
import { BlogService } from './blog.service';

const STORAGE_KEY = 'blog-selected-author';

function createBlog(id: number, overrides: Partial<Blog> = {}): Blog {
  return {
    id,
    title: `Blog ${id}`,
    contentPreview: `Vorschau ${id}`,
    author: 'student@hftm.ch',
    likes: 0,
    comments: 0,
    likedByMe: false,
    createdByMe: false,
    createdAt: '2026-02-15T10:30:00',
    updatedAt: '2026-02-15T10:30:00',
    ...overrides,
  };
}

describe('BlogStateService', () => {
  let getBlogs: ReturnType<typeof vi.fn>;
  let deleteBlog: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    getBlogs = vi.fn().mockResolvedValue([]);
    deleteBlog = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [{ provide: BlogService, useValue: { getBlogs, deleteBlog } }],
    });
  });

  function createService(): BlogStateService {
    return TestBed.inject(BlogStateService);
  }

  it('should start with empty blogs array', () => {
    const service = createService();

    expect(service.blogs()).toEqual([]);
    expect(service.blogCount()).toBe(0);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should update loading state', async () => {
    let resolveBlogs!: (blogs: Blog[]) => void;
    getBlogs.mockReturnValue(new Promise<Blog[]>((resolve) => (resolveBlogs = resolve)));

    const service = createService();
    const pending = service.loadBlogs();

    expect(service.loading()).toBe(true);

    resolveBlogs([createBlog(1)]);
    await pending;

    expect(service.loading()).toBe(false);
  });

  it('should calculate blog count', async () => {
    getBlogs.mockResolvedValue([createBlog(1), createBlog(2), createBlog(3)]);

    const service = createService();
    await service.loadBlogs();

    expect(service.blogCount()).toBe(3);
  });

  describe('computed signals', () => {
    it('recalculates the count when the blog list changes', async () => {
      getBlogs.mockResolvedValue([createBlog(1), createBlog(2), createBlog(3)]);

      const service = createService();
      await service.loadBlogs();

      expect(service.blogCount()).toBe(3);

      getBlogs.mockResolvedValue([]);
      await service.loadBlogs();

      expect(service.blogCount()).toBe(0);
    });

    it('derives the author list and filters by the selected author', async () => {
      getBlogs.mockResolvedValue([
        createBlog(1, { author: 'michael-hftm' }),
        createBlog(2, { author: 'student@hftm.ch' }),
        createBlog(3, { author: 'michael-hftm' }),
      ]);

      const service = createService();
      await service.loadBlogs();

      expect(service.authors()).toEqual(['michael-hftm', 'student@hftm.ch']);
      expect(service.filteredBlogs()).toHaveLength(3);

      service.setAuthor('michael-hftm');

      expect(service.filteredBlogs().map((blog) => blog.id)).toEqual([1, 3]);
    });

    it('drops a deleted blog from the derived signals', async () => {
      getBlogs.mockResolvedValue([createBlog(1), createBlog(2)]);

      const service = createService();
      await service.loadBlogs();

      expect(await service.deleteBlog(1)).toBe(true);
      expect(deleteBlog).toHaveBeenCalledWith('1');
      expect(service.blogCount()).toBe(1);
      expect(service.blogs().map((blog) => blog.id)).toEqual([2]);
    });
  });

  describe('localStorage effect', () => {
    it('writes the selected author to localStorage', () => {
      const setItem = vi.spyOn(Storage.prototype, 'setItem');

      const service = createService();
      service.setAuthor('michael-hftm');
      TestBed.tick();

      expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, 'michael-hftm');
    });

    it('restores the selected author from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'michael-hftm');

      expect(createService().selectedAuthor()).toBe('michael-hftm');
    });
  });

  describe('edge cases', () => {
    it('falls back to all authors when localStorage holds no value', () => {
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

      expect(createService().selectedAuthor()).toBe(ALL_AUTHORS);
    });

    it('keeps the list empty and reports an error when loading fails', async () => {
      getBlogs.mockRejectedValue(new Error('network down'));

      const service = createService();
      await service.loadBlogs();

      expect(service.blogs()).toEqual([]);
      expect(service.blogCount()).toBe(0);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe('Blogs konnten nicht geladen werden.');
    });

    it('handles an empty blog list without throwing', async () => {
      const service = createService();
      await service.loadBlogs();

      expect(service.authors()).toEqual([]);
      expect(service.filteredBlogs()).toEqual([]);
    });

    it('returns an empty list for an author without blogs', async () => {
      getBlogs.mockResolvedValue([createBlog(1, { author: 'michael-hftm' })]);

      const service = createService();
      await service.loadBlogs();
      service.setAuthor('niemand');

      expect(service.filteredBlogs()).toEqual([]);
      expect(service.blogCount()).toBe(1);
    });

    it('keeps the state unchanged when deleting fails', async () => {
      getBlogs.mockResolvedValue([createBlog(1)]);
      deleteBlog.mockRejectedValue(new Error('401'));

      const service = createService();
      await service.loadBlogs();

      expect(await service.deleteBlog(1)).toBe(false);
      expect(service.blogCount()).toBe(1);
    });
  });
});
