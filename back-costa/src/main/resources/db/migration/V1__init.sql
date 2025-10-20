CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS user_status (
                                           status_id UUID PRIMARY KEY,
                                           name VARCHAR(255) NOT NULL,
    description VARCHAR(255)
    );

CREATE TABLE IF NOT EXISTS auth_role (
                                         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                         name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    status INTEGER NOT NULL
    );

CREATE TABLE IF NOT EXISTS auth_user (
                                         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                         username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    status_id UUID NOT NULL REFERENCES user_status(status_id)
    );

CREATE TABLE IF NOT EXISTS auth_user_role (
                                              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                              auth_user_id UUID NOT NULL REFERENCES auth_user(id),
    auth_role_id UUID NOT NULL REFERENCES auth_role(id),
    status INTEGER DEFAULT 1
    );
