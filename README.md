# 🎓 Start Students - Frontend

Uma aplicação Angular moderna e responsiva para gerenciamento de estudantes com interface intuitiva, autenticação segura e funcionalidades completas de CRUD. Construída com **Angular 8**, **TypeScript** e integrada com a **API REST Start Students**.

<p>
  <a href="https://angular.io/"><img alt="Angular" src="https://img.shields.io/badge/Angular-8-DD0031?logo=angular&logoColor=white" /></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3.5-3178C6?logo=typescript&logoColor=white" /></a>
  <a href="https://nodejs.org/"><img alt="Node.js" src="https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white" /></a>
  <a href="https://www.npmjs.com/"><img alt="npm" src="https://img.shields.io/badge/npm-8+-CB3837?logo=npm&logoColor=white" /></a>
  <a href="https://rxjs.dev/"><img alt="RxJS" src="https://img.shields.io/badge/RxJS-6.4-EB2E49?logo=reactivex&logoColor=white" /></a>
  <a href="https://jwt.io/"><img alt="JWT" src="https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white" /></a>
  <a href="https://jasmine.github.io/"><img alt="Jasmine" src="https://img.shields.io/badge/Jasmine-Tests-8A4182?logo=jasmine&logoColor=white" /></a>
</p>

---

## 📋 Índice

