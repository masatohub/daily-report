export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      aria-label="読み込み中"
      role="status"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-b-gray-900"
        aria-hidden="true"
      />
      <span className="sr-only">読み込み中...</span>
    </div>
  );
}
