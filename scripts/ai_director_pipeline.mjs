import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { transcribeWithGroq } from './align_groq.mjs';
import { searchAndDownloadImage } from './fetch_scene_media.mjs';
import { loadLearningMemory, auditAndRefineStory } from './learning_manager.mjs';
import { runVisualQASupervisor } from './ai_visual_inspector.mjs';
import { generatePublishingPack } from './generate_publishing_pack.mjs';
import { rpmGovernor } from './gemini_rpm_governor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean);

if (API_KEYS.length === 0) {
  console.error('[FATAL] Tidak ada GEMINI_API_KEY yang ditemukan di file .env.');
  console.error('Silakan isi setidaknya satu GEMINI_API_KEY di file .env.');
  process.exit(1);
}

const DEFAULT_TOPIC = 'Runtuhnya Tembok Berlin Karena Salah Baca Memo';
const topic = process.argv[2] || DEFAULT_TOPIC;

console.log('================================================================');
console.log('       AI DIRECTOR & SUTRADARA VIDEO PIPELINE (AUTONOMOUS)      ');
console.log('================================================================');
console.log(`Topik Naskah : "${topic}"`);
console.log(`Tersedia     : ${API_KEYS.length} API Key (Rotasi Otomatis Failover)`);
console.log(`Audio Sync   : Groq Cloud LPU (Whisper Large V3)`);
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 1. MASTER SUTRADARA & CREATIVE DIRECTOR PROMPT
// -----------------------------------------------------------------------------
export const CREATIVE_PERSPECTIVES = [
  {
    name: '🌟 MASTER MULTI-PERSPEKTIF (GABUNGAN SEMUA SUDUT PANDANG)',
    angle: 'GABUNGKAN SEMUA SUDUT PANDANG MENJADI SATU KARYA DOKUMENTER LENGKAP BERDURASI 1.5 - 2.5 MENIT (DI BAWAH 3 MENIT): ' +
      'WAJIB MEMBUAT MINIMAL 10 HINGGA 14 ADEGAN SKETSA BERBEDA DALAM ARRAY "nodes"! DILARANG KERAS MERINGKAS HANYA JADI 4 ADEGAN! ' +
      'Bagi alur secara granular menjadi 4 fase, di mana SETIAP FASE MEMILIKI 3 SKETSA AKSI DETAIL: ' +
      '• Fase 1: Blunder Sepele (3 adegan: dokumen tercecer, perwira terburu-buru, instruksi keliru). ' +
      '• Fase 2: Ketegangan Garis Depan (3 adegan: pos jaga terisolasi, telepon darurat panik, sirine/alarm bahaya). ' +
      '• Fase 3: Rantai Efek Domino (3 adegan: desas-desus media menyebar, massa membludak, gerbang perbatasan jebol). ' +
      '• Fase 4: Bencana Puncak & Sidang Sejarah (3 adegan: runtuhnya sistem total, reaksi kaget dunia, vonis akhir). ' +
      'Total narasi 200 - 320 kata agar video berdurasi 90 - 150 detik dengan pergantian visual dinamis tiap 4-6 detik!',
  },
  {
    name: 'BLUNDER SEPELE & KELALAIAN MANUSIAWI',
    angle: 'Fokuskan alur cerita pada momen kelalaian manusiawi paling awal: benda kecil yang terlupakan, memo terburu-buru, salah belok, atau keputusan sepele dalam hitungan detik yang tanpa disadari memicu rangkaian bencana tak terkendali.',
  },
  {
    name: 'KETEGANGAN LAPANGAN DI TITIK KRITIS',
    angle: 'Fokuskan alur cerita pada kepanikan operator lapangan di garis depan: petugas jaga yang terisolasi, alarm darurat yang berbunyi, komunikasi radio yang terputus, dan detik-detik menegangkan saat mereka menyadari bahaya sudah terlambat dihentikan.',
  },
  {
    name: 'EFEK DOMINO SEBAB-AKIBAT SISTEMIK',
    angle: 'Fokuskan alur cerita pada eskalasi efek domino ekstrem bertahap: bagaimana 1 kesalahan mikro merusak sistem lapis pertama, merembet ke kekacauan lapis kedua, memicu kegagalan total, hingga menghancurkan seluruh struktur peradaban.',
  },
  {
    name: 'BREAKING NEWS & REAKSI KAGET DUNIA',
    angle: 'Fokuskan alur cerita pada ledakan kabar mengejutkan: transmisi darurat, kepanikan publik yang meluas, pers internasional yang menyiarkan bencana secara langsung, dan keterkejutan jutaan manusia saat menyadari sejarah berubah dalam semalam.',
  },
  {
    name: 'INVESTIGASI FORENSIK DOKUMENTER & BUKTI KUNCI',
    angle: 'Fokuskan alur cerita pada rekonstruksi forensik dingin ala Nessie Judge: analisis kronologis jam demi jam, berkas investigasi deklasifikasi, kata-kata terakhir para saksi kunci, dan pengungkapan fakta bahwa tragedi ini bisa dicegah jika satu hal kecil tidak terabaikan.',
  },
];