- [🎯 Visão Geral](#-visão-geral)
- [📸 Screenshots](#-screenshots)
- [🏗️ Arquitetura](#-arquitetura)
- [🔧 Tecnologias](#-tecnologias)
- [🚀 Como Executar](#-como-executar)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🎨 Design & UI](#-design--ui)
- [🔐 Autenticação](#-autenticação)
- [🧪 Testes](#-testes)
- [📚 Documentação](#-documentação)
- [👨🏻‍💻 Autor](#-autor)

---

## 🎯 Visão Geral

**Start Students Frontend** é uma SPA (Single Page Application) para gerenciar estudantes com:

✅ **Interface Responsiva** — Funciona perfeitamente em desktop, tablet e mobile  
✅ **Autenticação JWT** — Login seguro com tokens Bearer  
✅ **Paginação Inteligente** — 4 registros por página com navegação fluida  
✅ **Busca Avançada** — Filtros por nome e matrícula  
✅ **CRUD Completo** — Criar, visualizar, editar e deletar estudantes  
✅ **Modais Interativos** — Experiência fluida com modals elegantes  
✅ **Notificações Toast** — Feedback visual para ações do usuário  
✅ **Guards de Rota** — Proteção de rotas autenticadas  

---

## 📸 Screenshots

### 📱 Tela Principal - Listagem de Estudantes
Visualização em tabela com paginação de 4 registros por página, botões de ação (visualizar, editar, deletar) e busca.

### 📱 Paginação
Navegação entre páginas com números (1, 2, 3...) e setas, destacando a página ativa em vermelho.

### 📱 Modal de Novo Aluno
Formulário modal para criar novo estudante com campos: nome, CPF, email e telefone.

### 📱 Modal de Edição
Edição inline de dados do estudante com validação em tempo real.

### 📱 Confirmação de Exclusão
Modal elegante para confirmar a exclusão de um estudante.

---

## 🏗️ Arquitetura

A aplicação segue uma arquitetura de **componentes** com padrão **Smart/Dumb Components**:

```
┌────────────────────────────────────────────────────────┐
│              AppComponent (Smart)                      │
│              app-routing.module.ts                    │
└────────────┬─────────────────────────────┬────────────┘
             │                             │
    ┌────────▼────────┐         ┌─────────▼──────────┐
    │  LoginComponent  │         │ StudentsComponent  │
    │    (Smart)      │         │    (Smart)         │
    └─────────────────┘         └────────┬────────────┘
                                         │
                    ┌────────────────────┼─────────────────┐
                    │                    │                 │
              ┌─────▼─────┐     ┌────────▼──────┐   ┌──────▼─────┐
              │ NewStudent │     │EditStudent    │   │   Delete   │
              │ Component  │     │  Component    │   │Confirmation│
              └────────────┘     └───────────────┘   └────────────┘
                    │                    │                 │
                    └────────────────────┼─────────────────┘
                                         │
                        ┌────────────────▼──────────────┐
                        │      Services Layer           │
                        │  ├─ StudentsService          │
                        │  ├─ AuthService              │
                        │  ├─ JwtInterceptor           │
                        │  └─ ToastService             │
                        └──────────────────────────────┘
                                         │
                        ┌────────────────▼──────────────┐
                        │      API Layer                │
                        │  Start Students Backend API   │
                        │  (http://localhost:8080/api)  │
                        └──────────────────────────────┘
```

---

## 🔧 Tecnologias

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| **Framework** | Angular | 8 |
| **Linguagem** | TypeScript | 3.5 |
| **Package Manager** | npm | 8+ |
| **Runtime** | Node.js | 20+ |
| **HTTP Client** | HttpClientModule | Built-in |
| **State Management** | RxJS | 6.4 |
| **Forms** | Reactive Forms | Built-in |
| **Routing** | Angular Router | 8 |
| **Testes** | Jasmine + Karma | 3.8+ |
| **Build Tool** | Angular CLI | 8.3 |

---

## 🚀 Como Executar

### 📦 Pré-requisitos

- **Node.js 20+** — [Download](https://nodejs.org/)
- **npm 8+** — Incluso no Node.js
- **Angular CLI 8** — `npm install -g @angular/cli@8`
- **Backend API rodando** — Veja [start-back-dev](../start-back-dev)

### 🐱‍🏍 Início Rápido

```bash
# 1. Clonar repositório
git clone https://github.com/ItaloRochaj/start-dev.git
cd start-dev

# 2. Instalar dependências
npm install

# 3. Configurar URL da API (opcional)
# Edite src/environments/environment.ts
# apiUrl: 'http://localhost:8080/api'

# 4. Iniciar servidor de desenvolvimento
npm start

# ✅ Aplicação em http://localhost:4200
```

### 📦 Instalação Passo a Passo

#### Passo 1: Instalar Dependências

```bash
npm install
```

Se houver problemas de compatibilidade:
```bash
npm install --legacy-peer-deps
```

#### Passo 2: Configurar Ambiente

Edite `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'  // URL do backend
};
```

Para produção, edite `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.seu-dominio.com/api'
};
```

#### Passo 3: Iniciar Servidor de Desenvolvimento

```bash
# Opção 1: npm start
npm start

# Opção 2: ng serve
ng serve

# Opção 3: Com reload automático
ng serve --poll 2000
```

Acesse `http://localhost:4200`

#### Passo 4: Build para Produção

```bash
# Build otimizado
npm run build

# Os arquivos compilados estarão em dist/
```

---

## 📁 Estrutura do Projeto

```
start-dev/
├── src/
│   ├── app/
│   │   ├── app-routing.module.ts        # Rotas da aplicação
│   │   ├── app.component.ts             # Componente raiz
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   ├── app.module.ts                # Módulo principal
│   │   │
│   │   ├── login/                       # Feature Module - Login
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   ├── login.component.css
│   │   │   └── login.component.spec.ts
│   │   │
│   │   ├── students/                    # Feature Module - Estudantes
│   │   │   ├── students.component.ts
│   │   │   ├── students.component.html
│   │   │   ├── students.component.css
│   │   │   ├── students.component.spec.ts
│   │   │   │
│   │   │   └── subcomponentes/
│   │   │       ├── new-student/
│   │   │       │   ├── new-student.component.ts
│   │   │       │   ├── new-student.component.html
│   │   │       │   └── new-student.component.css
│   │   │       │
│   │   │       ├── edit-student/
│   │   │       │   ├── edit-student.component.ts
│   │   │       │   ├── edit-student.component.html
│   │   │       │   └── edit-student.component.css
│   │   │       │
│   │   │       ├── student-details/
│   │   │       │   ├── student-details.component.ts
│   │   │       │   ├── student-details.component.html
│   │   │       │   └── student-details.component.css
│   │   │       │
│   │   │       ├── delete-confirmation/
│   │   │       │   ├── delete-confirmation.component.ts
│   │   │       │   ├── delete-confirmation.component.html
│   │   │       │   └── delete-confirmation.component.css
│   │   │       │
│   │   │       └── toast/
│   │   │           ├── toast.component.ts
│   │   │           ├── toast.component.html
│   │   │           └── toast.component.css
│   │   │
│   │   ├── services/                    # Serviços
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.spec.ts
│   │   │   ├── students.service.ts
│   │   │   ├── students.service.spec.ts
│   │   │   └── toast.service.ts
│   │   │
│   │   ├── guards/                      # Guards de Rota
│   │   │   └── auth.guard.ts
│   │   │
│   │   ├── interceptors/                # HTTP Interceptors
│   │   │   └── jwt.interceptor.ts
│   │   │
│   │   └── components/                  # Componentes Compartilhados
│   │       └── toast/
│   │
│   ├── assets/                          # Arquivos estáticos
│   │   ├── default-avatar.svg
│   │   └── placeholder-photo.svg
│   │
│   ├── environments/                    # Configurações de ambiente
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── index.html                       # HTML raiz
│   ├── main.ts                          # Bootstrap
│   ├── styles.css                       # Estilos globais
│   ├── test.ts                          # Setup de testes
│   └── polyfills.ts                     # Polyfills para compatibilidade
│
├── e2e/                                 # Testes E2E (Protractor)
│   ├── src/
│   │   ├── app.e2e-spec.ts
│   │   └── app.po.ts
│   ├── protractor.conf.js
│   └── tsconfig.json
│
├── angular.json                         # Configurações Angular CLI
├── package.json                         # Dependências npm
├── tsconfig.json                        # Configurações TypeScript
├── tsconfig.app.json
├── tsconfig.spec.json
├── tslint.json                          # Linter rules
├── karma.conf.js                        # Configuração de testes
└── README.md                            # Este arquivo
```

---

## 🎨 Design & UI

### 🎨 Cores Principais

- **Vermelho Primário:** `#dc3545` — Botões de ação, página ativa
- **Azul Secundário:** `#6081dd` — Links, botões secundários
- **Cinza:** `#f5f5f5` — Background
- **Verde:** `#d4edda` — Status ativo
- **Cinza Claro:** `#e9ecef` — Status inativo

### 📐 Layout

- **Responsivo:** Mobile-first com breakpoints em 768px e 480px
- **Grid System:** Flexbox para posicionamento
- **Tipografia:** Sistema de escalas com font-weight consistente
- **Espaçamento:** Grid de 8px para consistência

### 🎛️ Componentes Principais

**Tabela de Estudantes**
- Colunas: Matrícula, Nome, Status, Ações
- Paginação: 4 registros por página
- Hover: Background azul claro
- Ações: Visualizar, Editar, Deletar

**Modais**
- Overlay com fade-in
- Slide-up animation
- Fechamento ao clicar fora

**Paginação**
- Números 1-5 visíveis
- Página ativa em vermelho
- Setas desabilitadas em extremos

---

## 🔐 Autenticação

### Fluxo de Login

```
1. Usuário insere email/senha
     ↓
2. AuthService.login() envia POST /api/auth/login
     ↓
3. Backend retorna JWT token
     ↓
4. Token armazenado em localStorage
     ↓
5. JwtInterceptor adiciona token em cada requisição
     ↓
6. AuthGuard protege rotas
```

### Código de Exemplo

```typescript
// auth.service.ts
login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
  return this.http.post<ApiResponse<AuthResponse>>(
    `${this.apiUrl}/auth/login`,
    { email, password }
  ).pipe(
    tap(response => {
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
    })
  );
}

// jwt.interceptor.ts
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = localStorage.getItem('auth_token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(req);
}

// auth.guard.ts
canActivate(): boolean {
  return !!localStorage.getItem('auth_token');
}
```

---

## 🧪 Testes

### Executar Testes Unitários

```bash
# Todos os testes
npm test

# Teste específico
npm test -- --include='**/students.component.spec.ts'

# Com coverage
npm test -- --code-coverage
```

### Estrutura de Testes

```typescript
describe('StudentsComponent', () => {
  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;
  let studentsService: StudentsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentsComponent ],
      providers: [ StudentsService ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
    studentsService = TestBed.inject(StudentsService);
    fixture.detectChanges();
  });

  it('should load students on init', () => {
    spyOn(studentsService, 'getStudents').and.returnValue(
      of({ data: { content: [] } })
    );
    component.ngOnInit();
    expect(component.students).toEqual([]);
  });
});
```

### Testes E2E

```bash
# Protractor E2E tests
npm run e2e
```

---

## 📚 Documentação

### Guias

- **[Configuração de Ambiente](./docs/ENVIRONMENT_SETUP.md)** — Variáveis e configurações
- **[Integração com Backend](./docs/BACKEND_INTEGRATION.md)** — Como conectar com API
- **[Componentes Customizados](./docs/CUSTOM_COMPONENTS.md)** — Guia de criação

### Comandos Úteis

```bash
# Gerar novo componente
ng generate component students/novo-componente

# Gerar novo serviço
ng generate service services/novo-servico

# Gerar novo guard
ng generate guard guards/novo-guard

# Servir com livereload
ng serve --live-reload

# Build com análise
ng build --analyze-bundle
```

---

## 🚨 Troubleshooting

### ❌ Erro: "Cannot find module '@angular/core'"

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Erro: "404 Not Found" ao chamar API

**Solução:** Certifique-se que o backend está rodando em `http://localhost:8080`
e que `environment.apiUrl` está configurado corretamente.

### ❌ Token JWT expirado

**Solução:** O token é armazenado em `localStorage`. Para forçar novo login:
```javascript
localStorage.removeItem('auth_token');
location.reload();
```

### ❌ Erro CORS

**Solução:** O backend deve ter CORS configurado para aceitar requisições de `http://localhost:4200`.

---

## 📈 Roadmap

- [ ] Adicionar filtros avançados
- [ ] Exportar dados em CSV/PDF
- [ ] Modo dark
- [ ] Progredientres/atalhos de teclado
- [ ] Integração com Google Auth
- [ ] Notificações em tempo real (WebSocket)

---

## 👨🏻‍💻 Autor

**Italo Rocha**

- GitHub: [@ItaloRochaj](https://github.com/ItaloRochaj)
- LinkedIn: [Italo Rocha](https://www.linkedin.com/in/italorocha/)

---

## 📄 Licença

Este projeto é distribuído sob a licença MIT.

---

**Versão:** 1.0.0 | **Última atualização:** January 2026
