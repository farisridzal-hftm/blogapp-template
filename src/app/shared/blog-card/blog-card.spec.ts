import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogCard } from './blog-card';
import { Blog } from '../models/blog';

describe('BlogCard', () => {
  let component: BlogCard;
  let fixture: ComponentFixture<BlogCard>;

  const mockBlog: Blog = {
    id: 1,
    title: 'Test Titel',
    contentPreview: 'Test Vorschau',
    author: 'Test Autor',
    likes: 0,
    comments: 0,
    likedByMe: false,
    createdByMe: false,
    createdAt: '2026-02-15T10:30:00',
    updatedAt: '2026-02-16T08:15:00',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCard],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogCard);
    fixture.componentRef.setInput('blog', mockBlog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
