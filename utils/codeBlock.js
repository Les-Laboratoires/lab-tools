/**
 * make a code block around the given code
 * @param {string} code - given code
 * @param {string} lang - programming language of given code
 * @returns {string} code in markdown code block
 */
function codeBlock(code, lang) {
  return "```" + lang + "\n" + code.replace(/```/g, "\\```") + "\n```"
}

module.exports = codeBlock
