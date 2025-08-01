import { Component } from '@angular/core';
import { FRASES_BIBLICAS } from '../../data/frases';
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent {
  gruposDeFrases: string[][] = [];
  editandoFrases: boolean[][] = [];
  textosEditando: string[][] = [];
  logoDataUrl: string | null = null;
  backgroundColors: string[] = [];
  grupoSelecionado = 0;
  fontColors: string[] = [];

  ngOnInit() {
    this.carregarDoLocalStorage();

    // Se não havia nada salvo, carregar padrão do FRASES_BIBLICAS
    if (this.gruposDeFrases.length === 0) {
      for (let i = 0; i < FRASES_BIBLICAS.length; i += 18) {
        const grupo = FRASES_BIBLICAS.slice(i, i + 18);
        this.gruposDeFrases.push(grupo);
        this.editandoFrases.push(new Array(grupo.length).fill(false));
        this.textosEditando.push([...grupo]);
        this.backgroundColors.push('#ffffff');
        this.fontColors.push('#9A7E48'); 
      }
    }
  }


  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoDataUrl = reader.result as string;
      this.salvarNoLocalStorage();
    };
    reader.readAsDataURL(file);
  }

  toggleEdicao(grupoIndex: number, fraseIndex: number): void {
    this.editandoFrases[grupoIndex][fraseIndex] = true;
  }

  salvarFrase(grupoIndex: number, fraseIndex: number): void {
    this.gruposDeFrases[grupoIndex][fraseIndex] = this.textosEditando[grupoIndex][fraseIndex];
    this.editandoFrases[grupoIndex][fraseIndex] = false;
    this.salvarNoLocalStorage();
  }


  adicionarNovaFolha(): void {
    const novaFolha = new Array(18).fill('');
    this.gruposDeFrases.push(novaFolha);
    this.editandoFrases.push(new Array(18).fill(false));
    this.textosEditando.push([...novaFolha]);
    this.backgroundColors.push('#ffffff');
    this.fontColors.push('#9A7E48');
    this.salvarNoLocalStorage();
  }

  removerFolhaSelecionada(): void {
    const index = this.grupoSelecionado;
    if (index >= 0 && index < this.gruposDeFrases.length) {
      this.gruposDeFrases.splice(index, 1);
      this.editandoFrases.splice(index, 1);
      this.textosEditando.splice(index, 1);
      this.backgroundColors.splice(index, 1);
      this.fontColors.splice(index, 1);
      this.salvarNoLocalStorage();

      // Ajustar grupo selecionado
      if (this.grupoSelecionado >= this.gruposDeFrases.length) {
        this.grupoSelecionado = this.gruposDeFrases.length - 1;
      }
    }
  }

  baixarFolhasComoImagens(): void {
    const folhas = document.querySelectorAll('.folha');

    folhas.forEach(async (folha, index) => {
      // Esconder botões de edição
      const botoes = folha.querySelectorAll('.edit-btn');
      botoes.forEach(btn => (btn as HTMLElement).style.display = 'none');

      // Captura com html2canvas
      const canvas = await html2canvas(folha as HTMLElement, {
        backgroundColor: null,
        scale: 2 // melhor resolução
      });

      // Restaurar visibilidade dos botões
      botoes.forEach(btn => (btn as HTMLElement).style.display = '');

      // Criar link para download
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 1.0);
      link.download = `pagina-${index + 1}.jpeg`;
      link.click();
    });
  }

  salvarNoLocalStorage(): void {
    const dados = {
      gruposDeFrases: this.gruposDeFrases,
      textosEditando: this.textosEditando,
      backgroundColors: this.backgroundColors,
      fontColors: this.fontColors,
      logoDataUrl: this.logoDataUrl,
    };
    localStorage.setItem('folhasData', JSON.stringify(dados));
  }

  carregarDoLocalStorage(): void {
    const dadosSalvos = localStorage.getItem('folhasData');
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        this.gruposDeFrases = dados.gruposDeFrases || [];
        this.textosEditando = dados.textosEditando || [];
        this.backgroundColors = dados.backgroundColors || [];
        this.fontColors = dados.fontColors || [];
        this.logoDataUrl = dados.logoDataUrl || null;

        // Gerar estrutura de edição para cada grupo
        this.editandoFrases = this.gruposDeFrases.map(grupo => new Array(grupo.length).fill(false));
      } catch (e) {
        console.error('Erro ao carregar dados do localStorage:', e);
      }
    }
  }

  resetarTudo(): void {
    if (!confirm('Tem certeza que deseja resetar tudo para o padrão?')) return;

    localStorage.removeItem('folhasData');

    // Resetar os dados
    this.gruposDeFrases = [];
    this.editandoFrases = [];
    this.textosEditando = [];
    this.backgroundColors = [];
    this.fontColors = [];
    this.logoDataUrl = null;
    this.grupoSelecionado = 0;

    for (let i = 0; i < FRASES_BIBLICAS.length; i += 18) {
      const grupo = FRASES_BIBLICAS.slice(i, i + 18);
      this.gruposDeFrases.push(grupo);
      this.editandoFrases.push(new Array(grupo.length).fill(false));
      this.textosEditando.push([...grupo]);
      this.backgroundColors.push('#ffffff');
      this.fontColors.push('#9A7E48');
    }

    this.salvarNoLocalStorage();
  }

}