import { Component, signal } from '@angular/core';
import {
  FormField,
  form,
  maxLength,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';

interface BlogCreateModel {
  title: string;
  content: string;
  category: string;
}

const TITLE_PATTERN = /^[\p{L}\p{N} ]+$/u;

@Component({
  selector: 'app-blog-create',
  imports: [FormField],
  templateUrl: './blog-create.html',
  styleUrl: './blog-create.scss',
})
export class BlogCreateComponent {
  protected readonly blogModel = signal<BlogCreateModel>({
    title: '',
    content: '',
    category: 'general',
  });

  protected readonly blogForm = form(this.blogModel, (s) => {
    required(s.title, { message: 'Titel ist erforderlich' });
    minLength(s.title, 3, { message: 'Titel muss mindestens 3 Zeichen lang sein' });
    maxLength(s.title, 100, { message: 'Titel darf maximal 100 Zeichen lang sein' });

    validate(s.title, ({ value }) => {
      const title = value();

      if (title.length > 0 && !TITLE_PATTERN.test(title)) {
        return {
          kind: 'noSpecialChars',
          message: 'Titel darf nur Buchstaben, Zahlen und Leerzeichen enthalten',
        };
      }

      return null;
    });

    required(s.content, { message: 'Inhalt ist erforderlich' });
    minLength(s.content, 10, { message: 'Inhalt muss mindestens 10 Zeichen lang sein' });

    validate(s.content, ({ value, valueOf }) => {
      const content = value();
      const minContentLength = valueOf(s.title).length * 2;

      if (content.length > 0 && content.length < minContentLength) {
        return {
          kind: 'contentTooShort',
          message: `Inhalt muss mindestens doppelt so lang wie der Titel sein (${minContentLength} Zeichen)`,
        };
      }

      return null;
    });

    required(s.category, { message: 'Kategorie ist erforderlich' });
  });

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    await submit(this.blogForm, async () => {
      console.log('Blog-Formular:', this.blogModel());
    });
  }
}
