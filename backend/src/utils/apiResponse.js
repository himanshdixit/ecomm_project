export const apiResponse = ({ success = true, message = "OK", data = null }) => ({
  success,
  message,
  data,
});
