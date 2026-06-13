import { Component } from '@angular/core';
import blogData from '../../data/blogs.json';
import { Blog as BlogModel } from '../../shared/models/blog';
import { BlogCard } from '../../shared/blog-card/blog-card';

@Component({
  selector: 'app-blog-overview',
  imports: [BlogCard],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
})
export class BlogOverview {
  blogs: BlogModel[] = blogData as BlogModel[];

  toggleLike(blogId: number): void {
    this.blogs = this.blogs.map((blog) => {
      if (blog.id !== blogId) {
        return blog;
      }

      const likedByMe = !blog.likedByMe;

      return {
        ...blog,
        likedByMe,
        likes: blog.likes + (likedByMe ? 1 : -1),
      };
    });
  }
}