export const DIRECTOR_PROMPT = `
Kamu adalah Creative Director & Sutradara Dokumenter Papan Atas Dunia sekaligus Storyteller bertaraf Nessie Judge (Nerror).
Tugasmu adalah menciptakan naskah dan alur visual "Butterfly Effect" (efek domino sebab-akibat ekstrem) berdurasi 60 hingga 160 detik (maksimal di bawah 3 menit) untuk YouTube Shorts / TikTok / Reels (9:16).

PRINSIP WAJIB SUTRADARA KELAS DUNIA (JANGAN PERNAH MENGGUNAKAN TEMPLATE STATIS!):
1. GAYA VISUAL HOOK PEMBUKA (BEBAS DARI TEMPLATE KAKU):
   - Kamu (AI Sutradara) WAJIB memilih salah satu dari 4 gaya Hook pembuka ('hookStyle') yang paling dramatis untuk topik ini:
     * "fullscreen-dramatic" : Tampilan layar penuh sinematik (1080x1920) dengan arsip bersejarah otentik atau grafik komando resolusi tinggi, headline editorial raksasa di atas, dan atmosfer dokumenter modern (Vox / Johnny Harris). BUKAN split-screen kaku!
     * "forensic-dossier"    : Tampilan berkas investigasi deklasifikasi meja gelap, stempel merah rahasia beranimasi, laser scanner, dan dokumen kasus fatal.
     * "breaking-transmission": Tampilan monitor TV vintage siaran darurat breaking news dengan scanlines analog, glitch siaran mendadak, dan banner peringatan merah.
     * "split-contrast"      : Tampilan perbandingan kontras dunia mikro vs makro (hanya gunakan jika kamu memang ingin membandingkan dua kutub secara spesifik).
   - Tentukan 'kicker' (badge editorial pendek, misal: "9 NOVEMBER 1989", "SIARAN TV LANGSUNG", "KESALAHAN FATAL").
   - Tentukan 'headline' (judul pancingan besar 3-5 kata, misal: "SATU MEMO MEROBOHKAN TEMBOK", "KUNCI LOKER YANG DILUPAKAN").

2. VARIASI KALIMAT PEMBUKA (DILARANG KERAS MENGGUNAKAN SATU TEMPLATE KALIMAT!):
   - DILARANG SELALU MENGGUNAKAN: "Kalian bayangin... dari X, Y terjadi dalam satu malam?". Kalimat ini sudah basi!
   - Ciptakan variasi kalimat pembuka yang selalu segar, mengejutkan, dan alami seperti kreator manusia papan atas:
     * Contoh Gaya Fakta Dingin: "9 November 1989. Pria ini salah membaca satu lembar catatan di siaran langsung TV... dan malam itu juga, negara adidaya tamat."
     * Contoh Gaya Misteri Saksi: "Tidak ada yang menyangka, tenggelamnya kapal termewah di dunia berawal dari kelalaian sepele: kunci loker yang tertinggal di darat."
     * Contoh Gaya Kronologi Mendadak: "Dalam 4 jam, ribuan massa bersenjata palu merobohkan benteng beton paling ketat di dunia... hanya karena sebuah memo tanpa briefing."

3. AKURASI SEJARAH WAJIB MUTLAK (DILARANG MENGARANG ELEMEN FIKSI!):
   - DILARANG KERAS mengarang elemen fiksi seperti katup pipa gas bocor, kecelakaan mobil, atau tabung meledak pada peristiwa sejarah yang tidak memilikinya!
   - Pilihlah arketipe sketsa ('directorType') yang 100% SESUAI dengan peristiwa sejarah nyata:
     * Pada peristiwa Tembok Berlin: HANYA gunakan arketipe nyata seperti "press-podium" (konferensi pers Schabowski), "memo-investigation" (memo salah baca), "breaking-news" (siaran berita TV yang mengguncang Berlin), "panic-phone" (telepon pos jaga perbatasan yang diabaikan markas), "gate-breach" (gerbang pos perbatasan dibuka), "wall-demolition" (warga merobohkan tembok dengan palu), atau "soviet-collapse" (kolaps Uni Soviet). JANGAN PERNAH gunakan 'valve-failure' atau 'car-route' untuk Tembok Berlin!
     * Pada peristiwa Titanic: HANYA gunakan "key-lockbox", "maritime-disaster", "clock-countdown", "telegraph-wire", "courtroom-gavel", dll.
     * Pada peristiwa Chernobyl: HANYA gunakan "reactor-meltdown", "radiation-hazard", "valve-failure", "critical-gauge", dll.

4. STRATEGI VISUAL (SKETSA FORENSIK DINAMIS + FOTO BUKTI ARSIP OTENTIK):
   - 'mediaType': 'graphic' (sketsa vektor forensik dinamis) untuk adegan proses, aksi massa, rekonstruksi kronologis, dan simbol investigasi.
   - 'mediaType': 'photo' (arsip foto asli) HANYA jika menyebutkan tokoh nyata (Schabowski, Dyatlov, Fleming, Princip, dll.) atau bangunan/objek bersejarah nyata.
   - Sediakan kata kunci pencarian bahasa Inggris yang SPESIFIK dan BERAGAM pada 'searchQuery' dan 'rightSearchQuery' (misal: "Bornholmer Strasse border opening 1989 crowd", "Mauerspechte Berlin Wall chiseled 1989", "East German border checkpoint 1989", bukan hanya "Berlin Wall"!).

5. KATALOG 26 SKETSA ANIMASI FORENSIK ("directorType"):
   * "press-podium"      : Podium konferensi pers/pidato, kilatan blitz kamera wartawan yang menyala acak, jam berdetik, dan dokumen di tangan.
   * "memo-investigation": Kertas dokumen memo rahasia di bawah sorotan lampu meja dengan kaca pembesar memindai kata fatal berstabilo kuning dan stempel merah.
   * "memo-handoff"      : Sketsa tangan menyelipkan berkas rahasia di meja gelap.
   * "panic-phone"       : Pos jaga dengan telepon engkol darurat bergetar merah tanpa instruksi atasan.
   * "gate-breach"       : Palang gerbang perbatasan/pos pemeriksaan terangkat ke atas, sirene merah berputar, warga menerobos maju.
   * "wall-demolition"   : Aksi massa merobohkan dinding/benteng/tembok, siluet mengayunkan palu godam dengan percikan api, retakan beton menjalar.
   * "breaking-news"     : Monitor TV tabung vintage dengan ticker darurat breaking news siaran langsung.
   * "crowd-protest"     : Lautan siluet ribuan massa mengangkat plakat dan megafon di bawah sorotan lampu jalan.
   * "soviet-collapse"   : Peta wilayah geopolitik retak & terpecah belah jadi negara-negara merdeka.
   * "domino-collapse"   : Balok domino 3D beruntun saling bertumbukan dan tumbang ke depan (tuliskan 5 tahap dipisahkan koma pada 'secondaryText').
   * "clock-countdown"   : Jam analog vintage berdetik cepat, hitungan mundur digital milidetik, zona bahaya merah.
   * "key-lockbox"       : Loker/brankas baja dengan siluet kunci hilang bertanda tanya kuning, gembok darurat, stempel KUNCI TERTINGGAL.
   * "car-route"         : Peta jalan taktis dengan mobil bergerak di jalur rute, panah belokan salah merah. (Hanya untuk konvoi mobil/sopir!).
   * "radiation-hazard"  : Lambang radiasi trefoil nuklir berputar, gelombang awan racun/radiasi konsentris melingkar, dosimeter roentgen.
   * "valve-failure"     : Pipa industri tekanan tinggi dengan katup roda berputar cepat, semburan uap/gas bocor membahana. (Hanya untuk pabrik/pipa/reaktor!).
   * "telegraph-wire"    : Tiang radio komunikasi telegraf dengan pita kode morse SOS CQD berdenyut dan gelombang radio.
   * "courtroom-gavel"   : Palu hakim kayu menghantam balok suara dengan gelombang kejut cincin emas, vonis investigasi resmi.
   * "maritime-disaster" : Siluet kapal laut miring tenggelam di laut gelap bersalju, gunung es tajam, dan sinyal radio darurat memancar.
   * "reactor-meltdown"  : Penampang reaktor nuklir dengan batang kendali membara merah berdenyut, indikator suhu/radiasi kritis.
   * "laboratory-discovery": Cawan petri laboratorium di bawah mikroskop, biakan bakteri dengan cincin inhibisi antibiotik.
   * "tactical-map"      : Radar taktis melingkar & titik koordinat target pergerakan.
   * "critical-gauge"    : Indikator meteran bahaya, tekanan overload, atau suhu kritis.
   * "forensic-dossier"  : Berkas penyelidikan deklasifikasi dengan stempel merah TOP SECRET.
   * "bureaucracy-draft" : Meja birokrasi dengan tumpukan draf regulasi formal.
   * "breaking-ticker"   : Ticker darurat telegraf teks berjalan.
   * "press-question"    : Mikrofon wartawan mengajukan pertanyaan mendesak.

6. SUPERVISI GAYA EDITING & WARNA DINAMIS (EDITORIAL STYLE OTONOM):
   AI Sutradara WAJIB menentukan 'editorialStyle' secara mandiri sesuai tema cerita agar video memiliki mood visual unik dan tidak monoton:
   - 'editorialStyle.mood': Tentukan preset visual paling cocok:
     * 'cold-war-crisis'  : Spionase, Perang Dingin, krisis politik, memo rahasia, tembok pembatas.
     * 'noir-forensic'     : Bencana laut, deklasifikasi arsip misteri, kapal karam, investigasi kematian.
     * 'amber-urgent'     : Breaking news mendadak, alarm pos jaga, kepanikan massa, kebakaran/ledakan.
     * 'industrial-decay' : Bencana reaktor nuklir, kebocoran radiasi, kegagalan turbin industri pabrik.
     * 'clean-documentary': Penemuan sains & laboratorium, era modern, birokrasi, penemuan obat.
   - 'editorialStyle.grainIntensity': 0.03 hingga 0.06 (butiran film 35mm yang nyaman di mata penonton, dilarang berlebihan!).
   - 'editorialStyle.vignetteStrength': 0.25 hingga 0.45 (bayangan tepi sinematik lembut).
   - 'editorialStyle.shakeSensitivity': 'subtle' atau 'moderate'.
   - 'editorialStyle.shakeThresholdChaos': Level chaos (60-75) saat guncangan kamera mulai aktif pada momen tegang.

7. RAHASIA YOUTUBE SHORTS VIRAL MILLION-VIEWS (DENSITAS MULTI-SKETSA CEPAT & ALUR INTENSIF):
   - JANGAN PELIT SKETSA! DILARANG KERAS 1 SKETSA DIAM LAMA UNTUK BANYAK PENJELASAN! (Jika 1 sketsa diam 15 detik sementara voiceover menjelaskan banyak hal, penonton bosan dan visual tidak nyambung!).
   - BEDAH DAN PECAH ALUR CERITA MENJADI 8 HINGGA 12 BABAK VISUAL DINAMIS ('nodes').
   - Setiap adegan (node) berdurasi SINGKAT & INTENSIF (3 sampai 5 detik, sekitar 12 - 20 kata narasi per adegan).
   - SETIAP KALI VOICEOVER BERGANTI TINDAKAN, TOKOH, ATAU OBJEK: GANTI SKETSA VISUALNYA ('directorType')!
     * Contoh alur pergantian sketsa dinamis (Titanic):
       - Node 1 ('memo-handoff')     : Pergantian perwira kapal tergesa-gesa di Southampton.
       - Node 2 ('key-lockbox')      : Kunci kuningan loker teropong terbawa pulang di saku jas.
       - Node 3 ('maritime-disaster'): Siluet kapal melaju kencang di laut hitam Atlantik.
       - Node 4 ('clock-countdown')  : Menara pengawas sarang gagak di malam beku tanpa penerangan.
       - Node 5 ('key-lockbox')      : Loker nomor 4 terkunci mati, teropong optik tak bisa diambil.
       - Node 6 ('critical-gauge')   : Meteran jarak pandang mata telanjang drop drastis di tengah kabut.
       - Node 7 ('tactical-map')     : Siluet gunung es raksasa muncul mendadak 500 meter di depan.
       - Node 8 ('panic-phone')      : Lonceng darurat berdentang 3 kali, kemudi dibanting panik.
       - Node 9 ('valve-failure')    : Lambung baja kapal robek 90 meter oleh es bawah air.
       - Node 10 ('telegraph-wire')  : Sinyal radio morse SOS CQD memancar putus asa ke samudra.
       - Node 11 ('courtroom-gavel') : Palu sidang penyelidikan maritim membuktikan satu kunci menentukan 1.500 nyawa.
   - ATURAN 3 DETIK PERTAMA (STOP-THE-SCROLL): Kalimat pembuka pada 'hook.narration' (20 - 30 kata) langsung menyebutkan waktu, objek mikro sepele, dan bencana dahsyat.
   - TEKNIK SEAMLESS INFINITE LOOP (RETENSI > 100%): Rancang kalimat terakhir pada 'outro.narration' agar kata-kata terakhirnya menyambung kembali ke kata pertama pada kalimat pembuka ('hook.narration').
   - Total keseluruhan cerita: 8 sampai 16 nodes dinamis, total 180 - 350 kata narasi (durasi total video 1 - 2.5 menit, aman di bawah batas 3 menit). Video akan terasa sangat kaya, penuh variasi animasi sketsa berganti tiap 3-5 detik, dan setiap penjelasan visualnya 100% tepat sasaran!

8. LOGIKA SEBAB-MUSABAB DETAIL (ANTI-LONCAT ALUR & ANTI-MEMBINGUNGKAN):
   - JANGAN LANGSUNG LONCAT KE KLIMAKS TANPA MENJELASKAN SEBAB-MUSABABNYA!
   - Penonton cerdas butuh memahami MEKANISME KEGAGALAN OTENTIK (how and why it actually happened):
     * MENGAPA KESALAHAN AWAL TERJADI? (misal: Schabowski tidak ikut briefing karena baru pulang liburan, memo disodorkan di lorong tanpa penjelasan).
     * MENGAPA TIDAK ADA YANG MENCEGAH? (misal: wartawan menembak pertanyaan mendesak, Schabowski grogi di depan kamera live, tidak ada staf yang berani mengoreksi).
     * BAGAIMANA ESKALASI LAPANGAN BERJALAN? (bukan sulap instan; jelaskan pos perbatasan kebingungan, telepon darurat ke atasan tidak diangkat, komandan jaga terisolasi hingga terpaksa mengambil keputusan sendiri).
   - Rantai kausalitas harus logis, bertahap, dan memuaskan rasa ingin tahu penonton. Manfaatkan durasi optimal 1.5 hingga 2.5 menit (aman di bawah batas 3 menit YouTube Shorts) untuk menyajikan rekonstruksi sebab-akibat yang utuh dan berbobot!

FORMAT JSON WAJIB:
{
  "id": "slug-id",
  "title": "JUDUL DRAMATIS HURUF BESAR",
  "editorialStyle": {
    "mood": "cold-war-crisis ATAU noir-forensic ATAU amber-urgent ATAU industrial-decay ATAU clean-documentary",
    "grainIntensity": 0.048,
    "vignetteStrength": 0.35,
    "shakeSensitivity": "moderate",
    "shakeThresholdChaos": 65
  },
  "hook": {
    "hookStyle": "fullscreen-dramatic ATAU forensic-dossier ATAU breaking-transmission ATAU split-contrast",
    "kicker": "BADGE SINGKAT EDITORIAL (misal: '14 APRIL 1912', 'KESALAHAN FATAL')",
    "headline": "JUDUL PANCINGAN BESAR (misal: 'KUNCI LOKER YANG MENENGGELAMKAN TITANIC')",
    "narration": "Kalimat pembuka menggigit, detail, dan mencekam (20-30 kata) tanpa kalimat klise...",
    "leftTitle": "Hal Sepele",
    "rightTitle": "Dampak Global",
    "leftBadge": "AWAL MULA SEPELE",
    "rightBadge": "BENCANA GLOBAL",
    "leftPrimaryText": "Teks judul dokumen awal",
    "leftStampText": "BUKTI AWAL",
    "leftSearchQuery": "English search keyword for Cause archival photo/sketch",
    "rightSearchQuery": "Specific varied English keyword for Catastrophe archival photo (misal: 'Titanic iceberg sinking disaster 1912')"
  },
  "nodes": [
    {
      "step": 1,
      "timeOrYear": "LOKASI • JAM/TAHUN",
      "headline": "JUDUL AKSI 1",
      "narration": "Narasi aksi 1 (12-20 kata). Fokus pada satu momen/tindakan spesifik yang sedang terjadi.",
      "chaosLevel": 15,
      "mediaType": "graphic",
      "directorType": "pilihan arketipe sketsa 1 yang 100% cocok dengan aksi ini",
      "primaryText": "Teks grafis 1",
      "secondaryText": "Subjudul grafis 1",
      "stampText": "STATUS 1",
      "caption": "Keterangan forensik singkat..."
    },
    {
      "step": 2,
      "timeOrYear": "LOKASI • JAM/TAHUN",
      "headline": "JUDUL AKSI 2",
      "narration": "Narasi aksi 2 (12-20 kata). Ganti objek atau aksi berikutnya dalam rantai peristiwa.",
      "chaosLevel": 25,
      "mediaType": "graphic",
      "directorType": "pilihan arketipe sketsa 2 yang berbeda dan cocok dengan aksi 2",
      "primaryText": "Teks grafis 2",
      "secondaryText": "Subjudul grafis 2",
      "stampText": "STATUS 2",
      "caption": "Keterangan forensik singkat..."
    },
    {
      "step": 3,
      "timeOrYear": "LOKASI • JAM/TAHUN",
      "headline": "JUDUL AKSI 3",
      "narration": "Narasi aksi 3 (12-20 kata). Eskalasi ketegangan berikutnya.",
      "chaosLevel": 35,
      "mediaType": "graphic",
      "directorType": "pilihan arketipe sketsa 3 yang berbeda",
      "primaryText": "Teks grafis 3",
      "secondaryText": "Subjudul grafis 3",
      "stampText": "STATUS 3",
      "caption": "Keterangan forensik singkat..."
    },
    {
      "step": 4,
      "timeOrYear": "LOKASI • JAM/TAHUN",
      "headline": "JUDUL AKSI 4",
      "narration": "Narasi aksi 4 (12-20 kata). Titik kritis kepanikan.",
      "chaosLevel": 50,
      "mediaType": "graphic",
      "directorType": "pilihan arketipe sketsa 4 yang berbeda",
      "primaryText": "Teks grafis 4",
      "secondaryText": "Subjudul grafis 4",
      "stampText": "STATUS 4",
      "caption": "Keterangan forensik singkat..."
    },
    {
      "step": 5,
      "timeOrYear": "LOKASI • JAM/TAHUN",
      "headline": "JUDUL AKSI 5",
      "narration": "Narasi aksi 5 (12-20 kata). Kegagalan sistem / penghalang fatal.",
      "chaosLevel": 65,
      "mediaType": "graphic",
      "directorType": "pilihan arketipe sketsa 5 yang berbeda",
      "primaryText": "Teks grafis 5",
      "secondaryText": "Subjudul grafis 5",
      "stampText": "STATUS 5",
      "caption": "Keterangan forensik singkat..."
    },
    {
      "step": 6,
      "timeOrYear": "LOKASI • JAM/TAHUN",
      "headline": "JUDUL AKSI 6",
      "narration": "Narasi aksi 6 (12-20 kata). Ancaman di depan mata.",
      "chaosLevel": 75,
      "mediaType": "graphic",
      "directorType": "pilihan arketipe sketsa 6 yang berbeda",
      "primaryText": "Teks grafis 6",
      "secondaryText": "Subjudul grafis 6",
      "stampText": "STATUS 6",
      "caption": "Keterangan forensik singkat..."
    },
    {
      "step": 7,
      "timeOrYear": "LOKASI • JAM/TAHUN",
      "headline": "JUDUL AKSI 7 (KLIMAKS)",
      "narration": "Narasi aksi 7 (12-20 kata). Benturan / malapetaka puncak terjadi!",
      "chaosLevel": 90,
      "mediaType": "graphic",
      "directorType": "pilihan arketipe sketsa 7 (klimaks bencana)",
      "primaryText": "Teks grafis 7",
      "secondaryText": "Subjudul grafis 7",
      "stampText": "KLIMAKS",
      "caption": "Keterangan forensik singkat..."
    },
    {
      "step": 8,
      "timeOrYear": "LOKASI • JAM/TAHUN",
      "headline": "JUDUL AKSI 8 (DAMPAK AKHIR)",
      "narration": "Narasi aksi 8 (12-20 kata). Dampak kolosal sejarah dan vonis akhir.",
      "chaosLevel": 85,
      "mediaType": "graphic",
      "directorType": "pilihan arketipe sketsa 8 (sidang/kehancuran)",
      "primaryText": "Teks grafis 8",
      "secondaryText": "Subjudul grafis 8",
      "stampText": "VONIS",
      "caption": "Keterangan forensik singkat..."
    }
  ],
  "outro": {
    "narration": "Menurutmu, apa keputusan sepele yang kamu ambil hari ini, yang tanpa kamu sadari, bakal mengubah jalan hidupmu 5 tahun lagi?",
    "question": "Menurutmu, apa keputusan sepele yang kamu ambil hari ini yang bakal mengubah jalan hidupmu 5 tahun lagi?"
  }
}
`;

