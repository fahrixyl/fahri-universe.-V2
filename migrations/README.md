Visitor counter memakai Upstash Redis (key-value), jadi tidak perlu migrasi SQL.
Key yang dipakai: `fahri:visitors:total` (angka total) dan `fahri:seen:<hash>` (kedaluwarsa 24 jam).
