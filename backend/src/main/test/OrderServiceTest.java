package service;

import dto.OrderItemRequestDTO;
import dto.OrderRequestDTO;
import dto.OrderResponseDTO;
import dto.StockErrorDTO;
import entity.Product;
import repository.OrderRepository;
import repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import service.OrderService;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    private Product product1;
    private Product product2;

    @BeforeEach
    void setUp() {
        product1 = new Product("Café Torrado 500g", new BigDecimal("18.90"), 5);
        product1.setId(1L);
        
        product2 = new Product("Garrafa Térmica 1L", new BigDecimal("79.90"), 2);
        product2.setId(2L);
    }

    @Test
    void testCreateOrderSuccess() {
        OrderItemRequestDTO item1 = new OrderItemRequestDTO(1L, 2);
        OrderItemRequestDTO item2 = new OrderItemRequestDTO(2L, 1);
        OrderRequestDTO orderRequest = new OrderRequestDTO(Arrays.asList(item1, item2));

        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product2));
        when(orderRepository.save(any())).thenAnswer(invocation -> {
            var order = invocation.getArgument(0);
            return order;
        });

        OrderResponseDTO result = orderService.createOrder(orderRequest);

        assertNotNull(result);
        assertEquals(new BigDecimal("117.70"), result.getTotal());
        assertEquals(2, result.getItems().size());
        
        verify(productRepository, times(2)).save(any(Product.class));
        assertEquals(3, product1.getStock());
        assertEquals(1, product2.getStock());
    }

    @Test
    void testCreateOrderInsufficientStock() {
        OrderItemRequestDTO item1 = new OrderItemRequestDTO(1L, 10);
        OrderItemRequestDTO item2 = new OrderItemRequestDTO(2L, 3);
        OrderRequestDTO orderRequest = new OrderRequestDTO(Arrays.asList(item1, item2));

        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product2));

        OrderService.InsufficientStockException exception = assertThrows(
            OrderService.InsufficientStockException.class,
            () -> orderService.createOrder(orderRequest)
        );

        List<StockErrorDTO> stockErrors = exception.getStockErrors();
        assertEquals(2, stockErrors.size());
        
        assertTrue(stockErrors.stream().anyMatch(error ->
            error.getProductId().equals(1L) && error.getAvailable().equals(5)));
        assertTrue(stockErrors.stream().anyMatch(error -> 
            error.getProductId().equals(2L) && error.getAvailable().equals(2)));

        verify(productRepository, never()).save(any(Product.class));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void testCreateOrderPartialInsufficientStock() {
        OrderItemRequestDTO item1 = new OrderItemRequestDTO(1L, 2);
        OrderItemRequestDTO item2 = new OrderItemRequestDTO(2L, 5);
        OrderRequestDTO orderRequest = new OrderRequestDTO(Arrays.asList(item1, item2));

        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product2));

        OrderService.InsufficientStockException exception = assertThrows(
            OrderService.InsufficientStockException.class,
            () -> orderService.createOrder(orderRequest)
        );

        List<StockErrorDTO> stockErrors = exception.getStockErrors();
        assertEquals(1, stockErrors.size());
        assertEquals(2L, stockErrors.get(0).getProductId());
        assertEquals(2, stockErrors.get(0).getAvailable());

        verify(productRepository, never()).save(any(Product.class));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void testCreateOrderProductNotFound() {
        OrderItemRequestDTO item = new OrderItemRequestDTO(999L, 1);
        OrderRequestDTO orderRequest = new OrderRequestDTO(Arrays.asList(item));

        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> orderService.createOrder(orderRequest)
        );

        assertTrue(exception.getMessage().contains("Produto não encontrado: 999"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void testCreateOrderEmptyItems() {
        OrderRequestDTO orderRequest = new OrderRequestDTO(Arrays.asList());

        OrderResponseDTO result = orderService.createOrder(orderRequest);

        assertNotNull(result);
        assertEquals(BigDecimal.ZERO.setScale(2), result.getTotal());
        assertEquals(0, result.getItems().size());
    }

    @Test
    void testConcurrencyHandling() {
        OrderItemRequestDTO item = new OrderItemRequestDTO(1L, 3);
        OrderRequestDTO orderRequest = new OrderRequestDTO(Arrays.asList(item));

        Product productWithStock = new Product("Café Torrado 500g", new BigDecimal("18.90"), 5);
        productWithStock.setId(1L);
        
        Product productWithReducedStock = new Product("Café Torrado 500g", new BigDecimal("18.90"), 1);
        productWithReducedStock.setId(1L);

        when(productRepository.findById(1L))
            .thenReturn(Optional.of(productWithStock))
            .thenReturn(Optional.of(productWithReducedStock));

        OrderService.InsufficientStockException exception = assertThrows(
            OrderService.InsufficientStockException.class,
            () -> orderService.createOrder(orderRequest)
        );

        List<StockErrorDTO> stockErrors = exception.getStockErrors();
        assertEquals(1, stockErrors.size());
        assertEquals(1L, stockErrors.get(0).getProductId());
        assertEquals(1, stockErrors.get(0).getAvailable());
    }

    @Test
    void shouldCreateOrderWhenStockIsSufficient() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Café Torrado 500g");
        product.setPrice(BigDecimal.valueOf(18.90));
        product.setStock(5);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderRequestDTO dto = new OrderRequestDTO(
                List.of(new OrderItemRequestDTO(1L, 2))
        );

        var response = orderService.createOrder(dto);

        assertNotNull(response.getId());
        assertEquals(BigDecimal.valueOf(37.80).setScale(2), response.getTotal());
        assertEquals(3, product.getStock());
        verify(orderRepository).save(any(Order.class));
    }
}

