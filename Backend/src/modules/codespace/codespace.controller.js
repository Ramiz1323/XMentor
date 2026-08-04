import * as codeSpaceService from './codespace.service.js';

export const getCodeSpace = async (req, res, next) => {
  try {
    const space = await codeSpaceService.getUserCodeSpace(req.user._id);
    res.status(200).json({ success: true, data: space });
  } catch (error) {
    next(error);
  }
};

export const saveCodeSpace = async (req, res, next) => {
  try {
    const space = await codeSpaceService.saveUserCodeSpace(req.user._id, req.body);
    res.status(200).json({ success: true, data: space });
  } catch (error) {
    next(error);
  }
};

export const executeJava = async (req, res, next) => {
  try {
    const { code, stdin } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, error: 'Java code cannot be empty' });
    }
    const result = await codeSpaceService.executeJavaCode(code, stdin);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
