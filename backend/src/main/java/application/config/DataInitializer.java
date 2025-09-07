package application.config;

import application.entity.Product;
import application.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Autowired
    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        if (productRepository.count() == 0) {
            productRepository.save(new Product("Café Torrado 500g", new BigDecimal("18.90"), 5));
            productRepository.save(new Product("Filtro de Papel nº103", new BigDecimal("7.50"), 10));
            productRepository.save(new Product("Garrafa Térmica 1L", new BigDecimal("79.90"), 2));
            productRepository.save(new Product("Açúcar Mascavo 1kg", new BigDecimal("16.00"), 0));
            productRepository.save(new Product("Caneca Inox 300ml", new BigDecimal("29.00"), 8));
            
            System.out.println("Base de dados populada com produtos iniciais.");
        }
    }
}

