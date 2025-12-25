import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'roles-page',
  imports: [CommonModule],
  template: `
    <section class="roles-page">
      <header>
        <h1>Roles</h1>
        <p>Role management is powered by the identity module. More controls will appear here soon.</p>
      </header>
    </section>
  `,
  styles: [
    `
      .roles-page {
        padding: 2rem;
        display: flex;
        justify-content: center;
      }

      .roles-page header {
        max-width: 640px;
        text-align: center;
      }

      .roles-page h1 {
        margin-bottom: 0.5rem;
        font-size: 2rem;
      }

      .roles-page p {
        color: rgba(0, 0, 0, 0.65);
      }
    `
  ]
})
export class RolesPageComponent {}
