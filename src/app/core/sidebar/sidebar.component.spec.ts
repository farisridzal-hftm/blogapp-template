import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('renders the navigation in the toolbar on desktop', () => {
    const toolbar = fixture.nativeElement.querySelector('.app-toolbar') as HTMLElement;

    expect(toolbar.querySelector('nav.nav')).not.toBeNull();
    expect(toolbar.querySelector('button[aria-label="Navigation ein-/ausblenden"]')).toBeNull();
  });
});
