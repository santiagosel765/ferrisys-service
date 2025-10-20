
package com.ferrisys.controller;

import com.ferrisys.common.dto.CategoryDTO;
import com.ferrisys.common.dto.ProductDTO;
import com.ferrisys.common.dto.PageResponse;
import com.ferrisys.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/category/save")
    public void saveCategory(@RequestBody CategoryDTO dto) {
        inventoryService.saveOrUpdateCategory(dto);
    }

    @PostMapping("/product/save")
    public void saveProduct(@RequestBody ProductDTO dto) {
        inventoryService.saveOrUpdateProduct(dto);
    }

    @PostMapping("/category/disable")
    public void disableCategory(@RequestParam UUID id) {
        inventoryService.disableCategory(id);
    }

    @PostMapping("/product/disable")
    public void disableProduct(@RequestParam UUID id) {
        inventoryService.disableProduct(id);
    }

    @GetMapping("/categories")
    public PageResponse<CategoryDTO> getCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return inventoryService.listCategories(page, size);
    }

    @GetMapping("/products")
    public PageResponse<ProductDTO> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return inventoryService.listProducts(page, size);
    }
}
