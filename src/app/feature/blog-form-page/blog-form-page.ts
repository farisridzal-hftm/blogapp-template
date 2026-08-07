import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Blog } from '../../shared/blog';
import { BlogService } from '../../shared/blog.service';

@Component({
  selector: 'app-blog-form-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './blog-form-page.html',
  styleUrl: './blog-form-page.scss',
})
export class BlogFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly blogService = inject(BlogService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  private readonly editing = history.state?.blog as Blog | undefined;

  protected readonly isEdit = signal(!!this.editing);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    contentPreview: ['', Validators.required],
    headerImageUrl: [''],
  });

  constructor() {
    if (this.editing) {
      this.form.patchValue({
        title: this.editing.title,
        author: this.editing.author,
        contentPreview: this.editing.contentPreview,
        headerImageUrl: this.editing.headerImageUrl ?? '',
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    const blog: Blog = {
      id: this.editing?.id ?? 0,
      title: value.title,
      author: value.author,
      contentPreview: value.contentPreview,
      headerImageUrl: value.headerImageUrl || undefined,
      likes: this.editing?.likes ?? 0,
      comments: this.editing?.comments ?? 0,
      likedByMe: this.editing?.likedByMe ?? false,
      createdByMe: this.editing?.createdByMe ?? true,
      createdAt: this.editing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (this.editing) {
        await this.blogService.updateBlog(String(this.editing.id), blog);
        this.snackBar.open('Blog aktualisiert.', 'OK', { duration: 3000 });
      } else {
        await this.blogService.createBlog(blog);
        this.snackBar.open('Blog erstellt.', 'OK', { duration: 3000 });
      }

      await this.router.navigate(['/']);
    } catch {
      this.snackBar.open(
        'Speichern fehlgeschlagen. Ist das Backend erreichbar und bist du eingeloggt?',
        'OK',
        { duration: 5000 },
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    void this.router.navigate(['/']);
  }
}
