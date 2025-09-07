package application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponseDTO {
    private Long id;
    private LocalDateTime createdAt;
    private BigDecimal total;
    private List<OrderItemResponseDTO> items;

    public OrderResponseDTO() {}

    public OrderResponseDTO(Long id, LocalDateTime createdAt, BigDecimal total, List<OrderItemResponseDTO> items) {
        this.id = id;
        this.createdAt = createdAt;
        this.total = total;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public List<OrderItemResponseDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponseDTO> items) {
        this.items = items;
    }

    @Override
    public String toString() {
        return "OrderResponseDTO{" +
                "id=" + id +
                ", createdAt=" + createdAt +
                ", total=" + total +
                ", items=" + items +
                '}';
    }
}

