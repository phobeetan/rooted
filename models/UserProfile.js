/**
 * UserProfile model - plain data shape
 * @typedef {Object} UserProfile
 * @property {string} name
 * @property {string} birthday
 * @property {string} email
 * @property {string} occupation
 * @property {number} salary
 * @property {number} monthlySpending
 * @property {string} goals
 * @property {string} financialKnowledge
 */

/**
 * Create a UserProfile object from raw data
 * @param {Object} data
 * @returns {UserProfile}
 */
export function createUserProfile(data = {}) {
  return {
    name: data.name || '',
    birthday: data.birthday || '',
    email: data.email || '',
    occupation: data.occupation || '',
    salary: Number(data.salary) || 0,
    monthlySpending: Number(data.monthlySpending) || 0,
    goals: data.goals || '',
    financialKnowledge: data.financialKnowledge || ''
  };
}
// Single exported factory `createUserProfile` above
