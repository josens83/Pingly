module.exports = {
  '*.{ts,tsx}': [
    // 스테이징된 파일만 lint + format
    // 전체 프로젝트 타입 체크는 pre-push에서 실행됨
    'eslint --fix --max-warnings=0',
    'prettier --write',
  ],
  '*.prisma': ['npx prisma format', 'npx prisma validate'],
  '*.{js,jsx,json,md,css,scss}': ['prettier --write --ignore-unknown'],
}
