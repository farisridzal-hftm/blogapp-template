import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Blog } from '../../shared/blog';
import { ALL_AUTHORS, BlogStateService } from '../../shared/blog-state.service';
import { BlogCard } from '../../shared/components/blog-card/blog-card';

@Component({
  selector: 'app-blog-overview-page',
  imports: [
    BlogCard,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPage implements OnInit {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly state = inject(BlogStateService);
  readonly ALL_AUTHORS = ALL_AUTHORS;

  ngOnInit(): void {
    void this.state.loadBlogs();
  }

  editBlog(blog: Blog): void {
    void this.router.navigate(['/blog', blog.id, 'edit'], { state: { blog } });
  }

  async deleteBlog(blogId: number): Promise<void> {
    if (!window.confirm('Diesen Blog wirklich loeschen?')) {
      return;
    }

    if (await this.state.deleteBlog(blogId)) {
      this.snackBar.open('Blog geloescht.', 'OK', { duration: 3000 });
    } else {
      this.snackBar.open('Loeschen fehlgeschlagen.', 'OK', { duration: 5000 });
    }
  }

  toggleLike(blogId: number): void {
    this.state.toggleLike(blogId);
  }
}