// Helper: Rotational Gemini Caller with Per-Key RPM Governor & Auto-Cooldown
async function callGeminiWithRotation(taskFn) {
  return await rpmGovernor.executeWithGovernor('Gemini Task', taskFn);
}

// Groq Cloud LPU Fallback (Zero 503 Spike Guarantee)
async function generateStoryboardWithGroq(topic, dynamicPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY tidak ditemukan di file .env');

  console.log('      [LPU Failover] Mengaktifkan Groq Cloud LPU (Cadangan Darurat)...');
  const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'openai/gpt-oss-120b'];
  let lastErr = null;

  for (const modelName of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'system',
              content: 'You are an autonomous AI Film Director specializing in dramatic Butterfly Effect short videos. You must output pure valid JSON with NO markdown formatting and NO conversational text.',
            },
            {
              role: 'user',
              content: dynamicPrompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.88,
        }),
      });

      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        console.log(`      ✓ Naskah berhasil disusun via Groq LPU (${modelName})!`);
        return data.choices[0].message.content;
      }
      if (data.error) throw new Error(data.error.message);
    } catch (err) {
      lastErr = err;
      console.warn(`      [Groq Failover] Model ${modelName} gagal: ${err.message}. Mencoba model berikutnya...`);
    }
  }
  throw lastErr || new Error('Semua model Groq gagal.');
}

