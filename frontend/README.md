# Frontend Angular - Catálogo + Carrinho

## Descrição
Aplicação Angular (SPA) que consome o backend e fornece:
- listagem de produtos com busca debounce (300ms) e paginação
- carrinho lateral com botões (+/-), subtotal e checkout
- integração com backend com tratamento de erros 409

## Tecnologias
- Angular
- RxJS
- TypeScript

---

## Como rodar

### Requisitos
- Node.js 16+
- npm ou yarn

### Instalar e rodar
```bash
npm install
npm start
```
Aplicação: `http://localhost:4200`

---

## Configuração da API
Arquivo: `src/environments/environment.ts`  
```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1'
};
```

---

## Funcionalidades
- Listar produtos com busca debounce e paginação
- Carrinho lateral com incremento/decremento de itens
- Checkout integrado ao backend
- Tratamento de erro 409 → exibe `stockErrors` e mensagem do backend
- Acessibilidade básica (`aria-label`)

---

## Estrutura relevante
- `components/product-list` → listagem
- `components/cart` → carrinho + checkout
- `services/product.service.ts` → GET products
- `services/order.service.ts` → POST order
- `services/cart.service.ts` → estado do carrinho

---

## Tratamento de erros
```ts
if (error.status === 409) {
  this.stockErrors = error.error?.details ?? [];
  this.errorMessage = error.error?.message || 'Estoque insuficiente';
}
```

---

## Verificação dos requisitos
- SPA com busca debounce ✅  
- Paginação ✅  
- Carrinho lateral com subtotal e finalizar ✅  
- Sucesso exibe ID do pedido ✅  
- Erro 409 mostra lista de indisponíveis ✅  
- Acessibilidade mínima ✅  
- README indicando configuração da API ✅  
- Uso de environment ✅  
- Cancelamento de requisições (switchMap) ⚠️ recomendado  
- Testes unitários ⚠️ recomendado  

---

## Observações
- Recomenda-se adicionar `HttpInterceptor` para tratamento global de erros.  
- Migrar busca para `switchMap` em vez de `mergeMap` para evitar race conditions.  
- Adicionar testes unitários para serviços e componentes principais.
