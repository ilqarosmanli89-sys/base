# Mühasibat və vergi

Azərbaycan Respublikasının Vergi Məcəlləsi və Əmək Məcəlləsinə əsaslanan mühasibat və vergi proqramı (veb tətbiq).

## Bölmələr

Solda alətlər paneli: İdarə paneli, HR, Əmək haqqı, Satış, Alış, Anbar, Kassa, Vergilər, Mühasibat, Sistem.

- **İdarə paneli**: cari ayın satış, alış, ödənilməli ƏDV, kassa qalığı, anbar dəyəri, əmək haqqı fondu, son sənədlər və son tarixlər.
- **HR**: işçilər siyahısı, işə qəbul, redaktə, işdən çıxış.
- **Satış / Alış**: müştərilər, təchizatçılar, ƏDV ilə qaimələr. Satış anbar qalığını yoxlayır.
- **Anbar**: mallar, mədaxil/məxaric qalıqları, orta çəkili maya dəyəri.
- **Kassa**: mədaxil (MO) və məxaric (XO) orderləri, qalıq.
- **ƏDV hesabı**: ay üzrə hesablanan və əvəzləşdirilən ƏDV.
- **Əmək haqqı cədvəli**: ay üzrə bütün işçilərin hesablanması.
- Mühasibat (hesablar planı, əsas vəsaitlər, bank, hesabatlar) və Tənzimləmələr növbəti mərhələdədir.

## Kalkulyatorlar

- **Əmək haqqı**: gross → net, gəlir vergisi (VM 101.1, 101.1-1; 2026–2028 şkalaları), DSMF, icbari tibbi sığorta, işsizlik sığortası, işəgötürənin xərci.
- **Məzuniyyət haqqı**: ƏM 140 (12 ay ÷ 12 ÷ 30,4), staja görə əlavə günlər (ƏM 116).
- **İşdən çıxma**: müavinət, xəbərdarlıq əvəzinə ödəniş (ƏM 77), istifadə edilməmiş məzuniyyətə kompensasiya (ƏM 144).
- **Vergi təqvimi**: vergi rejiminə görə növbəti 12 ayın son tarixləri.

## Quruluş

- `src/lib/engine/`: hesablama mühərriki. UI-dan asılı deyil, hər qayda maddə istinadı ilə yazılıb.
  - `rates.ts`: bütün dərəcələr və qüvvəyə minmə tarixləri. Dərəcə dəyişəndə yalnız bura yenilənir.
  - `payroll.ts`, `leave.ts`, `calendar.ts`: hesablamalar.
  - `engine.test.ts`: testlər.
- `src/lib/data/`: SQLite verilənlər bazası (Node.js-in daxili `node:sqlite`), sorğular və server action-lar. Baza `data/app.db` faylında (və ya `DB_PATH`) yaranır; ilk açılışda nümunə məlumatlar yazılır (`SEED=0` ilə söndürülür).
- `src/app/`: Next.js səhifələri, `src/components/`: formalar və kalkulyatorlar.

## Yoxlanmalı

- DSMF, icbari tibbi sığorta və işsizlik sığortası dərəcələri Vergi Məcəlləsində yoxdur. `rates.ts`-dəki dəyərlər `verified: false` kimi işarələnib və rəsmi mənbə ilə yoxlanmalıdır.
- Gəlir vergisi güzəştləri (VM 102) və son tarixin istirahət gününə düşməsi hələ nəzərə alınmır.

## İşə salmaq

```bash
npm install          # Node.js 22.13+ lazımdır
npm run dev     # http://localhost:3000
npm test        # mühərrik testləri
npm run build
```
