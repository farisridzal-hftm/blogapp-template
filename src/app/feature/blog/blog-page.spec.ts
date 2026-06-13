import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogOverview } from './blog-page';

describe('BlogOverview', () => {
  let component: BlogOverview;
  let fixture: ComponentFixture<BlogOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
