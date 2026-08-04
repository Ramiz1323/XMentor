import CodeSpace from './codespace.model.js';
import axios from 'axios';
import logger from '../../utils/logger.js';

/**
 * Get or initialize default codespace for a user
 */
export const getUserCodeSpace = async (userId) => {
  let space = await CodeSpace.findOne({ user: userId });
  if (!space) {
    space = await CodeSpace.create({ user: userId });
  }
  return space;
};

/**
 * Save / update user codespace
 */
export const saveUserCodeSpace = async (userId, data) => {
  const { title, language, html, css, js, java } = data;
  
  let space = await CodeSpace.findOne({ user: userId });
  if (!space) {
    space = new CodeSpace({ user: userId });
  }

  if (title !== undefined) space.title = title;
  if (language !== undefined) space.language = language;
  if (html !== undefined) space.html = html;
  if (css !== undefined) space.css = css;
  if (js !== undefined) space.js = js;
  if (java !== undefined) space.java = java;

  await space.save();
  return space;
};

/**
 * Execute Java code securely using Piston API runner
 */
export const executeJavaCode = async (code) => {
  try {
    const payload = {
      language: 'java',
      version: '15.0.2',
      files: [
        {
          name: 'Main.java',
          content: code,
        },
      ],
    };

    const response = await axios.post('https://emkc.org/api/v2/piston/execute', payload, {
      timeout: 10000,
    });

    const runResult = response.data.run || {};
    const compileResult = response.data.compile || {};

    let output = runResult.output || compileResult.output || 'No output produced.';
    let stderr = runResult.stderr || compileResult.stderr || '';
    let exitCode = runResult.code !== undefined ? runResult.code : compileResult.code;

    return {
      success: exitCode === 0,
      output: output.trim(),
      stderr: stderr.trim(),
      exitCode,
    };
  } catch (error) {
    logger.error('Java Execution Error:', error.message);
    return {
      success: false,
      output: '',
      stderr: error.response?.data?.message || error.message || 'Execution engine unavailable.',
      exitCode: 1,
    };
  }
};
