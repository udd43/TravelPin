<div align="center">

# 📍 TravelPin

**친구들과 실시간 위치를 공유하고, 여행의 순간을 지도에 남겨보세요.**

_Drop pins. Share moments. Travel together._

[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![React 19](https://img.shields.io/badge/React-19-58c4dc?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)

<br />

[**데모 보기**](https://travel-pin.vercel.app) · [버그 리포트](https://github.com/udd43/TravelPin/issues) · [기능 요청](https://github.com/udd43/TravelPin/issues)

<br />

<img src="https://img.shields.io/badge/status-production--ready-10b981?style=flat-square" alt="status" />
<img src="https://img.shields.io/badge/PRs-welcome-ff6b6b?style=flat-square" alt="prs" />
<img src="https://img.shields.io/badge/mobile--first-responsive-646cff?style=flat-square" alt="mobile" />

</div>

<br />

## ✨ Features

<table>
<tr>
<td width="50%">

### 🗺️ 실시간 위치 공유
Google Maps 위에 친구들의 위치가 실시간으로 표시됩니다. 5초 간격 자동 갱신으로 서로의 움직임을 놓치지 마세요.

</td>
<td width="50%">

### 📸 포토 핀
여행 중 발견한 맛집, 풍경, 숨은 명소를 사진과 함께 지도에 핀으로 남기세요. 나중에 다시 찾아갈 수 있도록 길안내도 지원합니다.

</td>
</tr>
<tr>
<td width="50%">

### 💬 실시간 채팅
방 안에서 실시간 채팅으로 소통하세요. 위치 공유 메시지를 보내면 지도에서 바로 확인할 수 있습니다.

</td>
<td width="50%">

### 🔗 초대 링크
방 코드 한 줄이면 누구나 참여 가능. 카카오톡, 메시지, SNS로 공유하세요.

</td>
</tr>
</table>

<br />

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Client (SPA)                      │
│  React 19 · Vite 8 · Framer Motion · Google Maps    │
└─────────────────────┬────────────────────────────────┘
                      │ REST API
┌─────────────────────▼────────────────────────────────┐
│              Vercel Serverless Functions              │
│         /api/rooms · /api/pins · /api/messages        │
│         /api/users · /api/upload                      │
└──────┬──────────────┬──────────────┬─────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼─────────┐
│  Neon (PG)  │ │  Upstash   │ │ Vercel Blob  │
│   Rooms &   │ │  (Redis)   │ │   (Photos)   │
│    Pins     │ │  Members   │ │              │
│             │ │  Sessions  │ │              │
└─────────────┘ └────────────┘ └──────────────┘
```

<br />

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19, Vite 8 |
| **Routing** | React Router 7 |
| **Animation** | Framer Motion 12 |
| **Maps** | Google Maps API (`@react-google-maps/api`) |
| **Database** | Neon (Serverless Postgres) |
| **Cache / KV** | Upstash Redis |
| **Storage** | Vercel Blob |
| **Hosting** | Vercel (Serverless) |
| **Lint** | Oxlint |

<br />

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- Google Maps API Key
- Neon Database URL
- Upstash Redis credentials
- Vercel Blob token

### 1. Clone & Install

```bash
git clone https://github.com/udd43/TravelPin.git
cd TravelPin
npm install
```

### 2. Environment Variables

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Neon Postgres
DATABASE_URL=postgresql://...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=...
```

### 3. Database Setup

[Neon Console](https://console.neon.tech)의 SQL Editor에서 `schema.sql`을 실행하세요:

```bash
# 또는 psql로 직접 실행
psql $DATABASE_URL -f schema.sql
```

### 4. Run

```bash
npm run dev
```

`http://localhost:5173`에서 앱을 확인하세요.

<br />

## 📁 Project Structure

```
TravelPin/
├── api/                    # Vercel Serverless Functions
│   ├── rooms/              #   방 생성 · 조회 · 삭제
│   ├── pins/               #   핀 CRUD
│   ├── messages/           #   채팅 메시지
│   ├── users/              #   멤버 관리 · 강퇴
│   └── upload.js           #   이미지 업로드
├── src/
│   ├── components/
│   │   ├── Map/            #   UserMarker
│   │   ├── Pin/            #   PinMarker · PinCreator · PinDetail
│   │   ├── Chat/           #   ChatRoom · ChatMessage
│   │   └── UI/             #   BottomNav · BottomSheet · InviteModal · Toast
│   ├── hooks/              #   useAuth · useChat · useGeolocation
│   │                       #   useMembers · usePins · useRoom
│   ├── pages/
│   │   ├── Home.jsx        #   랜딩 · 방 생성 · 프로필 설정
│   │   └── MapRoom.jsx     #   메인 지도 화면
│   ├── App.jsx             #   라우팅 · 인증 로직
│   └── index.css           #   디자인 시스템 (CSS Variables)
├── schema.sql              # Postgres DDL
├── vercel.json             # Vercel rewrites 설정
└── vite.config.js          # Vite + Rolldown 설정
```

<br />

## 🎨 Design Philosophy

> **"Nothing-style minimalism meets dark elegance."**

- 🌑 **풀 다크 모드** — `#0a0a0a` 베이스의 모노크롬 지도 스타일
- 🔤 **Monospace UI** — 시스템 모노스페이스 폰트로 통일된 인터페이스
- ✨ **Micro-animations** — Framer Motion 기반의 자연스러운 전환 효과
- 📱 **Mobile-first** — 모바일 최적화 설계, PWA 지원

<br />

## 🗄️ Database Schema

```sql
rooms
├── id          VARCHAR(8)    PK
├── name        VARCHAR(100)
├── created_by  VARCHAR(36)
└── created_at  BIGINT

pins
├── id          VARCHAR(36)   PK
├── room_id     VARCHAR(8)    FK → rooms.id
├── user_id     VARCHAR(36)
├── nickname    VARCHAR(50)
├── avatar      VARCHAR(20)
├── lat         DOUBLE PRECISION
├── lng         DOUBLE PRECISION
├── photo_url   TEXT
├── comment     VARCHAR(200)
└── created_at  BIGINT
```

<br />

## 🤝 Contributing

기여를 환영합니다! 아래 가이드를 따라주세요.

1. Fork this repository
2. Create your branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

<br />

## 📄 License

MIT © [TravelPin Contributors](https://github.com/udd43/TravelPin/graphs/contributors)

<br />

<div align="center">

**Built with ❤️ for travelers who explore together.**

[⬆ Back to Top](#-travelpin)

</div>
