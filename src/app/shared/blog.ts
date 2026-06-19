import { Injectable } from '@angular/core';

import blogData from '../data/blogs.json';

export type BlogPost = {
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
};

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private readonly blogs = blogData as BlogPost[];

  getAll(): BlogPost[] {
    return this.blogs;
  }

  getById(id: number): BlogPost | undefined {
    return this.blogs.find((blog) => blog.id === id);
  }
}