// Guaranteed High Visual Density Guard (Anti-Short Story Safety Gate)
async function ensureHighVisualDensity(storyData, topic) {
  if (Array.isArray(storyData.nodes) && storyData.nodes.length >= 8) {
    return storyData;
  }

  console.log(`      ⚠️ [Densitas Guard] Naskah awal memiliki ${storyData.nodes?.length || 0} adegan (kurang dari target 8-14 adegan).`);
  console.log(`      🚀 [AI Multi-Sketch Expander] Membedah setiap babak menjadi sub-sketsa aksi detail agar video kaya & berdurasi ideal...`);

  const expandPrompt = `Kamu adalah Sutradara Film AI Senior.
Naskah Butterfly Effect berikut terlalu ringkas karena hanya memiliki ${storyData.nodes?.length || 0} adegan:
Judul: "${storyData.title || topic}"
Hook: "${storyData.hook?.narration || ''}"
Adegan Saat Ini:
${JSON.stringify(storyData.nodes, null, 2)}
Outro: "${storyData.outro?.narration || ''}"

TUGAS MUTLAK:
Pecah dan kembangkan alur di atas menjadi MINIMAL 10 HINGGA 14 ADEGAN VISUAL GRANULAR ('nodes')!
DILARANG MERINGKAS ATAU MENGURANGI!
Setiap adegan harus fokus pada 1 aksi/objek spesifik (durasi 3-5 detik, 12-20 kata narasi per node) dengan pilihan 'directorType' yang tepat:
Pilihan directorType: memo-handoff, memo-investigation, press-podium, press-question, breaking-news, panic-phone, crowd-protest, gate-breach, wall-demolition, domino-collapse, key-lockbox, telegram-wire, courtroom-gavel, tactical-map, valve-failure, clock-countdown.

FORMAT JSON MURNI:
{
  "nodes": [
    {
      "step": 1,
      "timeOrYear": "LOKASI • JAM/TAHUN",
      "headline": "JUDUL AKSI 1",
      "narration": "Narasi aksi 1 (12-20 kata)...",
      "chaosLevel": 10,
      "mediaType": "graphic",
      "directorType": "memo-handoff",
      "primaryText": "Teks grafis 1",
      "secondaryText": "Subjudul 1",
      "stampText": "STATUS 1",
      "caption": "Keterangan forensik..."
    }
  ]
}`;

  try {
    const expandedResult = await rpmGovernor.executeWithGovernor('Scene Expander', async (ai, key, keyNum) => {
      const model = rpmGovernor.getBestModelForKey(keyNum, 'text');
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: expandPrompt }] }],
        config: { temperature: 0.75, topP: 0.95 },
      });
      return res.text;
    });

    let clean = expandedResult.replace(/```json/gi, '').replace(/```/g, '').trim();
    const fIdx = clean.indexOf('{');
    const lIdx = clean.lastIndexOf('}');
    if (fIdx !== -1 && lIdx !== -1) {
      const parsed = JSON.parse(clean.slice(fIdx, lIdx + 1));
      if (Array.isArray(parsed.nodes) && parsed.nodes.length >= 8) {
        storyData.nodes = parsed.nodes;
        console.log(`      ✓ [AI Expander Berhasil] Alur berhasil dimekarkan menjadi ${storyData.nodes.length} adegan dinamis!`);
      }
    }
  } catch (err) {
    console.warn(`      [Expander Warning] Gagal expand otomatis: ${err.message}. Melanjutkan dengan struktur awal.`);
  }

  return storyData;
}

