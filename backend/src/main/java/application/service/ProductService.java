package application.service;

import application.dto.ProductDTO;
import application.repository.ProductRepository;
import application.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<ProductDTO> findProducts(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products;
        
        if (search == null || search.trim().isEmpty()) {
            products = productRepository.findAllActiveProducts(pageable);
        } else {
            products = productRepository.findActiveProductsByNameContaining(search.trim(), pageable);
        }
        
        return products.map(this::convertToDTO);
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    private ProductDTO convertToDTO(Product product) {
        return new ProductDTO(
            product.getId(),
            product.getName(),
            product.getPrice(),
            product.getStock(),
            product.getActive()
        );
    }
}

