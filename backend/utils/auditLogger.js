const AuditLog = require('../models/auditLog');

const logAudit = async ({ userId, role = 'system', action, resourceType = 'general', resourceId = null, details = {}, ip = '', userAgent = '' }) => {
  try {
    const record = new AuditLog({ userId, role, action, resourceType, resourceId, details, ip, userAgent });
    await record.save();
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

module.exports = { logAudit };
