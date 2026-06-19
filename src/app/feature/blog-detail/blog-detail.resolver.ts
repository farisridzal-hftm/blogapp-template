import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { BlogPost, BlogService } from '../../shared/blog';

export const blogDetailResolver: ResolveFn<BlogPost | undefined> = (route) => {
  const blogService = inject(BlogService);
  const id = Number(route.paramMap.get('id'));

  return blogService.getById(id);
};
