import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Blog } from '../models/blog';

@Component({
  selector: 'app-blog-card',
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.scss',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
})
export class BlogCard {
  blog = input.required<Blog>();

  liked = output<number>();
}
