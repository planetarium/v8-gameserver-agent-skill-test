# Poker Agent Skill for OpenClaw

OpenClaw 커스텀 스킬 - Agent8 GameServer에서 자율적으로 포커를 플레이하는 AI 에이전트

## 📁 파일 구조

```
poker-agent-skill/
├── skill.md           # OpenClaw 스킬 메인 문서 (배포용)
├── poker-agent.ts     # 포커 에이전트 메인 코드
├── polyfill.cjs       # Node.js 폴리필
├── package.json       # 패키지 정보 (참고용)
├── README.md          # 이 파일
└── .gitignore         # Git 제외 파일
```

## 🚀 배포 방법

### 1. GitHub에 업로드

```bash
# 이 디렉토리를 GitHub 저장소로 푸시
git init
git add .
git commit -m "Add poker agent skill"
git remote add origin https://github.com/YOUR_USERNAME/poker-agent-skill.git
git push -u origin main
```

### 2. skill.md의 URL 업데이트

`skill.md` 파일에서 다음 URL들을 실제 GitHub 주소로 변경:

```
YOUR_USERNAME → 실제 GitHub 사용자명
```

예시:
```
https://raw.githubusercontent.com/john/poker-agent-skill/main/polyfill.cjs
https://raw.githubusercontent.com/john/poker-agent-skill/main/poker-agent.ts
```

### 3. OpenClaw에서 사용

배포 후, OpenClaw 에이전트에게 다음과 같이 지시:

```
Read https://raw.githubusercontent.com/YOUR_USERNAME/poker-agent-skill/main/skill.md and follow the instructions to play poker on Agent8
```

또는:

```
Read https://your-domain.com/poker-agent-skill/skill.md and follow the instructions to join poker game at verse 0x...
```

## 💡 사용 예시 (로컬 테스트)

### 의존성 설치
```bash
npm install @agent8/gameserver@^1.10.2 ethers@^6.16.0 tsx@^4.21.0 ws@^8.19.0
```

### 에이전트 실행

Windows PowerShell:
```powershell
$env:VERSE="0x5ed994a3a9240fea2d1777bfb2cc0cd7d0a1f61b-1771833985558"
$env:STRATEGY="balanced"
$env:NAME="test-bot"
npx tsx poker-agent.ts
```

Linux/Mac:
```bash
VERSE="0x5ed994a3a9240fea2d1777bfb2cc0cd7d0a1f61b-1771833985558" \
STRATEGY=balanced \
NAME=test-bot \
npx tsx poker-agent.ts
```

## 🎯 전략 타입

- **aggressive**: 공격적 플레이 (블러핑 30%)
- **conservative**: 보수적 플레이 (블러핑 5%)
- **balanced**: 균형잡힌 플레이 (블러핑 15%) - 기본값
- **adaptive**: 적응형 플레이 (승률 기반 자동 조정)

## 📦 배포 플랫폼 옵션

### Option 1: GitHub Pages
가장 간단하고 무료입니다.

1. GitHub 저장소 Settings → Pages
2. Source: main branch
3. 접근 URL: `https://YOUR_USERNAME.github.io/poker-agent-skill/skill.md`

### Option 2: GitHub Raw
추가 설정 없이 바로 사용 가능

- URL: `https://raw.githubusercontent.com/YOUR_USERNAME/poker-agent-skill/main/skill.md`

### Option 3: 커스텀 도메인
자체 서버나 CDN 사용

- Vercel, Netlify, Cloudflare Pages 등
- 예: `https://poker-agent.yourdomain.com/skill.md`

## 🔧 커스터마이징

### 다른 Verse ID로 변경

`skill.md` 파일에서 예시 Verse ID를 실제 배포된 게임의 ID로 변경하세요.

### 전략 수정

`poker-agent.ts`의 `StrategyEngine` 클래스에서 전략 설정을 조정할 수 있습니다.

### 핸드 평가 로직 개선

`HandEvaluator` 클래스를 수정하여 더 정교한 평가 로직을 구현할 수 있습니다.

## 📝 라이선스

MIT

## 🤝 기여

이슈나 PR은 언제든 환영합니다!
