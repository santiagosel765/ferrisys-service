
package com.ferrisys.controller;

import com.ferrisys.common.dto.CategoryDTO;
import com.ferrisys.common.dto.ProductDTO;
import com.ferrisys.common.dto.PageResponse;
import com.ferrisys.service.InventoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/v1/inventory")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@ConditionalOnProperty(prefix = "modules.inventory", name = "enabled", havingValue = "true", matchIfMissing = true)
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/category/save")
    @PreAuthorize("@featureFlagService.enabledForCurrentUser('inventory') and (hasAuthority('MODULE_INVENTORY') or hasRole('ADMIN'))")
    public void saveCategory(@RequestBody CategoryDTO dto) {
        inventoryService.saveOrUpdateCategory(dto);
    }

    @PostMapping("/product/save")
    @PreAuthorize("@featureFlagService.enabledForCurrentUser('inventory') and (hasAuthority('MODULE_INVENTORY') or hasRole('ADMIN'))")
    public void saveProduct(@RequestBody ProductDTO dto) {
        inventoryService.saveOrUpdateProduct(dto);
    }

    @PostMapping("/category/disable")
    @PreAuthorize("@featureFlagService.enabledForCurrentUser('inventory') and (hasAuthority('MODULE_INVENTORY') or hasRole('ADMIN'))")
    public void disableCategory(@RequestParam UUID id) {
        inventoryService.disableCategory(id);
    }

    @PostMapping("/product/disable")
    @PreAuthorize("@featureFlagService.enabledForCurrentUser('inventory') and (hasAuthority('MODULE_INVENTORY') or hasRole('ADMIN'))")
    public void disableProduct(@RequestParam UUID id) {
        inventoryService.disableProduct(id);
    }

    @GetMapping("/categories")
    @PreAuthorize("@featureFlagService.enabledForCurrentUser('inventory') and (hasAuthority('MODULE_INVENTORY') or hasRole('ADMIN'))")
    public PageResponse<CategoryDTO> getCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return inventoryService.listCategories(page, size);
    }

    @GetMapping("/products")
    @PreAuthorize("@featureFlagService.enabledForCurrentUser('inventory') and (hasAuthority('MODULE_INVENTORY') or hasRole('ADMIN'))")
    public PageResponse<ProductDTO> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return inventoryService.listProducts(page, size);
    }
}
