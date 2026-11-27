# Mühasibat və vergi

Azərbaycan Respublikasının Vergi Məcəlləsi və Əmək Məcəlləsinə əsaslanan mühasibat və vergi proqramı (veb tətbiq).

## Hazırda olanlar

- **Əmək haqqı**: gross → net, gəlir vergisi (VM 101.1, 101.1-1; 2026–2028 şkalaları), DSMF, icbari tibbi sığorta, işsizlik sığortası, işəgötürənin xərci.
- **Məzuniyyət haqqı**: ƏM 140 (12 ay ÷ 12 ÷ 30,4), staja görə əlavə günlər (ƏM 116).
- **İşdən çıxma**: müavinət, xəbərdarlıq əvəzinə ödəniş (ƏM 77), istifadə edilməmiş məzuniyyətə kompensasiya (ƏM 144).
- **Vergi təqvimi**: vergi rejiminə görə növbəti 12 ayın son tarixləri.

## Quruluş

- `src/lib/engine/`: hesablama mühərriki. UI-dan asılı deyil, hər qayda maddə istinadı ilə yazılıb.
  - `rates.ts`: bütün dərəcələr və qüvvəyə minmə tarixləri. Dərəcə dəyişəndə yalnız bura yenilənir.
  - `payroll.ts`, `leave.ts`, `calendar.ts`: hesablamalar.
  - `engine.test.ts`: testlər.
- `src/app/`: Next.js səhifələri, `src/components/`: kalkulyatorlar.

## Yoxlanmalı

- DSMF, icbari tibbi sığorta və işsizlik sığortası dərəcələri Vergi Məcəlləsində yoxdur. `rates.ts`-dəki dəyərlər `verified: false` kimi işarələnib və rəsmi mənbə ilə yoxlanmalıdır.
- Gəlir vergisi güzəştləri (VM 102) və son tarixin istirahət gününə düşməsi hələ nəzərə alınmır.

## İşə salmaq

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # mühərrik testləri
npm run build
```
