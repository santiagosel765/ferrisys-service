-- Additional columns for business tables and new detail tables
ALTER TABLE bus_client
    ADD COLUMN phone VARCHAR(50),
    ADD COLUMN address VARCHAR(255);

ALTER TABLE bus_provider
    ADD COLUMN phone VARCHAR(50),
    ADD COLUMN address VARCHAR(255),
    ADD COLUMN ruc VARCHAR(20);

ALTER TABLE bus_purchase
    ADD COLUMN purchase_date DATE;

ALTER TABLE bus_quote
    ADD COLUMN quote_date DATE;

CREATE TABLE IF NOT EXISTS bus_purchase_detail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES bus_purchase(id),
    product_id UUID NOT NULL REFERENCES inv_product(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS bus_quote_detail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES bus_quote(id),
    product_id UUID NOT NULL REFERENCES inv_product(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);
