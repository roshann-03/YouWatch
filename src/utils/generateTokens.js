export const generateAuthTokenAndRefreshToken = async (user) => {
  try {
    const accessToken = await user.generateAuthToken();
    const refreshToken = await user.generateRefreshToken();
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error, "Failed to generate tokens");
  }
};
