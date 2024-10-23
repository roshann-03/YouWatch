class ApiResponse extends Error {
  constructor(statusCode, data, message = "Something went wrong") {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 300;
  }
}
export { ApiResponse };
