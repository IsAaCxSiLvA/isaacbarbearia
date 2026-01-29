import { Component, signal, OnInit, NgZone } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';

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
  styleUrls: []
})
export class AppComponent implements OnInit {
  constructor(private ngZone: NgZone) {}

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
  private hasLoadingStarted = false; // Guard para só rodar uma vez
  
  // Agendamento
  whatsappLink = signal('https://wa.me/5585999999999');
  whatsappNumber = signal('(85) 99999-9999');
  telefoneLink = signal('tel:5585999999999');
  telefoneNumber = signal('(85) 99999-9999');
  agendamentoInfo = signal('O agendamento é feito preferencialmente via WhatsApp ou telefone.');
  
  // Localização
  localizacaoEndereco = signal('Rua das Pedras, 123');
  localizacaoBairro = signal('Centro');
  localizacaoCidade = signal('Fortaleza - CE');
  localizacaoReferencia = signal('Próximo à praça principal');
  googleMapsLink = signal('#');
  
  // Horários
  horariosSegSex = signal('09:00 às 20:00');
  horariosSabado = signal('09:00 às 18:00');
  horariosDomingo = signal('Fechado');
  
  locationLink = signal('#');
  
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
      title: 'Profissionais',
      isOpen: false,
      type: 'team',
      icon: 'users',
      teamMembers: []
    },
    {
      id: 'projects',
      title: 'Participação Comunitária',
      isOpen: false,
      type: 'projects',
      icon: 'image',
      projectGallery: []
    },
    {
      id: 'partnerships',
      title: 'Parcerias',
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
      title: 'Avaliações',
      isOpen: false,
      type: 'feedback',
      icon: 'star',
      testimonials: []
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
    if (!this.hasLoadingStarted) {
      this.hasLoadingStarted = true;
      this.startLoading();
    }
    this.generateEmbers();
    this.generateSparks();
  }

  async startLoading() {
    // Versão SUPER SIMPLES: só espera 12 segundos e esconde
    this.isLoading.set(true);
    this.loadingProgress.set(0);
    
    // Animar progresso
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.83; // ~0.83% a cada 100ms = 100% em 12 segundos
      if (progress <= 100) {
        this.loadingProgress.set(progress);
      }
    }, 100);
    
    // Carregar dados em background
    this.loadDynamicData();
    
    // Esperar 12 segundos GARANTIDOS
    setTimeout(() => {
      clearInterval(interval);
      this.loadingProgress.set(100);
      
      // Esconder depois de mais 500ms
      setTimeout(() => {
        this.isLoading.set(false);
      }, 500);
    }, 12000);
  }

  async loadDynamicData() {
    try {
      const [profissionaisSnap, parceirosSnap, participacoesSnap, avaliacoesSnap, servicosSnap, agendamentoSnap, localizacaoSnap, horariosSnap] = await Promise.all([
        getDocs(collection(this.db, 'profissionais')),
        getDocs(collection(this.db, 'parceiros')),
        getDocs(collection(this.db, 'participacoes')),
        getDocs(collection(this.db, 'avaliacoes')),
        getDocs(collection(this.db, 'servicos')),
        getDoc(doc(this.db, 'config', 'agendamento')),
        getDoc(doc(this.db, 'config', 'localizacao')),
        getDoc(doc(this.db, 'config', 'horarios'))
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
        const data = doc.data() as { nome?: string; imagem?: string };
        return {
          name: data.nome || 'Parceiro',
          role: '',
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

      // Carregar dados de agendamento
      if (agendamentoSnap.exists()) {
        const agendamentoData = agendamentoSnap.data() as { whatsapp?: string; telefone?: string; info?: string };
        
        if (agendamentoData.whatsapp) {
          const numeroWhats = agendamentoData.whatsapp.replace(/\D/g, '');
          this.whatsappLink.set(`https://wa.me/${numeroWhats}`);
          this.whatsappNumber.set(agendamentoData.whatsapp);
        }
        
        if (agendamentoData.telefone) {
          const numeroTel = agendamentoData.telefone.replace(/\D/g, '');
          this.telefoneLink.set(`tel:${numeroTel}`);
          this.telefoneNumber.set(agendamentoData.telefone);
        }
        
        if (agendamentoData.info) {
          this.agendamentoInfo.set(agendamentoData.info);
        }
      }

      // Carregar dados de localização
      if (localizacaoSnap.exists()) {
        const locData = localizacaoSnap.data() as { endereco?: string; bairro?: string; cidade?: string; referencia?: string };
        
        if (locData.endereco) this.localizacaoEndereco.set(locData.endereco);
        if (locData.bairro) this.localizacaoBairro.set(locData.bairro);
        if (locData.cidade) this.localizacaoCidade.set(locData.cidade);
        if (locData.referencia) this.localizacaoReferencia.set(locData.referencia);
        
        // Gerar link do Google Maps
        const enderecoCompleto = `${locData.endereco || ''}, ${locData.bairro || ''}, ${locData.cidade || ''}`;
        const encodedAddress = encodeURIComponent(enderecoCompleto);
        this.googleMapsLink.set(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
      }

      // Carregar dados de horários
      if (horariosSnap.exists()) {
        const horData = horariosSnap.data() as { segSex?: string; sabado?: string; domingo?: string };
        
        if (horData.segSex) this.horariosSegSex.set(horData.segSex);
        if (horData.sabado) this.horariosSabado.set(horData.sabado);
        if (horData.domingo) this.horariosDomingo.set(horData.domingo);
      }

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
      } else {
        // Se não houver dados do Firebase, limpar os padrões
        this.items.update(items => items.map(item => {
          if (item.id === 'services') return { ...item, listItems: [] };
          if (item.id === 'team') return { ...item, teamMembers: [] };
          if (item.id === 'partnerships') return { ...item, partners: [] };
          if (item.id === 'projects') return { ...item, projectGallery: [] };
          if (item.id === 'feedback') return { ...item, testimonials: [] };
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