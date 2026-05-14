const normalizeMessage = (message) => (message || '').toLowerCase();

const determineSubmissionResult = ({ passed, total, errorMessage }) => {
  if (passed === total) {
    return 'ACCEPTED';
  }

  const normalizedError = normalizeMessage(errorMessage);

  if (normalizedError.includes('time limit')) {
    return 'TIME_LIMIT';
  }

  if (
    normalizedError.includes('compile') ||
    normalizedError.includes('syntaxerror') ||
    normalizedError.includes('exception in thread') ||
    normalizedError.includes('error:')
  ) {
    return 'COMPILE_ERROR';
  }

  return errorMessage ? 'RUNTIME_ERROR' : 'WRONG_ANSWER';
};

module.exports = { determineSubmissionResult };