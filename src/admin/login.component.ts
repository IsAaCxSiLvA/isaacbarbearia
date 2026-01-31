import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  erro = '';

  constructor(private firebaseService: FirebaseService, private router: Router) { }

  async login() {
    // Verificar se o email é o admin
    const adminEmail = 'admin@isaacbarbearia.com';
    if (this.email !== adminEmail) {
      this.erro = 'Apenas o admin pode fazer login!';
      return;
    }

    try {
      await this.firebaseService.login(this.email, this.password);
      // Redirecionar para admin.html ao invés do componente Angular
      window.location.href = '/admin.html';
    } catch (error: any) {
      this.erro = 'Email ou senha incorretos!';
      console.error('Erro de login:', error);
    }
  }
}
