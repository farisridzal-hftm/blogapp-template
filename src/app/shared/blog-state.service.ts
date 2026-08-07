import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Blog } from './blog';
import { BlogService } from './blog.service';

interface BlogState {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  selectedAuthor: string;
}

export const ALL_AUTHORS = 'all';

const STORAGE_KEY = 'blog-selected-author';

@Injectable({
  providedIn: 'root',
})
export class BlogStateService {
  private readonly blogService = inject(BlogService);

  readonly #state = signal<BlogState>({
    blogs: [],
    loading: false,
    error: null,
    selectedAuthor: localStorage.getItem(STORAGE_KEY) ?? ALL_AUTHORS,
  });

  readonly blogs = computed(() => this.#state().blogs);
  readonly loading = computed(() => this.#state().loading);
  readonly error = computed(() => this.#state().error);
  readonly blogCount = computed(() => this.blogs().length);
  readonly selectedAuthor = computed(() => this.#state().selectedAuthor);

  readonly authors = computed(() => [...new Set(this.blogs().map((blog) => blog.author))].sort());

  readonly filteredBlogs = computed(() => {
    const author = this.selectedAuthor();

    return author === ALL_AUTHORS
      ? this.blogs()
      : this.blogs().filter((blog) => blog.author === author);
  });

  constructor() {
    effect(() => localStorage.setItem(STORAGE_KEY, this.selectedAuthor()));
  }

  async loadBlogs(): Promise<void> {
    this.#loadStarted();

    try {
      this.#loadSucceeded(await this.blogService.getBlogs());
    } catch {
      this.#loadFailed('Blogs konnten nicht geladen werden.');
    }
  }

  async deleteBlog(id: number): Promise<boolean> {
    try {
      await this.blogService.deleteBlog(String(id));
      this.#blogDeleted(id);
      return true;
    } catch {
      return false;
    }
  }

  toggleLike(id: number): void {
    this.#likeToggled(id);
  }

  setAuthor(author: string): void {
    this.#authorSelected(author);
  }

  #loadStarted(): void {
    this.#state.update((state) => ({ ...state, loading: true, error: null }));
  }

  #loadSucceeded(blogs: Blog[]): void {
    this.#state.update((state) => ({ ...state, blogs, loading: false }));
  }

  #loadFailed(message: string): void {
    this.#state.update((state) => ({ ...state, error: message, loading: false }));
  }

  #authorSelected(author: string): void {
    this.#state.update((state) => ({ ...state, selectedAuthor: author }));
  }

  #blogDeleted(id: number): void {
    this.#state.update((state) => ({
      ...state,
      blogs: state.blogs.filter((blog) => blog.id !== id),
    }));
  }

  #likeToggled(id: number): void {
    this.#state.update((state) => ({
      ...state,
      blogs: state.blogs.map((blog) =>
        blog.id === id
          ? {
              ...blog,
              likedByMe: !blog.likedByMe,
              likes: blog.likedByMe ? blog.likes - 1 : blog.likes + 1,
            }
          : blog,
      ),
    }));
  }
}
