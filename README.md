# E-commerce Fullstack

## Descrição
Solução completa do teste técnico de E-commerce Fullstack:
- **Backend (Spring Boot)**: catálogo de produtos, carrinho e checkout com atomicidade e concorrência.
- **Frontend (Angular)**: SPA com listagem de produtos, busca debounce, carrinho lateral e checkout.

Repositório: https://github.com/maiandreh/ecommerce-fullstack

---

## Estrutura
- `backend/` → Java Spring Boot
- `frontend/` → Angular

---

## Como rodar

### Backend
```bash
cd backend
mvn spring-boot:run
```
Servidor: `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm start
```
Aplicação: `http://localhost:4200`

---

## Resumo dos requisitos atendidos
- Produtos com busca + paginação ✅  
- Checkout atômico + rollback ✅  
- Erro 409 com indisponíveis ✅  
- Frontend consumindo API e exibindo mensagens ✅  
- Massa inicial de dados ✅  
- Query SQL top 3 + EXPLAIN ✅  
- README detalhados ✅  

---

## Observações finais
- Backend já popula produtos de exemplo.  
- Frontend configura URL em `src/environments/environment.ts`.  
- Para produção, ajuste `application.properties` no backend e `environment.prod.ts` no frontend.  
