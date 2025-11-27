CREATE TABLE peminjam (
    id_peminjam UUID PRIMARY KEY,
    nama_peminjam VARCHAR(250) NOT NULL,
    tgl_daftar DATE NOT NULL,
    user_peminjam VARCHAR(30) NOT NULL,
    pass_peminjam VARCHAR(100) NOT NULL,
    foto_peminjam BYTEA, -- Image / Blob
    status_peminjam BOOLEAN NOT NULL
);

CREATE TABLE peminjaman (
    kode_pinjam SERIAL PRIMARY KEY,
    id_peminjam UUID NOT NULL REFERENCES peminjam(id_peminjam) ON DELETE CASCADE,
    tgl_pesan TIMESTAMP NOT NULL,
    tgl_ambil TIMESTAMP NOT NULL,
    tgl_wajibkembali TIMESTAMP NOT NULL,
    tgl_kembali TIMESTAMP,
    status_pinjam CHAR(1) NOT NULL
);

CREATE TABLE admin (
    id_admin VARCHAR(5) PRIMARY KEY,
    nama_admin VARCHAR(250) NOT NULL,
    user_admin VARCHAR(30) NOT NULL,
    pass_admin VARCHAR(100) NOT NULL
);

CREATE TABLE buku (
    id_buku SERIAL PRIMARY KEY,
    judul_buku VARCHAR(255) NOT NULL,
    tgl_terbit DATE,
    nama_pengarang VARCHAR(250),
    nama_penerbit VARCHAR(250)
);

CREATE TABLE detail_peminjaman (
    id SERIAL PRIMARY KEY,
    kode_pinjam INTEGER NOT NULL REFERENCES peminjaman(kode_pinjam) ON DELETE CASCADE,
    id_buku INTEGER NOT NULL REFERENCES buku(id_buku) ON DELETE CASCADE
);

| Table                          | Key                                          | Relasi      |
| ------------------------------ | -------------------------------------------- | ----------- |
| peminjam → peminjaman          | id_peminjam                                  | One to Many |
| peminjaman → detail_peminjaman | kode_pinjam                                  | One to Many |
| buku → detail_peminjaman       | id_buku                                      | One to Many |
| admin → peminjaman             | id_admin *(opsional jika ingin ditambah FK)* |             |
