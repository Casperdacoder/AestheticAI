import axios from 'axios';

const SPACELY_BASE_URL = process.env.SPACELY_API_BASE_URL || 'https://api.spacely.ai/api/v1';

export const generateTwoPointPerspective = async (req, res) => {
  const apiKey = process.env.SPACELY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'Missing SPACELY_API_KEY. Add it to your environment configuration.'
    });
  }

  try {
    const response = await axios.post(
      ${SPACELY_BASE_URL}/generate/two-point-perspective,
      req.body ?? {},
      {
        headers: {
          'Authorization': Bearer ,
          'Content-Type': 'application/json'
        },
        timeout: Number(process.env.SPACELY_TIMEOUT || 60000)
      }
    );

    return res.json({ success: true, data: response.data });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to contact Spacely AI';

    return res.status(status).json({ success: false, error: message });
  }
};
