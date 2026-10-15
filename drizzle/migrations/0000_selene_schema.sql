create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.handle_new_user_role() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'kusumavema117.magang@gmail.com' or not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created_role after insert on auth.users for each row execute function public.handle_new_user_role();

create table public.store_settings (id int primary key default 1, store_name text not null default '', tagline text not null default '', whatsapp text not null default '', address text not null default '', hours text not null default '', email text not null default '', instagram text not null default '', updated_at timestamptz not null default now());
create table public.hero_slides (id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', image_url text not null default '', cta_label text not null default 'Konsultasi Sekarang', cta_link text not null default '', sort_order int not null default 0, is_active boolean not null default true, created_at timestamptz not null default now());
create table public.garment_types (id uuid primary key default gen_random_uuid(), name text not null, description text not null default '', price int not null default 0, image_url text not null default '', sort_order int not null default 0, created_at timestamptz not null default now());
create table public.techniques (id uuid primary key default gen_random_uuid(), name text not null, description text not null default '', price int not null default 0, image_url text not null default '', sort_order int not null default 0, created_at timestamptz not null default now());
create table public.categories (id uuid primary key default gen_random_uuid(), name text not null, sort_order int not null default 0, created_at timestamptz not null default now());
create table public.products (id uuid primary key default gen_random_uuid(), name text not null, category_id uuid references public.categories(id) on delete set null, description text not null default '', image_url text not null default '', min_order int not null default 24, is_featured boolean not null default true, sort_order int not null default 0, created_at timestamptz not null default now());
create table public.orders (id uuid primary key default gen_random_uuid(), customer_name text not null, phone text not null default '', product text not null default '', quantity int not null default 1, notes text not null default '', status text not null default 'pending' check (status in ('pending','produksi','selesai')), created_at timestamptz not null default now());
create table public.site_texts (key text primary key, label text not null, value text not null default '', sort_order int not null default 0);

do $$ declare t text; begin
  foreach t in array array['store_settings','hero_slides','garment_types','techniques','categories','products','site_texts'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

grant select, insert, update, delete on public.orders to authenticated; grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "admin all orders" on public.orders for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "public read site-images" on storage.objects for select using (bucket_id = 'site-images');
create policy "admin upload site-images" on storage.objects for insert to authenticated with check (bucket_id = 'site-images' and public.has_role(auth.uid(),'admin'));
create policy "admin update site-images" on storage.objects for update to authenticated using (bucket_id = 'site-images' and public.has_role(auth.uid(),'admin'));
create policy "admin delete site-images" on storage.objects for delete to authenticated using (bucket_id = 'site-images' and public.has_role(auth.uid(),'admin'));

insert into public.store_settings (id, store_name, tagline, whatsapp, address, hours, email, instagram) values (1,'Selene Apparel','Partner Produksi Apparel & Seragam di Yogyakarta','628987654321','Jl. Sukun Raya No.98, Banguntapan, Bantul, DIY','Senin-Sabtu 09.00-17.00 WIB','halo@seleneapparel.id','@seleneapparel');
insert into public.hero_slides (title, description, image_url, sort_order) values
('Workshop Produksi Konveksi','Dari potong kain hingga jahit akhir, dikerjakan rapi oleh tim berpengalaman di Yogyakarta.','/images/slide-1.jpg',1),
('Sablon Tajam & Tahan Lama','Sablon DTF dan plastisol dengan warna pekat, presisi, dan awet dicuci berkali-kali.','/images/slide-2.jpg',2),
('Bordir Komputer Presisi','Logo instansi dan komunitas terbordir detail dengan benang berkualitas.','/images/slide-3.jpg',3),
('Seragam untuk Tim Anda','PDH, korsa, polo, hingga jaket — seragam yang membuat tim tampil kompak.','/images/slide-4.jpg',4);
insert into public.garment_types (name, description, price, image_url, sort_order) values
('Kaos Combed','Cotton combed 24s/30s, adem dan nyaman untuk harian maupun event.',65000,'/images/slide-2.jpg',1),
('Polo Shirt','Bahan lacoste CVC/PE, kerah rapi, cocok untuk seragam kantor.',85000,'/images/slide-4.jpg',2),
('Kemeja PDH / Korsa','American drill / nagata drill, jahitan kuat untuk instansi & organisasi.',110000,'/images/slide-3.jpg',3),
('Jaket / Hoodie','Fleece & taslan, hangat dan tetap stylish untuk komunitas.',135000,'/images/slide-1.jpg',4);
insert into public.techniques (name, description, price, sort_order) values
('Sablon DTF','Full color tanpa batas warna, detail foto tajam.',15000,1),
('Sablon Plastisol','Warna solid, tebal, dan sangat awet.',12000,2),
('Bordir Komputer','Logo timbul elegan dengan mesin bordir presisi.',20000,3),
('Sublimasi Fullprint','Cetak menyeluruh untuk jersey dan bahan polyester.',25000,4);
insert into public.categories (name, sort_order) values ('Kemeja & PDL',1),('Jaket & Hoodie',2),('Kaos & Polo',3),('Merchandise',4);
insert into public.products (name, category_id, description, image_url, min_order, sort_order) values
('Kemeja PDH Instansi',(select id from public.categories where name='Kemeja & PDL'),'Kemeja dinas dengan bordir logo dan nama.','/images/slide-3.jpg',24,1),
('Hoodie Komunitas',(select id from public.categories where name='Jaket & Hoodie'),'Hoodie fleece dengan sablon plastisol.','/images/slide-1.jpg',24,2),
('Kaos Event Combed 30s',(select id from public.categories where name='Kaos & Polo'),'Kaos acara dengan sablon DTF full color.','/images/slide-2.jpg',36,3),
('Polo Seragam Kantor',(select id from public.categories where name='Kaos & Polo'),'Polo lacoste dengan bordir dada kiri.','/images/slide-4.jpg',24,4),
('Totebag Kanvas',(select id from public.categories where name='Merchandise'),'Totebag kanvas sablon untuk souvenir.','/images/slide-2.jpg',50,5),
('Jaket Taslan Tim',(select id from public.categories where name='Jaket & Hoodie'),'Jaket taslan waterproof dengan furing.','/images/slide-1.jpg',24,6);
insert into public.orders (customer_name, phone, product, quantity, notes, status) values
('Himpunan Mahasiswa Teknik UGM','6281234567890','Kemeja PDH',60,'Bordir logo dada kiri','pending'),
('Kopi Senja Jogja','6285712345678','Polo Shirt',24,'Warna maroon','produksi'),
('Komunitas Lari Bantul','6282198765432','Kaos Combed',120,'Sablon DTF depan belakang','selesai');
insert into public.site_texts (key,label,value,sort_order) values
('hero_badge','Badge Hero','Konveksi Yogyakarta sejak 2015',1),
('catalog_title','Judul Katalog','Katalog Pilihan',2),
('catalog_subtitle','Subjudul Katalog','Produk konveksi favorit pelanggan kami — bisa dikustom sesuai kebutuhan.',3),
('consult_title','Judul Konsultasi','Punya desain sendiri? Ayo ngobrol dulu.',4),
('consult_body','Isi Konsultasi','Kirim mockup, logo, atau sekadar ide kasar via WhatsApp. Tim kami bantu pilih bahan, teknik cetak, dan memberi penawaran terbaik sesuai jumlah pesanan Anda.',5),
('footer_about','Tentang (Footer)','Selene Apparel adalah partner produksi apparel dan seragam untuk instansi, komunitas, dan brand lokal.',6);