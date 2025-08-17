# Supabase 데이터베이스 설정 가이드

## 📊 데이터베이스 테이블 생성

### 1. Supabase 대시보드에서 SQL 실행
- [Supabase Dashboard](https://supabase.com/dashboard) 접속
- 프로젝트 선택: `qmukkzzwpcgmyukoxynn`
- **SQL Editor**로 이동
- `database_schema.sql` 파일의 전체 내용을 복사해서 실행

### 2. 테이블 구조 확인
실행 후 다음 테이블들이 생성되어야 합니다:
- `public.profiles` - 사용자 프로필
- `public.categories` - 카테고리 
- `public.shared_items` - 공유 콘텐츠

## 🚨 현재 오류 해결하기

### 1. Supabase 대시보드 접속
- [Supabase Dashboard](https://supabase.com/dashboard) 접속
- 프로젝트 선택: `qmukkzzwpcgmyukoxynn`

### 2. URL Configuration 설정
**Authentication > URL Configuration**

#### Site URL:
```
http://localhost:3001
```

#### Additional Redirect URLs:
```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
http://localhost:3000/**
http://localhost:3001/**
```

### 3. Email Templates 수정
**Authentication > Email Templates > Magic Link**

```html
<h2>로그인 링크</h2>
<p>아래 링크를 클릭하여 로그인하세요:</p>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">로그인</a></p>
<p>또는 이 코드를 입력하세요: {{ .Token }}</p>
```

### 4. 임시 해결책 (선택사항)
**Authentication > Settings**
- "Enable email confirmations" **비활성화**
- "Enable phone confirmations" **비활성화**

이렇게 하면 이메일 확인 없이 바로 로그인됩니다.

## 🧪 테스트 방법

1. **브라우저에서 `http://localhost:3001` 접속**
2. **"이메일로 로그인" 클릭**
3. **이메일 주소 입력**
4. **"인증 링크 전송" 클릭**
5. **이메일 확인하고 링크 클릭**

## 🔍 디버깅

### 브라우저 개발자 도구 확인:
- Network 탭에서 `/auth/callback` 요청 확인
- Console에서 오류 메시지 확인

### 서버 로그 확인:
```bash
# 터미널에서 확인
npm run dev
```

## ⚡ 빠른 해결책

만약 계속 문제가 발생한다면:

1. **이메일 확인 비활성화**:
   - Authentication > Settings
   - "Enable email confirmations" 체크 해제

2. **개발 환경에서만 사용할 테스트 이메일**:
   - 본인의 실제 이메일 주소 사용
   - Gmail, Naver 등 실제 이메일 서비스

## 📞 문제 해결이 안될 때

1. **Supabase 대시보드 설정 스크린샷 확인**
2. **브라우저 콘솔 오류 메시지 확인**
3. **이메일이 실제로 도착하는지 확인** 