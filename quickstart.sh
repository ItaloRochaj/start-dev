#!/bin/bash
# Quickstart - Iniciar a aplicação com backend e frontend

# CORES PARA OUTPUT
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens
print_header() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Menu
print_header "START SYSTEM - QUICKSTART"

echo ""
echo "Escolha uma opção:"
echo ""
echo "1) Iniciar tudo (Backend + Frontend)"
echo "2) Iniciar apenas Backend"
echo "3) Iniciar apenas Frontend"
echo "4) Verificar pré-requisitos"
echo "5) Instalar dependências"
echo "6) Executar testes"
echo "7) Sair"
echo ""

read -p "Opção: " option

case $option in
  1)
    print_header "Iniciando Backend e Frontend"

    # Verificar se está no diretório correto
    if [ ! -d "start-back-dev" ] || [ ! -d "start-dev" ]; then
      print_error "Diretórios não encontrados. Execute o script na pasta pai de start-back-dev e start-dev"
      exit 1
    fi

    # Backend
    print_info "Iniciando Backend em http://localhost:8080..."
    cd start-back-dev
    mvn spring-boot:run > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    print_success "Backend iniciado (PID: $BACKEND_PID)"

    # Aguardar backend iniciar
    sleep 5

    # Frontend
    print_info "Iniciando Frontend em http://localhost:4200..."
    cd ../start-dev
    npm start > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!
    print_success "Frontend iniciado (PID: $FRONTEND_PID)"

    echo ""
    print_success "Aplicação iniciada!"
    echo ""
    echo "📍 URLs:"
    echo "   Backend:  http://localhost:8080"
    echo "   Frontend: http://localhost:4200"
    echo ""
    echo "🔍 Logs:"
    echo "   Backend:  tail -f /tmp/backend.log"
    echo "   Frontend: tail -f /tmp/frontend.log"
    echo ""
    echo "⏹  Para parar:"
    echo "   kill $BACKEND_PID  (Backend)"
    echo "   kill $FRONTEND_PID (Frontend)"
    ;;

  2)
    print_header "Iniciando Backend"

    if [ ! -d "start-back-dev" ]; then
      print_error "Diretório start-back-dev não encontrado"
      exit 1
    fi

    cd start-back-dev
    print_info "Verificando Maven..."

    if ! command -v mvn &> /dev/null; then
      print_error "Maven não encontrado. Instale Maven primeiro."
      exit 1
    fi

    print_success "Iniciando Backend..."
    mvn spring-boot:run
    ;;

  3)
    print_header "Iniciando Frontend"

    if [ ! -d "start-dev" ]; then
      print_error "Diretório start-dev não encontrado"
      exit 1
    fi

    cd start-dev
    print_info "Verificando dependências Node.js..."

    if ! command -v npm &> /dev/null; then
      print_error "Node.js/npm não encontrado. Instale primeiro."
      exit 1
    fi

    if [ ! -d "node_modules" ]; then
      print_warning "node_modules não encontrado. Instalando..."
      npm install
    fi

    print_success "Iniciando Frontend..."
    npm start
    ;;

  4)
    print_header "Verificando Pré-requisitos"

    # Java
    echo ""
    print_info "Verificando Java..."
    if command -v java &> /dev/null; then
      java_version=$(java -version 2>&1 | head -n 1)
      print_success "Java instalado: $java_version"
    else
      print_error "Java não encontrado. Instale Java 17 ou superior."
    fi

    # Maven
    echo ""
    print_info "Verificando Maven..."
    if command -v mvn &> /dev/null; then
      mvn_version=$(mvn -version | head -n 1)
      print_success "Maven instalado: $mvn_version"
    else
      print_error "Maven não encontrado. Instale Maven."
    fi

    # Node.js
    echo ""
    print_info "Verificando Node.js..."
    if command -v node &> /dev/null; then
      node_version=$(node -v)
      print_success "Node.js instalado: $node_version"
    else
      print_error "Node.js não encontrado. Instale Node.js."
    fi

    # npm
    echo ""
    print_info "Verificando npm..."
    if command -v npm &> /dev/null; then
      npm_version=$(npm -v)
      print_success "npm instalado: v$npm_version"
    else
      print_error "npm não encontrado."
    fi

    # Angular CLI
    echo ""
    print_info "Verificando Angular CLI..."
    if npm list -g @angular/cli > /dev/null 2>&1; then
      ng_version=$(npm list -g @angular/cli | head -n 1)
      print_success "Angular CLI instalado: $ng_version"
    else
      print_warning "Angular CLI não encontrado globalmente (opcional)"
    fi
    ;;

  5)
    print_header "Instalando Dependências"

    # Backend
    echo ""
    print_info "Backend: Maven usará pom.xml (sem ação necessária)"
    print_success "Backend pronto"

    # Frontend
    echo ""
    print_info "Instalando dependências do Frontend..."
    if [ ! -d "start-dev" ]; then
      print_error "Diretório start-dev não encontrado"
      exit 1
    fi

    cd start-dev
    npm install
    print_success "Dependências do Frontend instaladas"
    ;;

  6)
    print_header "Executando Testes"

    # Testes Backend
    echo ""
    print_info "Executando testes do Backend..."
    if [ -d "start-back-dev" ]; then
      cd start-back-dev
      mvn test
      cd ..
    fi

    # Testes Frontend
    echo ""
    print_info "Executando testes do Frontend..."
    if [ -d "start-dev" ]; then
      cd start-dev
      npm test
    fi
    ;;

  7)
    print_info "Saindo..."
    exit 0
    ;;

  *)
    print_error "Opção inválida"
    exit 1
    ;;
esac

echo ""
print_success "Operação concluída!"
