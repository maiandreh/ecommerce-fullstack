package application.service;

import application.dto.*;
import application.entity.Order;
import application.entity.OrderItem;
import application.entity.Product;
import application.repository.OrderRepository;
import application.repository.ProductRepository;
import application.exception.InsufficientStockException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO orderRequest) {
        List<StockErrorDTO> stockErrors = validateStock(orderRequest.getItems());
        if (!stockErrors.isEmpty()) {
            throw new InsufficientStockException(stockErrors);
        }

        Order order = new Order();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequestDTO itemRequest : orderRequest.getItems()) {
            Optional<Product> productOpt = productRepository.findById(itemRequest.getProductId());
            if (productOpt.isEmpty()) {
                throw new RuntimeException("Produto não encontrado: " + itemRequest.getProductId());
            }

            Product product = productOpt.get();
            
            if (product.getStock() < itemRequest.getQuantity()) {
                List<StockErrorDTO> errors = new ArrayList<>();
                errors.add(new StockErrorDTO(product.getId(), product.getStock()));
                throw new InsufficientStockException(errors);
            }

            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
                                           .setScale(2, RoundingMode.HALF_EVEN);
            
            OrderItem orderItem = new OrderItem(product, itemRequest.getQuantity(), unitPrice);
            orderItem.setLineTotal(lineTotal);
            order.addItem(orderItem);

            total = total.add(lineTotal);
        }

        order.setTotal(total.setScale(2, RoundingMode.HALF_EVEN));
        Order savedOrder = orderRepository.save(order);

        return convertToResponseDTO(savedOrder);
    }

    private List<StockErrorDTO> validateStock(List<OrderItemRequestDTO> items) {
        List<StockErrorDTO> errors = new ArrayList<>();

        for (OrderItemRequestDTO item : items) {
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                if (product.getStock() < item.getQuantity()) {
                    errors.add(new StockErrorDTO(product.getId(), product.getStock()));
                }
            }
        }

        return errors;
    }

    private OrderResponseDTO convertToResponseDTO(Order order) {
        List<OrderItemResponseDTO> itemDTOs = order.getItems().stream()
            .map(item -> new OrderItemResponseDTO(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getLineTotal()
            ))
            .toList();

        return new OrderResponseDTO(
            order.getId(),
            order.getCreatedAt(),
            order.getTotal(),
            itemDTOs
        );
    }
}

