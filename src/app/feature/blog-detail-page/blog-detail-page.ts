import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BlogService } from '../../shared/blog.service';

@Component({
  selector: 'app-blog-detail-page',
  imports: [MatButtonModule, MatCardModule, RouterLink],
  templateUrl: './blog-detail-page.html',
  styleUrl: './blog-detail-page.scss',
})
export class BlogDetailPage {
  private readonly blogService = inject(BlogService);

  id = input.required<string>();

  blog = computed(() => this.blogService.getById(Number(this.id())));
}
