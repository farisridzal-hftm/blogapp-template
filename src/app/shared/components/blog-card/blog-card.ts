import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Blog } from '../../blog';

@Component({
  selector: 'app-blog-card',
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.scss',
})
export class BlogCard {
  model = input.required<Blog>();

  liked = output<number>();

  onLike(): void {
    this.liked.emit(this.model().id);
  }
}