// -----------------------------------------------------------------------------
// STEP 1: Direct Storyboard via Gemini / Groq with High Creativity (Temp 0.88)
// -----------------------------------------------------------------------------
async function generateStoryboard(topic) {
  console.log('[1/4] Sutradara AI sedang merancang alur cerita & kurasi visual unik...');
  console.log('      (Menganalisa topik & menyusun 8-15 adegan berantai...)');

  // Perspective selection (explicit or random for high variance)
  const explicitPerspectiveIdx = process.argv[3] !== undefined && !isNaN(Number(process.argv[3])) ? Number(process.argv[3]) : null;
  const selectedPerspective = explicitPerspectiveIdx !== null && CREATIVE_PERSPECTIVES[explicitPerspectiveIdx]
    ? CREATIVE_PERSPECTIVES[explicitPerspectiveIdx]
    : CREATIVE_PERSPECTIVES[Math.floor(Math.random() * CREATIVE_PERSPECTIVES.length)];
  const sessionSalt = Date.now().toString(36);
  console.log(`      ✓ Sudut Pandang Kreatif: ${selectedPerspective.name}`);
  console.log(`      ✓ Arahan Sutradara: "${selectedPerspective.angle}"`);

  // Load Autonomous Learning Memory
  const learningDb = loadLearningMemory();
  const benchmarkExamples = (learningDb.best_story_benchmarks || [])
    .slice(0, 3)
    .map(
      (b) =>
        `- Judul: "${b.title}"\n  Gaya Hook: "${b.hookStyle}" (${b.hookNarration})\n  Adegan: ${(b.scenes || []).join(' -> ')}\n  Alasan Sukses: ${b.why_successful}`
    )
    .join('\n');
  const blacklistedStr = (learningDb.blacklisted_patterns || []).join(', ');

  const dynamicPrompt = `${DIRECTOR_PROMPT}\n\n` +
    `================================================================\n` +
    `MEMORI PEMBELAJARAN OTONOM DARI FEEDBACK SEBELUMNYA:\n` +
    `CONTOH NASKAH TERBAIK YANG DISUKAI PENONTON:\n${benchmarkExamples || 'Gunakan format dokumenter orisinil.'}\n\n` +
    `DAFTAR POLA/KATA YANG DILARANG (BLACKLISTED): ${blacklistedStr || 'Tidak ada.'}\n` +
    `================================================================\n\n` +
    `ARAHAN SUTRADARA UNTUK PRODUKSI INI (TAKE / ATTEMPT BARU):\n` +
    `SUDUT PANDANG (PERSPECTIVE): ${selectedPerspective.name}\n` +
    `INSTRUKSI KHUSUS: ${selectedPerspective.angle}\n` +
    `UNIQUE SESSION SEED: ${sessionSalt}\n` +
    `PENTING: Buat naskah, alur cerita, kalimat narasi, dan pilihan visual yang SEGAR, BERVARIASI, dan BERBEDA dari versi sebelumnya!\n` +
    `================================================================\n\n` +
    `Topik Cerita Butterfly Effect: "${topic}"`;

  const t0 = Date.now();
  let result = '';

  const provider = (process.env.STORY_PROVIDER || 'auto').toLowerCase();

  if (provider === 'groq') {
    result = await generateStoryboardWithGroq(topic, dynamicPrompt);
  } else {
    console.log(`      ⚡ Menjalankan Anti-Burst Parallel Race (${API_KEYS.length} Gemini Keys + Groq LPU Turbo)...`);
    console.log(`      📊 Status RPM Governor: ${rpmGovernor.getStatusString()}`);

    // Build anti-burst racing tasks: strictly 1 request per healthy key
    const availableKeys = rpmGovernor.getAvailableKeysForRace();
    const tasks = [];

    for (const keyState of availableKeys) {
      const { index, key } = keyState;
      const model = rpmGovernor.getBestModelForKey(index, 'text');
      const ai = new GoogleGenAI({ apiKey: key });

      rpmGovernor.recordRequest(index);

      tasks.push(
        (async () => {
          try {
            const res = await ai.models.generateContent({
              model,
              contents: [{ role: 'user', parts: [{ text: dynamicPrompt }] }],
              config: { temperature: 0.88, topP: 0.95 },
            });
            return { provider: `Gemini Key ${index} (${model})`, text: res.text };
          } catch (err) {
            const msg = err.message || '';
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded')) {
              rpmGovernor.penalizeKey(index, '429 Rate Limit');
            }
            throw err;
          }
        })()
      );
    }

    try {
      const winner = await Promise.any(tasks);
      result = winner.text;
      console.log(`      🎉 [Pemenang Balapan AI] Naskah tercepat selesai oleh: ${winner.provider}!`);
    } catch (allErr) {
      console.warn(`[Peringatan] Seluruh kandidat paralel mengalami kendala (${allErr.message}). Mengaktifkan panggilan darurat Groq LPU...`);
      result = await generateStoryboardWithGroq(topic, dynamicPrompt);
    }
  }

  console.log(`      ✓ Naskah & kurasi visual selesai dalam ${((Date.now() - t0) / 1000).toFixed(1)} detik.`);

  const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
  let storyData = JSON.parse(cleaned);

  // Autonomous AI Quality Critic Audit (Actor-Critic Self-Refinement Loop)
  console.log(`\n      [AI Supervisor Audit] Mengaudit naskah secara mandiri (Fact-Check & Anti-Halusinasi)...`);
  const auditRes = await auditAndRefineStory(storyData, topic);
  if (auditRes.storyData) {
    storyData = auditRes.storyData;
  }
  console.log(`      ✓ [AI Supervisor] Skor Kelayakan: ${auditRes.score}/100 | Potensi Retensi Viral: ${auditRes.retentionScore || 92}/100 - ${auditRes.notes}`);

  // Guaranteed High Visual Density Guard (Anti-Short Story Safety Gate)
  storyData = await ensureHighVisualDensity(storyData, topic);

  // Normalize & Supervise Editorial Style (AI-Directed Eye Comfort & Mood Tone)
  if (!storyData.editorialStyle || typeof storyData.editorialStyle !== 'object') {
    const topicLower = topic.toLowerCase();
    let defaultMood = 'clean-documentary';
    if (topicLower.includes('berlin') || topicLower.includes('perang') || topicLower.includes('soviet') || topicLower.includes('spionase')) {
      defaultMood = 'cold-war-crisis';
    } else if (topicLower.includes('titanic') || topicLower.includes('kapal') || topicLower.includes('misteri') || topicLower.includes('forensik')) {
      defaultMood = 'noir-forensic';
    } else if (topicLower.includes('chernobyl') || topicLower.includes('nuklir') || topicLower.includes('radiasi') || topicLower.includes('ledakan')) {
      defaultMood = 'industrial-decay';
    } else if (topicLower.includes('darurat') || topicLower.includes('panik') || topicLower.includes('breaking') || topicLower.includes('kebakaran')) {
      defaultMood = 'amber-urgent';
    }
    storyData.editorialStyle = {
      mood: defaultMood,
      grainIntensity: 0.048,
      vignetteStrength: 0.35,
      shakeSensitivity: 'moderate',
      shakeThresholdChaos: 65,
    };
  } else {
    if (!storyData.editorialStyle.mood) storyData.editorialStyle.mood = 'cold-war-crisis';
    // Clamp grain intensity for eye comfort (0.025 to 0.065)
    const rawGrain = typeof storyData.editorialStyle.grainIntensity === 'number' ? storyData.editorialStyle.grainIntensity : 0.048;
    storyData.editorialStyle.grainIntensity = Math.max(0.025, Math.min(0.065, rawGrain));
    const rawVignette = typeof storyData.editorialStyle.vignetteStrength === 'number' ? storyData.editorialStyle.vignetteStrength : 0.35;
    storyData.editorialStyle.vignetteStrength = Math.max(0.2, Math.min(0.5, rawVignette));
    if (!storyData.editorialStyle.shakeSensitivity) storyData.editorialStyle.shakeSensitivity = 'moderate';
    if (typeof storyData.editorialStyle.shakeThresholdChaos !== 'number') storyData.editorialStyle.shakeThresholdChaos = 65;
  }
  console.log(`      🎨 [AI Editorial Style] Mood: ${storyData.editorialStyle.mood} | Grain: ${storyData.editorialStyle.grainIntensity} | Shake Chaos: ${storyData.editorialStyle.shakeThresholdChaos}`);

  // Normalize Hook
  if (!storyData.hook || typeof storyData.hook !== 'object') {
    storyData.hook = {
      hookStyle: 'fullscreen-dramatic',
      kicker: 'DOKUMENTER INVESTIGASI',
      headline: storyData.title || topic,
      narration: `Satu kelalaian kecil yang tampak sepele... mengubah jalannya sejarah dunia hanya dalam hitungan jam.`,
      leftTitle: 'Awal Mula Sepele',
      rightTitle: 'Bencana Global',
      leftBadge: 'AWAL MULA SEPELE',
      rightBadge: 'BENCANA GLOBAL',
    };
  } else {
    if (!storyData.hook.hookStyle) storyData.hook.hookStyle = 'fullscreen-dramatic';
    if (!storyData.hook.kicker) storyData.hook.kicker = 'DOKUMENTER INVESTIGASI';
    if (!storyData.hook.headline) storyData.hook.headline = storyData.title || topic;
    if (!storyData.hook.narration) {
      storyData.hook.narration = `Satu kelalaian kecil pada ${storyData.hook.leftTitle || 'hari itu'} memicu rangkaian kehancuran tak terbendung hingga meruntuhkan tatanan dunia.`;
    }
    if (!storyData.hook.leftTitle) storyData.hook.leftTitle = 'Awal Mula Sepele';
    if (!storyData.hook.rightTitle) storyData.hook.rightTitle = 'Bencana Global';
    if (!storyData.hook.leftBadge) storyData.hook.leftBadge = 'AWAL MULA SEPELE';
    if (!storyData.hook.rightBadge) storyData.hook.rightBadge = 'BENCANA GLOBAL';
  }

  // Normalize Outro
  if (!storyData.outro || typeof storyData.outro !== 'object') {
    const defaultOutro = typeof storyData.outro === 'string'
      ? storyData.outro
      : 'Menurutmu, apa keputusan sepele yang kamu ambil hari ini, yang tanpa kamu sadari, bakal mengubah jalan hidupmu 5 tahun lagi?';
    storyData.outro = {
      narration: defaultOutro,
      question: defaultOutro,
    };
  } else {
    if (!storyData.outro.narration) {
      storyData.outro.narration = storyData.outro.question || 'Menurutmu, apa keputusan sepele yang kamu ambil hari ini yang bakal mengubah hidupmu 5 tahun lagi?';
    }
    if (!storyData.outro.question) {
      storyData.outro.question = storyData.outro.narration;
    }
  }

  // Normalize Nodes
  if (!Array.isArray(storyData.nodes) || storyData.nodes.length === 0) {
    throw new Error('Storyboard JSON tidak memiliki array nodes yang valid');
  }

  // Enforce Clean Slate from 0: Unique Production Run ID (Zero stale cache reuse)
  const runId = Date.now().toString(36);
  const baseSlug = (storyData.id || topic)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 35) || 'story';
  storyData.id = `${baseSlug}-${runId}`;

  const storySlug = storyData.id;
  const storyMediaDir = path.join(ROOT_DIR, 'public', 'butterfly', 'media', storySlug);
  
  // Wipe and recreate directory to guarantee 100% fresh visuals from 0
  if (fs.existsSync(storyMediaDir)) {
    fs.rmSync(storyMediaDir, { recursive: true, force: true });
  }
  fs.mkdirSync(storyMediaDir, { recursive: true });

  // Helper to strictly detect if a scene is explicitly about a specific historical person or authentic object
  function isExplicitHistoricalSubject(txt, query) {
    const combined = (txt + ' ' + (query || '')).toLowerCase();
    const explicitEntities = [
      'schabowski', 'dyatlov', 'fleming', 'princip', 'fleet', 'ferdinand',
      'napoleon', 'krenz', 'legasov', 'gorbachev', 'hitler', 'stalin', 'churchill',
      'kennedy', 'lincoln', 'caesar', 'einstein', 'oppenheimer', 'newton',
      'titanic', 'brandenburg gate', 'lusitania', 'carpathia',
      'bismarck', 'archduke', 'gavrilo', 'edward smith', 'captain smith',
      'akimov', 'toptunov', 'valery legasov', 'boris shcherbina', 'j. bruce ismay',
      'columbus', 'galileo', 'darwin', 'edison', 'tesla', 'fdr', 'truman',
      'hirohito', 'nixon', 'khrushchev', 'trotsky', 'lenin', 'cleopatra'
    ];
    return explicitEntities.some((entity) => combined.includes(entity));
  }

  function isHistoricalClimaxEvent(txt, query) {
    const combined = (txt + ' ' + (query || '')).toLowerCase();
    const climaxEntities = [
      'world war', 'perang dunia', 'berlin wall', 'tembok berlin',
      'chernobyl', 'reaktor chernobyl', 'titanic', 'kapal titanic',
      'cold war', 'perang dingin', 'watergate', 'hiroshima'
    ];
    return climaxEntities.some((entity) => combined.includes(entity));
  }

  console.log(`\n      [Visual Hunter (Clean Slate)] Kurasi visual otonom untuk: "${storyData.title || topic}"...`);

  // Hook Pembuka: 100% Sketsa Animasi Vektor Dinamis & Tipografi Forensik (ZERO B-roll web scraper risk!)
  storyData.hook.leftImage = null;
  storyData.hook.rightImage = null;

  // Tentukan arketipe animasi pembuka yang dramatis & 100% relevan
  if (!storyData.hook.archetype) {
    const graphicNode = storyData.nodes.find(
      (n) => n.directorType && n.directorType !== 'forensic-dossier'
    );
    const topLower = topic.toLowerCase();
    storyData.hook.archetype = graphicNode
      ? graphicNode.directorType
      : topLower.includes('berlin')
      ? 'wall-demolition'
      : topLower.includes('chernobyl')
      ? 'reactor-meltdown'
      : topLower.includes('titanic')
      ? 'maritime-disaster'
      : topLower.includes('sopir') || topLower.includes('mobil')
      ? 'car-route'
      : 'memo-investigation';
  }
  console.log(`      ⚙ [Hook Sinematik 1080x1920] Menggunakan Sketsa Vektor Dinamis: "${storyData.hook.archetype}" (Bebas dari foto acak internet)`);

  let photoCount = 0;
  let graphicCount = 0;
  const usedPhotos = new Set();

  const VALID_DIRECTOR_TYPES = new Set([
    'wall-demolition', 'gate-breach', 'domino-collapse', 'maritime-disaster',
    'reactor-meltdown', 'laboratory-discovery', 'press-podium', 'memo-investigation',
    'panic-phone', 'breaking-news', 'soviet-collapse', 'tactical-map',
    'critical-gauge', 'forensic-dossier', 'bureaucracy-draft', 'memo-handoff',
    'breaking-ticker', 'press-question', 'schabowski-slip',
    'clock-countdown', 'key-lockbox', 'car-route', 'radiation-hazard',
    'valve-failure', 'telegraph-wire', 'crowd-protest', 'courtroom-gavel'
  ]);

  for (let i = 0; i < storyData.nodes.length; i++) {
    const node = storyData.nodes[i];
    node.step = i + 1;
    const txt = (node.headline + ' ' + node.narration + ' ' + (node.caption || '')).toLowerCase();

    // STRICT USER RULE: Default to FULL ANIMATED SKETCH (graphic).
    // B-Roll Photo is ONLY permitted if an explicit historical person or landmark is mentioned!
    const qualifiesForPhoto = node.mediaType === 'photo' && isExplicitHistoricalSubject(txt, node.searchQuery);

    let isPhotoDownloaded = false;
    if (qualifiesForPhoto) {
      const nodeDest = path.join(storyMediaDir, `node_${node.step}.jpg`);
      const nodeQuery = node.searchQuery || `${topic} ${node.headline}`;
      const fallbackNodeQuery = `${topic} ${node.primaryText || ''}`;
      const res = await searchAndDownloadImage(nodeQuery, fallbackNodeQuery, nodeDest, {
        topic,
        headline: node.headline,
        narration: node.narration,
      });
      if (res.success) {
        isPhotoDownloaded = true;
        node.mediaType = 'photo';
        node.mediaUrl = `butterfly/media/${storySlug}/node_${node.step}.jpg`;
        usedPhotos.add(node.mediaUrl);
        photoCount++;
        console.log(`      ✓ [Bukti Saksi Nyata Adegan ${node.step}] Arsip tokoh/objek: "${res.title}" (${res.source})`);
      }
    }

    if (!isPhotoDownloaded) {
      // 100% Vector Forensic Animated Sketch
      node.mediaType = 'graphic';
      graphicCount++;

      // If the AI already chose a valid directorType, RESPECT AND PRESERVE THE AI'S CHOICE!
      if (node.directorType && VALID_DIRECTOR_TYPES.has(node.directorType)) {
        // AI choice is preserved!
      } else {
        // Comprehensive Semantic Matcher across all 26 archetypes:
        if (txt.includes('jam') || txt.includes('detik') || txt.includes('menit') || txt.includes('waktu') || txt.includes('hitung') || txt.includes('countdown')) {
          node.directorType = 'clock-countdown';
        } else if (txt.includes('kunci') || txt.includes('loker') || txt.includes('brankas') || txt.includes('teropong') || txt.includes('terkunci')) {
          node.directorType = 'key-lockbox';
        } else if (txt.includes('sopir') || txt.includes('mobil') || txt.includes('belok') || txt.includes('rute') || txt.includes('jalan') || txt.includes('tikungan')) {
          node.directorType = 'car-route';
        } else if (txt.includes('katup') || txt.includes('valve') || txt.includes('pipa') || txt.includes('bocor') || txt.includes('uap') || txt.includes('tekanan')) {
          node.directorType = 'valve-failure';
        } else if (txt.includes('radiasi') || txt.includes('roentgen') || txt.includes('hazard') || txt.includes('awan') || txt.includes('nuklir') || txt.includes('pripyat')) {
          node.directorType = 'radiation-hazard';
        } else if (txt.includes('telegraf') || txt.includes('morse') || txt.includes('sinyal') || txt.includes('sos') || txt.includes('cqd') || txt.includes('radio')) {
          node.directorType = 'telegraph-wire';
        } else if (txt.includes('protes') || txt.includes('revolusi') || txt.includes('massa') || txt.includes('demo') || txt.includes('rakyat') || txt.includes('megafon')) {
          node.directorType = 'crowd-protest';
        } else if (txt.includes('sidang') || txt.includes('pengadilan') || txt.includes('vonis') || txt.includes('hakim') || txt.includes('investigasi') || txt.includes('saksi')) {
          node.directorType = 'courtroom-gavel';
        } else if (txt.includes('kapal') || txt.includes('tenggelam') || txt.includes('gunung es') || txt.includes('titanic') || txt.includes('samudera') || txt.includes('laut')) {
          node.directorType = 'maritime-disaster';
        } else if (txt.includes('reaktor') || txt.includes('batang kendali') || txt.includes('chernobyl') || txt.includes('meltdown') || txt.includes('daya')) {
          node.directorType = 'reactor-meltdown';
        } else if (txt.includes('bakteri') || txt.includes('penisilin') || txt.includes('laboratorium') || txt.includes('cawan') || txt.includes('jamur')) {
          node.directorType = 'laboratory-discovery';
        } else if (txt.includes('domino') || txt.includes('bubar') || txt.includes('kolaps') || txt.includes('tirai besi') || txt.includes('runtuh beruntun') || txt.includes('berantai')) {
          node.directorType = 'domino-collapse';
        } else if (txt.includes('tembok') || txt.includes('roboh') || txt.includes('palu') || txt.includes('dorong') || txt.includes('hancur') || txt.includes('beton')) {
          node.directorType = 'wall-demolition';
        } else if (txt.includes('gerbang') || txt.includes('palang') || txt.includes('pos bornholmer') || txt.includes('serbu') || txt.includes('terobos') || txt.includes('buka')) {
          node.directorType = 'gate-breach';
        } else if (txt.includes('konferensi') || txt.includes('pers') || txt.includes('wartawan') || txt.includes('podium') || txt.includes('bicara')) {
          node.directorType = 'press-podium';
        } else if (txt.includes('memo') || txt.includes('draf') || txt.includes('regulasi') || txt.includes('surat') || txt.includes('kertas') || txt.includes('sofort') || txt.includes('dokumen')) {
          node.directorType = 'memo-investigation';
        } else if (txt.includes('telepon') || txt.includes('panik') || txt.includes('dering') || txt.includes('pos jaga') || txt.includes('alarm')) {
          node.directorType = 'panic-phone';
        } else if (txt.includes('tv') || txt.includes('siaran') || txt.includes('breaking') || txt.includes('berita') || txt.includes('kabar')) {
          node.directorType = 'breaking-news';
        } else if (txt.includes('peta') || txt.includes('radar') || txt.includes('koordinat') || txt.includes('target')) {
          node.directorType = 'tactical-map';
        } else if (txt.includes('tekanan') || txt.includes('suhu') || txt.includes('kecepatan') || txt.includes('overload')) {
          node.directorType = 'critical-gauge';
        } else {
          node.directorType = 'forensic-dossier';
        }
      }
      node.mediaUrl = node.directorType;
      console.log(`      ⚙ [Sketsa Animasi Forensik Adegan ${node.step}] Menggunakan: "${node.directorType}"`);
    }

    if (!node.zoomDirection) {
      node.zoomDirection = i % 3 === 0 ? 'out' : i % 2 === 0 ? 'in' : 'panRight';
    }
  }

  console.log(`      ✓ Judul: "${storyData.title}"`);
  console.log(`      ✓ Jumlah Adegan: ${storyData.nodes.length} adegan`);
  console.log(`      ✓ Visual Kurasi: ${photoCount} Foto Arsip + ${graphicCount} Sketsa Animasi Forensik\n`);

  return storyData;
}

