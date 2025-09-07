package application.exception;

import application.dto.StockErrorDTO;

import java.util.List;

public class InsufficientStockException extends RuntimeException {
    private final List<StockErrorDTO> stockErrors;

    public InsufficientStockException(List<StockErrorDTO> stockErrors) {
        super("Estoque insuficiente");
        this.stockErrors = stockErrors;
    }

    public List<StockErrorDTO> getStockErrors() {
        return stockErrors;
    }
}
