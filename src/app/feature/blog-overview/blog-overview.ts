import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BlogService } from '../../shared/blog';

@Component({
  selector: 'app-blog-overview',
  imports: [RouterLink],
  templateUrl: './blog-overview.html',
  styleUrl: './blog-overview.scss',
})
export class BlogOverview {
  private readonly blogService = inject(BlogService);

  protected readonly blogs = this.blogService.getAll();
}