/**
 * AI Voiceover Pacing & Phonetics Supervisor:
 * 1. Converts numbers, years, and dates to natural spoken Indonesian.
 * 2. Applies phonetic transcription for tricky foreign historical names.
 * 3. Sanitizes typography artifacts (quotes, brackets) to ensure pristine TTS output.
 * 4. Audits voiceover pacing and word rate (~130-150 words per minute).
 */
async function prepareTtsScriptWithAiSupervisor(rawScript, topic) {
  // 1. Try Gemini via RPM Governor (1M TPM, Flawless Indonesian phonetics)
  try {
    const rawResult = await rpmGovernor.executeWithGovernor('Phonetics Supervisor', async (ai, key, keyNum) => {
      const model = rpmGovernor.getBestModelForKey(keyNum, 'text');
      const res = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text:
                  'You are an elite Voice Director & Phonetics Supervisor for documentary voiceovers.\n' +
                  'Convert numbers and foreign names into natural Indonesian spoken phonetic text so TTS engines pronounce them flawlessly.\n' +
                  'Example: "1989" -> "sembilan belas delapan puluh sembilan", "Günter Schabowski" -> "Gunter Syabofski", "Bornholmer Straße" -> "Bornholmer Strase".\n' +
                  'Return pure valid JSON:\n{\n  "phoneticScript": "...",\n  "wordCount": 150,\n  "estimatedDurationSec": 60\n}\n\n' +
                  `NASKAH ASLI TOPIK "${topic}":\n"${rawScript}"\n\nOptimalkan naskah di atas untuk narasi suara TTS Indonesia agar pengucapan nama asing dan angka terdengar sangat alami.`,
              },
            ],
          },
        ],
        config: { temperature: 0.1, topP: 0.95 },
      });
      return res.text;
    });

    let clean = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();
    const fIdx = clean.indexOf('{');
    const lIdx = clean.lastIndexOf('}');
    if (fIdx !== -1 && lIdx !== -1) {
      const parsed = JSON.parse(clean.slice(fIdx, lIdx + 1));
      if (parsed.phoneticScript && parsed.phoneticScript.length > 20) {
        console.log(`      ✓ [AI Vocal Director] Naskah dioptimalkan fonetiknya (${parsed.wordCount || parsed.phoneticScript.split(' ').length} kata, est. ~${parsed.estimatedDurationSec || 60}s)`);
        return parsed.phoneticScript;
      }
    }
  } catch (geminiErr) {
    console.warn('[AI Vocal Director] Gemini phonetic skipped, mencoba Groq cadangan:', geminiErr.message);
  }

  // 2. Fallback to Groq LPU (Using token-efficient qwen/qwen3.8-27b)
  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'system',
              content:
                'You are an elite Voice Director & Phonetics Supervisor for documentary voiceovers. ' +
                'Convert numbers and foreign names into natural Indonesian spoken phonetic text so TTS engines pronounce them flawlessly. ' +
                'Return pure valid JSON: { "phoneticScript": "...", "wordCount": number, "estimatedDurationSec": number }',
            },
            {
              role: 'user',
              content: `NASKAH ASLI TOPIK "${topic}":\n"${rawScript}"\n\nOptimalkan naskah di atas untuk narasi suara TTS Indonesia agar pengucapan nama asing dan angka terdengar sangat alami.`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed.phoneticScript && parsed.phoneticScript.length > 20) {
            console.log(`      ✓ [AI Vocal Director Groq] Naskah dioptimalkan fonetiknya (${parsed.wordCount || parsed.phoneticScript.split(' ').length} kata, est. ~${parsed.estimatedDurationSec || 60}s)`);
            return parsed.phoneticScript;
          }
        }
      }
    } catch (err) {
      console.warn('[AI Vocal Director] Skip phonetic supervisor due to network:', err.message);
    }
  }

  // Fallback: Rule-based phonetic normalizer
  return rawScript
    .replace(/\b1989\b/g, 'sembilan belas delapan puluh sembilan')
    .replace(/\b1912\b/g, 'sembilan belas dua belas')
    .replace(/\b1986\b/g, 'sembilan belas delapan puluh enam')
    .replace(/\b1914\b/g, 'sembilan belas empat belas')
    .replace(/Günter Schabowski/gi, 'Gunter Syabofski')
    .replace(/Bornholmer Straße/gi, 'Bornholmer Strase')
    .replace(/["“”«»]/g, '')
    .trim();
}

// -----------------------------------------------------------------------------
// STEP 2: Synthesize Voiceover via Gemini 3.8 Flash Lite TTS
// -----------------------------------------------------------------------------
async function generateVoiceover(storyData) {
  console.log('[2/4] Mensintesis narasi vokal via Gemini 3.8 Flash Lite TTS...');

  const scriptParts = [
    storyData.hook?.narration || 'Kalian bayangin ini...',
    ...storyData.nodes.map((n) => n?.narration || ''),
    storyData.outro?.narration || 'Menurutmu apa keputusan sepele hari ini yang bakal mengubah hidupmu 5 tahun lagi?',
  ].filter(Boolean);
  const rawScript = scriptParts.join(' ');

  // Supervised by AI Vocal Director & Phonetics Supervisor
  const fullScript = await prepareTtsScriptWithAiSupervisor(rawScript, storyData.title || topic);

  const audioBuffer = await callGeminiWithRotation(async (ai, key, keyNum) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: fullScript,
    });
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data) {
      console.log(`      ✓ Sintesis TTS berhasil menggunakan Key ${keyNum}!`);
      return Buffer.from(part.inlineData.data, 'base64');
    }
    throw new Error('TTS response tidak memuat inline audio bytes');
  });

  const outDir = path.join(ROOT_DIR, 'public', 'butterfly', 'audio');
  fs.mkdirSync(outDir, { recursive: true });

  const wavFilename = `${storyData.id}_voiceover.wav`;
  const wavPath = path.join(outDir, wavFilename);
  fs.writeFileSync(wavPath, audioBuffer);
  console.log(`      ✓ File audio tersimpan di: ${wavPath}\n`);

  return { wavPath, relAudioUrl: `butterfly/audio/${wavFilename}`, scriptParts };
}

