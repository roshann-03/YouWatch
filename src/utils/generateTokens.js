export const generateAuthTokenAndRefreshToken = async (user) => {
  try {
    const authToken = await user.generateAuthToken();
    const refreshToken = await user.generateRefreshToken();
    return { authToken, refreshToken };
  } catch (error) {
    throw new Error(error, "Failed to generate tokens");
  }
};
