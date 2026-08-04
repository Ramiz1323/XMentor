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
 * Execute Java code securely using Judge0 Engine API
 */
export const executeJavaCode = async (code) => {
  try {
    const payload = {
      source_code: code,
      language_id: 62, // Java (OpenJDK 13.0.1)
    };

    const response = await axios.post('https://ce.judge0.com/submissions?wait=true', payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    const data = response.data || {};
    const stdout = data.stdout || '';
    const stderr = data.stderr || data.compile_output || data.message || '';
    const isSuccess = data.status?.id === 3; // Status 3 = Accepted

    return {
      success: isSuccess,
      output: stdout.trim() || (isSuccess ? 'Program executed successfully with no output.' : ''),
      stderr: stderr.trim(),
      exitCode: isSuccess ? 0 : 1,
      executionTime: data.time ? `${data.time}s` : undefined,
    };
  } catch (error) {
    logger.error('Java Execution Engine Error:', error.message);
    return {
      success: false,
      output: '',
      stderr: error.response?.data?.message || error.message || 'Execution engine timeout. Please check your code syntax.',
      exitCode: 1,
    };
  }
};