// -----------------------------------------------------------------------------
// STEP 3: Whisper Millisecond Ground-Truth Alignment (Groq Cloud LPU)
// -----------------------------------------------------------------------------
async function runWhisperAlignment(wavPath, storyId) {
  const jsonOutput = path.join(ROOT_DIR, 'public', 'butterfly', 'audio', `${storyId}_whisper.json`);
  const groqApiKey = process.env.GROQ_API_KEY;

  if (groqApiKey) {
    try {
      console.log('[3/4] Melakukan penyelarasan audio via Groq Cloud LPU (Whisper Large V3)...');
      console.log('      (Kecepatan tinggi ~3 detik, akurasi tinggi, 0% beban CPU lokal!)');
      const whisperData = await transcribeWithGroq(wavPath, jsonOutput);
      console.log(`      ✓ Total durasi audio: ${whisperData.totalDurationSec} detik`);
      console.log(`      ✓ Total kata terdeteksi: ${whisperData.allWords.length} kata (Whisper Large V3)\n`);
      return whisperData;
    } catch (groqErr) {
      console.warn(`[Peringatan] Groq Cloud gagal (${groqErr.message}). Beralih ke fallback Whisper lokal...`);
    }
  }

  console.log('[3/4] Menjalankan fallback Whisper ASR lokal...');
  await new Promise((resolve, reject) => {
    const py = spawn('python', [
      path.join(__dirname, 'align_whisper.py'),
      wavPath,
      jsonOutput,
    ], { stdio: 'inherit' });

    py.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`align_whisper.py keluar dengan kode ${code}`));
    });
  });

  const whisperData = JSON.parse(fs.readFileSync(jsonOutput, 'utf8'));
  console.log(`      ✓ Total durasi audio: ${whisperData.totalDurationSec} detik`);
  console.log(`      ✓ Total kata terdeteksi: ${whisperData.allWords.length} kata\n`);

  return whisperData;
}

