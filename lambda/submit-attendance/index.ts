import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamo } from '../shared/dynamo';
import { requireAuth, requireRole } from '../shared/auth';
import { ok, err } from '../shared/response';

const ATTENDANCE_TABLE = process.env.ATTENDANCE_TABLE!;
const TEACHER_ASSIGNMENTS_TABLE = process.env.TEACHER_ASSIGNMENTS_TABLE!;
const VALID_STATUSES = ['present', 'absent', 'late'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST /attendance/submit
 * Body: { classId, date, records: Record<studentId, 'present'|'absent'|'late'> }
 * Auth: teacher only. Must have any assignment for the given classId.
 */
export const handler = async (event: any) => {
  try {
    const auth = await requireAuth(event);
    requireRole(auth.role, 'teacher');

    const body = JSON.parse(event.body || '{}');
    const { classId, date, records } = body;

    // Validate inputs
    if (!classId || typeof classId !== 'string') {
      return err(400, 'classId is required');
    }
    if (!date || !DATE_REGEX.test(date)) {
      return err(400, 'date must be YYYY-MM-DD format');
    }
    if (!records || typeof records !== 'object' || Object.keys(records).length === 0) {
      return err(400, 'records must be a non-empty object of studentId → status');
    }

    // Validate all status values
    for (const [studentId, status] of Object.entries(records)) {
      if (!VALID_STATUSES.includes(status as string)) {
        return err(400, `Invalid status "${status}" for student ${studentId}`);
      }
    }

    // Verify teacher has an assignment for this classId
    const assignmentCheck = await dynamo.send(
      new QueryCommand({
        TableName: TEACHER_ASSIGNMENTS_TABLE,
        KeyConditionExpression: 'teacherId = :tid',
        FilterExpression: 'classId = :cid',
        ExpressionAttributeValues: {
          ':tid': auth.userId,
          ':cid': classId,
        },
        Limit: 1,
      })
    );

    if (!assignmentCheck.Items || assignmentCheck.Items.length === 0) {
      return err(403, 'Teacher not assigned to this class');
    }

    // Write attendance records — one per student, idempotent
    let written = 0;
    let skipped = 0;

    for (const [studentId, status] of Object.entries(records)) {
      try {
        await dynamo.send(
          new PutCommand({
            TableName: ATTENDANCE_TABLE,
            Item: {
              'classId#studentId': `${classId}#${studentId}`,
              date,
              classId,
              studentId,
              status,
              markedBy: auth.userId,
              sessionLocked: true,
            },
            ConditionExpression: 'attribute_not_exists(#sk)',
            ExpressionAttributeNames: {
              '#sk': 'date',
            },
          })
        );
        written++;
      } catch (e: any) {
        if (e.name === 'ConditionalCheckFailedException') {
          skipped++; // Already submitted — silently skip
        } else {
          throw e;
        }
      }
    }

    return ok({ written, skipped });
  } catch (e: any) {
    if (e.statusCode) return err(e.statusCode, e.message);
    console.error('submit-attendance error:', e);
    return err(500, 'Internal server error');
  }
};
