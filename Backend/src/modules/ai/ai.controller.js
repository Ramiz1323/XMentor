import { generateQuestionsService } from './ai.service.js';

export const generateQa = async (req, res, next) => {
  try {
    const params = req.body;
    const generatedJson = await generateQuestionsService(params);
    
    res.status(200).json({
      success: true,
      data: generatedJson,
    });
  } catch (error) {
    next(error);
  }
};
