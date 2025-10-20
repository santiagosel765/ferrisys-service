CREATE TABLE IF NOT EXISTS bus_client (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    status INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bus_provider (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    status INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bus_quote (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES bus_client(id),
    description VARCHAR(255),
    total NUMERIC(10,2),
    status INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bus_purchase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES bus_provider(id),
    description VARCHAR(255),
    total NUMERIC(10,2),
    status INTEGER NOT NULL
);
