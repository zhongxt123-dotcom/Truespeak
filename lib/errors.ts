export function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "未知服务器错误";
}
