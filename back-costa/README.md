# 🔐 ferrisys-auth

Authentication and authorization microservice for the **Ferrisys System**, a scalable and modular platform for hardware store management.

---

## 📌 Prerequisites

Ensure the following modules are already present and compiled:

### 📦 [ferrisys-common](../ferrisys-common)

> Contains shared entities (User, Role, Company, Module), DTOs, enums, and audit base classes.

### 📦 [ferrisys-parent](../ferrisys-parent)

> Parent POM for centralized dependency and plugin versions using Java 17 and Spring Boot 3.4.

---

## 🎯 Features

- 👤 **User Registration** with role and company assignment
- 🔐 **JWT-based login authentication**
- 🔄 **Password update/change**
- 🧩 **Role-based access** to system modules
- 🗂️ Uses centralized entities from `ferrisys-common`
- 📜 Loads default roles and module mappings from `data.sql`

---

## 📂 Project Structure

