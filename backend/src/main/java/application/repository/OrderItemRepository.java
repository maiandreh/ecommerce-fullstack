package application.repository;

import application.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query(value = "SELECT p.name, SUM(oi.quantity) as total_sold " +
                   "FROM order_items oi " +
                   "JOIN products p ON oi.product_id = p.id " +
                   "GROUP BY p.id, p.name " +
                   "ORDER BY total_sold DESC " +
                   "LIMIT 3", nativeQuery = true)
    List<Object[]> findTop3MostSoldProducts();
}

