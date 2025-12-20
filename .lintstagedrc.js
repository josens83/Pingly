module.exports = {
  '*.{ts,tsx}': [
    // TypeScript 전체 프로젝트 타입 체크 (파일 인자 무시)
    () => 'tsc --noEmit',
    // 스테이징된 파일만 lint + format
    'eslint --fix --max-warnings=0',
  ],
  '*.prisma': ['npx prisma format', 'npx prisma validate'],
  '*.{js,jsx,json,md,css,scss}': ['prettier --write --ignore-unknown'],
}
