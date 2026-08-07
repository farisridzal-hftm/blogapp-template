import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import blogData from '../data/blogs.json';
import { environment } from '../../environments/environment';
import { Blog, pagedBlogsSchema } from './blog';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly entriesUrl = `${environment.apiUrl}/entries`;
  private readonly blogs = blogData as Blog[];

  async getBlogs(): Promise<Blog[]> {
    try {
      const response = await firstValueFrom(this.http.get<unknown>(this.entriesUrl));

      const result = pagedBlogsSchema.safeParse(response);

      if (!result.success) {
        console.error('Ungueltige API-Response:', result.error);
        return [];
      }

      return result.data.data;
    } catch (error) {
      console.error('Fehler beim Laden der Blogs:', error);
      throw error;
    }
  }

  async createBlog(blog: Blog): Promise<Blog> {
    try {
      return await firstValueFrom(this.http.post<Blog>(this.entriesUrl, blog));
    } catch (error) {
      console.error('Fehler beim Erstellen des Blogs:', error);
      throw error;
    }
  }

  async updateBlog(id: string, blog: Blog): Promise<Blog> {
    try {
      return await firstValueFrom(this.http.put<Blog>(`${this.entriesUrl}/${id}`, blog));
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Blogs:', error);
      throw error;
    }
  }

  async deleteBlog(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.entriesUrl}/${id}`));
    } catch (error) {
      console.error('Fehler beim Löschen des Blogs:', error);
      throw error;
    }
  }

  getById(id: number): Blog | undefined {
    return this.blogs.find((blog) => blog.id === id);
  }
}
