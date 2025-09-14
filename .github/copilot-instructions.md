# HospLog - Dashboard Application

Este é um projeto React moderno que permite importar arquivos Excel e PDF para criar dashboards dinâmicos e interativos.

## Funcionalidades
- Upload de arquivos via drag-and-drop
- Processamento de dados de Excel, CSV e PDF
- Dashboard dinâmico e responsivo
- Interface minimalista e moderna
- Estados de carregamento e animações
- Tabelas interativas com busca e paginação
- Gráficos automáticos baseados nos dados
- Exportação de dados

## Tecnologias
- React + Vite + TypeScript
- Tailwind CSS
- Recharts para visualizações
- XLSX para processamento de Excel
- PDF.js para processamento de PDF
- React Dropzone para upload
- Lucide React para ícones

## Estrutura do Projeto
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

## Status do Projeto
✅ Projeto criado e configurado
✅ Componentes implementados
✅ Design system aplicado
✅ Funcionalidades completas