// -----------------------------------------------------------------------------
// STEP 4: Subtitle Paging & Story Construction (Ground-Truth Audio Aligned)
// -----------------------------------------------------------------------------
function cleanSubtitleWord(rawWord) {
  if (!rawWord) return '';
  return rawWord
    .replace(/[":;?!,()[\]{}…«»“”‘’\\/]/g, '')
    .replace(/\.+/g, '')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function normalizeToken(w) {
  return (w || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function partitionClause(words) {
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const remaining = words.length - i;
    let size = 3;
    if (remaining === 4) {
      size = 2;
    } else if (remaining === 2) {
      size = 2;
    } else if (remaining <= 3) {
      size = remaining;
    }
    chunks.push(words.slice(i, i + size));
    i += size;
  }
  return chunks;
}

function partitionSectionWords(sectionWords) {
  const clauses = [];
  let currentClause = [];

  for (let i = 0; i < sectionWords.length; i++) {
    const w = sectionWords[i];
    currentClause.push(w);

    const hasPunctuation = /[.!?]/.test(w.word);
    const nextWord = sectionWords[i + 1];
    const isBreathPause = nextWord ? (nextWord.start - w.end) >= 0.25 : false;

    if (hasPunctuation || isBreathPause || i === sectionWords.length - 1) {
      clauses.push(currentClause);
      currentClause = [];
    }
  }

  const allChunks = [];
  for (const clause of clauses) {
    if (clause.length > 0) {
      allChunks.push(...partitionClause(clause));
    }
  }
  return allChunks;
}

function buildSynchronizedStory(storyData, whisperData, relAudioUrl) {
  console.log('[4/4] Membangun timeline sinkron audio ground-truth dan kinetic subtitle berirama...');

  const FPS = 30;
  const allWords = whisperData.allWords || [];
  const totalFrames = Math.round(whisperData.totalDurationSec * FPS);

  const scriptSections = [
    { id: 'hook', text: storyData.hook.narration, target: storyData.hook },
    ...storyData.nodes.map((n) => ({ id: `node_${n.step}`, text: n.narration, target: n })),
    { id: 'outro', text: storyData.outro.narration, target: storyData.outro },
  ];

  let wordIdx = 0;
  const matchedSections = [];

  for (let s = 0; s < scriptSections.length; s++) {
    const currentSec = scriptSections[s];
    const nextSec = scriptSections[s + 1];

    const startWordIdx = wordIdx;
    let endWordIdx = -1;

    if (!nextSec) {
      endWordIdx = allWords.length - 1;
      wordIdx = allWords.length;
    } else {
      const nextStartTokens = nextSec.text.split(/\s+/).map(normalizeToken).filter((t) => t.length > 2).slice(0, 4);
      let foundNextStart = -1;
      for (let i = startWordIdx + 4; i < allWords.length; i++) {
        const wClean = normalizeToken(allWords[i]?.word);
        if (nextStartTokens.length > 0 && (wClean === nextStartTokens[0] || (wClean.startsWith(nextStartTokens[0]) && nextStartTokens[0].length >= 4))) {
          if (nextStartTokens.length >= 2 && i + 1 < allWords.length) {
            const wNext = normalizeToken(allWords[i + 1]?.word);
            if (wNext.includes(nextStartTokens[1]) || nextStartTokens[1].includes(wNext)) {
              foundNextStart = i;
              break;
            }
          } else {
            foundNextStart = i;
            break;
          }
        }
      }

      if (foundNextStart !== -1) {
        endWordIdx = foundNextStart - 1;
        wordIdx = foundNextStart;
      } else {
        const approxWords = currentSec.text.split(/\s+/).length;
        endWordIdx = Math.min(allWords.length - 1, startWordIdx + approxWords - 1);
        wordIdx = endWordIdx + 1;
      }
    }

    const assignedWords = allWords.slice(startWordIdx, endWordIdx + 1);
    matchedSections.push({
      ...currentSec,
      words: assignedWords,
      startSec: assignedWords[0]?.start ?? 0,
      endSec: assignedWords[assignedWords.length - 1]?.end ?? 0,
    });
  }

  // Calculate cut frames placed right in the silence gap between scenes
  const cutFrames = [0];
  for (let s = 0; s < matchedSections.length - 1; s++) {
    const cur = matchedSections[s];
    const nxt = matchedSections[s + 1];
    const midSec = (cur.endSec + nxt.startSec) / 2;
    const cutF = Math.round(midSec * FPS);
    cutFrames.push(cutF);
  }
  cutFrames.push(totalFrames);

  // AI Timeline & Rhythm Integrity Supervisor
  // Guarantees every scene has at least 2.5s (75 frames) breathing room and does not flash awkwardly
  const MIN_SCENE_FRAMES = 75; // 2.5s minimum
  for (let i = 1; i < cutFrames.length - 1; i++) {
    if (cutFrames[i] - cutFrames[i - 1] < MIN_SCENE_FRAMES) {
      cutFrames[i] = cutFrames[i - 1] + MIN_SCENE_FRAMES;
    }
  }
  // Ensure last cut leaves room for outro
  if (totalFrames - cutFrames[cutFrames.length - 2] < MIN_SCENE_FRAMES) {
    cutFrames[cutFrames.length - 2] = Math.max(0, totalFrames - MIN_SCENE_FRAMES);
  }

  // Apply ground-truth frame-perfect durations to Hook, Nodes, and Outro
  storyData.hook.durationFrames = cutFrames[1] - cutFrames[0];

  for (let i = 0; i < storyData.nodes.length; i++) {
    const node = storyData.nodes[i];
    const startF = cutFrames[i + 1];
    const endF = cutFrames[i + 2];
    node.startFrame = startF;
    node.durationFrames = endF - startF;
  }

  storyData.outro.durationFrames = cutFrames[cutFrames.length - 1] - cutFrames[cutFrames.length - 2];
  console.log(`      ✓ [AI Timeline Supervisor] Integritas durasi diverifikasi: Hook (${(storyData.hook.durationFrames / 30).toFixed(1)}s), ${storyData.nodes.length} Nodes (${(storyData.nodes.reduce((a,b)=>a+b.durationFrames,0) / 30).toFixed(1)}s), Outro (${(storyData.outro.durationFrames / 30).toFixed(1)}s)`);

  // Build clean stationary subtitle pages strictly within each scene
  const wordTimestamps = [];
  let pageIndex = 0;

  for (const sec of matchedSections) {
    const chunks = partitionSectionWords(sec.words);
    for (const chunk of chunks) {
      for (const w of chunk) {
        const cleanW = cleanSubtitleWord(w.word);
        if (cleanW) {
          wordTimestamps.push({
            word: cleanW,
            startFrame: Math.round(w.start * FPS),
            endFrame: Math.round(w.end * FPS),
            pageIndex,
          });
        }
      }
      pageIndex++;
    }
  }

  const fullStory = {
    id: storyData.id,
    title: storyData.title,
    editorialStyle: storyData.editorialStyle,
    hook: storyData.hook,
    nodes: storyData.nodes,
    outro: storyData.outro,
    wordTimestamps,
    audioUrl: relAudioUrl,
    totalDurationFrames: totalFrames,
  };

  // Save to active story file
  const outStoryTs = path.join(ROOT_DIR, 'src', 'data', 'currentStory.ts');
  const fileContent = `// Automatically generated by AI Director & Sutradara Pipeline
import { ButterflyStoryData } from './types';
export { cleanSubtitleWord } from '../utils/textUtils';

export const CURRENT_STORY: ButterflyStoryData = ${JSON.stringify(fullStory, null, 2)};
`;

  fs.writeFileSync(outStoryTs, fileContent, 'utf-8');

  // Also save a permanent archive copy in src/data/stories/<storyId>.ts
  const storiesDir = path.join(ROOT_DIR, 'src', 'data', 'stories');
  fs.mkdirSync(storiesDir, { recursive: true });
  const archivePath = path.join(storiesDir, `${storyData.id}.ts`);
  const archiveContent = `// Automatically generated by AI Director & Sutradara Pipeline
import { ButterflyStoryData } from '../types';
export { cleanSubtitleWord } from '../../utils/textUtils';

export const CURRENT_STORY: ButterflyStoryData = ${JSON.stringify(fullStory, null, 2)};
`;
  fs.writeFileSync(archivePath, archiveContent, 'utf-8');

  console.log(`      ✓ Data cerita aktif tersimpan di : src/data/currentStory.ts`);
  console.log(`      ✓ Arsip cerita tersimpan di       : src/data/stories/${storyData.id}.ts`);
  console.log(`      ✓ Total frame video: ${totalFrames} frames (${(totalFrames / 30).toFixed(2)} detik)`);
  console.log(`      ✓ Total halaman subtitle: ${pageIndex} halaman stationary\n`);
}

// -----------------------------------------------------------------------------
// MAIN ENTRY
// -----------------------------------------------------------------------------
async function main() {
  try {
    const storyData = await generateStoryboard(topic);
    const { wavPath, relAudioUrl } = await generateVoiceover(storyData);
    const whisperData = await runWhisperAlignment(wavPath, storyData.id);
    buildSynchronizedStory(storyData, whisperData, relAudioUrl);

    // 5. Automated AI Visual QA Supervisor (Vision Inspection & Safe-Zone Quality Gate)
    try {
      await runVisualQASupervisor(storyData);
    } catch (qaErr) {
      console.warn('      ⚠ [Visual QA Skip]', qaErr.message);
    }

    // 6. Automated YouTube Shorts Viral Publishing Pack (Titles, Description, Hashtags, Pinned Comment)
    try {
      await generatePublishingPack(storyData);
    } catch (pubErr) {
      console.warn('      ⚠ [Publishing Pack Skip]', pubErr.message);
    }

    console.log('================================================================');
    console.log('   PRODUKSI SUKSES! VIDEO SIAP DITINJAU ATAU DIRENDER CLOUD     ');
    console.log('================================================================');
    console.log('1. Buka preview instan di browser : jalankan "buka_studio.bat"');
    console.log('2. Render MP4 gratis di Cloud    : jalankan "render_di_cloud.bat"');
    console.log('   (Server GitHub RAM 16GB bekerja, laptop Anda tetap dingin!)');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n[FATAL ERROR]', err.message);
    process.exit(1);
  }
}

// Only execute main when run directly as CLI script
if (process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  main();
}
