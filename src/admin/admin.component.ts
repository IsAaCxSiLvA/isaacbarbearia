import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  tabAtual = 'profissionais';

  profissionais: any[] = [];
  parceiros: any[] = [];
  participacoes: any[] = [];
  avaliacoes: any[] = [];

  novoProfissional = { nome: '', especialidade: '', telefone: '' };
  novoParceiro = { nome: '', descricao: '', desconto: '' };
  novaParticipacao = { titulo: '', descricao: '', data: '' };

  constructor(private firebaseService: FirebaseService, private router: Router) { }

  ngOnInit() {
    this.carregarDados();
  }

  async carregarDados() {
    try {
      this.profissionais = await this.firebaseService.getProfissionais();
      this.parceiros = await this.firebaseService.getParceiros();
      this.participacoes = await this.firebaseService.getParticipacoes();
      this.avaliacoes = await this.firebaseService.getAvaliacoes();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  async adicionarProfissional() {
    try {
      await this.firebaseService.addProfissional(this.novoProfissional);
      this.novoProfissional = { nome: '', especialidade: '', telefone: '' };
      this.carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error);
    }
  }

  async deletarProfissional(id: string) {
    try {
      await this.firebaseService.deleteProfissional(id);
      this.carregarDados();
    } catch (error) {
      console.error('Erro ao deletar profissional:', error);
    }
  }

  async adicionarParceiro() {
    try {
      await this.firebaseService.addParceiro(this.novoParceiro);
      this.novoParceiro = { nome: '', descricao: '', desconto: '' };
      this.carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar parceiro:', error);
    }
  }

  async deletarParceiro(id: string) {
    try {
      await this.firebaseService.deleteParceiro(id);
      this.carregarDados();
    } catch (error) {
      console.error('Erro ao deletar parceiro:', error);
    }
  }

  async adicionarParticipacao() {
    try {
      await this.firebaseService.addParticipacao(this.novaParticipacao);
      this.novaParticipacao = { titulo: '', descricao: '', data: '' };
      this.carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar participação:', error);
    }
  }

  async deletarParticipacao(id: string) {
    try {
      await this.firebaseService.deleteParticipacao(id);
      this.carregarDados();
    } catch (error) {
      console.error('Erro ao deletar participação:', error);
    }
  }

  async deletarAvaliacao(id: string) {
    try {
      await this.firebaseService.deleteAvaliacao(id);
      this.carregarDados();
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
    }
  }

  async logout() {
    try {
      await this.firebaseService.logout();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
}
