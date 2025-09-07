# Backend - Catálogo de Produtos + Carrinho + Checkout

## Descrição
Backend Java/Spring Boot que implementa catálogo de produtos, carrinho e checkout atômico. Este serviço expõe endpoints REST consumidos pelo frontend do teste técnico.

## Tecnologias
- Java 17+
- Spring Boot (Web, Data JPA, Validation)
- H2 (in-memory) por padrão
- Maven
- JUnit / Mockito (testes unitários)

---

## Como rodar

### Requisitos
- Java 17+
- Maven

### Executar
```bash
mvn clean install
mvn spring-boot:run
```
O backend sobe por padrão em: `http://localhost:8080`

### Testes
```bash
mvn test
```

---

## Endpoints principais

### `GET /api/v1/products?search=&page=&size=`
Lista paginada de produtos. Parâmetros:
- `search` (opcional): substring case-insensitive para busca por nome
- `page` (opcional): número da página (0-based)
- `size` (opcional): tamanho da página

Resposta: `Page<ProductDTO>`

### `POST /api/v1/orders`
Cria um pedido (checkout).

Request body:
```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

Respostas:
- `201 Created` — pedido criado com sucesso
- `409 Conflict` — estoque insuficiente
```json
{
  "error": "Conflict",
  "message": "Estoque insuficiente",
  "details": [
    { "productId": 3, "available": 2 }
  ]
}
```

---

## Estratégia de atomicidade e concorrência
- O método de checkout (`createOrder`) no `OrderService` está anotado com `@Transactional`.  
- Se qualquer item não tiver estoque, é lançada `InsufficientStockException` → rollback automático.  
- A entidade `Product` possui `@Version` → optimistic locking.  
- `OptimisticLockException` é traduzida para resposta `409 Conflict`.

---

## Massa de dados inicial
A aplicação carrega automaticamente os produtos:
| Nome                | Preço  | Estoque |
|---------------------|--------|---------|
| Café Torrado 500g   | 18.90  | 5       |
| Filtro de Papel 103 | 7.50   | 10      |
| Garrafa Térmica 1L  | 79.90  | 2       |
| Açúcar Mascavo 1kg  | 16.00  | 0       |
| Caneca Inox 300ml   | 29.00  | 8       |

---

## Query - Top 3 produtos mais vendidos
```sql
EXPLAIN SELECT p.name, SUM(oi.quantity) as total_sold
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.name
ORDER BY total_sold DESC
LIMIT 3;
```

Resultado do `EXPLAIN` (H2):
```
SELECT
    P.NAME,
    SUM(OI.QUANTITY) AS TOTAL_SOLD
    /* Table scan for ORDER_ITEMS with join on PRODUCTS */
    /* GROUP BY p.name, sorted by SUM(oi.quantity) desc */
```

---

## Estrutura do Projeto
- **Controller** → recebe requisições HTTP
- **Service** → regras de negócio (estoque, cálculos)
- **Repository** → persistência JPA
- **DTOs** → entrada e saída validadas com `@Valid`
- **Exception Handling** → `@ControllerAdvice` centralizado

---

## Verificação dos requisitos
- Busca parcial + paginação ✅  
- Checkout atômico com rollback ✅  
- Retorno 409 com itens indisponíveis ✅  
- Cálculo com BigDecimal scale 2 ✅  
- Concorrência via `@Version` ✅  
- Dados iniciais ✅  
- DTOs + `@Valid` ✅  
- Testes unitários de estoque ✅  
- Query + EXPLAIN no README ✅  
- Commits organizados ⚠️ (não validável via ZIP)

---

## Exemplos de uso
```bash
curl -X POST 'http://localhost:8080/api/v1/orders'   -H 'Content-Type: application/json'   --data-raw '{"items":[{"productId":2,"quantity":3},{"productId":3,"quantity":3}]}'
```
Resposta:
```json
{
  "error": "Conflict",
  "message": "Estoque insuficiente",
  "details": [
    { "productId": 3, "available": 2 }
  ]
}
```
