import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Blog } from '../../shared/blog';
import { BlogService } from '../../shared/blog.service';
import { BlogCard } from '../../shared/components/blog-card/blog-card';

@Component({
  selector: 'app-blog-overview-page',
  imports: [BlogCard, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPage {
  private readonly blogService = inject(BlogService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  blogs = signal<Blog[]>([]);
  loading = signal(false);

  constructor() {
    void this.loadBlogs();
  }

  private async loadBlogs(): Promise<void> {
    this.loading.set(true);

    try {
      this.blogs.set(await this.blogService.getBlogs());
    } catch {
      this.snackBar.open('Blogs konnten nicht geladen werden.', 'OK', {
        duration: 5000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  editBlog(blog: Blog): void {
    void this.router.navigate(['/blog', blog.id, 'edit'], { state: { blog } });
  }

  async deleteBlog(blogId: number): Promise<void> {
    if (!window.confirm('Diesen Blog wirklich loeschen?')) {
      return;
    }

    try {
      await this.blogService.deleteBlog(String(blogId));
      this.blogs.update((blogs) => blogs.filter((blog) => blog.id !== blogId));
      this.snackBar.open('Blog geloescht.', 'OK', { duration: 3000 });
    } catch {
      this.snackBar.open('Loeschen fehlgeschlagen.', 'OK', { duration: 5000 });
    }
  }

  toggleLike(blogId: number): void {
    this.blogs.update((blogs) =>
      blogs.map((blog) => {
        if (blog.id !== blogId) {
          return blog;
        }

        return {
          ...blog,
          likedByMe: !blog.likedByMe,
          likes: blog.likedByMe ? blog.likes - 1 : blog.likes + 1,
        };
      }),
    );
  }
}
