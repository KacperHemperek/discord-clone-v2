export class ClientError extends Error {
  code: number;
  constructor(message: string, code: number = 500, cause?: string) {
    super(message, { cause });
    this.code = code;
  }
}
