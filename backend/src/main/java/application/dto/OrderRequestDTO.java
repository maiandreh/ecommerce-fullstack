package application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class OrderRequestDTO {

    @NotEmpty(message = "Lista de itens não pode estar vazia")
    @Valid
    private List<OrderItemRequestDTO> items;

    public OrderRequestDTO() {}

    public OrderRequestDTO(List<OrderItemRequestDTO> items) {
        this.items = items;
    }

    public List<OrderItemRequestDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequestDTO> items) {
        this.items = items;
    }

    @Override
    public String toString() {
        return "OrderRequestDTO{" +
                "items=" + items +
                '}';
    }
}

