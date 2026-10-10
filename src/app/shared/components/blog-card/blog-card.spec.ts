import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Blog } from '../../blog';
import { BlogCard } from './blog-card';

describe('BlogCard', () => {
  let component: BlogCard;
  let fixture: ComponentFixture<BlogCard>;

  const blog: Blog = {
    id: 1,
    title: 'Test Blog',
    contentPreview: 'Das ist ein Test-Preview.',
    author: 'Test Autor',
    likes: 3,
    comments: 1,
    likedByMe: false,
    createdByMe: false,
    headerImageUrl: 'https://example.com/image.jpg',
    createdAt: '2026-02-15T10:30:00',
    updatedAt: '2026-02-16T08:15:00',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('model', blog);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display blog title', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('mat-card-title')?.textContent).toContain('Test Blog');
    expect(element.querySelector('mat-card-subtitle')?.textContent).toContain('Test Autor');
    expect(element.querySelector('mat-card-content')?.textContent).toContain(
      'Das ist ein Test-Preview.',
    );
  });

  it('should render the header image with the title as alt text', () => {
    const image = (fixture.nativeElement as HTMLElement).querySelector('img');

    expect(image?.getAttribute('src')).toBe('https://example.com/image.jpg');
    expect(image?.getAttribute('alt')).toBe('Test Blog');
  });

  it('should emit the blog id on like click', () => {
    const liked = vi.fn();
    component.liked.subscribe(liked);

    const likeButton = (fixture.nativeElement as HTMLElement).querySelector(
      'mat-card-actions button',
    ) as HTMLButtonElement;
    likeButton.click();

    expect(liked).toHaveBeenCalledWith(1);
  });

  it('should emit the blog on edit click and the id on delete click', () => {
    const edit = vi.fn();
    const remove = vi.fn();
    component.edit.subscribe(edit);
    component.remove.subscribe(remove);

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('button[aria-label="Blog bearbeiten"]')?.click();
    element.querySelector<HTMLButtonElement>('button[aria-label="Blog loeschen"]')?.click();

    expect(edit).toHaveBeenCalledWith(blog);
    expect(remove).toHaveBeenCalledWith(1);
  });
});
