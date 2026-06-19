import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { BlogDetail } from './blog-detail';

describe('BlogDetail', () => {
  let component: BlogDetail;
  let fixture: ComponentFixture<BlogDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                blog: {
                  id: 1,
                  title: 'Test Blog',
                  contentPreview: 'Test Inhalt',
                  author: 'Test Autor',
                  likes: 0,
                  comments: 0,
                  likedByMe: false,
                  createdByMe: false,
                  createdAt: '2026-01-01T00:00:00',
                  updatedAt: '2026-01-01T00:00:00',
                },
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
