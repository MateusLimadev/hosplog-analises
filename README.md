# HospLog Dashboard

Uma aplicação React moderna e minimalista que transforma arquivos Excel, PDF e CSV em dashboards dinâmicos e interativos.

## ✨ Características

- 📁 **Upload via Drag & Drop**: Interface intuitiva para importação de arquivos
- 📊 **Visualizações Automáticas**: Gráficos gerados automaticamente baseados nos dados
- 📋 **Tabelas Interativas**: Navegação, busca e exportação de dados
- 🎨 **Design Minimalista**: Interface limpa e moderna com Tailwind CSS
- ⚡ **Processamento Rápido**: Performance otimizada com Vite
- 🔄 **Estados de Loading**: Spinners e animações para melhor UX

## 🚀 Tecnologias Utilizadas

- **React 18** + **TypeScript**
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Framework CSS utilitário
- **Recharts** - Biblioteca de gráficos para React
- **XLSX** - Processamento de arquivos Excel
- **PDF.js** - Processamento de arquivos PDF
- **React Dropzone** - Upload de arquivos via drag & drop
- **Lucide React** - Ícones modernos

## 📋 Funcionalidades

### Upload de Arquivos
- Suporte para Excel (.xlsx, .xls)
- Suporte para CSV (.csv)
- Suporte para PDF (.pdf)
- Validação automática de tipos
- Interface drag & drop responsiva

### Dashboard Dinâmico
- **Resumo**: Métricas e estatísticas dos dados
- **Gráficos**: Visualizações automáticas (barras, linhas, pizza)
- **Tabelas**: Dados tabulares com busca e paginação

### Recursos Avançados
- Exportação para CSV
- Busca em tempo real
- Paginação de dados
- Adaptação automática ao tipo de dados
- Estados de carregamento e erro

## 🛠️ Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute em modo desenvolvimento:
```bash
npm run dev
```

3. Acesse no navegador:
```
http://localhost:5173
```

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

## 🎯 Como Usar

1. **Upload**: Arraste um arquivo Excel, CSV ou PDF para a área de upload
2. **Processamento**: Aguarde o processamento automático dos dados
3. **Exploração**: Navegue pelas abas Resumo, Gráficos e Tabelas
4. **Interação**: Use filtros, busca e exportação conforme necessário

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── FileUpload.tsx   # Upload de arquivos
│   ├── LoadingSpinner.tsx # Componente de loading
│   ├── DashboardSummary.tsx # Resumo dos dados
│   ├── DashboardCharts.tsx # Visualizações gráficas
│   └── DashboardTables.tsx # Tabelas interativas
├── utils/               # Utilitários
│   └── fileProcessor.ts # Processamento de arquivos
├── App.tsx             # Componente principal
├── main.tsx           # Ponto de entrada
└── index.css          # Estilos globais
```

## 🎨 Design System

A aplicação utiliza um design system consistente com:
- Paleta de cores harmoniosa (tons de azul como primária)
- Tipografia moderna e legível
- Espaçamentos consistentes
- Animações suaves e não intrusivas
- Componentes reutilizáveis

Transforme seus dados em insights poderosos com HospLog Dashboard!
