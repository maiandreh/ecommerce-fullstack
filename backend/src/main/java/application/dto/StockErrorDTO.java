package application.dto;

public class StockErrorDTO {
    private Long productId;
    private Integer available;

    public StockErrorDTO() {}

    public StockErrorDTO(Long productId, Integer available) {
        this.productId = productId;
        this.available = available;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getAvailable() {
        return available;
    }

    public void setAvailable(Integer available) {
        this.available = available;
    }

    @Override
    public String toString() {
        return "StockErrorDTO{" +
                "productId=" + productId +
                ", available=" + available +
                '}';
    }
}

