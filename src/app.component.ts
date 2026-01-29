import { Component, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

interface AccordionItem {
  id: string;
  title: string;
  isOpen: boolean;
  type: 'text' | 'list' | 'hours' | 'feedback' | 'partners' | 'team' | 'projects';
  icon: 'scissors' | 'star' | 'calendar' | 'clock' | 'map' | 'briefcase' | 'users' | 'image';
  featured?: boolean;
  content?: string;
  listItems?: { name: string; price: string; available: boolean }[];
  testimonials?: { name: string; comment: string; rating: number; isNew?: boolean }[];
  partners?: { name: string; role: string; imageUrl: string }[];
  teamMembers?: { name: string; specialty: string; imageUrl: string }[];
  projectGallery?: { title: string; imageUrl: string; projectUrl: string; date: string; location: string; }[];
}

interface Particle {
  left: string;
  animationDuration: string;
  animationDelay: string;
  opacity: number;
  size: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  templateUrl: './app.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private firebaseConfig = {
    apiKey: 'AIzaSyDE2tWDNCDrY6O20EWrDt-NkvZmCm_MR10',
    authDomain: 'isaacbarbearia-admin.firebaseapp.com',
    projectId: 'isaacbarbearia-admin',
    storageBucket: 'isaacbarbearia-admin.firebasestorage.app',
    messagingSenderId: '308982033120',
    appId: '1:308982033120:web:38b82c1a3ca9e933be7e85'
  };
  private app = initializeApp(this.firebaseConfig);
  private db = getFirestore(this.app);
  
  // Loading State
  isLoading = signal(true);
  loadingProgress = signal(0);
  
  // Background Particles
  embers = signal<Particle[]>([]); // Rising from bottom
  sparks = signal<Particle[]>([]); // Falling from top

  // Review Form State
  showReviewForm = signal(false);
  newReviewName = signal('');
  newReviewMessage = signal('');
  newReviewRating = signal(5);

  // Accordion Data
  items = signal<AccordionItem[]>([
    {
      id: 'services',
      title: 'Nossos Serviços & Preços',
      isOpen: false,
      featured: true,
      type: 'list',
      icon: 'scissors',
      listItems: []
    },
    {
      id: 'team',
      title: 'Nossos Profissionais',
      isOpen: false,
      type: 'team',
      icon: 'users',
      teamMembers: [
        { name: 'Isaac Alencar', specialty: 'Fundador & Mestre Barbeiro', imageUrl: 'https://picsum.photos/id/1005/200/200' },
        { name: 'Bruno Santos', specialty: 'Expert em Degradê & Barba', imageUrl: 'https://picsum.photos/id/1011/200/200' },
      ]
    },
    {
      id: 'projects',
      title: 'Participação Comunitária',
      isOpen: false,
      type: 'projects',
      icon: 'image',
      projectGallery: [
        { title: 'Projeto Bairro Livre', imageUrl: 'https://picsum.photos/seed/bairro/300/300', projectUrl: '#', date: '25/07/2024', location: 'Praça Central' },
        { title: 'Corte Solidário', imageUrl: 'https://picsum.photos/seed/solidario/300/300', projectUrl: '#', date: '10/06/2024', location: 'Abrigo Municipal' },
        { title: 'Barbeiros do Bem', imageUrl: 'https://picsum.photos/seed/corte2/300/300', projectUrl: '#', date: '05/04/2024', location: 'Comunidade S. Jorge' },
        { title: 'Apoio ao Esporte Local', imageUrl: 'https://picsum.photos/seed/barba2/300/300', projectUrl: '#', date: '18/03/2024', location: 'Ginásio da Cidade' },
      ]
    },
    {
      id: 'partnerships',
      title: 'Parceiros & Convênios',
      isOpen: false,
      type: 'partners',
      icon: 'briefcase',
      partners: [
        { name: 'Iron Gym', role: '10% OFF na Mensalidade', imageUrl: 'https://picsum.photos/id/237/200/200' },
        { name: 'Viking Pub', role: '1ª Chopp Grátis', imageUrl: 'https://picsum.photos/id/292/200/200' },
        { name: 'Tattoo Ink', role: 'Flash Day Exclusivo', imageUrl: 'https://picsum.photos/id/1062/200/200' },
        { name: 'Rota 66 Moto Clube', role: 'Desconto em Eventos', imageUrl: 'https://picsum.photos/id/1118/200/200' }
      ]
    },
    {
      id: 'feedback',
      title: 'Avaliações dos Clientes',
      isOpen: false,
      type: 'feedback',
      icon: 'star',
      testimonials: [
        { name: 'Carlos Eduardo', comment: 'Melhor degradê da região. O atendimento é vip!', rating: 5 },
        { name: 'Rafael Silva', comment: 'Ambiente sensacional e profissionais muito qualificados.', rating: 5 },
        { name: 'Pedro Henrique', comment: 'A consultoria de estilo mudou meu visual. Recomendo!', rating: 5 }
      ]
    },
    {
      id: 'booking',
      title: 'Agendamento',
      isOpen: false,
      type: 'text',
      icon: 'calendar',
      content: 'O agendamento é feito preferencialmente via WhatsApp ou telefone. Clique no ícone do WhatsApp acima ou ligue para (11) 99999-9999.'
    },
    {
      id: 'hours',
      title: 'Horários',
      isOpen: false,
      type: 'hours',
      icon: 'clock',
      content: 'Segunda a Sábado: 09:00 às 20:00\nDomingo: Fechado'
    },
    {
      id: 'location',
      title: 'Localização',
      isOpen: false,
      type: 'text',
      icon: 'map',
      content: 'Estamos na Rua das Pedras, 123 - Centro. Próximo à praça principal.'
    }
  ]);

  ngOnInit() {
    this.startLoading();
    this.generateEmbers();
    this.generateSparks();
    this.loadDynamicData();
  }

  async startLoading() {
    // Simular progresso de carregamento
    const interval = setInterval(() => {
      this.loadingProgress.update(p => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + Math.random() * 15;
      });
    }, 200);

    // Aguardar dados carregarem
    await this.loadDynamicData();
    
    // Completar progresso
    this.loadingProgress.set(100);
    
    // Remover tela de loading após animação
    setTimeout(() => {
      this.isLoading.set(false);
    }, 800);
  }

  async loadDynamicData() {
    try {
      const [profissionaisSnap, parceirosSnap, participacoesSnap, avaliacoesSnap, servicosSnap] = await Promise.all([
        getDocs(collection(this.db, 'profissionais')),
        getDocs(collection(this.db, 'parceiros')),
        getDocs(collection(this.db, 'participacoes')),
        getDocs(collection(this.db, 'avaliacoes')),
        getDocs(collection(this.db, 'servicos'))
      ]);

      const teamMembers = profissionaisSnap.docs.map(doc => {
        const data = doc.data() as { nome?: string; especialidade?: string; imagem?: string };
        return {
          name: data.nome || 'Profissional',
          specialty: data.especialidade || 'Especialidade',
          imageUrl: data.imagem || `https://picsum.photos/seed/${encodeURIComponent(data.nome || doc.id)}/200/200`
        };
      });

      const listItems = servicosSnap.docs.map(doc => {
        const data = doc.data() as { nome?: string; realiza?: boolean; preco?: number };
        const price = data.realiza && data.preco && data.preco > 0 ? `R$ ${data.preco}` : '-';
        return {
          name: data.nome || 'Serviço',
          price,
          available: data.realiza !== false
        };
      });

      const partners = parceirosSnap.docs.map(doc => {
        const data = doc.data() as { nome?: string; descricao?: string; desconto?: string; imagem?: string };
        const role = data.desconto ? `${data.desconto}% OFF` : (data.descricao || 'Parceiro');
        return {
          name: data.nome || 'Parceiro',
          role,
          imageUrl: data.imagem || `https://picsum.photos/seed/${encodeURIComponent(data.nome || doc.id)}/200/200`
        };
      });

      const projectGallery = participacoesSnap.docs.map(doc => {
        const data = doc.data() as { titulo?: string; descricao?: string; data?: string };
        return {
          title: data.titulo || 'Evento',
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(data.titulo || doc.id)}/300/300`,
          projectUrl: '#',
          date: data.data || 'Data a definir',
          location: data.descricao || 'Comunidade'
        };
      });

      const testimonials = avaliacoesSnap.docs.map(doc => {
        const data = doc.data() as { cliente?: string; comentario?: string; estrelas?: number };
        return {
          name: data.cliente || 'Cliente',
          comment: data.comentario || 'Ótimo atendimento!',
          rating: data.estrelas || 5
        };
      });

      if (teamMembers.length || partners.length || projectGallery.length || testimonials.length || listItems.length) {
        this.items.update(items => items.map(item => {
          if (item.id === 'services' && listItems.length) {
            return { ...item, listItems };
          }
          if (item.id === 'team' && teamMembers.length) {
            return { ...item, teamMembers };
          }
          if (item.id === 'partnerships' && partners.length) {
            return { ...item, partners };
          }
          if (item.id === 'projects' && projectGallery.length) {
            return { ...item, projectGallery };
          }
          if (item.id === 'feedback' && testimonials.length) {
            return { ...item, testimonials };
          }
          return item;
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do Firebase:', error);
    }
  }

  generateEmbers() {
    const emberArray: Particle[] = [];
    const count = 25; 
    
    for (let i = 0; i < count; i++) {
      emberArray.push({
        left: Math.random() * 100 + '%',
        animationDuration: (Math.random() * 5 + 5) + 's',
        animationDelay: (Math.random() * 5) + 's',
        opacity: Math.random() * 0.5 + 0.2,
        size: (Math.random() * 3 + 2) + 'px'
      });
    }
    this.embers.set(emberArray);
  }

  generateSparks() {
    const sparkArray: Particle[] = [];
    const count = 20; // Falling sparks

    for (let i = 0; i < count; i++) {
      sparkArray.push({
        left: Math.random() * 100 + '%',
        animationDuration: (Math.random() * 3 + 3) + 's', // Faster than embers
        animationDelay: (Math.random() * 5) + 's',
        opacity: Math.random() * 0.7 + 0.3,
        size: (Math.random() * 2 + 1) + 'px' // Smaller, sharper
      });
    }
    this.sparks.set(sparkArray);
  }

  toggleItem(id: string) {
    this.items.update(items => 
      items.map(item => ({
        ...item,
        isOpen: item.id === id ? !item.isOpen : false 
      }))
    );
  }

  toggleReviewForm() {
    this.showReviewForm.update(v => !v);
  }

  setReviewRating(stars: number) {
    this.newReviewRating.set(stars);
  }

  async submitReview() {
    const name = this.newReviewName().trim();
    const message = this.newReviewMessage().trim();
    const rating = this.newReviewRating();

    if (!name || !message) {
      alert('Por favor, preencha nome e comentário!');
      return;
    }

    try {
      console.log('Salvando avaliação:', { name, message, rating });
      
      // Salvar no Firestore
      const docRef = await addDoc(collection(this.db, 'avaliacoes'), {
        cliente: name,
        comentario: message,
        estrelas: rating,
        data: new Date().toLocaleDateString('pt-BR')
      });
      
      console.log('Avaliação salva com ID:', docRef.id);

      // Atualizar estado local
      this.items.update(items => {
        return items.map(item => {
          if (item.id === 'feedback' && item.testimonials) {
            return {
              ...item,
              testimonials: [
                {
                  name: name,
                  comment: message,
                  rating: rating,
                  isNew: true
                },
                ...item.testimonials
              ]
            };
          }
          return item;
        });
      });

      // Reset Form
      this.newReviewName.set('');
      this.newReviewMessage.set('');
      this.newReviewRating.set(5);
      this.showReviewForm.set(false);
      
      alert('Avaliação enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      alert('Erro ao salvar avaliação. Verifique o console.');
    }
  }

  currentYear = new Date().getFullYear();
}