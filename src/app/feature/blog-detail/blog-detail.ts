import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BlogPost } from '../../shared/blog';

@Component({
  selector: 'app-blog-detail',
  imports: [],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.scss',
})
export class BlogDetail {
  private readonly route = inject(ActivatedRoute);

  protected readonly blog = computed(() => {
    return this.route.snapshot.data['blog'] as BlogPost | undefined;
  });
}
